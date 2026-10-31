import { quizApi } from "@tbe/services";
import { cleanOptionText } from "@tbe/utils";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  FiAlertCircle,
  FiArrowLeft,
  FiArrowRight,
  FiAward,
  FiCheck,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiFileText,
  FiHelpCircle,
  FiInfo,
  FiRotateCcw,
  FiSend,
  FiX,
  FiZap,
} from "react-icons/fi";

import { CodeRenderer } from "../quizes/common/CodeRenderer";
import { PersonalizationLoader } from "./PersonalizationLoader";
import { getQuizLogo, quizQuestionsCache } from "./QuizCatalogSpace";

interface QuizQuestion {
  _id?: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  detailedExplanation?: string;
  difficulty?: string;
}

interface QuizPlaySpaceProps {
  quizId: string;
  quizName?: string;
  user?: any;
  onBack: () => void;
}

export const QuizPlaySpace: React.FC<QuizPlaySpaceProps> = ({
  quizId,
  quizName,
  user,
  onBack,
}) => {
  const cachedData = quizQuestionsCache.get(quizId);
  const [quizDetails, setQuizDetails] = useState<any>(cachedData || null);
  const [questions, setQuestions] = useState<QuizQuestion[]>(
    cachedData?.questions || [],
  );
  const [isLoading, setIsLoading] = useState<boolean>(!cachedData);
  const [error, setError] = useState<string | null>(null);

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, number>
  >({});
  const [questionTimes, setQuestionTimes] = useState<Record<number, number>>(
    {},
  );
  const [questionStartTime, setQuestionStartTime] = useState<number>(
    Date.now(),
  );
  const [totalSeconds, setTotalSeconds] = useState<number>(0);
  const [gameState, setGameState] = useState<
    "playing" | "submitting" | "results"
  >("playing");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  const numbersContainerRef = useRef<HTMLDivElement>(null);
  const scrollNumbers = (direction: "left" | "right") => {
    if (numbersContainerRef.current) {
      numbersContainerRef.current.scrollBy({
        left: direction === "left" ? -180 : 180,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    if (numbersContainerRef.current) {
      const activeBtn = numbersContainerRef.current.children[
        currentIndex
      ] as HTMLElement;
      if (activeBtn) {
        activeBtn.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, [currentIndex]);

  // Detect dark theme
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

  // Fetch quiz questions with in-memory caching
  useEffect(() => {
    let isMounted = true;
    const fetchQuestions = async () => {
      if (quizQuestionsCache.has(quizId)) {
        const cached = quizQuestionsCache.get(quizId);
        setQuizDetails(cached);
        setQuestions(cached.questions || []);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const res = await quizApi.getQuestions(quizId, false);
        if (!isMounted) return;

        if (res?.data) {
          quizQuestionsCache.set(quizId, res.data);
          setQuizDetails(res.data);
          setQuestions(res.data.questions || []);
        } else {
          setError("Failed to load questions for this quiz.");
        }
      } catch (err: any) {
        if (!isMounted) return;
        setError(err.message || "Failed to load quiz.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchQuestions();
    return () => {
      isMounted = false;
    };
  }, [quizId]);

  // Overall timer
  useEffect(() => {
    if (gameState !== "playing") return;
    const interval = setInterval(() => {
      setTotalSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [gameState]);

  // Record time spent on question index changes
  const recordQuestionTime = useCallback(() => {
    const spent = Math.max(
      1,
      Math.floor((Date.now() - questionStartTime) / 1000),
    );
    setQuestionTimes((prev) => ({
      ...prev,
      [currentIndex]: (prev[currentIndex] || 0) + spent,
    }));
    setQuestionStartTime(Date.now());
  }, [currentIndex, questionStartTime]);

  // Select option handler
  const handleSelectOption = (optionIndex: number) => {
    if (gameState !== "playing") return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentIndex]: optionIndex,
    }));
  };

  // Navigation handlers
  const handleNext = () => {
    recordQuestionTime();
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    recordQuestionTime();
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleJumpToQuestion = (index: number) => {
    recordQuestionTime();
    setCurrentIndex(index);
  };

  // Keyboard shortcut listener
  useEffect(() => {
    if (gameState !== "playing") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const key = e.key.toLowerCase();
      // 1 or a -> option 0
      if (key === "1" || key === "a") handleSelectOption(0);
      else if (key === "2" || key === "b") handleSelectOption(1);
      else if (key === "3" || key === "c") handleSelectOption(2);
      else if (key === "4" || key === "d") handleSelectOption(3);
      else if (e.key === "ArrowRight" && currentIndex < questions.length - 1) {
        handleNext();
      } else if (e.key === "ArrowLeft" && currentIndex > 0) {
        handlePrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState, currentIndex, questions.length]);

  // Complete and submit quiz
  const handleSubmitQuiz = async () => {
    recordQuestionTime();
    setIsSubmitting(true);
    setGameState("submitting");

    const effectiveUserId = user?.id || user?._id || "guest";
    const answers = questions.map((q, idx) => ({
      questionIndex: idx,
      selectedAnswer: selectedAnswers[idx] ?? -1,
      isCorrect: selectedAnswers[idx] === q.correctAnswer,
      timeSpent: questionTimes[idx] || 1,
    }));

    try {
      if (effectiveUserId !== "guest") {
        await quizApi.submitQuiz(quizId, {
          userId: effectiveUserId,
          answers,
          totalTimeSpent: totalSeconds,
        });
      }
    } catch (err) {
      console.warn(
        "Could not submit remote analytics, displaying local results",
        err,
      );
    } finally {
      setIsSubmitting(false);
      setGameState("results");
    }
  };

  // Results calculation
  const results = useMemo(() => {
    let correct = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswer) {
        correct++;
      }
    });
    const total = questions.length || 1;
    const percentage = Math.round((correct / total) * 100);
    const xpEarned = correct * 10;
    return {
      correct,
      total: questions.length,
      percentage,
      xpEarned,
      passed: percentage >= 60,
    };
  }, [questions, selectedAnswers]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainder.toString().padStart(2, "0")}`;
  };

  const currentQuestion = questions[currentIndex];
  const progressPercent = questions.length
    ? Math.round(((currentIndex + 1) / questions.length) * 100)
    : 0;

  const title = quizName || quizDetails?.categoryName || "Technical Assessment";
  const logo = getQuizLogo(title);

  // 1. Loading State
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
        <PersonalizationLoader theme="dark" />
      </div>
    );
  }

  // 2. Error State
  if (error || !currentQuestion) {
    return (
      <div className="py-16 bg-white dark:bg-[#17171B] border border-slate-200/80 dark:border-[#26262C] rounded-2xl text-center p-8 max-w-lg mx-auto space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/40 text-[#FF3B30] flex items-center justify-center mx-auto">
          <FiAlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          {error || "No questions found in this assessment."}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          We could not load the requested quiz. Please try again or explore
          other topics.
        </p>
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-[#25252C] dark:hover:bg-[#2F2F37] text-slate-800 dark:text-slate-200 transition-all cursor-pointer"
          >
            Back to Quizzes
          </button>
        </div>
      </div>
    );
  }

  // 3. Results Screen
  if (gameState === "results") {
    return (
      <div className="max-w-3xl mx-auto space-y-4 animate-fadeIn">
        {/* Top Summary Card */}
        <div className="bg-white dark:bg-[#17171B] border border-slate-200/80 dark:border-[#26262C] rounded-2xl p-5 sm:p-7 shadow-xs">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-5 text-center sm:text-left">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-900/60">
                <FiAward className="w-3 h-3" />
                Assessment Completed
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {results.passed
                  ? "Outstanding Performance! 🎉"
                  : "Good Attempt! Keep Practicing 💪"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                You completed the{" "}
                <span className="text-slate-800 dark:text-slate-200 font-bold">
                  {title}
                </span>{" "}
                technical assessment in {formatTime(totalSeconds)}.
              </p>
            </div>

            {/* Score Ring / Pill */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex flex-col items-center justify-center w-24 h-24 rounded-2xl bg-slate-50 dark:bg-[#202026] border border-slate-200/80 dark:border-[#2C2C34]">
                <span className="text-3xl font-black text-[#FF3B30]">
                  {results.percentage}%
                </span>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Accuracy
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-6 pt-5 border-t border-slate-100 dark:border-[#24242C]">
            <div className="bg-slate-50 dark:bg-[#202026] p-3 rounded-xl text-center">
              <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Score
              </div>
              <div className="text-sm sm:text-base font-black text-slate-900 dark:text-white mt-0.5">
                {results.correct} / {results.total}
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-[#202026] p-3 rounded-xl text-center">
              <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Total Time
              </div>
              <div className="text-sm sm:text-base font-black text-slate-900 dark:text-white mt-0.5">
                {formatTime(totalSeconds)}
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-[#202026] p-3 rounded-xl text-center">
              <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                XP Earned
              </div>
              <div className="text-sm sm:text-base font-black text-amber-500 mt-0.5 flex items-center justify-center gap-1">
                <FiZap className="w-3.5 h-3.5" />+{results.xpEarned}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-end gap-2.5 mt-5">
            <button
              type="button"
              onClick={() => {
                setSelectedAnswers({});
                setQuestionTimes({});
                setCurrentIndex(0);
                setTotalSeconds(0);
                setQuestionStartTime(Date.now());
                setGameState("playing");
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-[#2C2C34] hover:bg-slate-50 dark:hover:bg-[#222228] text-slate-700 dark:text-slate-300 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <FiRotateCcw className="w-3.5 h-3.5" />
              Retake Quiz
            </button>
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#FF3B30] hover:bg-[#EE3126] text-white shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>Explore More Quizzes</span>
              <FiArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Detailed Question Review */}
        <div className="bg-white dark:bg-[#17171B] border border-slate-200/80 dark:border-[#26262C] rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#24242C] pb-3">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Questions &amp; Detailed Explanations
            </h3>
            <span className="text-xs text-slate-400">
              {results.correct} of {results.total} correct
            </span>
          </div>

          <div className="space-y-4">
            {questions.map((q, qIdx) => {
              const chosen = selectedAnswers[qIdx];
              const isCorrect = chosen === q.correctAnswer;

              return (
                <div
                  key={q._id || qIdx}
                  className={`p-3.5 sm:p-4 rounded-xl border transition-all ${
                    isCorrect
                      ? "border-emerald-200/80 dark:border-emerald-950/60 bg-emerald-50/20 dark:bg-emerald-950/10"
                      : "border-red-200/80 dark:border-red-950/60 bg-red-50/20 dark:bg-red-950/10"
                  }`}
                >
                  {/* Question header */}
                  <div className="flex items-start gap-2.5">
                    <span
                      className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center shrink-0 mt-0.5 ${
                        isCorrect
                          ? "bg-emerald-500 text-white"
                          : "bg-red-500 text-white"
                      }`}
                    >
                      {isCorrect ? (
                        <FiCheck className="w-3.5 h-3.5" />
                      ) : (
                        <FiX className="w-3.5 h-3.5" />
                      )}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
                        <CodeRenderer
                          content={q.question}
                          theme={isDarkMode ? "dark" : "light"}
                        />
                      </div>

                      {/* Options review */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                        {q.options.map((opt, optIdx) => {
                          const isOptionCorrect = optIdx === q.correctAnswer;
                          const wasOptionChosen = optIdx === chosen;

                          let optionStyle =
                            "border-slate-200 dark:border-[#2C2C34] bg-white dark:bg-[#1D1D24] text-slate-700 dark:text-slate-300";

                          if (isOptionCorrect) {
                            optionStyle =
                              "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold";
                          } else if (wasOptionChosen && !isCorrect) {
                            optionStyle =
                              "border-red-500 bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 line-through opacity-80";
                          }

                          return (
                            <div
                              key={optIdx}
                              className={`px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg text-[11px] sm:text-xs border flex items-center gap-2 transition-all ${optionStyle}`}
                            >
                              <span className="font-bold text-[10px] sm:text-[11px] opacity-80 shrink-0">
                                {String.fromCharCode(65 + optIdx)}.
                              </span>
                              <span className="truncate flex-1 min-w-0">
                                {cleanOptionText(opt)}
                              </span>
                              {isOptionCorrect && (
                                <FiCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 ml-auto" />
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation */}
                      {(q.explanation || q.detailedExplanation) && (
                        <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-[#2A2A32] text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
                          <FiInfo className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              Explanation:{" "}
                            </span>
                            <span>
                              {q.detailedExplanation || q.explanation}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // 4. Playing State (Ultra-Compact Square Layout Centered In-Between with Zero Page Scroll)
  return (
    <div className="w-full h-full min-h-0 flex flex-col justify-center items-center py-1 animate-fadeIn">
      <div className="w-full max-w-[480px] flex flex-col gap-1.5 sm:gap-2">
        {/* Top Breadcrumb Navigation */}
        <nav className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 flex-wrap px-0.5">
          <button
            type="button"
            onClick={onBack}
            className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            Learn
          </button>
          <span className="text-slate-300 dark:text-slate-600">›</span>
          <button
            type="button"
            onClick={onBack}
            className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            Quizzes
          </button>
          <span className="text-slate-300 dark:text-slate-600">›</span>
          <span className="font-bold text-[#FF4D4D] truncate max-w-[180px]">
            {title}
          </span>
        </nav>

        {/* Top Header Card */}
        <div className="bg-white dark:bg-[#16161A] border border-slate-200/80 dark:border-[#24242A] rounded-xl sm:rounded-2xl p-1.5 sm:p-2 shadow-2xs shrink-0">
          <div className="flex items-center justify-between gap-1.5">
            {/* Left: Back Button + Quiz Logo from CDN + Title */}
            <div className="flex items-center gap-1.5 min-w-0">
              <button
                type="button"
                onClick={onBack}
                className="w-6 h-6 rounded-md border border-slate-200/90 dark:border-[#2C2C34] bg-white dark:bg-[#1E1E24] hover:bg-slate-50 dark:hover:bg-[#25252C] text-slate-800 dark:text-slate-200 flex items-center justify-center transition-all shadow-2xs cursor-pointer shrink-0"
                title="Exit Quiz"
              >
                <FiChevronLeft className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>

              {/* Quiz Logo from CDN (no border, no white background) */}
              <div className="w-5 h-5 flex items-center justify-center shrink-0 select-none">
                {logo ? (
                  <img
                    src={logo}
                    alt={title}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="font-black text-[10px] text-slate-900 dark:text-white">
                    {title.slice(0, 2).toUpperCase()}
                  </span>
                )}
              </div>

              <div className="min-w-0">
                <h1 className="text-xs font-black text-slate-900 dark:text-white tracking-tight truncate leading-tight">
                  {title}
                </h1>
                <p className="text-[9px] text-slate-400 dark:text-slate-500 font-medium leading-none">
                  Technical Assessment
                </p>
              </div>
            </div>

            {/* Right: Timer & Question Count Badges */}
            <div className="flex items-center gap-1 shrink-0">
              {/* Timer Badge */}
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-red-50/70 dark:bg-red-950/30 border border-red-100/90 dark:border-red-900/40 text-[10px] font-semibold text-slate-800 dark:text-slate-200 shadow-2xs">
                <FiClock className="w-2.5 h-2.5 text-[#FF3B30] stroke-[2.2] shrink-0" />
                <span className="font-mono font-bold tracking-tight">
                  {formatTime(totalSeconds)}
                </span>
              </div>

              {/* Question Count Badge */}
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-red-50/70 dark:bg-red-950/30 border border-red-100/90 dark:border-red-900/40 text-[10px] font-bold text-[#FF3B30] shadow-2xs">
                <FiFileText className="w-2.5 h-2.5 text-[#FF3B30] stroke-[2.2] shrink-0" />
                <span>
                  {currentIndex + 1}/{questions.length}
                </span>
              </div>
            </div>
          </div>

          {/* Dynamic Progress Bar */}
          <div className="w-full bg-slate-100 dark:bg-[#24242C] h-1 rounded-full overflow-hidden mt-1.5">
            <div
              className="bg-[#FF3B30] h-1 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Main Question Card - Ultra Compact & Contained */}
        <div className="bg-white dark:bg-[#16161A] border border-slate-200/80 dark:border-[#24242A] rounded-xl sm:rounded-2xl p-2 sm:p-2.5 shadow-2xs flex flex-col gap-1.5 min-h-0">
          {/* Question Tag */}
          <div className="flex items-center justify-between">
            <span className="inline-block px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-red-50 dark:bg-red-950/40 text-[#FF3B30] border border-red-100/80 dark:border-red-900/40">
              QUESTION {currentIndex + 1}
            </span>
          </div>

          {/* Question Text & Code Snippet: scrollable internally only if extremely long */}
          <div className="text-xs font-bold text-slate-900 dark:text-white tracking-tight leading-snug max-h-[140px] overflow-y-auto pr-1 scrollbar-thin [&_pre]:max-h-24 [&_pre]:overflow-y-auto [&_pre]:p-1.5 [&_pre]:text-[11px] [&_pre]:my-1 [&_p]:my-0.5 [&_p]:leading-snug">
            <CodeRenderer
              content={currentQuestion.question}
              theme={isDarkMode ? "dark" : "light"}
            />
          </div>

          {/* Options List - Compact padding, minimal height, ZERO vertical scroll */}
          <div className="space-y-1">
            {currentQuestion.options.map((option, optIdx) => {
              const isSelected = selectedAnswers[currentIndex] === optIdx;
              const letter = String.fromCharCode(65 + optIdx);

              return (
                <div
                  key={optIdx}
                  onClick={() => handleSelectOption(optIdx)}
                  className={`rounded-lg border px-2 py-1 flex items-center justify-between gap-2 cursor-pointer transition-all duration-150 group select-none active:scale-[0.995] ${
                    isSelected
                      ? "border-slate-300 dark:border-[#3E3E48] bg-white dark:bg-[#1A1A20] shadow-2xs ring-1 ring-[#FF3B30]/30"
                      : "border-slate-200/80 dark:border-[#24242A] hover:border-slate-300 dark:hover:border-[#34343E] bg-white dark:bg-[#1A1A20]"
                  }`}
                >
                  {/* Left: Letter Badge + Option Content */}
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <div
                      className={`w-4.5 h-4.5 rounded flex items-center justify-center font-black text-[10px] shrink-0 transition-all ${
                        isSelected
                          ? "bg-red-50 dark:bg-red-950/50 text-[#FF3B30]"
                          : "bg-slate-100 dark:bg-[#24242C] text-slate-800 dark:text-slate-200 group-hover:bg-slate-200/80 dark:group-hover:bg-[#2C2C34]"
                      }`}
                    >
                      {letter}
                    </div>

                    <div className="text-[11px] sm:text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight flex-1 min-w-0 [&_*]:m-0 [&_*]:p-0 [&_p]:m-0 [&_p]:leading-tight">
                      <CodeRenderer
                        content={cleanOptionText(option)}
                        theme={isDarkMode ? "dark" : "light"}
                      />
                    </div>
                  </div>

                  {/* Right: Circular Radio Indicator */}
                  <div
                    className={`w-3.5 h-3.5 rounded-full border-2 transition-all shrink-0 flex items-center justify-center ${
                      isSelected
                        ? "border-[#FF3B30] bg-[#FF3B30] text-white"
                        : "border-slate-300 dark:border-slate-600 bg-transparent group-hover:border-slate-400"
                    }`}
                  >
                    {isSelected && <FiCheck className="w-2 h-2 stroke-[3]" />}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Keyboard Shortcut Hint */}
          <div className="text-[9px] text-slate-400 dark:text-slate-500 font-medium flex items-center gap-1 pt-0.5">
            <FiHelpCircle className="w-2.5 h-2.5 text-[#FF3B30] shrink-0" />
            <span>
              Press{" "}
              <span className="px-1 py-0.2 rounded bg-red-50 dark:bg-red-950/40 text-[#FF3B30] border border-red-100 dark:border-red-900/40 font-bold text-[8px]">
                1 — 4
              </span>{" "}
              or{" "}
              <span className="px-1 py-0.2 rounded bg-red-50 dark:bg-red-950/40 text-[#FF3B30] border border-red-100 dark:border-red-900/40 font-bold text-[8px]">
                A — D
              </span>{" "}
              to select, arrows to navigate.
            </span>
          </div>
        </div>

        {/* Bottom Navigation Card */}
        <div className="bg-white dark:bg-[#16161A] border border-slate-200/80 dark:border-[#24242A] rounded-xl sm:rounded-2xl p-1.5 sm:p-2 shadow-2xs flex items-center justify-between gap-1.5 shrink-0">
          {/* Left Section: Question Numbers Grid & Scroll Track */}
          <div className="flex flex-col gap-0.5 min-w-0 flex-1 max-w-[270px] sm:max-w-[300px]">
            <div
              ref={numbersContainerRef}
              className="flex items-center gap-1 overflow-x-auto overflow-y-hidden max-w-full pb-0.5 scrollbar-none"
            >
              {questions.map((_, idx) => {
                const isCurrent = idx === currentIndex;
                const isAnswered = selectedAnswers[idx] !== undefined;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleJumpToQuestion(idx)}
                    className={`w-5.5 h-5.5 sm:w-6 sm:h-6 rounded-md text-[10px] sm:text-[11px] font-extrabold transition-all shrink-0 cursor-pointer ${
                      isCurrent
                        ? "bg-[#FF3B30] text-white shadow-2xs scale-105"
                        : isAnswered
                          ? "bg-slate-100 dark:bg-[#202026] text-slate-800 dark:text-slate-200 border border-slate-300/80 dark:border-slate-700"
                          : "bg-slate-50 dark:bg-[#1E1E24] border border-slate-200/60 dark:border-[#2A2A32] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#26262E]"
                    }`}
                    title={`Question ${idx + 1}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Mini Scroll Slider with Chevrons */}
            <div className="flex items-center gap-1 w-full">
              <button
                type="button"
                onClick={() => scrollNumbers("left")}
                className="w-3.5 h-3.5 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-[#202026] text-slate-400 flex items-center justify-center shrink-0 cursor-pointer"
                title="Previous questions"
              >
                <FiChevronLeft className="w-2 h-2" />
              </button>
              <div className="flex-1 bg-slate-100 dark:bg-[#202026] h-1 rounded-full overflow-hidden">
                <div
                  className="bg-[#FF3B30] h-1 rounded-full transition-all duration-300"
                  style={{ width: `${Math.max(15, progressPercent)}%` }}
                />
              </div>
              <button
                type="button"
                onClick={() => scrollNumbers("right")}
                className="w-3.5 h-3.5 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-[#202026] text-slate-400 flex items-center justify-center shrink-0 cursor-pointer"
                title="Next questions"
              >
                <FiChevronRight className="w-2 h-2" />
              </button>
            </div>
          </div>

          {/* Right Section: Prev & Next Buttons */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={handlePrev}
              className="px-2 py-1 rounded-md border border-slate-200/90 dark:border-[#2C2C36] bg-white dark:bg-[#1A1A20] hover:bg-slate-50 dark:hover:bg-[#222228] text-slate-600 dark:text-slate-300 font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer disabled:opacity-40 disabled:pointer-events-none shadow-2xs"
            >
              <FiArrowLeft className="w-2.5 h-2.5" />
              <span>Prev</span>
            </button>

            {currentIndex < questions.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-2.5 py-1 rounded-md bg-[#FF3B30] hover:bg-[#EE3126] text-white font-bold text-[11px] flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
              >
                <span>Next</span>
                <FiArrowRight className="w-2.5 h-2.5" />
              </button>
            ) : (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmitQuiz}
                className="px-2.5 py-1 rounded-md bg-[#FF3B30] hover:bg-[#EE3126] text-white font-bold text-[11px] flex items-center gap-1 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
              >
                <FiSend className="w-2.5 h-2.5" />
                <span>{isSubmitting ? "..." : "Submit"}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
