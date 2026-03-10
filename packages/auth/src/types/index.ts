import type { DefaultSession, DefaultUser } from "next-auth";
import type { DefaultJWT } from "next-auth/jwt";

/**
 * Extended user type with additional fields
 */
export interface ExtendedUser extends DefaultUser {
  id: string;
  email: string;
  name?: string;
  image?: string;
  isOnboarded?: boolean;
  userName?: string;
  occupation?: string;
  purpose?: string[];
  contactNo?: string;
}

/**
 * Extended session type
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: ExtendedUser;
  }

  interface User extends ExtendedUser {}
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    sub: string;
  }
}

/**
 * Auth configuration options
 */
export interface AuthConfig {
  apiUrl?: string;
  pages?: {
    signIn?: string;
    signOut?: string;
    error?: string;
    verifyRequest?: string;
    newUser?: string;
  };
  onSignIn?: (user: ExtendedUser, account?: any) => Promise<boolean> | boolean;
  onSession?: (session: any, token: any) => Promise<any> | any;
  useDefaultCallbacks?: boolean; // Enable/disable default auth callbacks
}

/**
 * Simplified app-specific auth configuration for plug-and-play setup
 */
export interface AppAuthConfig {
  /**
   * Custom pages configuration
   * Default: { signIn: "/auth", error: "/auth" }
   */
  pages?: {
    signIn?: string;
    signOut?: string;
    error?: string;
    verifyRequest?: string;
    newUser?: string;
  };

  /**
   * App-specific onboarding field path in user object
   * Examples:
   * - "prepYatra.pyOnboarded" for Prep Yatra
   * - "quiz.onboarded" for Quizes
   * - "isOnboarded" for simple onboarding (default)
   */
  onboardingField?: string;

  /**
   * Whether to add custom redirect logic to prevent redirect loops
   * Default: false
   */
  enableRedirectLogic?: boolean;

  /**
   * Custom session callback for advanced use cases
   * If provided, will be called after default session logic
   */
  customSessionCallback?: (
    session: any,
    token: any,
    userData: any,
  ) => Promise<any> | any;
}

/**
 * User data structure for API operations
 */
export interface CreateUserData {
  name: string;
  email: string;
  image?: string;
  provider: string;
  providerAccountId: string;
}
