import { useProductOnboardingGate } from "@tbe/hooks";
import { useRouter } from "next/router";
import { useCallback } from "react";

export const OnboardingCheck = () => {
  const router = useRouter();

  const buildRedirectUrl = useCallback(() => {
    if (typeof window === "undefined") return "/builder";
    return `${window.location.origin}/builder`;
  }, []);

  const { isChecking } = useProductOnboardingGate({
    pathname: router.pathname,
    publicRoutes: ["/login", "/auth"],
    productId: "resume-yatra",
    from: "resumeyatra",
    buildRedirectUrl,
    isOnboarded: (data) =>
      (data as { resumeYatra?: { ryOnboarded?: boolean } })?.resumeYatra
        ?.ryOnboarded === true,
  });

  if (isChecking) {
    return (
      <div className="fixed inset-0 bg-background z-[9999] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500" />
      </div>
    );
  }

  return null;
};
