export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  image?: string;
  isOnboarded?: boolean;
  userName?: string;
  occupation?: string;
  purpose?: string[];
  contactNo?: string;
  prepYatra?: Record<string, unknown>;
  dsaYatra?: Record<string, unknown>;
}

export interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (providerOrCallbackUrl?: string, callbackUrl?: string) => void;
  signOut: (callbackUrl?: string) => void;
  refreshSession: () => Promise<void>;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}
