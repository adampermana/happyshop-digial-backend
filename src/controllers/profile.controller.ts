import type { Context } from 'hono'
import { AuthService } from '../services/auth.service'
import { successResponse, errorResponse } from '@/utils/response'
import { verifyToken } from '@/utils/jwt'

export class ProfileController {
    /**
     * GET /api/v1/profile
     */
    static async getProfile(c: Context) {
        try {
            // Get user from JWT token
            const authHeader = c.req.header('Authorization')
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return c.json(errorResponse('Unauthorized', 401), 401)
            }

            const token = authHeader.substring(7)
            const payload = verifyToken(token)

            const result = await AuthService.fetchProfile(payload.idUser)

            return c.json(successResponse('Profile fetched successfully', result, 200), 200)
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to fetch profile'
            return c.json(errorResponse(message, 400), 400)
        }
    }
}
