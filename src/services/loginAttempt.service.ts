import { prisma } from 'prisma/client'

/**
 * Service to handle login attempt tracking and spam prevention
 */
export class LoginAttemptService {
    /**
     * Check if user can login based on failed attempts
     * Returns error message if login is blocked, null if allowed
     */
    static async checkLoginAttempts(userId: string): Promise<string | null> {
        const user = await prisma.user.findUnique({
            where: { id_user: userId },
            select: {
                is_login_failed: true,
                is_captcha: true,
                failed_login_reset_at: true,
                last_failed_login_at: true,
            },
        })

        if (!user) return null

        // Check if restrictions should be reset (1 hour has passed)
        if (user.failed_login_reset_at && new Date() >= user.failed_login_reset_at) {
            await this.resetLoginRestrictions(userId)
            return null
        }

        // If login is disabled (5+ failed attempts)
        if (user.is_login_failed) {
            return 'Too Many Login Attempts For your account security, logins are temporarily restricted.\nPlease wait 1 hour before trying again.'
        }

        return null
    }

    /**
     * Check if captcha should be activated (3+ failed attempts)
     */
    static async shouldActivateCaptcha(userId: string): Promise<boolean> {
        const user = await prisma.user.findUnique({
            where: { id_user: userId },
            select: { is_captcha: true },
        })

        return user?.is_captcha || false
    }

    /**
     * Record a failed login attempt
     */
    static async recordFailedLogin(userId: string, usernameOrEmail: string, ipAddress?: string, uuidDevice?: string): Promise<void> {
        // Get current failed attempt count in the last hour
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)

        const recentFailedAttempts = await prisma.loginAttempt.count({
            where: {
                user_id: userId,
                is_successful: false,
                attempted_at: { gte: oneHourAgo },
            },
        })

        // Record the failed attempt
        await prisma.loginAttempt.create({
            data: {
                user_id: userId,
                username_or_email: usernameOrEmail,
                ip_address: ipAddress,
                uuid_device: uuidDevice,
                is_successful: false,
                failure_reason: 'Invalid password',
            },
        })

        const totalAttempts = recentFailedAttempts + 1

        // Update user flags based on attempt count
        const updateData: any = {
            lastFailedLoginAt: new Date(),
        }

        // Activate captcha after 3 failed attempts
        if (totalAttempts >= 3) {
            updateData.is_captcha = true
            updateData.failed_login_reset_at = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
        }

        // Disable login after 5 failed attempts
        if (totalAttempts >= 5) {
            updateData.is_login_failed = true
            updateData.failed_login_reset_at = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
        }

        await prisma.user.update({
            where: { id_user: userId },
            data: updateData,
        })
    }

    /**
     * Record a successful login
     */
    static async recordSuccessfulLogin(userId: string, usernameOrEmail: string, ipAddress?: string, uuidDevice?: string): Promise<void> {
        // Record successful login attempt
        await prisma.loginAttempt.create({
            data: {
                user_id: userId,
                username_or_email: usernameOrEmail,
                ip_address: ipAddress,
                uuid_device: uuidDevice,
                is_successful: true,
            },
        })

        // Reset user login restrictions
        await this.resetLoginRestrictions(userId)
    }

    /**
     * Reset login restrictions for a user
     */
    static async resetLoginRestrictions(userId: string): Promise<void> {
        await prisma.user.update({
            where: { id_user: userId },
            data: {
                is_login_failed: false,
                is_captcha: false,
                last_failed_login_at: null,
                failed_login_reset_at: null,
            },
        })
    }

    /**
     * Check for spam login attempts (3 rapid login attempts within short time)
     */
    static async checkSpamLogin(usernameOrEmail: string, uuidDevice?: string): Promise<string | null> {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)

        // Count login attempts in last 5 minutes
        const recentAttempts = await prisma.loginAttempt.count({
            where: {
                username_or_email: usernameOrEmail,
                attempted_at: { gte: fiveMinutesAgo },
                ...(uuidDevice && { uuidDevice }),
            },
        })

        // If 3 or more attempts in 5 minutes, it's spam
        if (recentAttempts >= 3) {
            return 'Too Many Login Attempts For your account security, logins are temporarily restricted.\nPlease wait 1 hour before trying again.'
        }

        return null
    }
}

