import { Hono } from 'hono'
import { AuthController } from './auth.controller'

const authRoutes = new Hono()

// Public routes
authRoutes.post('/login', AuthController.login)
authRoutes.post('/register', AuthController.register)

export default authRoutes
