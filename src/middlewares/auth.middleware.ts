import type { Context, Next } from 'hono'
import { verifyToken } from '@/utils/jwt'
import { errorResponse } from '@/utils/response'

/**
 * Authentication middleware
 * Verifies JWT token and attaches user info to context
 */
export async function authMiddleware(c: Context, next: Next) {
    try {
        // Get token from Authorization header
        const authHeader = c.req.header('Authorization')

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return c.json(errorResponse('No token provided'), 401)
        }

        const token = authHeader.substring(7) // Remove 'Bearer ' prefix

        // Verify token
        const payload = verifyToken(token)

        // Attach user info to context
        c.set('user', payload)

        await next()
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Authentication failed'
        return c.json(errorResponse(message), 401)
    }
}
