import { Hono } from 'hono'
import authRoutes from './handlers/auth.routes'
import userRoutes from './handlers/user.routes'
import profileRoutes from './handlers/profile.routes'
import moderationRoutes from './handlers/moderation.routes'

const api = new Hono()

// API Version 1
const v1 = new Hono()

// Mount routes
v1.route('/auth', authRoutes)
v1.route('/users', userRoutes)
v1.route('/profile', profileRoutes)
v1.route('/moderation', moderationRoutes)

// Mount versioned API
api.route('/v1', v1)

export default api
