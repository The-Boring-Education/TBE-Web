import { routes } from "@tbe/constants";
import { useGamificationFeedback } from "@tbe/gamification";
import { sendRequest } from "@tbe/utils";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiBookmark,
  FiCheck,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
  FiExternalLink,
  FiList,
  FiLock,
  FiSearch,
} from "react-icons/fi";

import MDXRenderer from "../common/MDXRenderer";
import { LearnButton } from "./LearnButton";
import { PersonalizationLoader } from "./PersonalizationLoader";

export interface SheetQuestion {
  _id: string;
  id?: string | number;
  name?: string;
  title?: string;
  question?: string;
  answer?: string;
  isCompleted?: boolean;
  isStarred?: boolean;
  frequency?: number;
  difficultyLevel?: string;
  resources?: {
    youtubeURL?: string;
    leetcodeURL?: string;
    blogURL?: string;
  };
  isLocked?: boolean;
  examples?: {
    inputText: string;
    outputText: string;
    explanation?: string;
    image?: string;
  }[];
  constraints?: string[];
}

export interface SheetLearningSpaceProps {
  sheetSlug?: string;
  initialSheet?: any;
  user?: any;
  onBack: () => void;
  onNavigateToDashboard?: () => void;
  onQuestionChange?: (questionTitle: string) => void;
  dashboardLabel?: string;
  parentLabel?: string;
  onToggleComplete?: (
    questionId: string | number,
    nextStatus: boolean,
  ) => Promise<any> | void;
  onFreemiumLockedClick?: (questionId: string | number) => void;
}

// Devicon CDN resolver based on slug or name
const getTechIconUrl = (sheetSlug?: string, sheetName?: string): string => {
  const text = `${sheetSlug || ""} ${sheetName || ""}`.toLowerCase();
  if (text.includes("java") && !text.includes("script")) {
    return "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg";
  }
  if (text.includes("react")) {
    return "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg";
  }
  if (text.includes("node") || text.includes("express")) {
    return "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg";
  }
  if (text.includes("javascript") || text.includes("js")) {
    return "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg";
  }
  if (text.includes("python")) {
    return "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg";
  }
  if (text.includes("c++") || text.includes("cpp")) {
    return "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg";
  }
  if (text.includes("go") || text.includes("golang")) {
    return "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/go/go-original.svg";
  }
  if (
    text.includes("db") ||
    text.includes("sql") ||
    text.includes("database") ||
    text.includes("mysql") ||
    text.includes("postgres")
  ) {
    return "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg";
  }
  if (
    text.includes("dsa") ||
    text.includes("array") ||
    text.includes("tree") ||
    text.includes("graph") ||
    text.includes("string") ||
    text.includes("pointer") ||
    text.includes("dynamic") ||
    text.includes("dp") ||
    text.includes("stack") ||
    text.includes("queue") ||
    text.includes("heap")
  ) {
    return "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg";
  }
  return "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg";
};

export const sheetDataCache = new Map<string, any>();

export const prefetchSheetData = async (sheetSlug: string, userId?: string) => {
  if (!sheetSlug || sheetDataCache.has(sheetSlug))
    return sheetDataCache.get(sheetSlug);
  try {
    const url = userId
      ? routes.api.sheetByIdWithUser(sheetSlug, userId)
      : `${routes.api.interviewPrep}?slug=${encodeURIComponent(sheetSlug)}`;
    const res = await sendRequest({ method: "GET", url });
    if (res?.data) {
      const sheetData = res.data;
      if (sheetData) {
        sheetDataCache.set(sheetSlug, sheetData);
        return sheetData;
      }
    }
  } catch (err) {
    // Ignore prefetch error
  }
  return null;
};

export const SheetLearningSpace: React.FC<SheetLearningSpaceProps> = ({
  sheetSlug,
  initialSheet,
  user,
  onBack,
  onNavigateToDashboard,
  onQuestionChange,
  dashboardLabel = "Learn",
  parentLabel = "Interview Sheets",
  onToggleComplete,
  onFreemiumLockedClick,
}) => {
  const cachedSheet = sheetSlug ? sheetDataCache.get(sheetSlug) : null;
  const [sheet, setSheet] = useState<any>(cachedSheet || initialSheet || null);
  const [questions, setQuestions] = useState<SheetQuestion[]>(
    cachedSheet?.questions || initialSheet?.questions || [],
  );
  const [currentQuestionId, setCurrentQuestionId] = useState<string>(
    cachedSheet?.questions?.[0]?._id?.toString?.() ||
      initialSheet?.questions?.[0]?._id?.toString?.() ||
      initialSheet?.questions?.[0]?.id?.toString?.() ||
      initialSheet?.questions?.[0]?.name?.toString?.() ||
      "",
  );
  const [isLoading, setIsLoading] = useState<boolean>(
    Boolean(
      sheetSlug &&
      !cachedSheet?.questions?.length &&
      !initialSheet?.questions?.length,
    ),
  );
  const [isUpdatingQuestion, setIsUpdatingQuestion] = useState<boolean>(false);
  const [isNavCollapsed, setIsNavCollapsed] = useState<boolean>(false);
  const [filterQuery, setFilterQuery] = useState<string>("");
  const [savedQuestionIds, setSavedQuestionIds] = useState<
    Record<string, boolean>
  >({});
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setIsNavCollapsed(true);
    }
  }, []);

  useEffect(() => {
    const checkDark = () => {
      if (typeof document !== "undefined") {
        setIsDarkMode(document.documentElement.classList.contains("dark"));
      }
    };
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  const { celebrate } = useGamificationFeedback();

  // Fetch sheet details with user progress (only when sheetSlug is provided)
  useEffect(() => {
    let isMounted = true;
    const fetchSheet = async () => {
      if (!sheetSlug) return;
      const inMemory = sheetDataCache.get(sheetSlug);
      if (
        !inMemory?.questions?.length &&
        !initialSheet?.questions?.length &&
        (!sheet || !questions.length)
      ) {
        setIsLoading(true);
      }
      try {
        const userId = user?.id || user?._id;
        const url = userId
          ? routes.api.sheetByIdWithUser(sheetSlug, userId)
          : `${routes.api.interviewPrep}?slug=${encodeURIComponent(sheetSlug)}`;

        const res = await sendRequest({
          method: "GET",
          url,
        });

        if (!isMounted) return;

        if (res?.data) {
          const sheetData = res.data;
          sheetDataCache.set(sheetSlug, sheetData);
          setSheet(sheetData);
          const qList = sheetData.questions || [];
          setQuestions(qList);
          if (qList.length > 0 && !currentQuestionId) {
            const first = qList[0];
            if (first) {
              const firstId = String(first._id || first.id || first.name);
              setCurrentQuestionId(firstId);
              onQuestionChange?.(
                first.title || first.name || first.question || "",
              );
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch sheet for learning space", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchSheet();

    return () => {
      isMounted = false;
    };
  }, [sheetSlug, user?.id, user?._id]);

  // Synchronize when initialSheet prop changes (e.g. topic switch in DSA Yatra)
  useEffect(() => {
    if (initialSheet) {
      setSheet(initialSheet);
      if (initialSheet.questions?.length) {
        setQuestions(initialSheet.questions);
        const first = initialSheet.questions[0];
        const firstId = String(first?._id || first?.id || first?.name || "");
        if (firstId) {
          setCurrentQuestionId((prev) => {
            const exists = initialSheet.questions.some(
              (q: any) => String(q._id || q.id || q.name) === prev,
            );
            return exists ? prev : firstId;
          });
          onQuestionChange?.(
            first?.title || first?.name || first?.question || "",
          );
        }
      }
    }
  }, [initialSheet, onQuestionChange]);

  // Set default initial question if available
  useEffect(() => {
    if (questions.length > 0 && !currentQuestionId) {
      const firstQuestion = questions[0];
      if (firstQuestion) {
        const firstId = String(
          firstQuestion._id || firstQuestion.id || firstQuestion.name,
        );
        setCurrentQuestionId(firstId);
        onQuestionChange?.(
          firstQuestion.title ||
            firstQuestion.name ||
            firstQuestion.question ||
            "",
        );
      }
    }
  }, [questions, currentQuestionId, onQuestionChange]);

  const activeQuestionIndex = useMemo(() => {
    return questions.findIndex(
      (q) => String(q._id || q.id || q.name) === currentQuestionId,
    );
  }, [questions, currentQuestionId]);

  const activeQuestion = useMemo(() => {
    return questions[activeQuestionIndex] || questions[0] || null;
  }, [questions, activeQuestionIndex]);

  const completedCount = useMemo(() => {
    return questions.filter((q) => q.isCompleted).length;
  }, [questions]);

  const totalCount = questions.length;
  const progressPercentage =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleSelectQuestion = (q: SheetQuestion) => {
    const id = String(q._id || q.id || q.name);
    setCurrentQuestionId(id);
    onQuestionChange?.(q.title || q.name || q.question || "");
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setIsNavCollapsed(true);
    }
  };

  const handleToggleCompletion = useCallback(async () => {
    if (!activeQuestion) return;
    const qId = String(
      activeQuestion._id || activeQuestion.id || activeQuestion.name,
    );
    const newStatus = !activeQuestion.isCompleted;

    setIsUpdatingQuestion(true);
    // Optimistic UI update
    setQuestions((prev) =>
      prev.map((q) =>
        String(q._id || q.id || q.name) === qId
          ? { ...q, isCompleted: newStatus }
          : q,
      ),
    );

    try {
      if (onToggleComplete) {
        await onToggleComplete(qId, newStatus);
      } else if (user && sheet?._id) {
        const response = await sendRequest({
          method: "PATCH",
          url: routes.api.markSheetQuestionAsCompleted,
          body: {
            userId: user?.id || user?._id,
            sheetId: sheet._id,
            questionId: qId,
            isCompleted: newStatus,
          },
        });

        if (newStatus && response?.gamification) {
          celebrate(response.gamification, {
            message: "Question solved! Great job!",
          });
        }
      }
    } catch (err) {
      console.error("Failed to mark question completion", err);
      // Revert on error
      setQuestions((prev) =>
        prev.map((q) =>
          String(q._id || q.id || q.name) === qId
            ? { ...q, isCompleted: !newStatus }
            : q,
        ),
      );
    } finally {
      setIsUpdatingQuestion(false);
    }
  }, [activeQuestion, onToggleComplete, user, sheet?._id, celebrate]);

  const handleNextQuestion = () => {
    if (
      activeQuestionIndex >= 0 &&
      activeQuestionIndex < questions.length - 1
    ) {
      const next = questions[activeQuestionIndex + 1];
      if (next) {
        const nextId = String(next._id || next.id || next.name);
        setCurrentQuestionId(nextId);
        onQuestionChange?.(next.title || next.name || next.question || "");
      }
    }
  };

  const handlePrevQuestion = () => {
    if (activeQuestionIndex > 0) {
      const prev = questions[activeQuestionIndex - 1];
      if (prev) {
        const prevId = String(prev._id || prev.id || prev.name);
        setCurrentQuestionId(prevId);
        onQuestionChange?.(prev.title || prev.name || prev.question || "");
      }
    }
  };

  const toggleSaveCurrentQuestion = () => {
    if (!activeQuestion) return;
    const qKey = String(
      activeQuestion._id || activeQuestion.id || activeQuestion.name,
    );
    setSavedQuestionIds((prev) => ({
      ...prev,
      [qKey]: !prev[qKey],
    }));
  };

  const isCurrentQuestionSaved = Boolean(
    activeQuestion &&
    savedQuestionIds[
      String(activeQuestion._id || activeQuestion.id || activeQuestion.name)
    ],
  );

  // Filter questions by search text
  const filteredQuestions = useMemo(() => {
    if (!filterQuery.trim()) return questions;
    const query = filterQuery.toLowerCase();
    return questions.filter((q) => {
      const titleMatch = (q.title || q.name || "")
        .toLowerCase()
        .includes(query);
      const questionMatch = (q.question || "").toLowerCase().includes(query);
      return titleMatch || questionMatch;
    });
  }, [questions, filterQuery]);

  const cleanAnswer = useMemo(() => {
    if (!activeQuestion) return "";
    let raw =
      (activeQuestion as any)?.content?.markdownContent ||
      activeQuestion?.answer;

    if (
      activeQuestion.examples &&
      activeQuestion.examples.length > 0 &&
      !raw?.includes("Example 1")
    ) {
      let formattedExamples = "\n\n### Examples\n";
      activeQuestion.examples.forEach((ex, i) => {
        formattedExamples += `\n**Example ${i + 1}:**\n\`\`\`\nInput: ${ex.inputText}\nOutput: ${ex.outputText}\n${ex.explanation ? `Explanation: ${ex.explanation}\n` : ""}\`\`\`\n`;
      });
      if (activeQuestion.constraints && activeQuestion.constraints.length > 0) {
        formattedExamples += "\n### Constraints\n";
        activeQuestion.constraints.forEach((c) => {
          formattedExamples += `- \`${c}\`\n`;
        });
      }
      raw = (raw || "") + formattedExamples;
    }

    if (!raw || raw.trim() === "" || raw === "undefined") {
      return "No answer or explanation available yet for this question.";
    }
    return raw;
  }, [activeQuestion]);

  const techIconUrl = useMemo(() => {
    return getTechIconUrl(sheetSlug, sheet?.name);
  }, [sheetSlug, sheet?.name]);

  if (isLoading && (!sheet || questions.length === 0)) {
    return (
      <div className="w-full h-full min-h-[550px] flex items-center justify-center bg-black rounded-2xl overflow-hidden p-6">
        <PersonalizationLoader
          fullScreen={false}
          theme="dark"
          title="Loading Interview Sheet..."
          subtitle="Preparing interview questions & answers..."
          className="bg-black text-white"
        />
      </div>
    );
  }

  return (
    <div className="space-y-2.5 sm:space-y-3">
      {/* Breadcrumb Navigation: Outside the rectangle card */}
      <nav className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 flex-wrap px-0.5">
        <button
          type="button"
          onClick={onNavigateToDashboard || onBack}
          className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          {dashboardLabel}
        </button>
        <span className="text-slate-300 dark:text-slate-600">›</span>
        <button
          type="button"
          onClick={onBack}
          className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          {parentLabel}
        </button>
        <span className="text-slate-300 dark:text-slate-600">›</span>
        <span className="font-bold text-[#FF4D4D] truncate max-w-[240px] sm:max-w-xs">
          {sheet?.name || "Interview Questions"}
        </span>
      </nav>

      {/* 2. Interview Sheet Header Card */}
      <div className="relative overflow-hidden rounded-2xl border border-[#FED7D7]/80 dark:border-red-950/80 p-3.5 sm:p-4 bg-[#FFF5F4] dark:bg-[#1A1113] flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-2xs">
        {/* Left Column: Title & Description */}
        <div className="space-y-1 z-10 max-w-xl">
          <h1 className="text-lg sm:text-xl font-black text-[#101828] dark:text-white tracking-tight leading-snug">
            {sheet?.name || "Interview Questions"}
          </h1>
          <p className="text-xs text-[#64748B] dark:text-slate-400 font-medium mt-0.5 line-clamp-2 leading-relaxed">
            {sheet?.description ||
              "Comprehensive interview questions covering core concepts, best practices, and real-world problems."}
          </p>
        </div>

        {/* Center: Java / Tech Icon in Softly Tinted Container */}
        <div className="hidden md:flex items-center justify-center shrink-0 z-10 mx-auto lg:mx-0">
          <div className="w-14 h-14 bg-white dark:bg-[#1E1E24] rounded-xl shadow-xs border border-[#E8EDF3] dark:border-[#2C2C34] flex items-center justify-center p-2.5 transition-transform hover:scale-105">
            <img
              src={techIconUrl}
              alt="Tech logo"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Right Column: Progress & Reusable LearnButton */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end gap-3.5 z-10 shrink-0">
          <div className="space-y-1.5 w-full sm:w-48 lg:w-52">
            <div className="flex items-center justify-between text-xs font-black text-[#101828] dark:text-white">
              <span>{progressPercentage}% Solved</span>
              <span className="text-[#64748B] dark:text-slate-400 font-semibold text-[11px]">
                {completedCount}/{totalCount}
              </span>
            </div>
            <div className="w-full bg-slate-200/80 dark:bg-[#282830] rounded-full h-2 overflow-hidden">
              <div
                className="bg-[#FF4D4D] h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          <LearnButton
            isCompleted={Boolean(activeQuestion?.isCompleted)}
            isLoading={isUpdatingQuestion}
            onClick={handleToggleCompletion}
            disabled={!activeQuestion}
            completedLabel="Solved"
            incompleteLabel="Mark as Solved"
          />
        </div>
      </div>

      {/* Main Workspace Split View */}
      <div className="flex flex-col lg:flex-row gap-3 sm:gap-3.5 items-start">
        {/* 3. Question Sidebar — Open and Closable */}
        {!isNavCollapsed && (
          <aside className="w-full lg:w-[320px] xl:w-[350px] p-1 sm:p-1.5 shrink-0 bg-white dark:bg-[#16161A] border border-slate-200/90 dark:border-[#26262C] rounded-2xl shadow-2xs transition-all duration-300 flex flex-col gap-1.5 self-start lg:sticky lg:top-1 max-h-none lg:max-h-[calc(100vh-2rem)] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-1.5 pt-0.5 pb-0.5">
              <div className="flex items-center gap-1.5">
                <FiList className="w-4 h-4 text-[#FF4D4D] shrink-0" />
                <h2 className="text-xs sm:text-sm font-bold text-[#101828] dark:text-white">
                  Questions ({questions.length})
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsNavCollapsed(true)}
                className="w-6 h-6 rounded-lg border border-slate-200/90 dark:border-[#2A2A32] bg-white dark:bg-[#1E1E24] hover:bg-slate-50 dark:hover:bg-[#26262E] flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer shrink-0 shadow-2xs"
                title="Collapse questions sidebar"
              >
                <FiChevronsLeft className="w-3 h-3" />
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative px-0.5">
              <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 w-3 h-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Search questions..."
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                className="w-full pl-7 pr-2.5 py-1.5 bg-[#F8FAFC] dark:bg-[#1E1E24] border border-[#E2E8F0] dark:border-[#2C2C34] rounded-lg text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 text-[#101828] dark:text-white focus:outline-none focus:bg-white dark:focus:bg-[#22222A] focus:border-[#FF4D4D] focus:ring-1 focus:ring-[#FF4D4D]/20 transition-all font-normal"
              />
            </div>

            {/* Scrollable Questions List */}
            <div className="space-y-0.5 overflow-y-auto max-h-52 sm:max-h-64 lg:max-h-[calc(100vh-10rem)] px-0.5 scrollbar-none sm:[&::-webkit-scrollbar]:w-1 sm:[&::-webkit-scrollbar-thumb]:bg-slate-200 dark:sm:[&::-webkit-scrollbar-thumb]:bg-[#2C2C34] sm:[&::-webkit-scrollbar-thumb]:rounded-full">
              {filteredQuestions.map((q, index) => {
                const qKey = String(q._id || q.id || q.name);
                const isCurrent = qKey === currentQuestionId;
                const displayTitle = q.title || q.name || q.question;
                const isCompleted = q.isCompleted;

                return (
                  <button
                    key={qKey}
                    type="button"
                    onClick={() => handleSelectQuestion(q)}
                    title={displayTitle}
                    className={`w-full text-left rounded-lg transition-all flex items-center justify-between px-1.5 py-1 gap-2 cursor-pointer group ${
                      isCurrent
                        ? "bg-[#FFF0F0] dark:bg-red-950/40"
                        : "hover:bg-[#F8FAFC] dark:hover:bg-[#202026]"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {isCurrent ? (
                        <div className="w-5 h-5 rounded-full bg-[#FF4D4D] text-white flex items-center justify-center text-[10px] font-bold leading-none shrink-0 p-0 shadow-2xs">
                          {index + 1}
                        </div>
                      ) : isCompleted ? (
                        <div className="w-5 h-5 rounded-full bg-[#10B981] text-white flex items-center justify-center text-[10px] font-bold leading-none shrink-0 p-0">
                          <FiCheck className="w-2.5 h-2.5 stroke-[2.5]" />
                        </div>
                      ) : q.isLocked ? (
                        <div className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center text-[10px] font-bold leading-none shrink-0 p-0">
                          <FiLock className="w-2.5 h-2.5" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-[#EEF2F6] dark:bg-[#222228] text-[#334155] dark:text-slate-300 flex items-center justify-center text-[10px] font-bold leading-none shrink-0 p-0">
                          {index + 1}
                        </div>
                      )}
                      <span
                        className={`text-xs leading-snug break-words flex-1 ${
                          isCurrent
                            ? "font-bold text-[#101828] dark:text-white"
                            : isCompleted
                              ? "font-medium text-[#101828] dark:text-slate-200"
                              : "font-normal text-[#334155] dark:text-slate-300 group-hover:text-[#101828] dark:group-hover:text-white"
                        }`}
                      >
                        {displayTitle}
                      </span>
                    </div>

                    <FiChevronRight
                      className={`w-3 h-3 shrink-0 transition-transform ${
                        isCurrent
                          ? "text-[#FF4D4D]"
                          : "text-slate-400 group-hover:text-slate-600 dark:text-slate-500"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </aside>
        )}

        {/* 4. Main Question and Answer Panel — Takes all width when sidebar is closed */}
        <div
          className={`flex-1 min-w-0 bg-white dark:bg-[#16161A] border border-slate-200/90 dark:border-[#26262C] rounded-2xl p-5 sm:p-7 md:p-8 shadow-2xs space-y-6 ${isNavCollapsed ? "w-full" : ""}`}
        >
          {/* Header Row: Breadcrumb & Save Button */}
          <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-[#26262C] flex-wrap">
            <div className="flex items-center gap-2 text-xs font-semibold flex-wrap">
              {isNavCollapsed && (
                <button
                  type="button"
                  onClick={() => setIsNavCollapsed(false)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200/90 dark:border-[#2A2A32] bg-[#F8FAFC] dark:bg-[#1E1E24] text-xs font-bold text-[#101828] dark:text-white hover:bg-slate-100 dark:hover:bg-[#26262E] transition-colors shadow-2xs cursor-pointer mr-1"
                  title="Open questions list"
                >
                  <FiList className="w-3.5 h-3.5 text-[#FF4D4D]" />
                  <span>Questions ({questions.length})</span>
                  <FiChevronsRight className="w-3 h-3 text-slate-400" />
                </button>
              )}
              <span className="text-[#FF4D4D] font-bold">
                Question {activeQuestionIndex + 1}
              </span>
              <span className="text-slate-300 dark:text-slate-600 font-bold">
                ›
              </span>
              <span className="text-[#64748B] dark:text-slate-400 font-medium truncate max-w-sm">
                {sheet?.name || "Interview Questions"}
              </span>

              {activeQuestion?.difficultyLevel && (
                <span
                  className={`ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                    activeQuestion.difficultyLevel.toLowerCase() === "easy"
                      ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200/80 dark:border-emerald-800/60"
                      : activeQuestion.difficultyLevel.toLowerCase() ===
                          "medium"
                        ? "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200/80 dark:border-amber-800/60"
                        : "bg-red-50 dark:bg-red-950/40 text-[#FF4D4D] border-red-200/80 dark:border-red-800/60"
                  }`}
                >
                  {activeQuestion.difficultyLevel}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {activeQuestion?.resources?.leetcodeURL && (
                <a
                  href={activeQuestion.resources.leetcodeURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl border border-slate-200/90 dark:border-[#2C2C34] text-xs font-semibold text-amber-600 dark:text-amber-400 hover:bg-slate-50 dark:hover:bg-[#1E1E24] transition-colors"
                >
                  <FiExternalLink className="w-3 h-3" />
                  <span>LeetCode</span>
                </a>
              )}
              {activeQuestion?.resources?.youtubeURL && (
                <a
                  href={activeQuestion.resources.youtubeURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl border border-slate-200/90 dark:border-[#2C2C34] text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-slate-50 dark:hover:bg-[#1E1E24] transition-colors"
                >
                  <FiExternalLink className="w-3 h-3" />
                  <span>Video</span>
                </a>
              )}
              <button
                type="button"
                onClick={toggleSaveCurrentQuestion}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer shadow-2xs ${
                  isCurrentQuestionSaved
                    ? "bg-rose-50 dark:bg-red-950/40 border-rose-200 dark:border-red-900 text-[#FF4D4D]"
                    : "bg-white dark:bg-[#1E1E24] border-slate-200/90 dark:border-[#2C2C34] text-[#101828] dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#26262E]"
                }`}
              >
                <FiBookmark
                  className={`w-3.5 h-3.5 ${
                    isCurrentQuestionSaved ? "fill-[#FF4D4D]" : ""
                  }`}
                />
                <span>{isCurrentQuestionSaved ? "Saved" : "Save"}</span>
              </button>
            </div>
          </div>

          {activeQuestion?.isLocked && (
            <div className="p-3 sm:p-4 rounded-xl border border-amber-200/80 dark:border-amber-800/60 bg-amber-50/70 dark:bg-amber-950/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-amber-900 dark:text-amber-300">
                  Premium Practice Problem
                </p>
                <p className="text-[11px] text-amber-700 dark:text-amber-400">
                  Upgrade to DSA Yatra Lifetime to unlock full solution
                  explanations, visualizers and patterns.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  onFreemiumLockedClick?.(
                    activeQuestion._id || (activeQuestion as any).id,
                  )
                }
                className="px-3 py-1.5 rounded-lg bg-[#FF4D4D] text-white text-xs font-bold hover:bg-[#EE3126] transition-all shrink-0 cursor-pointer shadow-xs"
              >
                Unlock Problem
              </button>
            </div>
          )}

          {/* Question Title Heading */}
          <div>
            <h2 className="text-xl sm:text-2xl md:text-[26px] font-black text-[#101828] dark:text-white tracking-tight leading-snug">
              {activeQuestion?.title ||
                activeQuestion?.name ||
                activeQuestion?.question}
            </h2>
          </div>

          {/* Answer Content Area */}
          <div className="text-sm text-[#101828] dark:text-slate-200 leading-relaxed font-sans min-h-[160px]">
            <MDXRenderer
              mdxSource={cleanAnswer}
              theme={isDarkMode ? "dark" : "light"}
            />
          </div>

          {/* Bottom Actions Row */}
          <div className="pt-4 border-t border-slate-100 dark:border-[#26262C] flex flex-col sm:flex-row items-center justify-between gap-3">
            <LearnButton
              variant="outline"
              onClick={handlePrevQuestion}
              disabled={activeQuestionIndex <= 0}
            >
              Previous Question
            </LearnButton>

            <LearnButton
              isCompleted={Boolean(activeQuestion?.isCompleted)}
              isLoading={isUpdatingQuestion}
              onClick={handleToggleCompletion}
              disabled={!activeQuestion}
              completedLabel="Solved"
              incompleteLabel="Mark as Solved"
            />

            <LearnButton
              variant="primary"
              onClick={handleNextQuestion}
              disabled={activeQuestionIndex >= questions.length - 1}
            >
              Next Question
            </LearnButton>
          </div>
        </div>
      </div>
    </div>
  );
};
