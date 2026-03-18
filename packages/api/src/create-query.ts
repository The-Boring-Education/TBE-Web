import {
  type QueryKey,
  useMutation,
  type UseMutationOptions,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";

import { CACHE_TIMES, type CacheTier } from "./cache-config";

// ── createQuery ──────────────────────────────────────────────────────────────

type CreateQueryOptions<TData, TParams> = {
  /** Function that produces a stable, unique query key from params */
  queryKey: (params: TParams) => QueryKey;
  /** The actual API call */
  queryFn: (params: TParams) => Promise<TData>;
  /** Cache tier — determines staleTime and gcTime */
  cacheTier?: CacheTier;
};

/**
 * Factory that produces a typed React Query hook from a service function.
 *
 * @example
 * // Define once in a hooks file:
 * export const useInterviewSheets = createQuery({
 *   queryKey: () => queryKeys.interviewPrep.lists(),
 *   queryFn: () => sendRequest({ method: "GET", url: "/interview-prep" }),
 *   cacheTier: "STATIC",
 * });
 *
 * // Use in any component:
 * const { data, isLoading } = useInterviewSheets({});
 */
export function createQuery<TData, TParams = void>({
  queryKey: keyFn,
  queryFn: fetchFn,
  cacheTier = "STANDARD",
}: CreateQueryOptions<TData, TParams>) {
  const tierConfig = CACHE_TIMES[cacheTier];

  return (
    params: TParams,
    options?: Omit<
      UseQueryOptions<TData, Error, TData, QueryKey>,
      "queryKey" | "queryFn"
    >,
  ) =>
    useQuery<TData, Error, TData, QueryKey>({
      queryKey: keyFn(params),
      queryFn: () => fetchFn(params),
      staleTime: tierConfig.staleTime,
      gcTime: tierConfig.gcTime,
      ...options,
    });
}

// ── createMutation ───────────────────────────────────────────────────────────

type CreateMutationOptions<TData, TVariables> = {
  /** The actual API call */
  mutationFn: (variables: TVariables) => Promise<TData>;
  /**
   * Query keys to invalidate on success.
   * Can be static keys or a function that receives the mutation result.
   */
  invalidates?:
    | QueryKey[]
    | ((data: TData, variables: TVariables) => QueryKey[]);
};

/**
 * Factory that produces a typed mutation hook with automatic cache invalidation.
 *
 * @example
 * export const useSubmitQuiz = createMutation({
 *   mutationFn: (vars: { quizId: string; answers: Answer[] }) =>
 *     quizApi.submit(vars.quizId, vars.answers),
 *   invalidates: (_, vars) => [
 *     queryKeys.quiz.detail(vars.quizId),
 *     queryKeys.quiz.attempts(vars.userId),
 *   ],
 * });
 */
export function createMutation<TData, TVariables>({
  mutationFn,
  invalidates,
}: CreateMutationOptions<TData, TVariables>) {
  return (
    options?: Omit<
      UseMutationOptions<TData, Error, TVariables, unknown>,
      "mutationFn"
    >,
  ) => {
    const queryClient = useQueryClient();

    return useMutation<TData, Error, TVariables, unknown>({
      mutationFn,
      onSuccess: (data, variables, onMutateResult, mutationContext) => {
        if (invalidates) {
          const keys =
            typeof invalidates === "function"
              ? invalidates(data, variables)
              : invalidates;
          keys.forEach((key) =>
            queryClient.invalidateQueries({ queryKey: key }),
          );
        }
        options?.onSuccess?.(data, variables, onMutateResult, mutationContext);
      },
      ...options,
    });
  };
}
