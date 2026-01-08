import { env } from './env'

/**
 * Application Configuration
 */
export const appConfig = {
    host: env.SERVER_HOST,
    port: env.SERVER_PORT,
    isDevelopment: env.NODE_ENV === 'development',
    isProduction: env.NODE_ENV === 'production',
}
