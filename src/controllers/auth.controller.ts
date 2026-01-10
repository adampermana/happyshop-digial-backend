import type { Context } from 'hono'
import { AuthService } from '../services/auth.service'
import { successResponse, errorResponse } from '@/utils/response'
import { verifyToken } from '@/utils/jwt'
import type {
    LoginRequest,
    VerificationRequiredResponse,
    RegisterRequest,
    VerifyAccountRequest,
    ResendOTPRequest,
    CloseAccountRequest,
} from '../modules/auth.types'

export class AuthController {
    /**
     * POST /api/v1/auth/login
     */
    static async login(c: Context) {
        try {
            const body = await c.req.json<LoginRequest>()

            // Validate request
            if (!body.username_or_email || !body.password) {
                return c.json(errorResponse('Username/Email and password are required', 400), 400)
            }

            const result = await AuthService.login(body)

            // Check if account requires verification
            if (result && 'requiresVerification' in result && result.requiresVerification) {
                return c.json({
                    meta: {
                        success: false,
                        message: result.message,
                        code: 403,
                    },
                    data: {
                        requiresVerification: true,
                        email: result.email,
                        phone: result.phone,
                    },
                }, 403)
            }

            return c.json(successResponse('Login successful', result, 200), 200)
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Login failed'
            return c.json(errorResponse(message, 401), 401)
        }
    }

    /**
     * POST /api/v1/auth/register
     */
    static async register(c: Context) {
        try {
            const body = await c.req.json<RegisterRequest>()

            // Validate required fields
            const requiredFields = ['username', 'email', 'phone', 'password', 'country', 'latitude', 'longitude', 'uuid_device', 'platform', 'fcm_token', 'is_rule']
            const missingFields = requiredFields.filter(field => !body[field as keyof RegisterRequest])

            if (missingFields.length > 0) {
                return c.json(
                    errorResponse(`Missing required fields: ${missingFields.join(', ')}`, 400),
                    400
                )
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (!emailRegex.test(body.email)) {
                return c.json(errorResponse('Invalid email format', 400), 400)
            }

            // Validate password length
            if (body.password.length < 6) {
                return c.json(errorResponse('Password must be at least 6 characters', 400), 400)
            }

            const result = await AuthService.register(body)

            // Check if account requires verification (existing unverified account)
            if (result && 'requiresVerification' in result && result.requiresVerification) {
                return c.json({
                    meta: {
                        success: false,
                        message: result.message,
                        code: 403,
                    },
                    data: {
                        requiresVerification: true,
                        email: result.email,
                        phone: result.phone,
                    },
                }, 403)
            }

            return c.json(successResponse('Registration successful. Please check your email for OTP verification.', result, 201), 201)
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Registration failed'
            return c.json(errorResponse(message, 400), 400)
        }
    }

    /**
     * POST /api/v1/auth/verify
     */
    static async verifyAccount(c: Context) {
        try {
            const body = await c.req.json<VerifyAccountRequest>()

            // Validate request
            if (!body.email || !body.otp) {
                return c.json(errorResponse('Email and OTP are required', 400), 400)
            }

            const result = await AuthService.verifyAccount(body)

            return c.json(successResponse('Account verified successfully', result, 200), 200)
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Verification failed'
            return c.json(errorResponse(message, 400), 400)
        }
    }

    /**
     * POST /api/v1/auth/resend-otp
     */
    static async resendOTP(c: Context) {
        try {
            const body = await c.req.json<ResendOTPRequest>()

            // Validate request
            if (!body.email) {
                return c.json(errorResponse('Email is required', 400), 400)
            }

            const result = await AuthService.resendOTP(body)

            // Check if rate limited
            if (result && 'rateLimited' in result && result.rateLimited) {
                return c.json({
                    meta: {
                        success: false,
                        message: result.message,
                        code: 429,
                    },
                    data: {
                        rateLimited: true,
                        seconds_remaining: result.seconds_remaining,
                        is_blocked: result.is_blocked,
                    },
                }, 429)
            }

            return c.json(successResponse('OTP sent successfully', result, 200), 200)
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Resend OTP failed'
            return c.json(errorResponse(message, 400), 400)
        }
    }

    /**
     * POST /api/v1/auth/close-account
     */
    static async closeAccount(c: Context) {
        try {
            // Get user from JWT token
            const authHeader = c.req.header('Authorization')
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return c.json(errorResponse('Unauthorized', 401), 401)
            }

            const token = authHeader.substring(7)
            const payload = verifyToken(token)

            const body = await c.req.json<CloseAccountRequest>()

            // Validate request
            if (!body.reason) {
                return c.json(errorResponse('Reason is required', 400), 400)
            }

            await AuthService.closeAccount(payload.idUser, body)

            return c.json(
                successResponse(
                    'Akun Anda telah berhasil ditutup.\nTerima kasih sudah menjadi bagian dari kami 💙',
                    null,
                    200
                ),
                200
            )
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Close account failed'
            return c.json(errorResponse(message, 400), 400)
        }
    }
}
