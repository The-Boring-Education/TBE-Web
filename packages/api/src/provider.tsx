"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { type ReactNode, useEffect, useState } from "react";

import { createQueryClient } from "./query-client";

interface TBEQueryProviderProps {
  children: ReactNode;
  /** Show React Query DevTools (defaults to true in development) */
  devtools?: boolean;
}

/**
 * Drop-in QueryProvider for all TBE apps.
 *
 * Usage in _app.tsx or layout.tsx:
 *   import { TBEQueryProvider } from "@tbe/api";
 *   <TBEQueryProvider>{children}</TBEQueryProvider>
 *
 * Uses useState to ensure a single QueryClient per app instance
 * (avoids re-creating on every render, critical for cache persistence).
 */
export function TBEQueryProvider({
  children,
  devtools,
}: TBEQueryProviderProps) {
  const [queryClient] = useState(() => createQueryClient());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const showDevtools =
    devtools ?? (mounted && process.env.NODE_ENV === "development");

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {showDevtools && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
