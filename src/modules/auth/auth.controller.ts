import type { Context } from 'hono'
import { AuthService } from './auth.service'
import { successResponse, errorResponse } from '@/utils/response'
import type { LoginRequest, RegisterRequest } from './auth.types'

export class AuthController {
    /**
     * POST /api/v1/auth/login
     */
    static async login(c: Context) {
        try {
            const body = await c.req.json<LoginRequest>()

            // Validate request
            if (!body.email || !body.password) {
                return c.json(errorResponse('Email and password are required'), 400)
            }

            const result = await AuthService.login(body)

            return c.json(successResponse('Login successful', result))
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Login failed'
            return c.json(errorResponse(message), 401)
        }
    }

    /**
     * POST /api/v1/auth/register
     */
    static async register(c: Context) {
        try {
            const body = await c.req.json<RegisterRequest>()

            // Validate request
            if (!body.email || !body.password || !body.name) {
                return c.json(errorResponse('Email, password, and name are required'), 400)
            }

            const result = await AuthService.register(body)

            return c.json(successResponse('Registration successful', result), 201)
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Registration failed'
            return c.json(errorResponse(message), 400)
        }
    }
}
