// Configuration
export { createAuthOptions } from "./config/nextauth"
export {
    sessionConfig,
    getCookieConfig,
    getAuthUrl,
    getAuthSecret
} from "./config/session"
export {
    defaultSignInCallback,
    defaultSessionCallback,
    defaultJwtCallback
} from "./config/callbacks"

// Providers
export { createGoogleProvider } from "./providers/google"

// Services
export { createOrFindUser, getUserByEmail, getUserById } from "./services"

// Hooks
export { useAuth } from "./hooks/useAuth"

// Components
export { AuthProvider } from "./components/AuthProvider"
export { ProtectedRoute } from "./components/ProtectedRoute"

// Middleware
export { withAuth, withAdminAuth } from "./middleware/withAuth"

// Plug-and-Play Handler
export { createNextAuthHandler, getAuthOptions } from "./handlers/nextAuthHandler"

// Types
export type { ExtendedUser, AuthConfig, CreateUserData, AppAuthConfig } from "./types"
