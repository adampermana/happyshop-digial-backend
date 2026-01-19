import type { Context } from 'hono'
import { UserModerationService } from '@/services/userModeration.service'
import { successResponse, errorResponse } from '@/utils/response'
import { verifyToken } from '@/utils/jwt'

export class ModerationController {
    /**
     * Suspend a user
     * POST /api/v1/moderation/suspend
     */
    static async suspendUser(c: Context) {
        try {
            // Get admin from JWT token
            const authHeader = c.req.header('Authorization')
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return c.json(errorResponse('Unauthorized', 401), 401)
            }

            const token = authHeader.substring(7)
            const payload = verifyToken(token)

            const body = await c.req.json()
            const { userId, reason, expiresAt, notes } = body

            if (!userId || !reason) {
                return c.json(errorResponse('userId and reason are required', 400), 400)
            }

            const log = await UserModerationService.suspendUser({
                userId,
                reason,
                moderatedBy: payload.idUser,
                expiresAt: expiresAt ? new Date(expiresAt) : undefined,
                notes,
            })

            return c.json(successResponse('User suspended successfully', log, 200), 200)
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to suspend user'
            return c.json(errorResponse(message, 500), 500)
        }
    }

    /**
     * Ban a user permanently
     * POST /api/v1/moderation/ban
     */
    static async banUser(c: Context) {
        try {
            // Get admin from JWT token
            const authHeader = c.req.header('Authorization')
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return c.json(errorResponse('Unauthorized', 401), 401)
            }

            const token = authHeader.substring(7)
            const payload = verifyToken(token)

            const body = await c.req.json()
            const { userId, reason, notes } = body

            if (!userId || !reason) {
                return c.json(errorResponse('userId and reason are required', 400), 400)
            }

            const log = await UserModerationService.banUser({
                userId,
                reason,
                moderatedBy: payload.idUser,
                notes,
            })

            return c.json(successResponse('User banned successfully', log, 200), 200)
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to ban user'
            return c.json(errorResponse(message, 500), 500)
        }
    }

    /**
     * Unsuspend a user
     * POST /api/v1/moderation/unsuspend
     */
    static async unsuspendUser(c: Context) {
        try {
            // Get admin from JWT token
            const authHeader = c.req.header('Authorization')
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return c.json(errorResponse('Unauthorized', 401), 401)
            }

            const token = authHeader.substring(7)
            const payload = verifyToken(token)

            const body = await c.req.json()
            const { userId, notes } = body

            if (!userId) {
                return c.json(errorResponse('userId is required', 400), 400)
            }

            const log = await UserModerationService.unsuspendUser(userId, payload.idUser, notes)

            return c.json(successResponse('User unsuspended successfully', log, 200), 200)
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to unsuspend user'
            return c.json(errorResponse(message, 500), 500)
        }
    }

    /**
     * Unban a user
     * POST /api/v1/moderation/unban
     */
    static async unbanUser(c: Context) {
        try {
            // Get admin from JWT token
            const authHeader = c.req.header('Authorization')
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return c.json(errorResponse('Unauthorized', 401), 401)
            }

            const token = authHeader.substring(7)
            const payload = verifyToken(token)

            const body = await c.req.json()
            const { userId, notes } = body

            if (!userId) {
                return c.json(errorResponse('userId is required', 400), 400)
            }

            const log = await UserModerationService.unbanUser(userId, payload.idUser, notes)

            return c.json(successResponse('User unbanned successfully', log, 200), 200)
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to unban user'
            return c.json(errorResponse(message, 500), 500)
        }
    }

    /**
     * Get moderation history for a user
     * GET /api/v1/moderation/history/:userId
     */
    static async getModerationHistory(c: Context) {
        try {
            const userId = c.req.param('userId')

            if (!userId) {
                return c.json(errorResponse('userId is required', 400), 400)
            }

            const history = await UserModerationService.getModerationHistory(userId)

            return c.json(successResponse('Moderation history retrieved successfully', history, 200), 200)
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to get moderation history'
            return c.json(errorResponse(message, 500), 500)
        }
    }

    /**
     * Check moderation status for a user
     * GET /api/v1/moderation/status/:userId
     */
    static async checkModerationStatus(c: Context) {
        try {
            const userId = c.req.param('userId')

            if (!userId) {
                return c.json(errorResponse('userId is required', 400), 400)
            }

            const status = await UserModerationService.checkModerationStatus(userId)

            return c.json(successResponse('Moderation status retrieved successfully', status, 200), 200)
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to check moderation status'
            return c.json(errorResponse(message, 500), 500)
        }
    }
}
