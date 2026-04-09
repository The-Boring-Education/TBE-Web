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
    publicRoutes: ["/login", "/", "/auth", "/onboarding"],
    productId: "oncampus",
    from: "oncampus",
    buildRedirectUrl,
    isOnboarded: (data) =>
      (data as { oncampus?: { onboardingCompleted?: boolean } })?.oncampus
        ?.onboardingCompleted === true,
  });

  if (isChecking) {
    return (
      <div className="fixed inset-0 bg-[#0A0A0A] z-[9999] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500" />
      </div>
    );
  }

  return null;
};
