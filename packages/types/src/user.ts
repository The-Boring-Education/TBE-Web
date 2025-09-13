export interface BaseUser {
    _id: string
    email: string
    name?: string
    image?: string
    role?: string
    createdAt: Date
    updatedAt: Date
}

export interface AuthUser {
    id: string
    email: string
    name?: string
    image?: string
}

export interface UserSession {
    user: AuthUser
    expires: string
}
