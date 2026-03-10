"use client";

import { useRouter } from "next/router";
import { type ReactNode, useEffect } from "react";

import { useAuth } from "../hooks/useAuth";

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
  requireAuth?: boolean;
  loadingComponent?: ReactNode;
}

/**
 * Client-side route protection component
 * Redirects unauthenticated users to sign-in page
 */
export const ProtectedRoute = ({
  children,
  redirectTo = "/auth/signin",
  requireAuth = true,
  loadingComponent,
}: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && requireAuth && !isAuthenticated) {
      // Store the intended destination
      const returnUrl = router.asPath;
      router.push(`${redirectTo}?callbackUrl=${encodeURIComponent(returnUrl)}`);
    }
  }, [isLoading, isAuthenticated, requireAuth, router, redirectTo]);

  // Show loading state
  if (isLoading) {
    return (
      loadingComponent || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto" />
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      )
    );
  }

  // If auth is not required or user is authenticated, render children
  if (!requireAuth || isAuthenticated) {
    return <>{children}</>;
  }

  // Don't render anything while redirecting
  return null;
};
