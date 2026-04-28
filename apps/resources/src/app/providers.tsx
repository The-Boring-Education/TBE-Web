"use client";

import { TBEQueryProvider } from "@tbe/query";
import React, { Suspense } from "react";

import { AnalyticsProvider } from "@/components/AnalyticsProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  const content = children as Parameters<
    typeof TBEQueryProvider
  >[0]["children"];
  return (
    <TBEQueryProvider>
      <Suspense fallback={null}>
        <AnalyticsProvider>{content}</AnalyticsProvider>
      </Suspense>
    </TBEQueryProvider>
  );
}
