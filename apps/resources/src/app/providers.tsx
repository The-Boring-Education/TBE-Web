"use client";

import { AuthProvider } from "@tbe/auth";
import { AnalyticsWrapper } from "@tbe/components";
import { TBEQueryProvider } from "@tbe/query";
import React from "react";
import { Suspense } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const content = children as Parameters<
    typeof TBEQueryProvider
  >[0]["children"];

  return (
    <AuthProvider>
      <TBEQueryProvider>
        <Suspense fallback={<>{content}</>}>
          <AnalyticsWrapper>{content}</AnalyticsWrapper>
        </Suspense>
      </TBEQueryProvider>
    </AuthProvider>
  );
}
