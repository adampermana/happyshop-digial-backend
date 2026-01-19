import { Hono } from 'hono'
import { ModerationController } from '../../controllers/moderation.controller'

const moderationRoutes = new Hono()

// All moderation routes require admin authentication
// TODO: Add admin authentication middleware

// Moderation actions
moderationRoutes.post('/suspend', ModerationController.suspendUser)
moderationRoutes.post('/ban', ModerationController.banUser)
moderationRoutes.post('/unsuspend', ModerationController.unsuspendUser)
moderationRoutes.post('/unban', ModerationController.unbanUser)

// Moderation queries
moderationRoutes.get('/history/:userId', ModerationController.getModerationHistory)
moderationRoutes.get('/status/:userId', ModerationController.checkModerationStatus)

export default moderationRoutes
