export interface LoginRequest {
    username_or_email: string
    password: string
    latitude?: string
    longitude?: string
    uuid_device?: string
}

export interface LoginResponse {
    token: string
    user: {
        is_email_verified: boolean
        is_active: boolean
        is_login: boolean
        is_suspend: boolean
    }
}

export interface RegisterRequest {
    username: string
    email: string
    phone: string
    password: string
    latitude: string
    longitude: string
    uuid_device: string
    platform: string
    fcm_token: string
    is_rule: boolean
    country: string
}

export interface RegisterResponse {
    role: string
    email: string
    phone: string | null
    is_email_verified: boolean
    is_active: boolean
    is_suspend: boolean
    created_at: Date
    updated_at: Date
    image_profile: string | null
}

export interface VerifyAccountRequest {
    email: string
    otp: string
}

export interface VerifyAccountResponse {
    role: string
    email: string
    phone: string | null
    is_email_verified: boolean
    is_active: boolean
    is_suspend: boolean
    created_at: Date
    updated_at: Date
    image_profile: string | null
}

export interface ResendOTPRequest {
    email: string
    phone?: string
}

export interface ResendOTPResponse {
    otp: string
    is_otp: boolean
}

export interface CloseAccountRequest {
    reason: string
}

export interface ProfileResponse {
    role: string
    email: string
    phone: string | null
    is_email_verified: boolean
    is_active: boolean
    is_suspend: boolean
    created_at: Date
    updated_at: Date
    image_profile: string | null
}
