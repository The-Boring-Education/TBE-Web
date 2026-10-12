import { routes, TOPIC_LABELS } from "@tbe/constants";
import { CACHE_TIMES, queryKeys, useQuery } from "@tbe/query";
import type { DsaTopicSummaryRow } from "@tbe/types";
import { sendRequest } from "@tbe/utils";

import type { TopicWithCount } from "./useDsaTopics";

export type { DsaTopicSummaryRow } from "@tbe/types";

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
      const rows = raw
        .map((item: unknown): (TopicWithCount & DsaTopicSummaryRow) | null => {
          const row =
            typeof item === "object" && item !== null
              ? (item as Record<string, unknown>)
              : {};
          const topic = typeof item === "string" ? item : row.topic;
          if (typeof topic !== "string" || !TOPIC_LABELS[topic]) return null;
          return {
            topic,
            count: typeof row.count === "number" ? row.count : 0,
            solved: typeof row.solved === "number" ? row.solved : 0,
            accessibleCount:
              typeof row.accessibleCount === "number" ? row.accessibleCount : 0,
            accessibleSolved:
              typeof row.accessibleSolved === "number"
                ? row.accessibleSolved
                : 0,
            label: TOPIC_LABELS[topic],
          };
        })
        .filter(
          (row): row is TopicWithCount & DsaTopicSummaryRow => row !== null,
        )
        .sort((a, b) => {
          const keys = Object.keys(TOPIC_LABELS);
          const idxA = keys.indexOf(a.topic);
          const idxB = keys.indexOf(b.topic);
          if (idxA !== -1 && idxB !== -1) return idxA - idxB;
          return a.label!.localeCompare(b.label!);
        });
      return rows;
    },
    enabled: !!userId,
    ...CACHE_TIMES.STANDARD,
  });
};
