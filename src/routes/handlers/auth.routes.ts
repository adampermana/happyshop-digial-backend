import { Hono } from 'hono'
import { AuthController } from '../../controllers/auth.controller'

const authRoutes = new Hono()

// Public routes
authRoutes.post('/login', AuthController.login)
authRoutes.post('/register', AuthController.register)
authRoutes.post('/verify', AuthController.verifyAccount)
authRoutes.post('/resend-otp', AuthController.resendOTP)

// Protected routes (requires JWT token)
authRoutes.post('/close-account', AuthController.closeAccount)

export default authRoutes
