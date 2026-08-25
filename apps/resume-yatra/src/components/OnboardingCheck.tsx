import { PersonalizationLoader } from "@tbe/components";
import { useProductOnboardingGate } from "@tbe/hooks";
import { useRouter } from "next/router";
import { useCallback } from "react";

export const OnboardingCheck = () => {
  const router = useRouter();

  const buildRedirectUrl = useCallback(() => {
    if (typeof window === "undefined") return "/builder/";
    return `${window.location.origin}/builder/`;
  }, []);

  const { isChecking, isActivating } = useProductOnboardingGate({
    pathname: router.pathname,
    publicRoutes: ["/", "/login", "/auth"],
    productId: "resume-yatra",
    from: "resumeyatra",
    buildRedirectUrl,
    isOnboarded: (data) =>
      (data as { resumeYatra?: { ryOnboarded?: boolean } })?.resumeYatra
        ?.ryOnboarded === true,
  });

  if (isActivating) {
    return (
      <PersonalizationLoader
        title="Preparing Resume Yatra..."
        subtitle="Setting up ATS resume builder and templates"
        fullScreen
      />
    );
  }

  return null;
};
