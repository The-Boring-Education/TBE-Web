"use client";

import { AuthProvider } from "@tbe/auth";
import { TBEQueryProvider } from "@tbe/query";
import React from "react";

import { TechYatraOnboardingGate } from "@/components/TechYatraOnboardingGate";

export function Providers({ children }: { children: React.ReactNode }) {
  // Cast to avoid ReactNode mismatch when monorepo packages use different
  // @types/react (e.g. one allows bigint in ReactNode, the other does not).
  const content = children as Parameters<
    typeof TBEQueryProvider
  >[0]["children"];
  return (
    <AuthProvider>
      <TBEQueryProvider>
        <TechYatraOnboardingGate />
        {content}
      </TBEQueryProvider>
    </AuthProvider>
  );
}
