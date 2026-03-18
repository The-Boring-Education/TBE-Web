"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";

import { useAuth } from "../hooks/useAuth";

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
  requireAuth?: boolean;
  loadingComponent?: ReactNode;
}

export const ProtectedRoute = ({
  children,
  redirectTo = "/login",
  requireAuth = true,
  loadingComponent,
}: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && requireAuth && !isAuthenticated) {
      const returnUrl = window.location.pathname + window.location.search;
      window.location.href = `${redirectTo}?returnTo=${encodeURIComponent(returnUrl)}`;
    }
  }, [isLoading, isAuthenticated, requireAuth, redirectTo]);

  if (isLoading) {
    return (
      loadingComponent || (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "3px solid #e5e7eb",
              borderTopColor: "#3b82f6",
              borderRadius: "50%",
              animation: "tbe-auth-spin 0.8s linear infinite",
            }}
          />
          <style>{`@keyframes tbe-auth-spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )
    );
  }

  if (!requireAuth || isAuthenticated) {
    return <>{children}</>;
  }

  return null;
};
