import { prisma } from 'prisma/client'

/**
 * Service to handle device-based spam prevention for registration
 */
export class DeviceRegistryService {
    /**
     * Check if device can register a new account
     * Returns error message if blocked, null if allowed
     */
    static async checkDeviceRegistration(uuidDevice: string, latitude?: string, longitude?: string): Promise<{
        allowed: boolean
        message?: string
        requiresCaptcha: boolean
    }> {
        const identifier = this.getIdentifier(uuidDevice, latitude, longitude)

        let registry = await prisma.deviceRegistry.findUnique({
            where: { uuid_device: identifier },
        })

        // If no previous attempts, allow registration
        if (!registry) {
            return { allowed: true, requiresCaptcha: false }
        }

        // Check if permanently blocked (4+ attempts)
        if (registry.is_permanently_blocked) {
            return {
                allowed: false,
                requiresCaptcha: false,
                message: 'Ups, "Batas pembuatan akun terlampaui."\nPesan-pesan ini menunjukkan bahwa pengguna telah mencapai batas platform untuk membuat akun baru.',
            }
        }

        // Check if temporarily blocked and still within block period
        if (registry.blocked_until && new Date() < registry.blocked_until) {
            const hours = Math.ceil((registry.blocked_until.getTime() - Date.now()) / (1000 * 60 * 60))

            if (registry.register_count >= 3) {
                return {
                    allowed: false,
                    requiresCaptcha: false,
                    message: 'Opps The system detected suspicious behavior that resembles spam or bot activity. Please try again later.',
                }
            }
        }

        // If block period has expired, reset the registry
        if (registry.blocked_until && new Date() >= registry.blocked_until) {
            registry = await prisma.deviceRegistry.update({
                where: { uuid_device: identifier },
                data: {
                    register_count: 0,
                    is_captcha_required: false,
                    blocked_until: null,
                    last_attempt_at: new Date(),
                },
            })
        }

        // Captcha required after 2 attempts
        if (registry.register_count >= 2 || registry.is_captcha_required) {
            return {
                allowed: true,
                requiresCaptcha: true,
                message: 'Opps, You have created too many accounts. Please try again later.',
            }
        }

        return { allowed: true, requiresCaptcha: false }
    }

    /**
     * Record a registration attempt
     */
    static async recordRegistrationAttempt(uuidDevice: string, latitude?: string, longitude?: string, success: boolean = false): Promise<void> {
        const identifier = this.getIdentifier(uuidDevice, latitude, longitude)

        const existing = await prisma.deviceRegistry.findUnique({
            where: { uuid_device: identifier },
        })

        if (!existing) {
            // Create new registry entry
            await prisma.deviceRegistry.create({
                data: {
                    uuid_device: identifier,
                    latitude,
                    longitude,
                    register_count: 1,
                    is_captcha_required: false,
                    is_permanently_blocked: false,
                    last_attempt_at: new Date(),
                },
            })
            return
        }

        const newCount = existing.register_count + 1
        const updateData: any = {
            register_count: newCount,
            last_attempt_at: new Date(),
        }

        // After 2 spam attempts: activate captcha (reset when user successfully creates account)
        if (newCount >= 2 && !success) {
            updateData.is_captcha_required = true
        }

        // Reset captcha if registration was successful
        if (success) {
            updateData.is_captcha_required = false
            updateData.register_count = 0 // Reset count on successful registration
        }

        // After 3 spam attempts: block for 24 hours
        if (newCount >= 3 && !success) {
            updateData.blocked_until = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        }

        // After 4 spam attempts: permanent block
        if (newCount >= 4 && !success) {
            updateData.is_permanently_blocked = true
            updateData.blocked_until = null // No expiry for permanent block
        }

        await prisma.deviceRegistry.update({
            where: { uuid_device: identifier },
            data: updateData,
        })
    }

    /**
     * Get identifier for device (prefer UUID, fallback to location)
     */
    private static getIdentifier(uuidDevice: string, latitude?: string, longitude?: string): string {
        if (uuidDevice) {
            return uuidDevice
        }

        // Fallback to location-based identifier
        if (latitude && longitude) {
            // Round coordinates to ~100m precision for spam detection
            const lat = parseFloat(latitude).toFixed(3)
            const lng = parseFloat(longitude).toFixed(3)
            return `loc_${lat}_${lng}`
        }

        return `unknown_${Date.now()}`
    }
}

