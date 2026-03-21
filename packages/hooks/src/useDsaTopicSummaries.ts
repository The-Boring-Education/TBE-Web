import { routes } from "@tbe/constants";
import { CACHE_TIMES, queryKeys, useQuery } from "@tbe/query";
import { sendRequest } from "@tbe/utils";

export interface DsaTopicSummaryRow {
  topic: string;
  count: number;
}

/**
 * Fetches DSA topic ids + question counts only (no question bodies).
 * Use for sheet landing; pair with {@link useDsaQuestionsForTopic} on topic select.
 */
export const useDsaTopicSummaries = () => {
  return useQuery({
    queryKey: queryKeys.dsa.topics(),
    queryFn: async () => {
      const result = await sendRequest({
        url: `${routes.api.base}${routes.api.dsaSheet}?query=topics`,
        method: "GET",
      });

      const rows = result.data?.topics as DsaTopicSummaryRow[] | undefined;
      if (!Array.isArray(rows)) {
        throw new Error(result.message || "Failed to fetch DSA topics");
      }
      return rows;
    },
    ...CACHE_TIMES.STABLE,
  });
};
