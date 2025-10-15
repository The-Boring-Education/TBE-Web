// Configuration
export { createAuthOptions } from "./config/nextauth"
export {
    sessionConfig,
    getCookieConfig,
    getAuthUrl,
    getAuthSecret
} from "./config/session"

// Providers
export { createGoogleProvider } from "./providers/google"

// Hooks
export { useAuth } from "./hooks/useAuth"

// Components
export { AuthProvider } from "./components/AuthProvider"
export { ProtectedRoute } from "./components/ProtectedRoute"

// Middleware
export { withAuth, withAdminAuth } from "./middleware/withAuth"

// Types
export type { ExtendedUser, AuthConfig, CreateUserData } from "./types"
