import { prisma } from 'prisma/client'
import { hashPassword, comparePassword } from '@/utils/hash'
import { generateToken } from '@/utils/jwt'
import { LoginAttemptService } from './loginAttempt.service'
import { DeviceRegistryService } from './deviceRegistry.service'
import { OTPService } from './otp.service'
import type {
    LoginRequest,
    LoginResponse,
    VerificationRequiredResponse,
    RegisterRequest,
    RegisterResponse,
    VerifyAccountRequest,
    VerifyAccountResponse,
    ResendOTPRequest,
    ResendOTPResponse,
    RateLimitResponse,
    CloseAccountRequest,
    ProfileResponse,
} from '../modules/auth.types'

export class AuthService {
    /**
     * Login user with email/username and password
     */
    static async login(data: LoginRequest): Promise<LoginResponse | VerificationRequiredResponse> {
        const { username_or_email, password, uuid_device, latitude, longitude, platform, fcm_token } = data

        // Check for spam login attempts
        const spamCheck = await LoginAttemptService.checkSpamLogin(username_or_email, uuid_device)
        if (spamCheck) {
            throw new Error(spamCheck)
        }

        // Find user by email or username
        const user = await prisma.user.findFirst({
            where: {
                OR: [{ email: username_or_email }, { username: username_or_email }],
            },
        })

        if (!user) {
            throw new Error(`Account not registered, please register account ${username_or_email}`)
        }

        // Check if account is suspended
        if (user.is_suspended) {
            throw new Error('Account has been closed. Please contact support.')
        }

        // Check login attempt restrictions
        const attemptCheck = await LoginAttemptService.checkLoginAttempts(user.id_user)
        if (attemptCheck) {
            throw new Error(attemptCheck)
        }

        // Verify password
        const isPasswordValid = await comparePassword(password, user.password)
        if (!isPasswordValid) {
            // Record failed login
            await LoginAttemptService.recordFailedLogin(user.id_user, username_or_email, latitude, uuid_device)
            throw new Error('salah password, silahkan coba lagi')
        }

        // Check if account is active (not verified yet)
        if (!user.is_active || !user.is_email_verified) {
            // Return special response with email for OTP verification flow
            return {
                requiresVerification: true,
                email: user.email,
                phone: user.phone,
                message: 'Please verify your account.',
            }
        }

        // Record successful login
        await LoginAttemptService.recordSuccessfulLogin(user.id_user, username_or_email, latitude, uuid_device)

        // Update/store device information if uuid_device is provided
        if (uuid_device) {
            await prisma.userDevice.upsert({
                where: { uuid_device: uuid_device },
                update: {
                    user_id: user.id_user,
                    platform,
                    fcm_token,
                },
                create: {
                    user_id: user.id_user,
                    uuid_device: uuid_device,
                    platform,
                    fcm_token,
                },
            })
        }

        // Generate JWT token with idUser
        const token = generateToken({
            idUser: user.id_user,
            email: user.email,
            role: user.role,
        })

        return {
            token,
            user: {
                is_email_verified: user.is_email_verified,
                is_active: user.is_active,
                is_login: !user.is_login_failed,
                is_suspend: user.is_suspended,
            },
        }
    }

    /**
     * Register new user
     */
    static async register(data: RegisterRequest): Promise<RegisterResponse | VerificationRequiredResponse> {
        const { email, username, phone, password, country, latitude, longitude, uuid_device, platform, fcm_token, is_rule } = data

        // Validate username format (only alphanumeric, hyphens, and underscores - no spaces)
        const usernameRegex = /^[a-zA-Z0-9_-]+$/
        if (!usernameRegex.test(username)) {
            throw new Error('Username can only contain letters, numbers, hyphens (-), and underscores (_). Spaces are not allowed.')
        }

        // Validate terms acceptance
        if (!is_rule) {
            throw new Error('You must accept the terms and conditions to register')
        }

        // First, check if ALL data matches an existing unverified account (same email AND username AND phone)
        const exactMatchAccount = await prisma.user.findFirst({
            where: {
                email,
                username,
                ...(phone && { phone }),
            },
        })

        if (exactMatchAccount) {
            // If account was closed, prevent re-registration
            if (exactMatchAccount.is_suspended) {
                throw new Error('This account has been closed and cannot be reused')
            }

            // If account not verified yet, return response with email for OTP flow
            if (!exactMatchAccount.is_email_verified || !exactMatchAccount.is_active) {
                return {
                    requiresVerification: true,
                    email: exactMatchAccount.email,
                    phone: exactMatchAccount.phone,
                    message: 'Please verify your account.',
                }
            }

            // Account exists and is verified - prompt to login
            throw new Error('Your account has been registered. Please log in.')
        }

        // If no exact match, check individual fields for partial matches
        // Collect all conflicts first, then show combined message
        const conflicts: string[] = []
        const closedAccountMessages: string[] = []

        // Check if email already exists
        const existingEmail = await prisma.user.findUnique({
            where: { email },
        })

        if (existingEmail) {
            if (existingEmail.is_suspended) {
                closedAccountMessages.push('This email address has been used for a closed account and cannot be reused')
            } else {
                conflicts.push('Email already registered')
            }
        }

        // Check if username already exists
        const existingUsername = await prisma.user.findUnique({
            where: { username },
        })

        if (existingUsername) {
            if (existingUsername.is_suspended) {
                closedAccountMessages.push('This username has been used for a closed account and cannot be reused')
            } else {
                conflicts.push('Username already taken')
            }
        }

        // Check if phone already exists
        if (phone) {
            const existingPhone = await prisma.user.findFirst({
                where: { phone },
            })

            if (existingPhone) {
                if (existingPhone.is_suspended) {
                    closedAccountMessages.push('This phone number has been used for a closed account and cannot be reused')
                } else {
                    conflicts.push('Phone number already registered')
                }
            }
        }

        // If any closed account messages, throw them first (priority)
        if (closedAccountMessages.length > 0) {
            throw new Error(closedAccountMessages.join(' & '))
        }

        // If any conflicts found, throw combined message
        if (conflicts.length > 0) {
            throw new Error(conflicts.join(' & '))
        }

        // NOW check device registration spam (only for NEW accounts)
        const deviceCheck = await DeviceRegistryService.checkDeviceRegistration(uuid_device, latitude, longitude)
        if (!deviceCheck.allowed) {
            throw new Error(deviceCheck.message || 'Registration blocked')
        }

        if (deviceCheck.requiresCaptcha) {
            throw new Error(deviceCheck.message || 'Captcha verification required')
        }

        // Hash password
        const hashedPassword = await hashPassword(password)

        // Create user with 'user' role only
        const user = await prisma.user.create({
            data: {
                email,
                username,
                phone,
                password: hashedPassword,
                country,
                role: 'user',
                is_email_verified: false,
                is_active: false,
                image_profile: `https://api.dicebear.com/9.x/fun-emoji/svg?seed=${encodeURIComponent(username)}`,
            },
        })

        // Store device information (upsert to handle re-registration)
        await prisma.userDevice.upsert({
            where: { uuid_device: uuid_device },
            update: {
                user_id: user.id_user,
                platform,
                fcm_token: fcm_token,
            },
            create: {
                user_id: user.id_user,
                uuid_device: uuid_device,
                platform,
                fcm_token: fcm_token,
            },
        })

        // Record successful registration
        await DeviceRegistryService.recordRegistrationAttempt(uuid_device, latitude, longitude, true)

        // Generate and send OTP
        const otpCode = await OTPService.generateOTP(user.id_user, email, phone)

        return {
            role: user.role,
            email: user.email,
            phone: user.phone,
            is_email_verified: user.is_email_verified,
            is_active: user.is_active,
            is_suspend: user.is_suspended,
            created_at: user.created_at,
            updated_at: user.updated_at,
            image_profile: user.image_profile,
        }
    }

    /**
     * Verify account with OTP
     */
    static async verifyAccount(data: VerifyAccountRequest): Promise<VerifyAccountResponse> {
        const { email, otp } = data

        // Verify OTP
        const verification = await OTPService.verifyOTP(email, otp)
        if (!verification.valid) {
            throw new Error(verification.message || 'Invalid OTP')
        }

        // Activate user account
        const user = await prisma.user.update({
            where: { id_user: verification.userId },
            data: {
                is_email_verified: true,
                is_active: true,
            },
        })

        return {
            role: user.role,
            email: user.email,
            phone: user.phone,
            is_email_verified: user.is_email_verified,
            is_active: user.is_active,
            is_suspend: user.is_suspended,
            created_at: user.created_at,
            updated_at: user.updated_at,
            image_profile: user.image_profile,
        }
    }

    /**
     * Resend OTP
     */
    static async resendOTP(data: ResendOTPRequest): Promise<ResendOTPResponse | RateLimitResponse> {
        const { email, phone } = data

        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email },
        })

        if (!user) {
            throw new Error('User not found')
        }

        // Check if user already verified
        if (user.is_email_verified) {
            throw new Error('Email already verified')
        }

        // Check OTP rate limiting
        const rateCheck = await OTPService.canRequestOTP(user.id_user, email)
        if (!rateCheck.allowed) {
            // Return rate limit response with seconds remaining
            return {
                rateLimited: true,
                seconds_remaining: rateCheck.secondsRemaining || 0,
                is_blocked: rateCheck.isBlocked,
                message: rateCheck.message || 'Too many OTP requests',
            }
        }

        // Record OTP request
        await OTPService.recordOTPRequest(user.id_user, email, phone)

        // Generate new OTP
        const otpCode = await OTPService.generateOTP(user.id_user, email, phone)

        return {
            otp: otpCode,
            is_otp: rateCheck.isBlocked,
        }
    }

    /**
     * Close user account
     */
    static async closeAccount(userId: string, data: CloseAccountRequest): Promise<void> {
        const { reason } = data

        // Update user status
        await prisma.user.update({
            where: { id_user: userId },
            data: {
                is_active: false,
                is_suspended: true,
                updated_by: userId,
            },
        })

        // Log the reason (could be stored in a separate table if needed)
        console.log(`User ${userId} closed account. Reason: ${reason}`)
    }

    /**
     * Fetch user profile
     */
    static async fetchProfile(userId: string): Promise<ProfileResponse> {
        const user = await prisma.user.findUnique({
            where: { id_user: userId },
        })

        if (!user) {
            throw new Error('User not found')
        }

        return {
            role: user.role,
            email: user.email,
            phone: user.phone,
            is_email_verified: user.is_email_verified,
            is_active: user.is_active,
            is_suspend: user.is_suspended,
            created_at: user.created_at,
            updated_at: user.updated_at,
            image_profile: user.image_profile,
        }
    }
}

