import { prisma } from 'prisma/client'
import { hashPassword, comparePassword } from '@/utils/hash'
import { generateToken } from '@/utils/jwt'
import { LoginAttemptService } from './loginAttempt.service'
import { DeviceRegistryService } from './deviceRegistry.service'
import { OTPService } from './otp.service'
import type {
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    RegisterResponse,
    VerifyAccountRequest,
    VerifyAccountResponse,
    ResendOTPRequest,
    ResendOTPResponse,
    CloseAccountRequest,
    ProfileResponse,
} from '../modules/auth.types'

export class AuthService {
    /**
     * Login user with email/username and password
     */
    static async login(data: LoginRequest): Promise<LoginResponse> {
        const { usernameOrEmail, password, uuidDevice, latitude, longitude } = data

        // Check for spam login attempts
        const spamCheck = await LoginAttemptService.checkSpamLogin(usernameOrEmail, uuidDevice)
        if (spamCheck) {
            throw new Error(spamCheck)
        }

        // Find user by email or username
        const user = await prisma.user.findFirst({
            where: {
                OR: [{ email: usernameOrEmail }, { username: usernameOrEmail }],
            },
        })

        if (!user) {
            throw new Error(`Account not registered, please register account ${usernameOrEmail}`)
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
            await LoginAttemptService.recordFailedLogin(user.id_user, usernameOrEmail, latitude, uuidDevice)
            throw new Error('salah password, silahkan coba lagi')
        }

        // Check if account is active
        if (!user.is_active) {
            throw new Error('Account is inactive. Please verify your email first.')
        }

        // Record successful login
        await LoginAttemptService.recordSuccessfulLogin(user.id_user, usernameOrEmail, latitude, uuidDevice)

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
    static async register(data: RegisterRequest): Promise<RegisterResponse> {
        const { email, username, phone, password, country, latitude, longitude, uuid_device, platform, fcm_token, is_rule } = data

        // Validate terms acceptance
        if (!is_rule) {
            throw new Error('You must accept the terms and conditions to register')
        }

        // Check device registration spam
        const deviceCheck = await DeviceRegistryService.checkDeviceRegistration(uuid_device, latitude, longitude)
        if (!deviceCheck.allowed) {
            throw new Error(deviceCheck.message || 'Registration blocked')
        }

        if (deviceCheck.requiresCaptcha) {
            throw new Error(deviceCheck.message || 'Captcha verification required')
        }

        // Check if email already exists
        const existingEmail = await prisma.user.findUnique({
            where: { email },
        })

        if (existingEmail) {
            // If account was closed, prevent re-registration
            if (existingEmail.is_suspended) {
                throw new Error('This email address has been used for a closed account and cannot be reused')
            }

            await DeviceRegistryService.recordRegistrationAttempt(uuid_device, latitude, longitude, false)
            throw new Error('Email already registered')
        }

        // Check if username already exists
        const existingUsername = await prisma.user.findUnique({
            where: { username },
        })

        if (existingUsername) {
            await DeviceRegistryService.recordRegistrationAttempt(uuid_device, latitude, longitude, false)
            throw new Error('Username already taken')
        }

        // Check if phone already exists
        if (phone) {
            const existingPhone = await prisma.user.findFirst({
                where: { phone },
            })

            if (existingPhone) {
                // If account was closed, prevent re-registration
                if (existingPhone.is_suspended) {
                    throw new Error('This phone number has been used for a closed account and cannot be reused')
                }

                await DeviceRegistryService.recordRegistrationAttempt(uuid_device, latitude, longitude, false)
                throw new Error('Phone number already registered')
            }
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
                image_profile: `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random`,
            },
        })

        // Store device information
        await prisma.userDevice.create({
            data: {
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
    static async resendOTP(data: ResendOTPRequest): Promise<ResendOTPResponse> {
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
            throw new Error(rateCheck.message || 'Too many OTP requests')
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

