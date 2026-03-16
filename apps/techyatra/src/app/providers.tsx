"use client";

import { TBEQueryProvider } from "@tbe/query";
import { SessionProvider } from "next-auth/react";
import React from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <TBEQueryProvider>{children}</TBEQueryProvider>
    </SessionProvider>
  );
}
