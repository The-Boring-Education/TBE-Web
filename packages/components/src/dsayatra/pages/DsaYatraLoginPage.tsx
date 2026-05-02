import { useAuth } from "@tbe/auth";
import { useRouter } from "next/router";
import { useEffect } from "react";

import LoadingSpinner from "../../common/LoadingSpinner";
import LoginCardNew from "../../containers/Cards/LoginCardNew";

/**
 * DSA Yatra sign-in (`/login`) — redirects authenticated users via `callbackUrl` (default `/dashboard`).
 */
export default function DsaYatraLoginPage() {
  const router = useRouter();
  const { signIn, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      let callbackUrl = (router.query.callbackUrl as string) || "/dashboard";

      if (callbackUrl && !callbackUrl.startsWith("/")) {
        callbackUrl = "/dashboard";
      }

      router.replace(callbackUrl);
    }
  }, [isAuthenticated, isLoading, router]);

  const _handleSignIn = () => {
    let callbackUrl = (router.query.callbackUrl as string) || "/dashboard";

    if (callbackUrl && !callbackUrl.startsWith("/")) {
      callbackUrl = "/dashboard";
    }

    signIn(callbackUrl);
  };

  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-lightBG">
      <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <LoginCardNew variant="dsayatra" />
      </div>
    </div>
  );
}
