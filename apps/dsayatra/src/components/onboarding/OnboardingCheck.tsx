import { LoadingSpinner } from "@tbe/components";
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
    publicRoutes: ["/login", "/", "/auth", "/journey/[username]"],
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
        <LoadingSpinner />
      </div>
    );
  }

  return null;
};
