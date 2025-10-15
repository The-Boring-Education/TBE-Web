import type { DefaultSession, DefaultUser } from "next-auth"
import type { DefaultJWT } from "next-auth/jwt"

/**
 * Extended user type with additional fields
 */
export interface ExtendedUser extends DefaultUser {
    id: string
    email: string
    name?: string
    image?: string
}

/**
 * Extended session type
 */
declare module "next-auth" {
    interface Session extends DefaultSession {
        user: ExtendedUser
    }

    interface User extends ExtendedUser {}
}

declare module "next-auth/jwt" {
    interface JWT extends DefaultJWT {
        sub: string
    }
}

/**
 * Auth configuration options
 */
export interface AuthConfig {
    apiUrl?: string
    pages?: {
        signIn?: string
        signOut?: string
        error?: string
        verifyRequest?: string
        newUser?: string
    }
    onSignIn?: (user: ExtendedUser, account?: any) => Promise<boolean> | boolean
    onSession?: (session: any, token: any) => Promise<any> | any
}

/**
 * User data structure for API operations
 */
export interface CreateUserData {
    name: string
    email: string
    image?: string
    provider: string
    providerAccountId: string
}
