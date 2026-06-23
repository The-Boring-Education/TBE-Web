import {
  AptitudeQuizPanel,
  Button,
  DsaUpsellModal,
  FlexContainer,
  FreemiumLockBanner,
  LoadingSpinner,
  Text,
} from "@tbe/components";
import { routes } from "@tbe/constants";
import { useUser } from "@tbe/hooks";
import type { AptitudeQuestion } from "@tbe/interface";
import { CACHE_TIMES, queryKeys, useQuery, useQueryClient } from "@tbe/query";
import { cn, sendRequest } from "@tbe/utils";
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  ChevronRight,
  Clock,
  Folder,
  FolderOpen,
  Lightbulb,
  List,
  ListFilter,
  Lock,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { CoreSubjectMDXRenderer } from "@/components/CoreSubjectMDXRenderer";
import OnCampusLearningLayout from "@/components/OnCampusLearningLayout";

/* ─────────────────────────────────────────────
   Sub-components
   ───────────────────────────────────────────── */

/** Single topic entry in the left sidebar */
function TopicItem({
  topic,
  isActive,
  onClick,
}: {
  topic: { topic: string; count: number; label: string; isLocked: boolean };
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full group relative py-2.5 px-4 rounded-r-lg border-l-[3px] transition-all duration-300 cursor-pointer text-left focus:outline-none",
        isActive
          ? "bg-red-500/[0.03] border-red-500 shadow-[0_1px_6px_rgba(239,68,68,0.02)] text-white"
          : "border-transparent bg-transparent hover:bg-white/[0.02] hover:border-gray-800 text-gray-400",
      )}
      aria-pressed={isActive}
    >
      <FlexContainer
        className="items-center w-full gap-3"
        itemCenter
        justifyCenter={false}
      >
        {isActive ? (
          <FolderOpen className="w-[15px] h-[15px] shrink-0 text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
        ) : topic.isLocked ? (
          <Lock className="w-[15px] h-[15px] shrink-0 text-red-500/80" />
        ) : (
          <Folder className="w-[15px] h-[15px] shrink-0 text-gray-600 group-hover:text-gray-400 transition-colors" />
        )}
        <Text
          level="p"
          className="text-[13px] font-semibold leading-tight transition-colors duration-300 py-0.5 text-left break-words whitespace-normal flex-1"
        >
          {topic.label}
        </Text>
      </FlexContainer>
    </button>
  );
}

/* ─────────────────────────────────────────────
   Main Component Page
   ───────────────────────────────────────────── */

const AptitudePrepPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, loading: userLoading, isAuth } = useUser();
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedTopicLabel, setSelectedTopicLabel] = useState<string>("");
  const [viewMode, setViewMode] = useState<"STUDY" | "QUIZ">("STUDY");
  const [isMobileTopicsOpen, setIsMobileTopicsOpen] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [activeHeadingId, setActiveHeadingId] = useState<string>("");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isStudyCompleted, setIsStudyCompleted] = useState<boolean>(false);

  const handleAptitudeProgressSaved = useCallback(() => {
    if (selectedTopic && user?.id) {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.aptitude.questions(selectedTopic, user.id),
      });
      // Server awards COMPLETE_APTITUDE_QUESTION; refresh navbar points.
      void queryClient.invalidateQueries({
        queryKey: queryKeys.gamification.points(user.id),
      });
    }
  }, [queryClient, selectedTopic, user?.id]);

  // Fetch Topics (auto-fetch, includes userId parameter to personalize locked/unlocked state)
  const { data: topicsResponse, isLoading: topicsLoading } = useQuery<any>({
    queryKey: queryKeys.aptitude.topics(user?.id),
    queryFn: () => {
      const userParam = user?.id
        ? `&userId=${encodeURIComponent(user.id)}`
        : "";
      return sendRequest({
        url: `${routes.api.base}${routes.api.interviewPrep}?roadmap=APTITUDE${userParam}`,
      });
    },
    enabled: !userLoading,
    ...CACHE_TIMES.STATIC,
  });

  const topicsWithCounts = useMemo(() => {
    const data = topicsResponse?.data;
    if (!Array.isArray(data)) return [];

    return data
      .map((t: any) => ({
        topic: t.slug,
        count: t.questionCount,
        label: t.name,
        isLocked: t.isLocked || false,
      }))
      .sort((a: any, b: any) => a.label.localeCompare(b.label));
  }, [topicsResponse]);

  const selectedTopicData = useMemo(() => {
    return selectedTopic
      ? topicsWithCounts.find((t) => t.topic === selectedTopic)
      : undefined;
  }, [selectedTopic, topicsWithCounts]);

  const isSelectedTopicLocked = selectedTopicData?.isLocked || false;

  const topicHasQuestions =
    !selectedTopicData || (selectedTopicData.count ?? 0) > 0;

  // Fetch Questions (enabled when topic selected and has questions)
  const {
    data: questionsResponse,
    isLoading: questionsLoading,
    refetch: refetchQuestions,
  } = useQuery<any>({
    queryKey: queryKeys.aptitude.questions(
      selectedTopic ?? "",
      user?.id ?? undefined,
    ),
    queryFn: () => {
      const userParam = user?.id
        ? `&userId=${encodeURIComponent(user.id)}`
        : "";
      return sendRequest({
        url: `${routes.api.base}${routes.api.interviewPrep}?roadmap=APTITUDE&topic=${selectedTopic}${userParam}`,
      });
    },
    ...CACHE_TIMES.STABLE,
    enabled:
      !!selectedTopic &&
      topicHasQuestions &&
      (!isAuth || (!!user?.id && !userLoading)),
  });

  // Fetch Study Guide (enabled when topic selected)
  const { data: studyGuideResponse, isLoading: studyGuideLoading } =
    useQuery<any>({
      queryKey: queryKeys.aptitude.studyGuide(selectedTopic ?? "", user?.id),
      queryFn: () => {
        const userParam = user?.id
          ? `&userId=${encodeURIComponent(user.id)}`
          : "";
        return sendRequest({
          url: `${routes.api.base}${routes.api.interviewPrep}/aptitude/study-guide?topic=${selectedTopic}${userParam}`,
        });
      },
      ...CACHE_TIMES.STABLE,
      enabled: !!selectedTopic && (!isAuth || (!!user?.id && !userLoading)),
    });

  const questions = useMemo(() => {
    const data = questionsResponse?.data?.questions;
    if (!Array.isArray(data)) return [];
    return data as AptitudeQuestion[];
  }, [questionsResponse]);

  const isTopicEmpty = !!selectedTopicData && selectedTopicData.count === 0;

  useEffect(() => {
    if (!userLoading && !isAuth) {
      router.push("/login");
    }
  }, [userLoading, isAuth, router]);

  useEffect(() => {
    if (selectedTopic) {
      const key = `aptitude-completed-${selectedTopic}`;
      setIsStudyCompleted(localStorage.getItem(key) === "true");
    }
  }, [selectedTopic]);

  const handleTopicClick = (topic: string, label: string) => {
    setSelectedTopic(topic);
    setSelectedTopicLabel(label);
    setViewMode("STUDY");
    setIsMobileTopicsOpen(false);
  };

  const handleBackToTopics = () => {
    setSelectedTopic(null);
    setSelectedTopicLabel("");
    setViewMode("STUDY");
    setIsMobileTopicsOpen(true);
  };

  const toggleStudyCompleted = () => {
    if (!selectedTopic) return;
    const key = `aptitude-completed-${selectedTopic}`;
    const nextState = !isStudyCompleted;
    setIsStudyCompleted(nextState);
    localStorage.setItem(key, String(nextState));
  };

  // Extract headings for Table of Contents (sticky sidebar)
  const headings = useMemo(() => {
    const markdown = studyGuideResponse?.data?.content || "";
    if (!markdown) return [];
    const lines = markdown.split("\n");
    const list: { text: string; id: string; level: number }[] = [];
    let inCodeBlock = false;

    lines.forEach((line: string) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("```")) {
        inCodeBlock = !inCodeBlock;
        return;
      }
      if (inCodeBlock) return;

      const match = line.match(/^(#{2,3})\s+(.*)/);
      if (match) {
        const level = match[1].length;
        const text = match[2].trim().replace(/\*\*|`/g, "");
        const id = text
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
        if (text) {
          list.push({ text, id, level });
        }
      }
    });
    return list;
  }, [studyGuideResponse?.data?.content]);

  // Table of Contents navigation scroll
  const scrollToHeading = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Observe heading in view for TOC active states
  useEffect(() => {
    if (headings.length === 0 || viewMode !== "STUDY") return;

    const observerOptions = {
      root: scrollContainerRef.current,
      rootMargin: "-20px 0px -65% 0px",
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      const visibleEntries = entries.filter((entry) => entry.isIntersecting);
      if (visibleEntries.length > 0) {
        const sorted = visibleEntries.sort(
          (a, b) => a.boundingClientRect.top - b.boundingClientRect.top,
        );
        setActiveHeadingId(sorted[0].target.id);
      }
    }, observerOptions);

    headings.forEach((heading) => {
      const el = document.getElementById(heading.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings, viewMode]);

  // Scroll content container to top on topic or viewMode change
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [selectedTopic, viewMode]);

  const overallLoading = userLoading || topicsLoading;

  if (overallLoading) {
    return (
      <OnCampusLearningLayout backHref={routes.oncampus.dashboard} isLoading>
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner height={8} width={8} />
          <Text level="p" className="text-gray-400 ml-3">
            Loading...
          </Text>
        </div>
      </OnCampusLearningLayout>
    );
  }

  if (topicsResponse?.error) {
    return (
      <OnCampusLearningLayout backHref={routes.oncampus.dashboard}>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <Text level="h2" className="text-xl font-bold text-red-500 mb-2">
            Failed to load topics
          </Text>
          <Text level="p" className="text-gray-400 mb-6">
            There was an error fetching the aptitude topics. Please try again.
          </Text>
          <Button
            onClick={() => router.reload()}
            variant="PRIMARY"
            text="Retry"
          />
        </div>
      </OnCampusLearningLayout>
    );
  }

  const hasLockedTopics = topicsWithCounts.some((t) => t.isLocked);
  const unlockedCount = topicsWithCounts.filter((t) => !t.isLocked).length;

  return (
    <OnCampusLearningLayout
      backHref={routes.oncampus.dashboard}
      layoutMode="workspace"
    >
      {hasLockedTopics && (
        <FreemiumLockBanner
          unlockedCount={unlockedCount}
          message={`Freemium preview — ${unlockedCount} topics unlocked. Subscribe to access all.`}
          onUpgradeClick={() => router.push(routes.oncampus.pricing)}
        />
      )}
      <div className="flex flex-col h-full w-full">
        {/* ── Top header bar & Mobile drawer (Hidden during active Study/Quiz modes) ── */}
        {!selectedTopic && (
          <div className="w-full min-h-[72px] border-b border-gray-800 bg-[#0A0A0A] flex shrink-0">
            {/* Left column — sidebar label */}
            <div className="border-r border-gray-800/60 px-3 py-3.5 flex items-center justify-between shrink-0 transition-all duration-300 w-auto lg:w-[260px]">
              <div className="hidden lg:block">
                <Text
                  level="h2"
                  className="text-[13px] font-black text-white mb-0.5 tracking-tight"
                >
                  Explore Topics
                </Text>
                <Text
                  level="p"
                  className="text-[9px] font-bold text-gray-550 uppercase tracking-[0.1em]"
                >
                  Choose a topic
                </Text>
              </div>
            </div>

            {/* Right header area */}
            <div className="flex flex-1 items-center justify-between px-4">
              <div className="flex items-center min-w-0">
                <div className="flex flex-col min-w-0">
                  <Text
                    level="h1"
                    className="strong-text font-bold text-white mb-0.5 tracking-tight line-clamp-1"
                  >
                    Aptitude Preparation
                  </Text>
                  <Text
                    level="p"
                    className="text-[10px] font-medium text-gray-500 uppercase tracking-wider hidden sm:block"
                  >
                    Select a topic to start practicing
                  </Text>
                </div>
              </div>

              {/* Mobile-only: topics list toggle pill */}
              <button
                onClick={() => setIsMobileTopicsOpen(!isMobileTopicsOpen)}
                className={cn(
                  "lg:hidden flex items-center gap-1.5 shrink-0 ml-2 px-3 py-1.5 rounded-lg border text-[11px] font-semibold transition-all duration-200 active:scale-95",
                  isMobileTopicsOpen
                    ? "bg-red-500/10 border-red-500/60 text-red-400"
                    : "bg-gray-900/50 border-gray-700 text-gray-400 hover:text-white hover:border-gray-600",
                )}
                title="Toggle topics list"
              >
                <ListFilter className="w-3.5 h-3.5" />
                <span>{topicsWithCounts.length} Topics</span>
              </button>
            </div>
          </div>
        )}

        {/* ── Mobile collapsible topics drawer ── */}
        {!selectedTopic && (
          <div
            className={cn(
              "lg:hidden w-full bg-[#0A0A0A] border-b border-gray-800 overflow-y-auto scrollbar-thin-grey transition-[max-height] duration-300 ease-in-out",
              isMobileTopicsOpen ? "max-h-[50vh]" : "max-h-0 overflow-hidden",
            )}
          >
            <div className="px-3 py-2 space-y-1">
              {topicsWithCounts.map((topic) => {
                const isActive = selectedTopic === topic.topic;
                return (
                  <TopicItem
                    key={topic.topic}
                    topic={topic}
                    isActive={isActive}
                    onClick={() => {
                      if (topic.isLocked) {
                        setShowPayment(true);
                        return;
                      }
                      handleTopicClick(topic.topic, topic.label);
                    }}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* ── Body: sidebar + content ── */}
        <FlexContainer
          direction="col"
          className="lg:flex-row flex-1 min-h-0 w-full"
          itemCenter={false}
          justifyCenter={false}
          wrap={false}
        >
          {/* Desktop Left Sidebar */}
          <div className="hidden lg:flex lg:w-[260px] flex-shrink-0 border-r border-gray-800 flex-col bg-[#0A0A0A]">
            <div className="flex-1 overflow-y-auto px-3 py-3 scrollbar-thin-grey">
              <div className="space-y-1">
                {selectedTopic ? (
                  <div className="space-y-3">
                    <button
                      onClick={handleBackToTopics}
                      className="flex items-center gap-1.5 px-2 py-1.5 text-xs font-bold text-gray-550 hover:text-white transition-colors cursor-pointer w-full text-left focus:outline-none"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>All Topics</span>
                    </button>
                    <div className="border-t border-gray-900 my-1 pt-2">
                      <p className="text-[10px] font-black text-red-500 uppercase tracking-widest px-2 mb-2">
                        {selectedTopicLabel}
                      </p>
                      <div className="space-y-0.5">
                        {/* Option 1: Study Guide */}
                        <button
                          onClick={() => {
                            if (isSelectedTopicLocked) {
                              setShowPayment(true);
                            } else {
                              setViewMode("STUDY");
                            }
                          }}
                          className={cn(
                            "w-full text-left py-2 px-3 rounded-lg border transition-all duration-200 text-xs flex items-center gap-2 cursor-pointer focus:outline-none",
                            viewMode === "STUDY"
                              ? "bg-red-500/[0.08] border-red-500/25 text-white font-bold"
                              : "border-transparent text-gray-400 hover:bg-white/[0.02] hover:text-white",
                          )}
                        >
                          {isSelectedTopicLocked ? (
                            <Lock className="w-3.5 h-3.5 text-red-500/80 shrink-0" />
                          ) : (
                            <BookOpen className="w-3.5 h-3.5 text-gray-600 shrink-0" />
                          )}
                          <span className="truncate flex-1">Study Guide</span>
                        </button>

                        {/* Option 2: Practice Quiz */}
                        <button
                          onClick={() => {
                            if (isSelectedTopicLocked) {
                              setShowPayment(true);
                            } else {
                              setViewMode("QUIZ");
                            }
                          }}
                          className={cn(
                            "w-full text-left py-2 px-3 rounded-lg border transition-all duration-200 text-xs flex items-center gap-2 cursor-pointer focus:outline-none",
                            viewMode === "QUIZ"
                              ? "bg-red-500/[0.08] border-red-500/25 text-white font-bold"
                              : "border-transparent text-gray-400 hover:bg-white/[0.02] hover:text-white",
                          )}
                        >
                          {isSelectedTopicLocked ? (
                            <Lock className="w-3.5 h-3.5 text-red-500/80 shrink-0" />
                          ) : (
                            <Sparkles className="w-3.5 h-3.5 text-gray-600 shrink-0" />
                          )}
                          <span className="truncate flex-1">Practice Quiz</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <FlexContainer
                    direction="col"
                    fullWidth
                    itemCenter={false}
                    justifyCenter={false}
                    wrap={false}
                    className="gap-1"
                  >
                    {topicsWithCounts.map((topic) => {
                      const isActive = selectedTopic === topic.topic;
                      return (
                        <TopicItem
                          key={topic.topic}
                          topic={topic}
                          isActive={isActive}
                          onClick={() => {
                            if (topic.isLocked) {
                              setShowPayment(true);
                              return;
                            }
                            handleTopicClick(topic.topic, topic.label);
                          }}
                        />
                      );
                    })}
                  </FlexContainer>
                )}
              </div>
            </div>
          </div>

          {/* ── Main Content Area ── */}
          {!selectedTopic ? (
            /* Welcome / Landing View: Aptitude Vault */
            <div className="flex flex-1 flex-col min-w-0 bg-[#050505] relative overflow-hidden p-4 lg:p-8">
              {/* Subtle Background Glows */}
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-900/10 rounded-full blur-[100px] pointer-events-none" />
              <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-900/10 rounded-full blur-[100px] pointer-events-none" />

              <FlexContainer
                className="h-full z-10"
                itemCenter
                justifyCenter
                fullWidth
                wrap={false}
              >
                <div className="text-center space-y-5 max-w-md px-6 my-auto">
                  <div className="relative mx-auto w-24 h-24 mb-6">
                    <div className="absolute inset-0 bg-red-500/20 rounded-2xl blur-xl" />
                    <div className="relative w-full h-full bg-[#111] border border-gray-800 rounded-2xl flex items-center justify-center shadow-2xl">
                      <Lightbulb className="w-10 h-10 text-white opacity-80 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]" />
                    </div>
                  </div>

                  <div>
                    <Text
                      level="h2"
                      className="text-white text-3xl font-extrabold tracking-tight mb-2"
                    >
                      Aptitude Vault
                    </Text>
                    <Text
                      level="p"
                      className="text-gray-400 text-[15px] leading-relaxed"
                    >
                      Sharpen your quantitative, logical, and verbal reasoning
                      skills. Select a topic on the left to review concepts and
                      start practice sessions.
                    </Text>
                  </div>
                </div>
              </FlexContainer>
            </div>
          ) : isSelectedTopicLocked ? (
            /* Gated Topic Screen */
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-[#050505] relative overflow-hidden">
              <div className="relative mx-auto w-20 h-20 mb-6">
                <div className="absolute inset-0 bg-red-500/20 rounded-2xl blur-xl" />
                <div className="relative w-full h-full bg-[#111] border border-gray-800 rounded-2xl flex items-center justify-center shadow-2xl">
                  <Lock className="w-8 h-8 text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">
                🔒 This Topic is Locked
              </h2>
              <p className="text-gray-400 mb-6 max-w-md text-sm leading-relaxed">
                You have completed the free portion of Aptitude. To access this
                topic and get full access to all prep guides and practice
                questions, please upgrade your plan.
              </p>
              <button
                onClick={() => router.push(routes.oncampus.pricing)}
                className="rounded-lg bg-red-500 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-red-600 active:scale-95 shadow-[0_4px_12px_rgba(239,68,68,0.2)]"
              >
                View Pricing Plans
              </button>
            </div>
          ) : viewMode === "STUDY" ? (
            /* Study Guide Content View (Just like Core Subjects chapter content) */
            <div
              ref={scrollContainerRef}
              className="flex-1 overflow-y-auto bg-[#050505] scrollbar-thin-grey scroll-smooth relative"
            >
              {studyGuideLoading ? (
                <div className="h-full w-full flex flex-col items-center justify-center space-y-4">
                  <LoadingSpinner height={8} width={8} />
                  <Text level="p" className="text-gray-400 font-medium">
                    Loading study guide...
                  </Text>
                </div>
              ) : (
                <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 sm:py-8 flex gap-8 items-start">
                  {/* Left column - Content */}
                  <div className="flex-1 min-w-0 xl:max-w-[72%]">
                    {/* Back Button */}
                    <button
                      onClick={handleBackToTopics}
                      className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-400 transition-colors mb-4 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to topics</span>
                    </button>

                    {/* Title */}
                    <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
                      {selectedTopicLabel} Study Guide
                    </h1>

                    {/* Meta row */}
                    <div className="flex items-center gap-3 text-xs text-gray-500 pb-4 border-b border-gray-900 mb-6 flex-wrap">
                      <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest bg-red-500/10 px-2 py-0.5 rounded">
                        Study Guide
                      </span>
                      <span className="text-gray-700 font-semibold">•</span>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                        <span>
                          {Math.max(
                            1,
                            Math.ceil(
                              (studyGuideResponse?.data?.content || "").split(
                                /\s+/,
                              ).length / 200,
                            ),
                          )}{" "}
                          min read
                        </span>
                      </div>
                      <span className="text-gray-700 font-semibold">•</span>
                      <button
                        onClick={toggleStudyCompleted}
                        className={cn(
                          "flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border transition-all cursor-pointer",
                          isStudyCompleted
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                            : "bg-red-500/5 border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500/40",
                        )}
                      >
                        {isStudyCompleted ? "Completed" : "Mark Read"}
                      </button>
                    </div>

                    {/* Markdown Renderer */}
                    <div className="prose prose-invert max-w-none prose-red prose-headings:scroll-mt-6">
                      <CoreSubjectMDXRenderer
                        mdxSource={studyGuideResponse?.data?.content || ""}
                      />
                    </div>

                    {/* Bottom Next Button */}
                    {!isTopicEmpty && (
                      <div className="flex items-center justify-end border-t border-gray-800/60 mt-12 pt-8 pb-16">
                        <button
                          type="button"
                          onClick={() => setViewMode("QUIZ")}
                          className="group flex flex-col items-end px-4 py-2.5 sm:px-5 sm:py-3.5 bg-[#0A0A0A] border border-gray-800 rounded-xl hover:border-red-500/30 text-right transition-all duration-300 w-full sm:w-auto"
                        >
                          <span className="text-[9px] font-black text-gray-555 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                            PRACTICE QUIZ
                            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                          </span>
                          <span className="text-white font-bold text-xs sm:text-[13px] line-clamp-1 group-hover:text-red-400 transition-colors">
                            Attempt Questions
                          </span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Right column - Sticky Table of Contents */}
                  {headings.length > 0 && (
                    <aside className="w-[28%] shrink-0 hidden xl:block sticky top-24 self-start space-y-6">
                      <div className="bg-[#0A0A0A]/50 border border-gray-800 rounded-2xl p-5 shadow-xl backdrop-blur-sm">
                        <div className="flex items-center gap-2 border-b border-gray-800 pb-3 mb-4">
                          <List className="w-4 h-4 text-red-500" />
                          <span className="text-[11px] font-black text-white uppercase tracking-wider">
                            Table of Contents
                          </span>
                        </div>
                        <nav className="space-y-0.5 max-h-[60vh] overflow-y-auto scrollbar-thin-grey pr-1">
                          {headings.map((heading) => (
                            <button
                              key={heading.id}
                              onClick={() => scrollToHeading(heading.id)}
                              className={cn(
                                "w-full text-left transition-all duration-200 py-1.5 px-3 border-l text-[12px] block truncate",
                                heading.level === 3
                                  ? "pl-6 text-[11px]"
                                  : "font-bold",
                                activeHeadingId === heading.id
                                  ? "text-red-500 border-red-500 bg-red-500/[0.02] font-extrabold"
                                  : "text-gray-500 border-transparent hover:text-gray-300 hover:border-gray-700",
                              )}
                            >
                              {heading.text}
                            </button>
                          ))}
                        </nav>
                      </div>

                      <div className="bg-gradient-to-br from-red-500/[0.02] to-transparent border border-gray-800/60 rounded-2xl p-5 shadow-lg">
                        <h3 className="text-white font-bold text-[12px] mb-1.5 tracking-tight flex items-center gap-1.5">
                          💡 Learning Guide
                        </h3>
                        <p className="text-gray-400 text-[11px] leading-relaxed">
                          Review core concepts, follow the step-by-step solving
                          guidelines, and attempt practice questions afterwards.
                        </p>
                      </div>
                    </aside>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Practice Quiz Workspace */
            <div className="flex-1 flex flex-col h-full w-full overflow-hidden bg-[#0A0A0A]">
              {questionsLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                  <LoadingSpinner height={8} width={8} />
                  <Text level="p" className="text-gray-400 font-medium">
                    Loading questions...
                  </Text>
                </div>
              ) : questionsResponse?.error ? (
                <div className="flex flex-col items-center justify-center py-10 text-center px-4 h-full">
                  <div className="w-16 h-16 bg-red-950/30 border border-red-500/20 rounded-full flex items-center justify-center mb-4">
                    <AlertTriangle className="w-7 h-7 text-red-500" />
                  </div>
                  <Text level="p" className="text-red-400 text-sm mb-6">
                    Network error while fetching questions.
                  </Text>
                  <Button
                    onClick={() => refetchQuestions()}
                    variant="PRIMARY"
                    size="MEDIUM"
                    text="Try Again"
                  />
                </div>
              ) : (
                <div className="flex-1 h-full w-full overflow-hidden flex flex-col">
                  {/* Back to Study Guide Header in Workspace */}
                  <div className="px-4 py-2 border-b border-gray-800/60 bg-[#0C0C0C] flex items-center justify-between shrink-0">
                    <button
                      onClick={() => setViewMode("STUDY")}
                      className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-white transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to study guide</span>
                    </button>
                    <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest bg-red-500/10 px-2 py-0.5 rounded">
                      Practice Mode
                    </span>
                  </div>
                  <div className="flex-1 h-full w-full overflow-hidden">
                    <AptitudeQuizPanel
                      questions={questions}
                      topicSlug={selectedTopic ?? undefined}
                      userId={user?.id ?? undefined}
                      onProgressSaved={handleAptitudeProgressSaved}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </FlexContainer>
      </div>
      <DsaUpsellModal
        open={showPayment}
        onViewPlans={() => router.push(routes.oncampus.pricing)}
        onDismiss={() => setShowPayment(false)}
        title="Unlock OnCampus Aptitude Preparation"
        description="Subscribe to OnCampus to access all quantitative, logical, and verbal reasoning topics, complete study guides, and practice questions."
      />
    </OnCampusLearningLayout>
  );
};

export default AptitudePrepPage;
