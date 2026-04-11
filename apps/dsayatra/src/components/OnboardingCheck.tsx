import { useProductOnboardingGate } from "@tbe/hooks";
import { useRouter } from "next/router";
import { useCallback } from "react";

export const OnboardingCheck = () => {
  const router = useRouter();

  const buildRedirectUrl = useCallback(() => {
    if (typeof window === "undefined") return "/dashboard";
    return `${window.location.origin}/dashboard`;
  }, []);

  const { isChecking } = useProductOnboardingGate({
    pathname: router.pathname,
    publicRoutes: ["/login", "/", "/auth"],
    productId: "dsayatra",
    from: "dsayatra",
    buildRedirectUrl,
    isOnboarded: (data) =>
      (data as { dsaYatra?: { dyOnboarded?: boolean } })?.dsaYatra
        ?.dyOnboarded === true,
  });

  if (isChecking) {
    return (
      <div className="fixed inset-0 bg-white z-[9999] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return null;
};
