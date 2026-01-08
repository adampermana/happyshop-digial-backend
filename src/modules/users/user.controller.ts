import type { Context } from 'hono'
import { UserService } from './user.service'
import { successResponse, errorResponse } from '@/utils/response'

export class UserController {
    /**
     * GET /api/v1/users/profile
     */
    static async getProfile(c: Context) {
        try {
            const user = c.get('user') // From auth middleware

            if (!user || !user.userId) {
                return c.json(errorResponse('Unauthorized'), 401)
            }

            const profile = await UserService.getProfile(user.userId)

            return c.json(successResponse('Profile fetched successfully', profile))
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to fetch profile'
            return c.json(errorResponse(message), 400)
        }
    }

    /**
     * PUT /api/v1/users/profile
     */
    static async updateProfile(c: Context) {
        try {
            const user = c.get('user')

            if (!user || !user.userId) {
                return c.json(errorResponse('Unauthorized'), 401)
            }

            const body = await c.req.json<{ name?: string }>()

            const updatedProfile = await UserService.updateProfile(user.userId, body)

            return c.json(successResponse('Profile updated successfully', updatedProfile))
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to update profile'
            return c.json(errorResponse(message), 400)
        }
    }
}
