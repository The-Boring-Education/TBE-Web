import {
  Button,
  DsaPrepWorkspace,
  EditDsaOnboardingModal,
  Footer,
  LearningEnvironmentLayout,
  LoadingSpinner,
  Navbar,
  SEO,
  Text,
} from "@tbe/components";
import { routes } from "@tbe/constants";
import {
  useDsaCompletedQuestions,
  useDsaQuestions,
  useDsaTopics,
  useUser,
} from "@tbe/hooks";
import type { DsaQuestion, PageProps, UserProfile } from "@tbe/interface";
import { userService } from "@tbe/services";
import { getPreFetchProps } from "@tbe/utils";
import { Target } from "lucide-react";
import { useRouter } from "next/router";
import { Fragment, useEffect, useState } from "react";

import { STUDY_GUIDE_CONFIGS } from "../data/studyGuideData";

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

  const targetLabel = profile?.dsaYatra?.target || "Product-based";
  const timelineLabel = profile?.dsaYatra?.timeline || "4-6 months";
  const expLabel = profile?.dsaYatra?.experienceLevel || "Fresher (0-1 yr)";

  const isMatch =
    targetLabel === "Product-based" &&
    timelineLabel === "4-6 months" &&
    expLabel === "Fresher (0-1 yr)";

  if (!isMatch) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col font-sans">
        <Navbar
          variant="study-guide"
          compact
          userId={user?.id}
          onSignOut={() => router.push("/login")}
          theme="dark"
          showBackButton
          backButtonHref={routes.dsayatra.dashboard}
        />
        <main className="flex-1 pt-[54px] flex flex-col items-center justify-center px-4">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 max-w-md text-center">
            <Target className="w-14 h-14 text-[#ff5757] mx-auto mb-3" />
            <Text level="h3" className="text-xl font-bold text-white mb-2">
              Sheet Currently Unavailable
            </Text>
            <Text level="p" className="text-gray-400 mb-4 text-sm">
              This specific sheet is curated for users targeting{" "}
              <strong>Product-based companies</strong> within{" "}
              <strong>4-6 months</strong> with <strong>Fresher (0-1 yr)</strong>{" "}
              experience. <br />
              <br />
              Update your goals to access the SA PREP sheet, or explore topics
              directly.
            </Text>
            <div className="flex justify-center w-full">
              <Button
                variant="PRIMARY"
                onClick={() => setIsEditModalOpen(true)}
                className="bg-[#ff5757] hover:bg-[#ff4444] text-white font-bold px-8 py-3 rounded-xl transition-all hover:scale-105"
              >
                Adjust My Goals
              </Button>
            </div>
          </div>
        </main>
        <Footer isMini />
        <EditDsaOnboardingModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onUpdate={() => {
            if (user?.id) {
              setIsProfileLoading(true);
              userService.getProfile(user.id).then((p) => {
                setProfile(p);
                setIsProfileLoading(false);
              });
            }
          }}
          currentData={profile as any}
          userId={user?.id || ""}
        />
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
        studyGuideConfigs={STUDY_GUIDE_CONFIGS}
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
