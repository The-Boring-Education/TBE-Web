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
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      let callbackUrl = (router.query.callbackUrl as string) || "/dashboard";

      if (callbackUrl && !callbackUrl.startsWith("/")) {
        callbackUrl = "/dashboard";
      }

      router.replace(callbackUrl);
    }
  }, [isAuthenticated, isLoading, router]);

  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0b]">
        <LoadingSpinner />
      </div>
    );
  }

  return <LoginCardNew variant="dsayatra" />;
}
