"use client";

import { AuthProvider } from "@tbe/auth";
import { ThemeProvider } from "@tbe/hooks";
import { TBEQueryProvider } from "@tbe/query";
import React from "react";

import { TechYatraOnboardingGate } from "@/components/TechYatraOnboardingGate";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <TBEQueryProvider>
        <TechYatraOnboardingGate />
        <ThemeProvider>
          {children as Parameters<typeof TBEQueryProvider>[0]["children"]}
        </ThemeProvider>
      </TBEQueryProvider>
    </AuthProvider>
  );
}
