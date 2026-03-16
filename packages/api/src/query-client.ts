import { QueryClient } from "@tanstack/react-query";

import { CACHE_TIMES } from "./cache-config";

/**
 * Creates a QueryClient with production-ready defaults.
 *
 * Defaults use the STANDARD tier (5min stale, 10min gc) which is a safe
 * middle ground. Individual queries override these via their cache tier.
 *
 * The factory pattern ensures each SSR request / test gets its own client
 * (shared clients across requests cause data leaks in SSR).
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: CACHE_TIMES.STANDARD.staleTime,
        gcTime: CACHE_TIMES.STANDARD.gcTime,
        retry: 1,
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}
