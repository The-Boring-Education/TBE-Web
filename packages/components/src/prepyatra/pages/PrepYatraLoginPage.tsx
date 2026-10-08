import { useAuth } from "@tbe/auth";
import { useRouter } from "next/router";
import { useEffect } from "react";

import LoadingSpinner from "../../common/LoadingSpinner";
import LoginCardNew from "../../containers/Cards/LoginCardNew";
import { getSafeRedirectPath } from "../../containers/Cards/LoginCardNew";
import InstallButton from "../features/InstallButton";

/**
 * Prep Yatra sign-in page — redirects authenticated users via `callbackUrl` (default `/dashboard`).
 */
export default function PrepYatraLoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const rawCallback = Array.isArray(router.query.callbackUrl)
        ? router.query.callbackUrl[0]
        : router.query.callbackUrl;
      const callbackUrl = getSafeRedirectPath(rawCallback, "/dashboard");
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

  return (
    <>
      <LoginCardNew variant="prepyatra" />
      <InstallButton />
    </>
  );
}
