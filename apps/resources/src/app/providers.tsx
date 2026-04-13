"use client";

import { AuthProvider } from "@tbe/auth";
import { TBEQueryProvider } from "@tbe/query";
import React from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const content = children as Parameters<
    typeof TBEQueryProvider
  >[0]["children"];
  return (
    <AuthProvider>
      <TBEQueryProvider>{content}</TBEQueryProvider>
    </AuthProvider>
  );
}
