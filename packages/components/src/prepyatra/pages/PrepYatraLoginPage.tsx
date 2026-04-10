import { useAuth } from "@tbe/auth";
import { useRouter } from "next/router";
import { useEffect } from "react";

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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center  relative overflow-hidden bg-lightBG">
      <Navbar variant="prepyatra" />
      <div className="mt-8">
        <LoginCardNew variant="prepyatra" />
        <Footer />
      </div>
      <InstallButton />
    </div>
  );
}
