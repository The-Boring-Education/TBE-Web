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

      const raw = result.data?.topics;
      if (!Array.isArray(raw)) {
        throw new Error(result.message || "Failed to fetch DSA topics");
      }
      // API may return legacy string[]; sheet UI expects { topic, count }.
      const rows: DsaTopicSummaryRow[] = raw.map((item: unknown) =>
        typeof item === "string"
          ? { topic: item, count: 0 }
          : (item as DsaTopicSummaryRow),
      );
      return rows;
    },
    ...CACHE_TIMES.STABLE,
  });
};
