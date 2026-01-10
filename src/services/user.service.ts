import { prisma } from 'prisma/client'

export class UserService {
    /**
     * Get user profile by ID
     */
    static async getProfile(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id_user: userId },
            select: {
                id_user: true,
                email: true,
                username: true,
                role: true,
                is_email_verified: true,
                is_active: true,
                created_at: true,
                updated_at: true,
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
    static async updateProfile(user_id: string, data: { username?: string }) {
        const user = await prisma.user.update({
            where: { id_user: user_id },
            data,
            select: {
                id_user: true,
                email: true,
                username: true,
                role: true,
                is_email_verified: true,
                is_active: true,
                updated_at: true,
            },
        })

        return user
    }
}
