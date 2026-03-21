import { TOPIC_LABELS } from "@tbe/constants";
import type { DsaQuestion } from "@tbe/interface";
import { useCallback, useMemo } from "react";

export interface TopicWithCount {
  topic: string;
  count: number;
  label: string;
}

interface UseDsaTopicsReturn {
  topicsWithCounts: TopicWithCount[];
  topicsCompletionMap: Record<string, boolean>;
  getFilteredQuestions: (topic: string | null) => DsaQuestion[];
}

const useDsaTopics = (
  questions: DsaQuestion[],
  completedIds: (string | number)[] = [],
): UseDsaTopicsReturn => {
  const topicsWithCounts = useMemo(() => {
    const topicMap = new Map<string, number>();

    questions.forEach((question) => {
      const primaryTopic = question.topics?.[0];
      if (primaryTopic) {
        topicMap.set(primaryTopic, (topicMap.get(primaryTopic) || 0) + 1);
      }
    });

    return Array.from(topicMap.entries())
      .map(([topic, count]) => ({
        topic,
        count,
        label: TOPIC_LABELS[topic] || topic,
      }))
      .sort((a, b) => {
        const keys = Object.keys(TOPIC_LABELS);
        const priorityA = keys.indexOf(a.topic);
        const priorityB = keys.indexOf(b.topic);
        if (priorityA !== -1 && priorityB !== -1) return priorityA - priorityB;
        return a.label.localeCompare(b.label);
      });
  }, [questions]);

  const topicsCompletionMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    topicsWithCounts.forEach(({ topic }) => {
      const topicQuestions = questions.filter((q) => q.topics?.[0] === topic);
      const isCompleted =
        topicQuestions.length > 0 &&
        topicQuestions.every((q) => {
          const qId = q.id || q.name;
          return completedIds.includes(qId);
        });
      map[topic] = isCompleted;
    });
    return map;
  }, [topicsWithCounts, questions, completedIds]);

  const getFilteredQuestions = useCallback(
    (topic: string | null): DsaQuestion[] => {
      if (!topic) return [];
      return questions.filter((q) => q.topics?.[0] === topic);
    },
    [questions],
  );

  return { topicsWithCounts, topicsCompletionMap, getFilteredQuestions };
};

export default useDsaTopics;
