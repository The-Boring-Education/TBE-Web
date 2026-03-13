import {
  Button,
  DsaPrepWorkspace,
  EditDsaOnboardingModal,
  FlexContainer,
  LinkButton,
  LoadingSpinner,
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
      <div className="flex bg-gray-950 font-sans h-[calc(100vh-72px)]">
        <main className="flex-1 flex items-center justify-center">
          <LoadingSpinner height={8} width={8} />
          <Text level="p" className="text-gray-400 ml-3">
            Loading Sheet...
          </Text>
        </main>
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
      <div className="flex bg-gray-950 font-sans h-[calc(100vh-72px)]">
        <main className="flex-1 px-4 pt-10 text-center flex flex-col items-center justify-center space-y-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 max-w-lg">
            <Target className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <Text level="h3" className="text-xl font-bold text-white mb-2">
              Sheet Currently Unavailable
            </Text>
            <Text level="p" className="text-gray-400 mb-6">
              This specific sheet is curated for users targeting{" "}
              <strong>Product-based companies</strong> within{" "}
              <strong>4-6 months</strong> with <strong>Fresher (0-1 yr)</strong>{" "}
              experience. <br />
              <br />
              Update your goals to access the DSA PREP sheet, or explore topics
              directly.
            </Text>
            <Button
              variant="PRIMARY"
              onClick={() => setIsEditModalOpen(true)}
              className="bg-red-500 hover:bg-red-600 text-white font-bold"
            >
              Update Goals to Unlock
            </Button>
          </div>

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
        </main>
      </div>
    );
  }

  return (
    <FlexContainer
      direction="col"
      className="flex-1 min-h-0 w-full bg-[#0A0A0A] h-[calc(100vh-72px)] mt-0 font-sans"
      itemCenter={false}
      justifyCenter={false}
      wrap={false}
    >
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
        topicSidebarHeader={
          <LinkButton
            href={routes.dsayatra.dashboard}
            className="mb-4 inline-block self-start"
            buttonProps={{
              variant: "OUTLINE",
              size: "SMALL",
              text: "← Back",
              className:
                "border-red-500/40 text-red-500 bg-transparent hover:border-red-500 hover:bg-red-500/10 font-bold px-4",
            }}
          />
        }
      />
    </FlexContainer>
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
