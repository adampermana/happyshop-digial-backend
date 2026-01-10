/**
 * Standardized API response format
 */
export interface ApiResponse<T = any> {
    meta: {
        success: boolean
        message: string
        code: number
    }
    data?: T
}

/**
 * Success response helper
 */
export function successResponse<T>(message: string, data?: T, code: number = 200): ApiResponse<T> {
    return {
        meta: {
            success: true,
            message,
            code,
        },
        data,
    }
}

/**
 * Error response helper
 */
export function errorResponse(message: string, code: number = 400): ApiResponse {
    return {
        meta: {
            success: false,
            message,
            code,
        },
    }
}
