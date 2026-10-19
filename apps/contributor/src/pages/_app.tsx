import "@/styles/globals.css";

import { AuthProvider, useAuth } from "@tbe/auth";
import type { AppProps } from "next/app";
import { useEffect } from "react";

function CrossTabAuthSync() {
  const { isAuthenticated, refreshSession, signOut } = useAuth();

  useEffect(() => {
    const syncAuth = () => {
      // Check cookies for access token
      const hasToken = document.cookie.includes("tbe_access_token=");
      if (isAuthenticated && !hasToken) {
        // Logged out in another tab
        signOut();
      } else if (!isAuthenticated && hasToken) {
        // Logged in in another tab
        refreshSession();
      }
    };

    window.addEventListener("focus", syncAuth);
    window.addEventListener("storage", syncAuth);
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        syncAuth();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.removeEventListener("focus", syncAuth);
      window.removeEventListener("storage", syncAuth);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [isAuthenticated, refreshSession, signOut]);

  return null;
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <CrossTabAuthSync />
      <Component {...pageProps} />
    </AuthProvider>
  );
}
