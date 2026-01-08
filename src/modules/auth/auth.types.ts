export interface LoginRequest {
    email: string
    password: string
}

export interface LoginResponse {
    token: string
    user: {
        id: string
        email: string
        name: string
        role: string
        isActive: boolean
        isEmailVerified: boolean
    }
}

export interface RegisterRequest {
    email: string
    password: string
    name: string
}
