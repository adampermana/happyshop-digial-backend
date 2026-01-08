import { prisma } from '@/libs/prisma/client'
import { hashPassword, comparePassword } from '@/utils/hash'
import { generateToken } from '@/utils/jwt'
import type { LoginRequest, LoginResponse, RegisterRequest } from './auth.types'

export class AuthService {
    /**
     * Login user with email and password
     */
    static async login(data: LoginRequest): Promise<LoginResponse> {
        const { email, password } = data

        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email },
        })

        if (!user) {
            throw new Error(`Account not registered, please register account ${email}`)
        }

        // Check if account is active
        if (!user.isActive) {
            throw new Error('Account is inactive. Please contact support.')
        }

        // Verify password
        const isPasswordValid = await comparePassword(password, user.password)
        if (!isPasswordValid) {
            throw new Error('Invalid email or password')
        }

        // Generate JWT token
        const token = generateToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        })

        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                isActive: user.isActive,
                isEmailVerified: user.isEmailVerified,
            },
        }
    }

    /**
     * Register new user
     */
    static async register(data: RegisterRequest): Promise<LoginResponse> {
        const { email, password, name } = data

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        })

        if (existingUser) {
            throw new Error('Email already registered')
        }

        // Hash password
        const hashedPassword = await hashPassword(password)

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role: 'user',
                isEmailVerified: false,
                isActive: true,
            },
        })

        // Generate JWT token
        const token = generateToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        })

        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                isActive: user.isActive,
                isEmailVerified: user.isEmailVerified,
            },
        }
    }
}
