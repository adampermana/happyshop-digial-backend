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

    // JWT
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,

    // App
    NODE_ENV: process.env.NODE_ENV,
}
