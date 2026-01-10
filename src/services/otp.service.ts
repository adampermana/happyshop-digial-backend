import { prisma } from 'prisma/client'

/**
 * Service to handle OTP generation, verification, and rate limiting
 */
export class OTPService {
    /**
     * Generate a 6-digit OTP code
     */
    static generateOTPCode(): string {
        return Math.floor(100000 + Math.random() * 900000).toString()
    }

    /**
     * Generate and save OTP for user
     */
    static async generateOTP(userId: string, email: string, phone?: string): Promise<string> {
        const otpCode = this.generateOTPCode()
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

        // Invalidate previous OTPs for this user
        await prisma.otp.updateMany({
            where: {
                user_id: userId,
                is_used: false,
            },
            data: {
                is_used: true,
            },
        })

        // Create new OTP
        await prisma.otp.create({
            data: {
                user_id: userId,
                email,
                phone,
                otp_code: otpCode,
                expires_at: expiresAt,
                is_used: false,
            },
        })

        // Log OTP to console (since SMTP not configured yet)
        console.log('========================================')
        console.log('📧 OTP CODE GENERATED')
        console.log(`Email: ${email}`)
        console.log(`OTP Code: ${otpCode}`)
        console.log(`Expires At: ${expiresAt.toISOString()}`)
        console.log('========================================')

        return otpCode
    }

    /**
     * Verify OTP code
     */
    static async verifyOTP(email: string, otpCode: string): Promise<{ valid: boolean; userId?: string; message?: string }> {
        const otp = await prisma.otp.findFirst({
            where: {
                email,
                otp_code: otpCode,
                is_used: false,
            },
            orderBy: {
                created_at: 'desc',
            },
        })

        if (!otp) {
            return {
                valid: false,
                message: 'Invalid OTP code',
            }
        }

        // Check if OTP is expired
        if (new Date() > otp.expires_at) {
            return {
                valid: false,
                message: 'OTP code has expired',
            }
        }

        // Mark OTP as used
        await prisma.otp.update({
            where: { id: otp.id },
            data: { is_used: true },
        })

        return {
            valid: true,
            userId: otp.user_id,
        }
    }

    /**
     * Check if user can request OTP (rate limiting)
     */
    static async canRequestOTP(userId: string, email: string): Promise<{ allowed: boolean; message?: string; isBlocked: boolean; secondsRemaining?: number }> {
        // Check OTP attempt tracking
        const otpAttempt = await prisma.otpAttempt.findFirst({
            where: { user_id: userId, email },
        })

        if (!otpAttempt) {
            return { allowed: true, isBlocked: false }
        }

        // Check if blocked (max 3 attempts reached)
        if (otpAttempt.is_blocked && otpAttempt.blocked_until && new Date() < otpAttempt.blocked_until) {
            const secondsRemaining = Math.ceil((otpAttempt.blocked_until.getTime() - Date.now()) / 1000)
            return {
                allowed: false,
                isBlocked: true,
                secondsRemaining,
                message: 'Too many OTP requests\nYou have reached the maximum number of OTP requests.\nPlease try again after 1 hour.',
            }
        }

        // Reset if block period expired
        if (otpAttempt.blocked_until && new Date() >= otpAttempt.blocked_until) {
            await prisma.otpAttempt.update({
                where: { id: otpAttempt.id },
                data: {
                    attempt_count: 0,
                    is_blocked: false,
                    blocked_until: null,
                    last_attempt_at: new Date(),
                },
            })
            return { allowed: true, isBlocked: false }
        }

        // Check 1-minute cooldown
        const oneMinuteAgo = new Date(Date.now() - 60 * 1000)
        if (otpAttempt.last_attempt_at > oneMinuteAgo) {
            const secondsRemaining = Math.ceil((otpAttempt.last_attempt_at.getTime() + 60 * 1000 - Date.now()) / 1000)
            return {
                allowed: false,
                isBlocked: false,
                secondsRemaining,
                message: `Please wait ${secondsRemaining} seconds before requesting another OTP`,
            }
        }

        // Check if approaching max attempts
        if (otpAttempt.attempt_count >= 3) {
            return {
                allowed: false,
                isBlocked: true,
                message: 'Too many OTP requests\nYou have reached the maximum number of OTP requests.\nPlease try again after 1 hour.',
            }
        }

        return { allowed: true, isBlocked: false }
    }

    /**
     * Record OTP request attempt
     */
    static async recordOTPRequest(userId: string, email: string, phone?: string): Promise<void> {
        const existing = await prisma.otpAttempt.findFirst({
            where: { user_id: userId, email },
        })

        if (!existing) {
            await prisma.otpAttempt.create({
                data: {
                    user_id: userId,
                    email,
                    phone,
                    attempt_count: 1,
                    is_blocked: false,
                    last_attempt_at: new Date(),
                },
            })
            return
        }

        const newCount = existing.attempt_count + 1
        const updateData: any = {
            attempt_count: newCount,
            last_attempt_at: new Date(),
        }

        // Block after 3 attempts for 1 hour
        if (newCount >= 3) {
            updateData.is_blocked = true
            updateData.blocked_until = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
        }

        await prisma.otpAttempt.update({
            where: { id: existing.id },
            data: updateData,
        })
    }
}

