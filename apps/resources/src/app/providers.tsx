"use client";

import { TBEQueryProvider } from "@tbe/query";
import React from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const content = children as Parameters<
    typeof TBEQueryProvider
  >[0]["children"];
  return <TBEQueryProvider>{content}</TBEQueryProvider>;
}
