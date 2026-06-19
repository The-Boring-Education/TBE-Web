import { useAuth } from "@tbe/auth";
import { useRouter } from "next/router";
import { useEffect } from "react";

import LoadingSpinner from "../../common/LoadingSpinner";
import LoginCardNew from "../../containers/Cards/LoginCardNew";
import InstallButton from "../features/InstallButton";

/**
 * Prep Yatra sign-in page — redirects authenticated users via `callbackUrl` (default `/dashboard`).
 */
export default function PrepYatraLoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const callbackUrl = (router.query.callbackUrl as string) || "/dashboard";
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
