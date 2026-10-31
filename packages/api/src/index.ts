// Cache configuration
export { CACHE_TIMES, type CacheTier } from "./cache-config";

// Query key factory
export { queryKeys } from "./query-keys";

// QueryClient factory
export { createQueryClient } from "./query-client";

// Provider
export { TBEQueryProvider } from "./provider";

// Hook factories
export { createMutation, createQuery } from "./create-query";

// Re-export commonly used React Query primitives so apps don't need
// to depend on @tanstack/react-query directly
export {
  type QueryKey,
  useInfiniteQuery,
  useMutation,
  type UseMutationOptions,
  type UseMutationResult,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query";
