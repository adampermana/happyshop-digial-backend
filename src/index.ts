import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serve } from 'bun'
import apiRoutes from './routes/index_routes'
import { appConfig } from './config/app'

const app = new Hono()

// CORS middleware
app.use('/*', cors())

// Root health check
app.get('/', (c) => {
  return c.json({
    status: 'ok',
    message: 'HappyShop Digital API',
    version: '1.0.0',
    environment: appConfig.isDevelopment ? 'development' : 'production',
    timestamp: new Date().toISOString()
  })
})

// API routes
app.route('/api', apiRoutes)

// 404 handler
app.notFound((c) => {
  return c.json({
    status: 'error',
    message: 'Route not found',
    path: c.req.path
  }, 404)
})

// Global error handler
app.onError((err, c) => {
  console.error('Error:', err)
  return c.json({
    status: 'error',
    message: err.message || 'Internal server error'
  }, 500)
})

// Start server
serve({
  fetch: app.fetch,
  port: appConfig.port,
})

console.log(`🚀 Server running on http://${appConfig.host}:${appConfig.port}`)
console.log(`📝 Environment: ${appConfig.isDevelopment ? 'development' : 'production'}`)
console.log(`📚 API Documentation: http://${appConfig.host}:${appConfig.port}/api/v1`)

export default app
