import { prisma } from 'prisma/client'

export type ModerationActionType = 'suspended' | 'banned' | 'unbanned' | 'unsuspended'

export interface SuspendUserRequest {
    userId: string
    reason: string
    moderatedBy?: string
    expiresAt?: Date
    notes?: string
}

export interface BanUserRequest {
    userId: string
    reason: string
    moderatedBy?: string
    notes?: string
}

export interface ModerationLogResponse {
    id: number
    user_id: string
    action_type: ModerationActionType
    reason: string
    notes?: string
    moderated_by?: string
    moderated_at: Date
    expires_at?: Date
    is_active: boolean
}

export class UserModerationService {
    /**
     * Suspend a user temporarily or permanently
     */
    static async suspendUser(data: SuspendUserRequest): Promise<ModerationLogResponse> {
        const { userId, reason, moderatedBy, expiresAt, notes } = data

        // Set user as suspended
        await prisma.user.update({
            where: { id_user: userId },
            data: {
                is_suspended: true,
                updated_by: moderatedBy || userId,
            },
        })

        // Create moderation log
        const log = await prisma.userModerationLog.create({
            data: {
                user_id: userId,
                action_type: 'suspended',
                reason,
                notes,
                moderated_by: moderatedBy,
                expires_at: expiresAt,
                is_active: true,
            },
        })

        return log as ModerationLogResponse
    }

    /**
     * Ban a user permanently
     */
    static async banUser(data: BanUserRequest): Promise<ModerationLogResponse> {
        const { userId, reason, moderatedBy, notes } = data

        // Set user as banned
        await prisma.user.update({
            where: { id_user: userId },
            data: {
                is_banned: true,
                is_active: false,
                updated_by: moderatedBy || userId,
            },
        })

        // Create moderation log
        const log = await prisma.userModerationLog.create({
            data: {
                user_id: userId,
                action_type: 'banned',
                reason,
                notes,
                moderated_by: moderatedBy,
                expires_at: null, // Permanent
                is_active: true,
            },
        })

        return log as ModerationLogResponse
    }

    /**
     * Unsuspend a user
     */
    static async unsuspendUser(userId: string, moderatedBy?: string, notes?: string): Promise<ModerationLogResponse> {
        // Remove suspension
        await prisma.user.update({
            where: { id_user: userId },
            data: {
                is_suspended: false,
                updated_by: moderatedBy || userId,
            },
        })

        // Deactivate previous suspension logs
        await prisma.userModerationLog.updateMany({
            where: {
                user_id: userId,
                action_type: 'suspended',
                is_active: true,
            },
            data: {
                is_active: false,
            },
        })

        // Create unsuspend log
        const log = await prisma.userModerationLog.create({
            data: {
                user_id: userId,
                action_type: 'unsuspended',
                reason: 'User unsuspended',
                notes,
                moderated_by: moderatedBy,
                is_active: true,
            },
        })

        return log as ModerationLogResponse
    }

    /**
     * Unban a user
     */
    static async unbanUser(userId: string, moderatedBy?: string, notes?: string): Promise<ModerationLogResponse> {
        // Remove ban
        await prisma.user.update({
            where: { id_user: userId },
            data: {
                is_banned: false,
                is_active: true,
                updated_by: moderatedBy || userId,
            },
        })

        // Deactivate previous ban logs
        await prisma.userModerationLog.updateMany({
            where: {
                user_id: userId,
                action_type: 'banned',
                is_active: true,
            },
            data: {
                is_active: false,
            },
        })

        // Create unban log
        const log = await prisma.userModerationLog.create({
            data: {
                user_id: userId,
                action_type: 'unbanned',
                reason: 'User unbanned',
                notes,
                moderated_by: moderatedBy,
                is_active: true,
            },
        })

        return log as ModerationLogResponse
    }

    /**
     * Check if user has active moderation
     */
    static async checkModerationStatus(userId: string): Promise<{
        isSuspended: boolean
        isBanned: boolean
        activeModeration?: ModerationLogResponse
    }> {
        const user = await prisma.user.findUnique({
            where: { id_user: userId },
            select: {
                is_suspended: true,
                is_banned: true,
            },
        })

        if (!user) {
            throw new Error('User not found')
        }

        // Get most recent active moderation
        const activeModeration = await prisma.userModerationLog.findFirst({
            where: {
                user_id: userId,
                is_active: true,
                action_type: { in: ['suspended', 'banned'] },
            },
            orderBy: {
                moderated_at: 'desc',
            },
        })

        return {
            isSuspended: user.is_suspended,
            isBanned: user.is_banned,
            activeModeration: activeModeration ? (activeModeration as ModerationLogResponse) : undefined,
        }
    }

    /**
     * Get moderation history for a user
     */
    static async getModerationHistory(userId: string): Promise<ModerationLogResponse[]> {
        const logs = await prisma.userModerationLog.findMany({
            where: { user_id: userId },
            orderBy: {
                moderated_at: 'desc',
            },
        })

        return logs as ModerationLogResponse[]
    }

    /**
     * Check and expire temporary suspensions
     * This should be run as a cron job
     */
    static async checkExpiredModerations(): Promise<number> {
        const now = new Date()

        // Find expired suspensions
        const expiredSuspensions = await prisma.userModerationLog.findMany({
            where: {
                action_type: 'suspended',
                is_active: true,
                expires_at: {
                    lte: now,
                    not: null,
                },
            },
        })

        let unsuspendedCount = 0

        // Unsuspend each user
        for (const log of expiredSuspensions) {
            await this.unsuspendUser(log.user_id, undefined, 'Auto-expired suspension')
            unsuspendedCount++
        }

        return unsuspendedCount
    }
}
