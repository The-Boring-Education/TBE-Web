import { routes, TOPIC_LABELS } from "@tbe/constants";
import { CACHE_TIMES, queryKeys, useQuery } from "@tbe/query";
import { sendRequest } from "@tbe/utils";

import type { TopicWithCount } from "./useDsaTopics";

export interface DsaTopicSummaryRow {
  topic: string;
  count: number;
  solved: number;
}

import useUser from "./useUser";

type DsaProductContext = "DSA_YATRA" | "ONCAMPUS";

/**
 * Fetches DSA topic ids + question counts only (no question bodies).
 * Use for sheet landing; pair with {@link useDsaQuestionsForTopic} on topic select.
 */
export const useDsaTopicSummaries = (
  productType: DsaProductContext = "DSA_YATRA",
) => {
  const { user } = useUser();
  const userId = user?.id;

  return useQuery({
    queryKey: [...queryKeys.dsa.topics(userId), productType],
    queryFn: async () => {
      const url = `${routes.api.base}${routes.api.dsaSheet}?query=topics${userId ? `&userId=${userId}` : ""}&productType=${productType}`;
      const result = await sendRequest({
        url,
        method: "GET",
      });

      if (result.status !== true) {
        throw new Error(result.message || "Failed to fetch DSA topics");
      }

      const raw = result.data?.topics;
      if (!Array.isArray(raw)) {
        throw new Error(result.message || "Failed to fetch DSA topics");
      }
      const rows: TopicWithCount[] = raw
        .map((item: any) => {
          const topic = typeof item === "string" ? item : item.topic;
          const count = typeof item === "string" ? 0 : item.count || 0;
          const solved =
            typeof item === "string" || typeof item.solved !== "number"
              ? 0
              : item.solved;
          return {
            topic,
            count,
            solved,
            label: TOPIC_LABELS[topic],
          };
        })
        .filter((row: any) => !!row.label)
        .sort((a, b) => {
          const keys = Object.keys(TOPIC_LABELS);
          const idxA = keys.indexOf(a.topic);
          const idxB = keys.indexOf(b.topic);
          if (idxA !== -1 && idxB !== -1) return idxA - idxB;
          return a.label!.localeCompare(b.label!);
        }) as TopicWithCount[];
      return rows;
    },
    enabled: !!userId,
    ...CACHE_TIMES.STABLE,
  });
};
