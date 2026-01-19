/**
 * Environment Configuration
 * Centralized access to environment variables
 */

export const env = {
    // Server
    SERVER_HOST: process.env.SERVER_HOST,
    SERVER_PORT: process.env.SERVER_PORT,

    // Database (Prisma uses DATABASE_URL directly)
    DATABASE_URL: process.env.DATABASE_URL,

    // App
    NODE_ENV: process.env.NODE_ENV,
}
