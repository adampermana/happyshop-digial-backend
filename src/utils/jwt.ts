import * as jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

export interface JWTPayload {
    idUser: string
    email: string
    role: string
}

/**
 * Generate JWT token
 */
export function generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
    } as jwt.SignOptions)
}

/**
 * Verify and decode JWT token
 */
export function verifyToken(token: string): JWTPayload {
    try {
        return jwt.verify(token, JWT_SECRET) as JWTPayload
    } catch (error) {
        throw new Error('Invalid or expired token')
    }
}

/**
 * Decode JWT token without verification (for debugging)
 */
export function decodeToken(token: string): JWTPayload | null {
    const decoded = jwt.decode(token)
    return decoded as JWTPayload | null
}
