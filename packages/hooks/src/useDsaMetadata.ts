import { routes, TOPIC_LABELS } from "@tbe/constants";
import { CACHE_TIMES, queryKeys, useQuery } from "@tbe/query";
import { sendRequest } from "@tbe/utils";
import { useMemo } from "react";

import { type TopicWithCount } from "./useDsaTopics";

interface UseDsaMetadataReturn {
  topicsWithCounts: (TopicWithCount & { questions: string[] })[];
  topicsCompletionMap: Record<string, boolean>;
  totalQuestions: number;
  loading: boolean;
  error: any;
}

const useDsaMetadata = (
  completedIds: (string | number)[] = [],
): UseDsaMetadataReturn => {
  const {
    data: response,
    isLoading,
    error,
  } = useQuery<any>({
    queryKey: queryKeys.dsa.questions({ limit: 0, metadata: true as any }),
    queryFn: () =>
      sendRequest({
        url: `${routes.api.base}${routes.api.dsaSheet}?metadata=true`,
      }),
    ...CACHE_TIMES.STABLE,
  });

  const topicsWithCounts = useMemo(() => {
    const topics = response?.data?.filters?.topics;
    if (!Array.isArray(topics)) return [];

    return topics
      .map((t: any) => ({
        topic: t.topic,
        count: t.count,
        label: TOPIC_LABELS[t.topic] || t.topic,
        questions: t.questions || [],
      }))
      .sort((a, b) => {
        const keys = Object.keys(TOPIC_LABELS);
        const priorityA = keys.indexOf(a.topic);
        const priorityB = keys.indexOf(b.topic);
        if (priorityA !== -1 && priorityB !== -1) return priorityA - priorityB;
        return a.label.localeCompare(b.label);
      });
  }, [response]);

  const topicsCompletionMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    topicsWithCounts.forEach(({ topic, questions }) => {
      const isCompleted =
        questions.length > 0 &&
        questions.every((id: string) => completedIds.includes(id));
      map[topic] = isCompleted;
    });
    return map;
  }, [topicsWithCounts, completedIds]);

  return {
    topicsWithCounts,
    topicsCompletionMap,
    totalQuestions: response?.data?.totalQuestions || 0,
    loading: isLoading,
    error,
  };
};

export default useDsaMetadata;
