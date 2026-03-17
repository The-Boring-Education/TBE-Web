"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { getAuthApiUrl } from "../config";
import {
  clearTokens,
  decodeToken,
  getAccessToken,
  getRefreshToken,
  isTokenExpired,
  setTokens,
} from "../token";
import type { AuthContextType, AuthUser } from "../types";

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  signIn: () => {},
  signOut: () => {},
  refreshSession: async () => {},
});

export const useAuthContext = () => useContext(AuthContext);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getUserFromToken = useCallback((token: string): AuthUser | null => {
    const payload = decodeToken<{
      sub: string;
      email: string;
      name: string;
      image?: string;
      isOnboarded?: boolean;
    }>(token);
    if (!payload?.sub) return null;
    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      image: payload.image,
      isOnboarded: payload.isOnboarded ?? false,
    };
  }, []);

  const refreshAccessToken = useCallback(async (): Promise<boolean> => {
    const refreshToken = getRefreshToken();
    if (!refreshToken || isTokenExpired(refreshToken)) return false;

    try {
      const apiUrl = getAuthApiUrl();
      const response = await fetch(`${apiUrl}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) return false;

      const result = await response.json();
      if (result.status && result.data?.accessToken) {
        setTokens(result.data.accessToken, refreshToken);
        const newUser = getUserFromToken(result.data.accessToken);
        setUser(newUser);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [getUserFromToken]);

  const initializeAuth = useCallback(async () => {
    setIsLoading(true);
    try {
      const accessToken = getAccessToken();
      if (accessToken && !isTokenExpired(accessToken)) {
        setUser(getUserFromToken(accessToken));
        setIsLoading(false);
        return;
      }

      const refreshed = await refreshAccessToken();
      if (!refreshed) {
        clearTokens();
        setUser(null);
      }
    } catch {
      clearTokens();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [getUserFromToken, refreshAccessToken]);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    const accessToken = getAccessToken();
    if (!accessToken) return;

    const payload = decodeToken<{ exp: number }>(accessToken);
    if (!payload?.exp) return;

    const expiresIn = payload.exp * 1000 - Date.now();
    const refreshAt = expiresIn - 5 * 60 * 1000;
    if (refreshAt <= 0) return;

    const timer = setTimeout(() => {
      refreshAccessToken();
    }, refreshAt);

    return () => clearTimeout(timer);
  }, [user, refreshAccessToken]);

  const signIn = useCallback(
    (provider: string = "google", callbackUrl?: string) => {
      const apiUrl = getAuthApiUrl();
      const returnTo = callbackUrl || window.location.pathname;
      const redirectUri = `${window.location.origin}/auth/callback?returnTo=${encodeURIComponent(returnTo)}`;
      window.location.href = `${apiUrl}/auth/login?provider=${provider}&redirect_uri=${encodeURIComponent(redirectUri)}`;
    },
    [],
  );

  const signOut = useCallback((callbackUrl?: string) => {
    clearTokens();
    setUser(null);
    window.location.href = callbackUrl || "/";
  }, []);

  const refreshSession = useCallback(async () => {
    await refreshAccessToken();
  }, [refreshAccessToken]);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      signIn,
      signOut,
      refreshSession,
    }),
    [user, isLoading, signIn, signOut, refreshSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
