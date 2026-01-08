import { Hono } from 'hono'
import { UserController } from './user.controller'
import { authMiddleware } from '@/middlewares/auth.middleware'

const userRoutes = new Hono()

// Protected routes (require authentication)
userRoutes.get('/profile', authMiddleware, UserController.getProfile)
userRoutes.put('/profile', authMiddleware, UserController.updateProfile)

export default userRoutes
