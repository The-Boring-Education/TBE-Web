import type { DsaQuestion } from "@tbe/interface";
import {
  decodeDsaTopicFromUrl,
  encodeDsaQuestionTitleForUrl,
  encodeDsaTopicForUrl,
  findDsaQuestionByUrlSlug,
} from "@tbe/utils";
import type { NextRouter } from "next/router";
import { useCallback, useEffect } from "react";

export interface UseDsaPrepUrlSyncParams {
  router: NextRouter;
  selectedTopic: string | null;
  setSelectedTopic: (topic: string | null) => void;
  setSelectedQuestion: (q: DsaQuestion | null) => void;
  topicQuestions: DsaQuestion[];
  topicQuestionsLoading: boolean;
}

/**
 * Keeps `topic` / `question` query params in sync with DSA prep workspace state
 * (shallow routing). Hydrates state from URL on load and on browser back/forward.
 */
export const useDsaPrepUrlSync = ({
  router,
  selectedTopic,
  setSelectedTopic,
  setSelectedQuestion,
  topicQuestions,
  topicQuestionsLoading,
}: UseDsaPrepUrlSyncParams) => {
  const replaceQuery = useCallback(
    (query: Record<string, string>) => {
      void router.replace({ pathname: router.pathname, query }, undefined, {
        shallow: true,
      });
    },
    [router],
  );

  useEffect(() => {
    if (!router.isReady) return;

    const rawTopic = router.query.topic;
    if (rawTopic === undefined) {
      setSelectedTopic(null);
      return;
    }

    const decoded = decodeDsaTopicFromUrl(
      Array.isArray(rawTopic) ? rawTopic[0] : rawTopic,
    );
    if (decoded) {
      setSelectedTopic(decoded);
    } else {
      setSelectedTopic(null);
      replaceQuery({});
    }
  }, [router.isReady, router.query.topic, replaceQuery, setSelectedTopic]);

  useEffect(() => {
    if (!router.isReady || !selectedTopic) {
      setSelectedQuestion(null);
      return;
    }
    if (topicQuestionsLoading) {
      setSelectedQuestion(null);
      return;
    }

    const rawQ = router.query.question;
    const qSlug =
      rawQ === undefined ? undefined : Array.isArray(rawQ) ? rawQ[0] : rawQ;

    if (!qSlug) {
      setSelectedQuestion(null);
      return;
    }

    const found = findDsaQuestionByUrlSlug(topicQuestions, qSlug);
    if (found) {
      setSelectedQuestion(found);
    } else {
      setSelectedQuestion(null);
      replaceQuery({ topic: encodeDsaTopicForUrl(selectedTopic) });
    }
  }, [
    router.isReady,
    router.query.question,
    selectedTopic,
    topicQuestions,
    topicQuestionsLoading,
    replaceQuery,
    setSelectedQuestion,
  ]);

  const handleTopicClick = useCallback(
    (topic: string) => {
      setSelectedTopic(topic);
      setSelectedQuestion(null);
      replaceQuery({ topic: encodeDsaTopicForUrl(topic) });
    },
    [replaceQuery, setSelectedQuestion, setSelectedTopic],
  );

  const handleQuestionClick = useCallback(
    (question: DsaQuestion) => {
      setSelectedQuestion(question);
      const raw = router.query.topic;
      const topicFromUrl =
        typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : undefined;
      const topicKey =
        selectedTopic ?? decodeDsaTopicFromUrl(topicFromUrl) ?? null;
      if (!topicKey) return;
      replaceQuery({
        topic: encodeDsaTopicForUrl(topicKey),
        question: encodeDsaQuestionTitleForUrl(question.name),
      });
    },
    [replaceQuery, router.query.topic, selectedTopic, setSelectedQuestion],
  );

  const handleBackToTopics = useCallback(() => {
    setSelectedTopic(null);
    setSelectedQuestion(null);
    replaceQuery({});
  }, [replaceQuery, setSelectedQuestion, setSelectedTopic]);

  return { handleTopicClick, handleQuestionClick, handleBackToTopics };
};
