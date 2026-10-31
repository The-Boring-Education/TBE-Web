import { useAuth } from "@tbe/auth";
import type { ContributionTypeGroup } from "@tbe/constants";
import {
  CACHE_TIMES,
  createMutation,
  queryKeys,
  useQuery,
  type UseQueryResult,
} from "@tbe/query";

import {
  type ContributionItem,
  type ContributionsPage,
  type ContributorAPIResponse,
  type ContributorProfile,
  fetchContributorProfile,
  fetchUserSubmissions,
  submitContribution,
  type SubmitContributionPayload,
} from "../api/contributor";

export type ContributionFilter = ContributionTypeGroup | "all";

const UNEXPECTED_ERROR = "An unexpected error occurred. Please try again.";

const unwrap = <T>(res: ContributorAPIResponse<T>, fallback: string): T => {
  if (!res.status || res.data === undefined) {
    throw new Error(res.message || fallback);
  }
  return res.data;
};

export const useContributorProfile = (): UseQueryResult<
  ContributorProfile,
  Error
> => {
  const { user } = useAuth();
  return useQuery({
    queryKey: queryKeys.contributor.profile(user?.id),
    queryFn: async () =>
      unwrap(await fetchContributorProfile(), "Failed to load profile"),
    enabled: Boolean(user),
    ...CACHE_TIMES.STANDARD,
  });
};

export const useContributorSubmissions = (
  typeGroup: ContributionFilter,
  page: number,
): UseQueryResult<ContributionsPage, Error> => {
  const { user } = useAuth();
  return useQuery({
    queryKey: queryKeys.contributor.submissions({
      userId: user?.id,
      typeGroup,
      page,
    }),
    queryFn: async () =>
      unwrap(
        await fetchUserSubmissions(typeGroup, page),
        "Failed to load submissions. Please retry.",
      ),
    enabled: Boolean(user),
    ...CACHE_TIMES.STANDARD,
  });
};

export const useSubmitContribution = createMutation<
  ContributionItem | undefined,
  SubmitContributionPayload
>({
  mutationFn: async (payload) => {
    const res = await submitContribution(payload).catch(() => {
      throw new Error(UNEXPECTED_ERROR);
    });
    if (!res.status) {
      throw new Error(res.message || "Failed to submit contribution");
    }
    return res.data;
  },
  invalidates: [queryKeys.contributor.all],
});
