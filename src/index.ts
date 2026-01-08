import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serve } from 'bun'
import authRoutes from './modules/auth/auth.routes'
import userRoutes from './modules/users/user.routes'
import { appConfig } from './config/app'

const app = new Hono()

// CORS middleware
app.use('/*', cors())

// Health check
app.get('/', (c) => {
  return c.json({
    status: 'ok',
    message: 'HappyShop Digital API',
    environment: appConfig.isDevelopment ? 'development' : 'production'
  })
})

app.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    port: appConfig.port
  })
})

// API v1 routes
app.route('/api/v1/auth', authRoutes)
app.route('/api/v1/users', userRoutes)

// Start server
serve({
  fetch: app.fetch,
  port: appConfig.port,
})

console.log(`🚀 Server running on http://${appConfig.host}:${appConfig.port}`)

export default app
