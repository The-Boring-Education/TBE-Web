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
    publicRoutes: ["/login", "/", "/auth", "/journey/[username]"],
    productId: "dsayatra",
    from: "dsayatra",
    buildRedirectUrl,
    isOnboarded: (data) =>
      (data as { dsaYatra?: { dyOnboarded?: boolean } })?.dsaYatra
        ?.dyOnboarded === true,
  });

  if (isActivating) {
    return (
      <PersonalizationLoader
        title="Personalizing your DSA Yatra roadmap..."
        subtitle="Configuring curated coding patterns and problem sheets"
        fullScreen
        theme="dark"
      />
    );
  }

  return null;
};
