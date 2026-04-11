"use client";

import { useProductOnboardingGate } from "@tbe/hooks";
import { usePathname } from "next/navigation";
import { useCallback } from "react";

export function TechYatraOnboardingGate() {
  const pathname = usePathname() ?? "/";

  const buildRedirectUrl = useCallback(() => {
    if (typeof window === "undefined") return "/";
    return `${window.location.origin}/`;
  }, []);

  const { isChecking } = useProductOnboardingGate({
    pathname,
    publicRoutes: ["/", "/auth/callback"],
    productId: "tech-yatra",
    from: "techyatra",
    buildRedirectUrl,
    isOnboarded: (data) =>
      (data as { techYatra?: { tyOnboarded?: boolean } })?.techYatra
        ?.tyOnboarded === true,
  });

  if (isChecking) {
    return (
      <div className="fixed inset-0 bg-white z-[9999] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return null;
}
