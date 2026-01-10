import { Hono } from 'hono'
import { ProfileController } from '../../controllers/profile.controller'

const profileRoutes = new Hono()

// Protected route (requires JWT token)
profileRoutes.get('/', ProfileController.getProfile)

export default profileRoutes
