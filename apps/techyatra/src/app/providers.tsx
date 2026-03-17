"use client";

import { AuthProvider } from "@tbe/auth";
import { TBEQueryProvider } from "@tbe/query";
import React from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <TBEQueryProvider>{children}</TBEQueryProvider>
    </AuthProvider>
  );
}
