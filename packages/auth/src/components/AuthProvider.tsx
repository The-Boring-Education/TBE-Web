"use client";

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";

interface AuthProviderProps {
  children: ReactNode;
  session?: any;
}

/**
 * Auth provider component
 * Wraps SessionProvider with consistent configuration
 */
export const AuthProvider = ({ children, session }: AuthProviderProps) => {
  return (
    <SessionProvider
      session={session}
      refetchInterval={5 * 60} // Refetch session every 5 minutes
      refetchOnWindowFocus
    >
      {children}
    </SessionProvider>
  );
};
