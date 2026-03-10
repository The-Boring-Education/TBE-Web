import {
  Button,
  DsaQuestionList,
  EditDsaOnboardingModal,
  FlexContainer,
  LinkButton,
  LoadingSpinner,
  QuestionDetailPanel,
  SEO,
  Text,
} from "@tbe/components";
import { PAGE_REFRESH_TIMEOUT, routes, TOPIC_LABELS } from "@tbe/constants";
import { useApi, useUser } from "@tbe/hooks";
import type { DsaQuestion, PageProps, UserProfile } from "@tbe/interface";
import { userService } from "@tbe/services";
import { cn, getPreFetchProps } from "@tbe/utils";
import {
  ClipboardList,
  FileText,
  Home,
  Settings,
  Target,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { Fragment, useEffect, useMemo, useState } from "react";

import { transformDsaQuestion } from "../utils/dsaHelpers";

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

  // Completed questions tracking (localStorage for now)
  const [completedQuestions, setCompletedQuestions] = useState<
    (string | number)[]
  >([]);

  useEffect(() => {
    const saved = localStorage.getItem("dsayatra_completed_questions");
    if (saved) {
      try {
        setCompletedQuestions(JSON.parse(saved));
      } catch {}
    }
  }, []);

  const toggleQuestionComplete = (questionId: string | number) => {
    setCompletedQuestions((prev) => {
      const next = prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId];
      localStorage.setItem(
        "dsayatra_completed_questions",
        JSON.stringify(next),
      );
      return next;
    });
  };

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

  const { response, loading: sheetsLoading } = useApi("dsa-sheet", {
    url: `${routes.api.base}${routes.api.dsaSheet}?limit=1000`,
  });

  const dsaQuestions = React.useMemo(() => {
    const data = response?.data?.questions;

    if (!Array.isArray(data)) return [];

    return data.map(transformDsaQuestion);
  }, [response]);

  const topicsWithCounts = useMemo(() => {
    const topicMap = new Map<string, number>();

    dsaQuestions.forEach((question) => {
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
        const priorityA = Object.keys(TOPIC_LABELS).indexOf(a.topic);
        const priorityB = Object.keys(TOPIC_LABELS).indexOf(b.topic);
        if (priorityA !== -1 && priorityB !== -1) {
          return priorityA - priorityB;
        }
        return a.label.localeCompare(b.label);
      });
  }, [dsaQuestions]);

  const topicsCompletionMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    topicsWithCounts.forEach(({ topic }) => {
      const topicQuestions = dsaQuestions.filter(
        (q) => q.topics?.[0] === topic,
      );
      const isCompleted =
        topicQuestions.length > 0 &&
        topicQuestions.every((q) => {
          const qId = q.id || q.name;
          return completedQuestions.includes(qId);
        });
      map[topic] = isCompleted;
    });
    return map;
  }, [topicsWithCounts, dsaQuestions, completedQuestions]);

  const filteredQuestions = useMemo(() => {
    if (!selectedTopic) return [];
    return dsaQuestions.filter((q) => q.topics?.[0] === selectedTopic);
  }, [dsaQuestions, selectedTopic]);

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
      <div className="flex bg-[#0f0f0f] font-sans h-[calc(100vh-72px)]">
        <main className="flex-1 flex items-center justify-center">
          <LoadingSpinner height={8} width={8} />
          <Text level="p" className="text-gray-400 ml-3">
            Loading Sheet...
          </Text>
        </main>
      </div>
    );
  }

  // Check criteria:
  // "this sheet will come if the user has selected the goal timeline, four to six months, experience freshers, zero to one years, and fact [Product-based] in the cards."
  const targetLabel = profile?.dsaYatra?.target || "Product-based";
  const timelineLabel = profile?.dsaYatra?.timeline || "4-6 months";
  const expLabel = profile?.dsaYatra?.experienceLevel || "Fresher (0-1 yr)";

  const isMatch =
    targetLabel === "Product-based" &&
    timelineLabel === "4-6 months" &&
    expLabel === "Fresher (0-1 yr)";

  if (!isMatch) {
    return (
      <div className="flex bg-[#0f0f0f] font-sans h-[calc(100vh-72px)]">
        <main className="flex-1 px-4 pt-10 text-center flex flex-col items-center justify-center space-y-4">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-8 max-w-lg">
            <Target className="w-16 h-16 text-[#ff5757] mx-auto mb-4" />
            <Text level="h3" className="text-xl font-bold text-white mb-2">
              Sheet Currently Unavailable
            </Text>
            <Text level="p" className="text-gray-400 mb-6">
              This specific sheet is curated for users targeting{" "}
              <strong>Product-based companies</strong> within{" "}
              <strong>4-6 months</strong> with <strong>Fresher (0-1 yr)</strong>{" "}
              experience. <br />
              <br />
              Update your goals to access the SA PREP sheet, or explore topics
              directly.
            </Text>
            <Button
              variant="PRIMARY"
              onClick={() => setIsEditModalOpen(true)}
              className="bg-[#ff5757] hover:bg-[#ff5252] text-white font-bold"
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
      <FlexContainer
        direction="col"
        className="lg:flex-row flex-1 min-h-0 w-full"
        itemCenter={false}
        justifyCenter={false}
        wrap={false}
      >
        {/* Left Sidebar - Topics or Questions */}
        <div
          className={`flex flex-col flex-shrink-0 border-r border-[#2a2a2a] bg-black transition-all duration-300 ${selectedTopic ? "w-full lg:w-[350px]" : "flex-1 lg:flex-none w-full lg:w-[340px]"}`}
        >
          <div className="flex-1 overflow-y-auto px-5 py-5 scrollbar-thin-grey">
            {!selectedTopic ? (
              <div className="flex flex-col">
                <LinkButton
                  href={routes.dsayatra.dashboard}
                  className="mb-4 inline-block self-start"
                  buttonProps={{
                    variant: "OUTLINE",
                    size: "SMALL",
                    text: "← Back",
                    className:
                      "border-[#ff5757]/40 text-[#ff5757] bg-transparent hover:border-[#ff5757] hover:bg-[#ff5757]/10 font-bold px-4",
                  }}
                />
                <div className="mb-4">
                  <h1 className="text-[24px] font-bold text-white">
                    Explore Topics
                  </h1>
                  <p className="text-[13px] text-gray-400">
                    Choose a Topic to Begin
                  </p>
                </div>

                <FlexContainer
                  direction="col"
                  fullWidth
                  itemCenter={false}
                  justifyCenter={false}
                  wrap={false}
                  className="gap-2"
                >
                  {topicsWithCounts.map(({ topic, count, label }, index) => {
                    const isCompleted = topicsCompletionMap[topic];
                    return (
                      <div
                        key={topic}
                        className={cn(
                          "w-full border rounded-xl px-4 py-3.5 transition-all duration-200 cursor-pointer group flex items-center justify-between",
                          isCompleted
                            ? "border-green-500/30 hover:border-green-500/50 hover:bg-green-500/10 bg-[#0A0A0A]"
                            : "border-[#1A1C20] hover:border-[#ff5757] hover:bg-transparent bg-[#050505]",
                        )}
                        onClick={() => handleTopicClick(topic)}
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div
                            className={cn(
                              "flex items-center justify-center w-[22px] h-[22px] rounded-full border text-[11px] font-bold transition-all duration-200 shrink-0",
                              isCompleted
                                ? "border-green-500 text-green-500"
                                : "border-[#2a2a2a] text-[#555] group-hover:border-[#ff5757] group-hover:text-[#ff5757]",
                            )}
                          >
                            {index + 1}
                          </div>
                          <Text
                            level="p"
                            className={cn(
                              "text-[15px] font-bold truncate transition-colors",
                              isCompleted ? "text-green-500" : "text-white",
                            )}
                          >
                            {label}
                          </Text>
                        </div>
                        <div className="ml-3 shrink-0">
                          <Text
                            level="span"
                            className={cn(
                              "text-[13px] font-medium",
                              isCompleted ? "text-green-500/80" : "text-[#555]",
                            )}
                          >
                            {count}
                          </Text>
                        </div>
                      </div>
                    );
                  })}
                </FlexContainer>
              </div>
            ) : (
              <div className="space-y-4">
                <Button
                  onClick={handleBackToTopics}
                  variant="OUTLINE"
                  size="SMALL"
                  text="← Back to Topics"
                  className="border-[#2a2a2a] bg-transparent hover:border-[#ff5757] hover:bg-[#ff5757]/10 text-white"
                />

                <div className="mb-1">
                  <h1 className="mt-2 text-xl font-bold text-white">
                    Questions in {TOPIC_LABELS[selectedTopic] || selectedTopic}
                  </h1>
                  <p className="mb-4 text-xs text-gray-400 mt-1">
                    Select a question to view details
                  </p>

                  <DsaQuestionList
                    questions={filteredQuestions}
                    selectedQuestionId={selectedQuestion?.id}
                    onQuestionClick={handleQuestionClick}
                    completedQuestionIds={completedQuestions}
                    onToggleComplete={toggleQuestionComplete}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div
          className={`flex-1 flex flex-col min-w-0 bg-[#0A0A0A] ${!selectedTopic ? "hidden lg:flex" : "flex"}`}
        >
          <div
            className="flex-1 overflow-y-auto scrollbar-thin-grey px-4 py-4 scroll-smooth"
            id="right-scroll-area"
          >
            {!selectedTopic ? (
              <FlexContainer
                className="h-full"
                itemCenter
                justifyCenter
                fullWidth
                wrap={false}
              >
                <div className="text-center space-y-3 bg-[#111] p-10 rounded-2xl border border-[#2a2a2a] max-w-lg">
                  <Target className="w-12 h-12 text-[#ff5757]/50 mx-auto" />
                  <Text
                    level="p"
                    className="text-gray-300 text-[16px] font-bold"
                  >
                    Select a topic from the left
                  </Text>
                  <Text level="p" className="text-gray-500 text-[12px]">
                    Start your focused FAANG preparation today. Click on any
                    topic to view the curated list of questions.
                  </Text>
                </div>
              </FlexContainer>
            ) : (
              <div className="w-full max-w-4xl px-4">
                <div className="mb-6 pb-4 border-b border-[#2a2a2a]">
                  <Text
                    level="h2"
                    className="text-2xl font-bold text-white mb-1"
                  >
                    {TOPIC_LABELS[selectedTopic] || selectedTopic}
                  </Text>
                  <Text level="p" className="text-sm text-gray-400">
                    Continue your {TOPIC_LABELS[selectedTopic] || selectedTopic}{" "}
                    preparation journey.
                  </Text>
                </div>

                <div className="pb-1 w-full">
                  <QuestionDetailPanel question={selectedQuestion} />
                </div>
              </div>
            )}
          </div>
        </div>
      </FlexContainer>
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
