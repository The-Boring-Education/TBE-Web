import {
  DsaPrepWorkspace,
  LearningEnvironmentLayout,
  LoadingSpinner,
  SEO,
  Text,
} from "@tbe/components";
<<<<<<< HEAD
import { routes } from "@tbe/constants";
=======
import { DSA_STUDY_GUIDE_CONFIGS, TOPIC_LABELS } from "@tbe/constants";
>>>>>>> bd5a408ac7897c4543dedd9fdd0b0780abc164af
import {
  useDsaCompletedQuestions,
  useDsaQuestions,
  useDsaTopics,
  useUser,
} from "@tbe/hooks";
import type { DsaQuestion, PageProps, UserProfile } from "@tbe/interface";
import { userService } from "@tbe/services";
import { getPreFetchProps } from "@tbe/utils";
import { useRouter } from "next/router";
import { Fragment, useEffect, useState } from "react";

const SheetsPageClient = () => {
  const router = useRouter();
  const { loading: userLoading, isAuth, user } = useUser();

  const [selectedQuestion, setSelectedQuestion] = useState<DsaQuestion | null>(
    null,
  );
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { questions, loading: sheetsLoading } = useDsaQuestions();
  const { completedIds, toggleComplete } = useDsaCompletedQuestions();
  const { topicsWithCounts, topicsCompletionMap } = useDsaTopics(
    questions,
    completedIds,
  );

  useEffect(() => {
    if (user?.id) {
      setIsProfileLoading(true);
      userService
        .getProfile(user.id)
        .then((p) => {
          setProfile(p);
          setIsProfileLoading(false);
        })
        .catch(() => setIsProfileLoading(false));
    } else if (!userLoading) {
      setIsProfileLoading(false);
    }
  }, [user?.id, userLoading]);

  useEffect(() => {
    if (router.isReady && router.query.topic) {
      setSelectedTopic(router.query.topic as string);
    }
  }, [router.isReady, router.query.topic]);

  useEffect(() => {
    if (!userLoading && !isAuth) {
      router.push("/login");
    }
  }, [userLoading, isAuth, router]);

  const handleQuestionClick = (question: DsaQuestion) => {
    setSelectedQuestion(question);
  };

  const handleTopicClick = (topic: string) => {
    setSelectedTopic(topic);
    setSelectedQuestion(null);
  };

  const handleBackToTopics = () => {
    setSelectedTopic(null);
    setSelectedQuestion(null);
  };

  if (sheetsLoading || userLoading || isProfileLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#0A0A0A] font-sans items-center justify-center">
        <div className="flex items-center">
          <LoadingSpinner height={8} width={8} />
          <Text level="p" className="text-gray-400 ml-3">
            Loading Sheet...
          </Text>
        </div>
      </div>
    );
  }

  return (
    <LearningEnvironmentLayout backHref="/dashboard" layoutMode="workspace">
      <DsaPrepWorkspace
        questions={questions}
        topicsWithCounts={topicsWithCounts}
        selectedTopic={selectedTopic}
        selectedQuestion={selectedQuestion}
        onTopicClick={handleTopicClick}
        onQuestionClick={handleQuestionClick}
        onBackToTopics={handleBackToTopics}
        completionMap={topicsCompletionMap}
        completedQuestionIds={completedIds}
        onToggleComplete={toggleComplete}
        studyGuideConfigs={DSA_STUDY_GUIDE_CONFIGS}
      />
    </LearningEnvironmentLayout>
  );
};

export default function SheetsPage({ seoMeta }: PageProps) {
  return (
    <Fragment>
      <SEO seoMeta={seoMeta} appId="dsayatra" />
      <SheetsPageClient />
    </Fragment>
  );
}

export const getServerSideProps = async () =>
  getPreFetchProps({ slug: "/sheets", appId: "dsayatra" });
