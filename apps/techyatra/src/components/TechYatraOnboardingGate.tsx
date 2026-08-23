"use client";

import { PersonalizationLoader } from "@tbe/components";
import { useProductOnboardingGate } from "@tbe/hooks";
import { usePathname } from "next/navigation";
import { useCallback } from "react";

export function TechYatraOnboardingGate() {
  const pathname = usePathname() ?? "/";

  const buildRedirectUrl = useCallback(() => {
    if (typeof window === "undefined") return "/";
    return `${window.location.origin}/`;
  }, []);

  const { isChecking, isActivating } = useProductOnboardingGate({
    pathname,
    publicRoutes: ["/", "/auth/callback"],
    productId: "tech-yatra",
    from: "techyatra",
    buildRedirectUrl,
    isOnboarded: (data) =>
      (data as { techYatra?: { tyOnboarded?: boolean } })?.techYatra
        ?.tyOnboarded === true,
  });

  if (isActivating) {
    return (
      <PersonalizationLoader
        title="Setting up your Tech Yatra roadmaps..."
        subtitle="Personalizing full-stack & systems learning paths"
        fullScreen
      />
    );
  }

  return null;
}
