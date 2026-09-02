import { PersonalizationLoader } from "@tbe/components";
import { useProductOnboardingGate } from "@tbe/hooks";
import { useRouter } from "next/router";
import { useCallback } from "react";

export const OnboardingCheck = () => {
  const router = useRouter();

  const buildRedirectUrl = useCallback(() => {
    if (typeof window === "undefined") return "/dashboard";
    return `${window.location.origin}/dashboard`;
  }, []);

  const { isChecking, isActivating } = useProductOnboardingGate({
    pathname: router.pathname,
    publicRoutes: ["/login", "/", "/auth", "/onboarding"],
    productId: "oncampus",
    from: "oncampus",
    buildRedirectUrl,
    isOnboarded: (data) =>
      (data as { oncampus?: { onboardingCompleted?: boolean } })?.oncampus
        ?.onboardingCompleted === true,
  });

  if (isActivating) {
    return (
      <PersonalizationLoader
        title="Setting up OnCampus placement portal..."
        subtitle="Preparing mock assessments and campus drive roadmaps"
        fullScreen
        theme="dark"
      />
    );
  }

  return null;
};
