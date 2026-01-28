import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useApi, useUser } from "@tbe/hooks";
import { routes } from "@tbe/constants";
import { LoadingSpinner, DsaQuestionList, QuestionDetailPanel } from "@tbe/components";
import { DsaQuestion } from "@tbe/interface";

const DSAPrepPage = () => {
  const router = useRouter();
  const { loading: userLoading, isAuth } = useUser();
  const [selectedQuestion, setSelectedQuestion] = useState<DsaQuestion | null>(null)

  const { response, loading: sheetsLoading } = useApi("dsa-sheet", {
    url: `${routes.api.base}${routes.api.dsaSheet}`,
  });

  const dsaQuestions = React.useMemo(() => {
    const data = response?.data?.questions;

    if (!Array.isArray(data)) return [];

    return data.map((question: any) => ({
      id: question._id,
      name: question.title,
      difficultyLevel: question.difficulty,
      content: question.content,
      topics: question.topics,
      companyType: question.companyTypes,
      domain: question.domain,
    }));
  }, [response]);


  useEffect(() => {
    if (!userLoading && !isAuth) {
      router.push("/login");
    }
  }, [userLoading, isAuth, router]);

  const handleQuestionClick = (question: DsaQuestion) => {
    setSelectedQuestion(question)
  };

  if (sheetsLoading || userLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-2 w-full">
      <div className="w-60 flex-shrink-0 overflow-y-auto scrollbar-hide">
        <DsaQuestionList
          questions={dsaQuestions}
          selectedQuestionId={selectedQuestion?.id}
          onQuestionClick={handleQuestionClick}
          className="gap-1"
        />
      </div>

      <div className="flex-1 min-w-0 bg-[#0A0A0A] border border-gray-800 rounded-lg p-4 overflow-auto">
        <QuestionDetailPanel
          question={selectedQuestion}
        />
      </div>
    </div>
  );
};

export default DSAPrepPage;
