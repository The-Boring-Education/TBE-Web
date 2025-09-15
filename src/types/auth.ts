export interface User {
    id: string
    name: string
    email: string
    image?: string
    isOnboarded?: boolean
    userName?: string
    occupation?: string
    purpose?: string[]
}

export interface GoogleUserInfo {
    sub: string
    name: string
    email: string
    picture: string
}

export interface AuthContextType {
    user: User | null
    loading: boolean
    signInWithGoogle: () => void
    signOut: () => Promise<void>
    updateUser: (updates: Partial<User>) => void
    refreshUserFromBackend: () => Promise<void>
    retryBackendVerification: () => Promise<void>
    checkAuth: () => Promise<void>
}