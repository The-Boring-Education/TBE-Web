"use client";

import { AnalyticsWrapper } from "@tbe/components";
import { TBEQueryProvider } from "@tbe/query";
import React, { Suspense } from "react";

import { AnalyticsProvider } from "@/components/AnalyticsProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  const content = children as Parameters<
    typeof TBEQueryProvider
  >[0]["children"];
  return (
    <AnalyticsWrapper>
      <TBEQueryProvider>{content}</TBEQueryProvider>
    </AnalyticsWrapper>
  );
}
