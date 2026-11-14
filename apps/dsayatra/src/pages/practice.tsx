import { Fragment, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { DsaPracticeIDE, LoadingSpinner, SEO } from "@tbe/components";
import { routes } from "@tbe/constants";
import { useDsaQuestionsForTopic } from "@tbe/hooks";
import type { DsaQuestion, PageProps } from "@tbe/interface";
import {
  decodeDsaTopicFromUrl,
  findDsaQuestionByUrlSlug,
  getPreFetchProps,
} from "@tbe/utils";

export default function DsaPracticePage({ seoMeta }: PageProps) {
  const router = useRouter();
  const [targetQuestion, setTargetQuestion] = useState<DsaQuestion | null>(
    null,
  );

  const topicQuery =
    typeof router.query.topic === "string" ? router.query.topic : null;
  const decodedTopic = topicQuery ? decodeDsaTopicFromUrl(topicQuery) : "ARRAY";

  const { questions, loading } = useDsaQuestionsForTopic(decodedTopic, {
    productType: "DSA_YATRA",
  });

  useEffect(() => {
    if (!router.isReady || loading || !questions || questions.length === 0) {
      return;
    }

    const questionSlug =
      typeof router.query.question === "string" ? router.query.question : null;

    if (questionSlug) {
      const found = findDsaQuestionByUrlSlug(questions, questionSlug);
      if (found) {
        setTargetQuestion(found);
        return;
      }
    }

    if (!targetQuestion && questions[0]) {
      setTargetQuestion(questions[0]);
    }
  }, [router.isReady, router.query.question, questions, loading, targetQuestion]);

  const handleClose = () => {
    router.push(routes.dsayatra.home);
  };

  return (
    <Fragment>
      <SEO
        meta={{
          title: "DSA Practice IDE | The Boring Education",
          description:
            "Practice DSA coding problems in an interactive split-screen IDE with test-case validation and multi-language support.",
          ...seoMeta,
        }}
      />

      <div className="w-full h-screen h-[100dvh] bg-[#0E0E11] text-white flex flex-col font-sans overflow-hidden">
        {loading || !targetQuestion ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <LoadingSpinner />
            <p className="text-xs text-slate-400 font-mono">
              Loading Practice IDE...
            </p>
          </div>
        ) : (
          <DsaPracticeIDE
            question={targetQuestion}
            isOpen
            onClose={handleClose}
          />
        )}
      </div>
    </Fragment>
  );
}

export const getServerSideProps = async () =>
  getPreFetchProps({ slug: "/practice", appId: "dsayatra" });
