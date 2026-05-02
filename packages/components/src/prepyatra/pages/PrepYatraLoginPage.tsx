import { useAuth } from "@tbe/auth";
import { useRouter } from "next/router";
import { useEffect } from "react";

import LoadingSpinner from "../../common/LoadingSpinner";
import LoginCardNew from "../../containers/Cards/LoginCardNew";
import Footer from "../../layout/Footer";
import Navbar from "../../layout/Navbar";
import InstallButton from "../features/InstallButton";

/**
 * Prep Yatra sign-in page — redirects authenticated users via `callbackUrl` (default `/dashboard`).
 */
export default function PrepYatraLoginPage() {
  const router = useRouter();
  const { signIn, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const callbackUrl = (router.query.callbackUrl as string) || "/dashboard";
      router.replace(callbackUrl);
    }
  }, [isAuthenticated, isLoading, router]);

  const _handleSignIn = () => {
    const callbackUrl = (router.query.callbackUrl as string) || "/dashboard";
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
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-lightBG">
      <Navbar variant="prepyatra" />
      <div className="flex flex-1 items-center justify-center px-4 py-8">
        <LoginCardNew variant="prepyatra" />
      </div>
      <Footer />
      <InstallButton />
    </div>
  );
}
