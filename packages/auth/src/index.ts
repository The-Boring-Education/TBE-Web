// Configuration
export {
  defaultJwtCallback,
  defaultSessionCallback,
  defaultSignInCallback,
} from "./config/callbacks";
export { createAuthOptions } from "./config/nextauth";
export {
  getAuthSecret,
  getAuthUrl,
  getCookieConfig,
  sessionConfig,
} from "./config/session";

// Providers
export { createGoogleProvider } from "./providers/google";

// Services
export { createOrFindUser, getUserByEmail, getUserById } from "./services";

// Hooks
export { useAuth } from "./hooks/useAuth";

// Components
export { AuthProvider } from "./components/AuthProvider";
export { ProtectedRoute } from "./components/ProtectedRoute";

// Middleware
export { withAdminAuth, withAuth } from "./middleware/withAuth";

// Plug-and-Play Handler
export {
  createNextAuthHandler,
  getAuthOptions,
} from "./handlers/nextAuthHandler";

// Types
export type {
  AppAuthConfig,
  AuthConfig,
  CreateUserData,
  ExtendedUser,
} from "./types";
