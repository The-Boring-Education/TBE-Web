import {
  AptitudeQuizPanel,
  ContentFeedbackWidget,
  DsaUpsellModal,
  FreemiumLockBanner,
  LoadingSpinner,
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
  Brain,
  Calculator,
  Check,
  ChevronRight,
  Clock,
  Lightbulb,
  List,
  Lock,
  Search,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { CoreSubjectMDXRenderer } from "@/components/CoreSubjectMDXRenderer";

type AptitudeCategory = "QUANTITATIVE" | "LOGICAL" | "VERBAL";

interface TopicData {
  topic: string;
  count: number;
  label: string;
  category?: string;
  subCategory?: string;
  isLocked: boolean;
}

const CATEGORY_TABS = [
  { id: "ALL", label: "All Topics" },
  { id: "QUANTITATIVE", label: "Quantitative", icon: Calculator },
  { id: "LOGICAL", label: "Logical Reasoning", icon: Brain },
  { id: "VERBAL", label: "Verbal Ability", icon: BookOpen },
];

function getTopicCategory(topic: {
  topic: string;
  label: string;
  category?: string;
}): AptitudeCategory {
  if (topic.category) {
    const cat = topic.category.toUpperCase();
    if (cat.includes("QUANT")) return "QUANTITATIVE";
    if (cat.includes("VERBAL")) return "VERBAL";
    if (cat.includes("LOGIC") || cat.includes("REASON")) return "LOGICAL";
  }

  const text = `${topic.topic} ${topic.label}`.toLowerCase();
  if (
    text.includes("blood") ||
    text.includes("relation") ||
    text.includes("direction") ||
    text.includes("syllogism") ||
    text.includes("coding") ||
    text.includes("decoding") ||
    text.includes("series") ||
    text.includes("analogy") ||
    text.includes("seating") ||
    text.includes("puzzle") ||
    text.includes("venn") ||
    text.includes("statement") ||
    text.includes("logic") ||
    text.includes("reasoning")
  ) {
    return "LOGICAL";
  }

  if (
    text.includes("grammar") ||
    text.includes("vocabulary") ||
    text.includes("comprehension") ||
    text.includes("sentence") ||
    text.includes("synonym") ||
    text.includes("antonym") ||
    text.includes("idiom") ||
    text.includes("phrase") ||
    text.includes("verbal")
  ) {
    return "VERBAL";
  }

  return "QUANTITATIVE";
}

function getCategoryColor(category: AptitudeCategory) {
  switch (category) {
    case "QUANTITATIVE":
      return {
        bg: "bg-blue-500/10 dark:bg-blue-500/15",
        text: "text-blue-600 dark:text-blue-400",
        border: "border-blue-500/20",
        label: "Quantitative",
        Icon: Calculator,
      };
    case "LOGICAL":
      return {
        bg: "bg-purple-500/10 dark:bg-purple-500/15",
        text: "text-purple-600 dark:text-purple-400",
        border: "border-purple-500/20",
        label: "Logical",
        Icon: Brain,
      };
    case "VERBAL":
      return {
        bg: "bg-emerald-500/10 dark:bg-emerald-500/15",
        text: "text-emerald-600 dark:text-emerald-400",
        border: "border-emerald-500/20",
        label: "Verbal",
        Icon: BookOpen,
      };
  }
}

export default function AptitudePrepPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, loading: userLoading, isAuth } = useUser();

  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedTopicLabel, setSelectedTopicLabel] = useState<string>("");
  const [viewMode, setViewMode] = useState<"STUDY" | "QUIZ">("STUDY");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showPayment, setShowPayment] = useState(false);
  const [activeHeadingId, setActiveHeadingId] = useState<string>("");
  const [isStudyCompleted, setIsStudyCompleted] = useState<boolean>(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Sync state with URL query parameters
  useEffect(() => {
    if (!router.isReady) return;
    const topicParam = router.query.topic;
    if (typeof topicParam === "string" && topicParam) {
      setSelectedTopic(topicParam);
      const modeParam = router.query.mode;
      if (modeParam === "quiz") {
        setViewMode("QUIZ");
      } else {
        setViewMode("STUDY");
      }
    }
  }, [router.isReady, router.query.topic, router.query.mode]);

  const handleAptitudeProgressSaved = useCallback(() => {
    if (selectedTopic && user?.id) {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.aptitude.questions(selectedTopic, user.id),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.gamification.points(user.id),
      });
    }
  }, [queryClient, selectedTopic, user?.id]);

  // Fetch Topics
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

  const topicsWithCounts: TopicData[] = useMemo(() => {
    const data = topicsResponse?.data;
    if (!Array.isArray(data)) return [];

    return data
      .map((t: any) => ({
        topic: t.slug,
        count: t.questionCount || 0,
        label: t.name,
        category: t.category,
        subCategory: t.subCategory,
        isLocked: Boolean(t.isLocked),
      }))
      .sort((a: any, b: any) => a.label.localeCompare(b.label));
  }, [topicsResponse]);

  // Set topic label from loaded topics if not set
  useEffect(() => {
    if (selectedTopic && !selectedTopicLabel && topicsWithCounts.length > 0) {
      const found = topicsWithCounts.find((t) => t.topic === selectedTopic);
      if (found) {
        setSelectedTopicLabel(found.label);
      }
    }
  }, [selectedTopic, selectedTopicLabel, topicsWithCounts]);

  const selectedTopicData = useMemo(() => {
    return selectedTopic
      ? topicsWithCounts.find((t) => t.topic === selectedTopic)
      : undefined;
  }, [selectedTopic, topicsWithCounts]);

  const isSelectedTopicLocked = selectedTopicData?.isLocked || false;
  const topicHasQuestions =
    !selectedTopicData || (selectedTopicData.count ?? 0) > 0;

  // Fetch Questions for active topic
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

  // Fetch Study Guide for active topic
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

  const questions: AptitudeQuestion[] = useMemo(() => {
    const data = questionsResponse?.data?.questions;
    if (!Array.isArray(data)) return [];
    return data as AptitudeQuestion[];
  }, [questionsResponse]);

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

  const handleTopicClick = (
    topic: string,
    label: string,
    mode: "STUDY" | "QUIZ" = "STUDY",
  ) => {
    setSelectedTopic(topic);
    setSelectedTopicLabel(label);
    setViewMode(mode);
    void router.push(
      {
        pathname: "/aptitude",
        query: { topic, mode: mode.toLowerCase() },
      },
      undefined,
      { shallow: true },
    );
  };

  const handleBackToTopics = () => {
    setSelectedTopic(null);
    setSelectedTopicLabel("");
    setViewMode("STUDY");
    void router.push("/aptitude", undefined, { shallow: true });
  };

  const toggleStudyCompleted = () => {
    if (!selectedTopic) return;
    const key = `aptitude-completed-${selectedTopic}`;
    const nextState = !isStudyCompleted;
    setIsStudyCompleted(nextState);
    localStorage.setItem(key, String(nextState));
  };

  // Filter topics by Category and Search
  const filteredTopics = useMemo(() => {
    return topicsWithCounts.filter((t) => {
      const cat = getTopicCategory(t);
      const matchesCategory =
        selectedCategory === "ALL" || cat === selectedCategory;
      const matchesSearch =
        !searchQuery.trim() ||
        t.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.topic.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [topicsWithCounts, selectedCategory, searchQuery]);

  // Extract headings for Table of Contents
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

  const scrollToHeading = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  useEffect(() => {
    if (headings.length === 0 || viewMode !== "STUDY") return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter((entry) => entry.isIntersecting);
        if (visibleEntries.length > 0) {
          const sorted = visibleEntries.sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top,
          );
          setActiveHeadingId(sorted[0].target.id);
        }
      },
      {
        root: scrollContainerRef.current,
        rootMargin: "-20px 0px -65% 0px",
        threshold: 0,
      },
    );

    headings.forEach((heading) => {
      const el = document.getElementById(heading.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings, viewMode]);

  const overallLoading = userLoading || topicsLoading;

  if (overallLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner />
      </div>
    );
  }

  if (topicsResponse?.error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-base font-bold text-[#FF4D4D] mb-1">
          Failed to load aptitude topics
        </h2>
        <p className="text-xs text-slate-500 max-w-sm mb-4">
          There was an error fetching the aptitude syllabus. Please try again.
        </p>
        <button
          type="button"
          onClick={() => router.reload()}
          className="px-4 py-2 text-xs font-bold rounded-lg bg-[#FF4D4D] text-white hover:bg-[#EE3126] transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const hasLockedTopics = topicsWithCounts.some((t) => t.isLocked);
  const unlockedCount = topicsWithCounts.filter((t) => !t.isLocked).length;
  const totalQuestionsCount = topicsWithCounts.reduce(
    (acc, t) => acc + (t.count || 0),
    0,
  );

  return (
    <div className="w-full min-w-0 max-w-full font-sans px-1 sm:px-2 py-1 space-y-3 pb-4">
      <Head>
        <title>
          {selectedTopic
            ? `${selectedTopicLabel || "Topic"} | Aptitude Preparation | OnCampus`
            : "Aptitude Preparation | OnCampus"}
        </title>
        <meta
          name="description"
          content="Comprehensive quantitative aptitude, logical reasoning, and verbal tests with study guides and timed quizzes."
        />
      </Head>

      {/* 1. Header with Breadcrumb Navigation */}
      <nav className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 dark:text-slate-500 flex-wrap">
        <Link
          href="/dashboard"
          className="hover:text-slate-800 dark:hover:text-white transition-colors"
        >
          OnCampus
        </Link>
        <span className="text-slate-300 dark:text-slate-600">›</span>
        <button
          type="button"
          onClick={handleBackToTopics}
          className={cn(
            "transition-colors cursor-pointer",
            selectedTopic
              ? "hover:text-slate-800 dark:hover:text-white"
              : "font-bold text-[#FF4D4D]",
          )}
        >
          Aptitude
        </button>
        {selectedTopic && (
          <>
            <span className="text-slate-300 dark:text-slate-600">›</span>
            <span className="font-bold text-[#FF4D4D] truncate max-w-[200px]">
              {selectedTopicLabel || selectedTopic}
            </span>
          </>
        )}
      </nav>

      {hasLockedTopics && !selectedTopic && (
        <FreemiumLockBanner
          unlockedCount={unlockedCount}
          message={`Freemium preview — ${unlockedCount} topics unlocked. Subscribe to access all ${topicsWithCounts.length} topics.`}
          onUpgradeClick={() => router.push(routes.oncampus.pricing)}
        />
      )}

      {/* 2. Main Page Content: Catalog View vs Topic Detail View */}
      {!selectedTopic ? (
        /* ══════════════ CATALOG VIEW: TOPIC CARDS GRID ══════════════ */
        <div className="space-y-3">
          {/* Hero Section */}
          <div className="rounded-2xl border border-slate-200/90 dark:border-[#24242A] bg-white dark:bg-[#131316] p-4 sm:p-5 lg:p-6 shadow-2xs space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1 max-w-xl">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <div className="w-5 h-5 rounded-md bg-[#FF4D4D]/10 text-[#FF4D4D] flex items-center justify-center shrink-0">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] font-bold text-[#FF4D4D] uppercase tracking-wider">
                    Placement & Assessment Preparation
                  </span>
                </div>
                <h1 className="text-lg sm:text-xl lg:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                  Aptitude{" "}
                  <span className="text-[#FF4D4D]">Preparation Vault</span>
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                  Master quantitative aptitude, logical reasoning, and verbal
                  ability with structured conceptual study guides and timed
                  practice tests.
                </p>
              </div>

              {/* Quick Stat Counter */}
              <div className="flex items-center gap-2 self-start md:self-auto shrink-0 bg-slate-50 dark:bg-[#1A1A20] border border-slate-200/80 dark:border-[#282830] px-3.5 py-2 rounded-xl shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-[#FF4D4D]/10 text-[#FF4D4D] flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900 dark:text-white">
                    {topicsWithCounts.length} Topics
                  </div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">
                    {totalQuestionsCount} Practice Questions
                  </div>
                </div>
              </div>
            </div>

            {/* Filter Tabs & Search Bar Row */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2 border-t border-slate-100 dark:border-[#1E1E24]">
              {/* Category Filter Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none flex-nowrap">
                {CATEGORY_TABS.map((tab) => {
                  const isActive = selectedCategory === tab.id;
                  const Icon = tab.icon;

                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setSelectedCategory(tab.id)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer flex items-center gap-1.5",
                        isActive
                          ? "bg-[#FF3B30] text-white shadow-2xs font-bold"
                          : "bg-slate-50 dark:bg-[#1E1E24] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#26262E] hover:text-slate-900 dark:hover:text-white border border-slate-200/60 dark:border-transparent",
                      )}
                    >
                      {Icon && <Icon className="w-3.5 h-3.5" />}
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-64 shrink-0">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search aptitude topics..."
                  className="w-full pl-8 pr-7 py-1.5 rounded-lg border border-slate-200/90 dark:border-[#24242A] bg-white dark:bg-[#131316] text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#FF4D4D] transition-colors shadow-2xs"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Topics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredTopics.map((topic) => {
              const category = getTopicCategory(topic);
              const { bg, text, border, label, Icon } =
                getCategoryColor(category);
              const isCompleted =
                typeof window !== "undefined" &&
                localStorage.getItem(`aptitude-completed-${topic.topic}`) ===
                  "true";

              return (
                <div
                  key={topic.topic}
                  onClick={() => {
                    if (topic.isLocked) {
                      setShowPayment(true);
                      return;
                    }
                    handleTopicClick(topic.topic, topic.label, "STUDY");
                  }}
                  className={cn(
                    "rounded-2xl border bg-white dark:bg-[#16161A] p-4 transition-all shadow-2xs hover:shadow-md cursor-pointer group flex flex-col justify-between space-y-3.5",
                    topic.isLocked
                      ? "border-slate-200/80 dark:border-[#222228] opacity-85"
                      : "border-slate-200/90 dark:border-[#24242A] hover:border-[#FF4D4D]/50 hover:-translate-y-0.5",
                  )}
                >
                  {/* Top Bar: Icon + Status Pill */}
                  <div className="flex items-center justify-between gap-2">
                    <div
                      className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 transition-transform group-hover:scale-105",
                        bg,
                        text,
                        border,
                      )}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="flex items-center gap-1.5">
                      {topic.isLocked ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          <Lock className="w-3 h-3" />
                          Locked
                        </span>
                      ) : isCompleted ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <Check className="w-3 h-3" />
                          Completed
                        </span>
                      ) : (
                        <span
                          className={cn(
                            "text-[10px] font-bold px-2 py-0.5 rounded-md border",
                            bg,
                            text,
                            border,
                          )}
                        >
                          {label}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Middle: Topic Name and Info */}
                  <div className="space-y-1">
                    <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-[#FF4D4D] transition-colors line-clamp-1 leading-snug">
                      {topic.label}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium line-clamp-1">
                      {topic.count > 0
                        ? `${topic.count} practice questions available`
                        : "Conceptual study guide available"}
                    </p>
                  </div>

                  {/* Bottom Actions Row */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-[#202026]">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (topic.isLocked) {
                          setShowPayment(true);
                          return;
                        }
                        handleTopicClick(topic.topic, topic.label, "STUDY");
                      }}
                      className="flex-1 py-1.5 px-2.5 rounded-lg text-xs font-semibold bg-slate-50 dark:bg-[#1E1E24] hover:bg-slate-100 dark:hover:bg-[#26262E] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200/80 dark:border-[#2C2C34] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-[#FF4D4D]" />
                      <span>Study Guide</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (topic.isLocked) {
                          setShowPayment(true);
                          return;
                        }
                        handleTopicClick(topic.topic, topic.label, "QUIZ");
                      }}
                      className="flex-1 py-1.5 px-2.5 rounded-lg text-xs font-bold bg-[#FF4D4D] hover:bg-[#EE3126] text-white transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Take Quiz</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredTopics.length === 0 && (
            <div className="text-center py-12 rounded-2xl border border-dashed border-slate-200 dark:border-[#24242A] text-slate-400 text-xs space-y-1">
              <p className="font-bold text-slate-600 dark:text-slate-300">
                No topics matched your search
              </p>
              <p>
                Try clearing your search query or selecting a different
                category.
              </p>
            </div>
          )}
        </div>
      ) : isSelectedTopicLocked ? (
        /* ══════════════ GATED LOCKED TOPIC VIEW ══════════════ */
        <div className="rounded-2xl border border-slate-200/90 dark:border-[#24242A] bg-white dark:bg-[#16161A] p-8 text-center shadow-2xs space-y-4 max-w-xl mx-auto my-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {selectedTopicLabel} is Locked
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
              You are viewing the freemium preview. Upgrade to the OnCampus Pass
              to unlock complete study guides, all practice question banks, and
              timed assessments.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleBackToTopics}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-[#2C2C36] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1E1E24] transition-colors cursor-pointer"
            >
              Back to Topics
            </button>
            <button
              type="button"
              onClick={() => router.push(routes.oncampus.pricing)}
              className="px-5 py-2 text-xs font-bold rounded-xl bg-[#FF4D4D] hover:bg-[#EE3126] text-white transition-all shadow-2xs cursor-pointer"
            >
              Unlock OnCampus Pass
            </button>
          </div>
        </div>
      ) : (
        /* ══════════════ TOPIC DETAIL WORKSPACE: STUDY GUIDE & PRACTICE QUIZ ══════════════ */
        <div className="space-y-3">
          {/* Top Bar: Back Button, Segmented View Switcher, Reading Status */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-slate-100 dark:border-[#202026]">
            <button
              type="button"
              onClick={handleBackToTopics}
              className="flex items-center gap-1.5 text-xs font-bold text-[#FF4D4D] hover:underline cursor-pointer self-start"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to all topics</span>
            </button>

            {/* Segmented Switch: Study Guide vs Practice Quiz */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#1E1E24] p-1 rounded-xl border border-slate-200/80 dark:border-[#282830] self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setViewMode("STUDY")}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer",
                  viewMode === "STUDY"
                    ? "bg-white dark:bg-[#2A2A34] text-slate-900 dark:text-white shadow-2xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white",
                )}
              >
                <BookOpen className="w-3.5 h-3.5 text-[#FF4D4D]" />
                <span>Study Guide</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode("QUIZ")}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer",
                  viewMode === "QUIZ"
                    ? "bg-[#FF4D4D] text-white shadow-2xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white",
                )}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  Practice Quiz (
                  {questions.length || selectedTopicData?.count || 0})
                </span>
              </button>
            </div>
          </div>

          {viewMode === "STUDY" ? (
            /* ──────────────── STUDY GUIDE MODE ──────────────── */
            studyGuideLoading ? (
              <div className="flex items-center justify-center py-20 rounded-2xl border border-slate-200/90 dark:border-[#24242A] bg-white dark:bg-[#16161A]">
                <LoadingSpinner />
              </div>
            ) : (
              <div className="flex gap-6 items-start">
                {/* Main Content Area */}
                <div className="flex-1 min-w-0 space-y-4">
                  <div className="rounded-2xl border border-slate-200/90 dark:border-[#24242A] bg-white dark:bg-[#16161A] p-4 sm:p-6 lg:p-7 shadow-2xs space-y-4">
                    {/* Header */}
                    <div className="space-y-1.5 border-b border-slate-100 dark:border-[#202026] pb-3">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#FF4D4D] bg-red-500/10 px-2 py-0.5 rounded-md">
                          Aptitude Syllabus Guide
                        </span>

                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                            <Clock className="w-3 h-3" />
                            <span>
                              {Math.max(
                                1,
                                Math.ceil(
                                  (
                                    studyGuideResponse?.data?.content || ""
                                  ).split(/\s+/).length / 200,
                                ),
                              )}{" "}
                              min read
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={toggleStudyCompleted}
                            className={cn(
                              "px-2.5 py-1 rounded-md text-[11px] font-bold border transition-all cursor-pointer",
                              isStudyCompleted
                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                                : "bg-slate-100 dark:bg-[#202026] border-slate-200 dark:border-[#2A2A32] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white",
                            )}
                          >
                            {isStudyCompleted ? "Completed" : "Mark as read"}
                          </button>
                        </div>
                      </div>

                      <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                        {selectedTopicLabel}
                      </h1>
                    </div>

                    {/* Markdown Reader */}
                    {studyGuideResponse?.data?.content ? (
                      <div className="prose prose-slate dark:prose-invert max-w-none prose-sm sm:prose-base leading-relaxed">
                        <CoreSubjectMDXRenderer
                          mdxSource={studyGuideResponse.data.content}
                        />
                      </div>
                    ) : (
                      <div className="py-12 text-center text-xs text-slate-400 space-y-2">
                        <Lightbulb className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
                        <p className="font-bold text-slate-600 dark:text-slate-300">
                          Study guide is being compiled for this topic.
                        </p>
                        <p>You can proceed directly to the practice quiz.</p>
                      </div>
                    )}

                    {/* Next step: Jump to Quiz */}
                    <div className="pt-4 border-t border-slate-100 dark:border-[#202026] flex items-center justify-between">
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
                        Done revising concepts? Test your speed and accuracy.
                      </div>
                      <button
                        type="button"
                        onClick={() => setViewMode("QUIZ")}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FF4D4D] hover:bg-[#EE3126] text-white text-xs font-bold transition-all shadow-2xs cursor-pointer ml-auto"
                      >
                        <span>Start Practice Quiz</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Sticky Table of Contents on Right */}
                {headings.length > 0 && (
                  <aside className="w-64 shrink-0 hidden xl:block sticky top-2 space-y-3">
                    <div className="bg-white dark:bg-[#16161A] p-3.5 rounded-2xl border border-slate-200/90 dark:border-[#24242A] shadow-2xs space-y-2.5">
                      <div className="flex items-center gap-1.5 pb-2 border-b border-slate-100 dark:border-[#202026]">
                        <List className="w-3.5 h-3.5 text-[#FF4D4D]" />
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          On this page
                        </span>
                      </div>

                      <nav className="space-y-1 max-h-[70vh] overflow-y-auto scrollbar-thin-grey pr-1">
                        {headings.map((heading) => (
                          <button
                            key={heading.id}
                            type="button"
                            onClick={() => scrollToHeading(heading.id)}
                            className={cn(
                              "w-full text-left transition-all py-1 px-2 rounded-lg text-[11px] block truncate cursor-pointer",
                              heading.level === 3
                                ? "pl-4 text-[10px]"
                                : "font-semibold",
                              activeHeadingId === heading.id
                                ? "text-[#FF4D4D] bg-red-500/10 font-bold"
                                : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#1E1E24] hover:text-slate-900 dark:hover:text-white",
                            )}
                          >
                            {heading.text}
                          </button>
                        ))}
                      </nav>
                    </div>
                  </aside>
                )}
              </div>
            )
          ) : (
            /* ──────────────── PRACTICE QUIZ MODE ──────────────── */
            <div className="rounded-2xl border border-slate-200/90 dark:border-[#24242A] bg-white dark:bg-[#16161A] shadow-2xs overflow-hidden">
              {questionsLoading ? (
                <div className="flex items-center justify-center py-20">
                  <LoadingSpinner />
                </div>
              ) : questionsResponse?.error ? (
                <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                  <div className="w-12 h-12 bg-red-500/10 text-[#FF4D4D] rounded-full flex items-center justify-center mb-3">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-[#FF4D4D] mb-1">
                    Failed to load questions
                  </p>
                  <p className="text-xs text-slate-500 mb-4">
                    Network error while fetching aptitude question set.
                  </p>
                  <button
                    type="button"
                    onClick={() => refetchQuestions()}
                    className="px-4 py-1.5 text-xs font-bold rounded-lg bg-[#FF4D4D] text-white hover:bg-[#EE3126] transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              ) : questions.length === 0 ? (
                <div className="py-16 text-center text-xs text-slate-400 space-y-2">
                  <Sparkles className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
                  <p className="font-bold text-slate-600 dark:text-slate-300">
                    No questions uploaded for this topic yet.
                  </p>
                  <button
                    type="button"
                    onClick={() => setViewMode("STUDY")}
                    className="text-xs font-bold text-[#FF4D4D] hover:underline cursor-pointer"
                  >
                    ← Read Study Guide Instead
                  </button>
                </div>
              ) : (
                <div className="w-full">
                  <AptitudeQuizPanel
                    questions={questions}
                    topicSlug={selectedTopic ?? undefined}
                    userId={user?.id ?? undefined}
                    onProgressSaved={handleAptitudeProgressSaved}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Upsell Modal */}
      <DsaUpsellModal
        open={showPayment}
        onViewPlans={() => router.push(routes.oncampus.pricing)}
        onDismiss={() => setShowPayment(false)}
        title="Unlock OnCampus Aptitude Preparation"
        description="Subscribe to OnCampus to access all quantitative, logical, and verbal reasoning topics, complete study guides, and timed practice assessments."
      />

      {/* Content Feedback */}
      {isAuth && selectedTopic && (
        <ContentFeedbackWidget
          contentType="APTITUDE_TOPIC"
          contentId={selectedTopic}
          title="Rate this topic"
          meta={{
            topicId: selectedTopic,
            topicName: selectedTopicLabel || selectedTopic,
          }}
          theme="dark"
        />
      )}
    </div>
  );
}
