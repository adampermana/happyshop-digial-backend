import { prisma } from '@/libs/prisma/client'

export class UserService {
    /**
     * Get user profile by ID
     */
    static async getProfile(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isEmailVerified: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
                // Exclude password
            },
        })

        if (!user) {
            throw new Error('User not found')
        }

        return user
    }

    /**
     * Update user profile
     */
    static async updateProfile(userId: string, data: { name?: string }) {
        const user = await prisma.user.update({
            where: { id: userId },
            data,
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isEmailVerified: true,
                isActive: true,
                updatedAt: true,
            },
        })

        return user
    }
}
