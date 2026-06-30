"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Brain,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Trophy,
  X,
  XCircle,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import type { QuizQuestion, ResourceQuiz } from "@/lib/types";

const MAX_QUESTIONS = 10;

/** Fisher-Yates shuffle then take up to MAX_QUESTIONS. */
function pickQuestions(all: QuizQuestion[]): QuizQuestion[] {
  const pool = [...all];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const itemI = pool[i];
    const itemJ = pool[j];
    if (!itemI || !itemJ) continue;
    [pool[i], pool[j]] = [itemJ, itemI];
  }
  return pool.slice(0, MAX_QUESTIONS);
}

type AnswerState = "idle" | "correct" | "wrong";

type Props = {
  quiz: ResourceQuiz;
  isOpen: boolean;
  onClose: () => void;
  inline?: boolean;
  onBack?: () => void;
  shareUrl?: string;
};

function ScoreEmoji(score: number, total: number): string {
  const pct = (score / total) * 100;
  if (pct === 100) return "🏆";
  if (pct >= 80) return "🎉";
  if (pct >= 60) return "👍";
  if (pct >= 40) return "📚";
  return "💪";
}

function getScoreLabel(pct: number): string {
  if (pct === 100) return "Perfect Score!";
  if (pct >= 80) return "Excellent!";
  if (pct >= 60) return "Good Job!";
  if (pct >= 40) return "Keep Practicing!";
  return "Keep Going!";
}

function getScoreColor(pct: number): string {
  if (pct >= 80) return "text-emerald-400";
  if (pct >= 60) return "text-yellow-400";
  if (pct >= 40) return "text-orange-400";
  return "text-red-400";
}

const QUIZ_SHARE_MESSAGES_GENERAL = [
  (scoreLine: string, title: string) =>
    `I scored ${scoreLine} on "${title}"!\n\nCan you beat me?`,
  (scoreLine: string, title: string) =>
    `Just got ${scoreLine} on "${title}".\n\nThink you can top that?`,
  (scoreLine: string, title: string) =>
    `${scoreLine} on "${title}" — your turn.\n\nCan you beat my score?`,
  (scoreLine: string, title: string) =>
    `Took the "${title}" quiz and hit ${scoreLine}.\n\nBet you can't beat me.`,
  (scoreLine: string, title: string) =>
    `Got ${scoreLine} on "${title}" today.\n\nSame questions — can you do better?`,
  (scoreLine: string, title: string) =>
    `${scoreLine} on "${title}".\n\nChallenge: beat me if you can.`,
] as const;

const QUIZ_SHARE_MESSAGES_PERFECT = [
  (scoreLine: string, title: string) =>
    `I scored ${scoreLine} on "${title}" — perfect run! 🎯\n\nCan you beat me?`,
  (scoreLine: string, title: string) =>
    `Flawless ${scoreLine} on "${title}"!\n\nThink you can match it?`,
  (scoreLine: string, title: string) =>
    `${scoreLine} on "${title}". Zero wrong.\n\nYour move — beat me if you can.`,
] as const;

function pickQuizShareMessage(
  score: number,
  total: number,
  pct: number,
  title: string,
): string {
  const scoreLine = `${score}/${total} (${pct}%)`;
  const pool =
    pct === 100 ? QUIZ_SHARE_MESSAGES_PERFECT : QUIZ_SHARE_MESSAGES_GENERAL;
  const template = pool[Math.floor(Math.random() * pool.length)]!;
  return template(scoreLine, title);
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function QuizModal({
  quiz,
  isOpen,
  onClose,
  inline = false,
  onBack,
  shareUrl,
}: Props) {
  const back = onBack || onClose;
  // activeQuestions: random subset picked fresh each open/restart
  const [activeQuestions, setActiveQuestions] = useState<QuizQuestion[]>(() =>
    pickQuestions(quiz.questions),
  );
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answerState, setAnswerState] = useState<AnswerState>("idle");
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(() =>
    Array(Math.min(quiz.questions.length, MAX_QUESTIONS)).fill(null),
  );
  const [finished, setFinished] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [shareMessage, setShareMessage] = useState("");

  const total = activeQuestions.length;
  if (total === 0) return null;
  const question: QuizQuestion = activeQuestions[current]!;
  const progress = ((current + 1) / total) * 100;
  const pct = Math.round((score / total) * 100);

  // Reset + re-randomise when closed
  useEffect(() => {
    if (!isOpen) {
      const fresh = pickQuestions(quiz.questions);
      setActiveQuestions(fresh);
      setCurrent(0);
      setSelected(null);
      setAnswerState("idle");
      setScore(0);
      setAnswers(Array(fresh.length).fill(null));
      setFinished(false);
      setShowAnswer(false);
      setShareMessage("");
    }
  }, [isOpen, quiz.questions]);

  useEffect(() => {
    if (finished && pct >= 60) {
      setShareMessage(pickQuizShareMessage(score, total, pct, quiz.title));
    } else {
      setShareMessage("");
    }
  }, [finished, pct, score, total, quiz.title]);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development" || !isOpen || finished) return;
    console.log("[Quiz] correctIndex:", question.correct);
  }, [isOpen, finished, current, question.correct]);

  // Close on Escape
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, [onClose]);

  const handleSelect = useCallback(
    (idx: number) => {
      if (answerState !== "idle") return;
      setSelected(idx);
      const isCorrect = idx === question.correct;
      setAnswerState(isCorrect ? "correct" : "wrong");
      setShowAnswer(true);
      const next = [...answers];
      next[current] = idx;
      setAnswers(next);
      if (isCorrect) setScore((s) => s + 1);
    },
    [answerState, question, answers, current],
  );

  const handleNext = useCallback(() => {
    if (current + 1 >= total) {
      setFinished(true);
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
      setAnswerState("idle");
      setShowAnswer(false);
    }
  }, [current, total]);

  const handlePrev = useCallback(() => {
    if (current === 0) return;
    const prevIdx = current - 1;
    const prevQuestion = activeQuestions[prevIdx];
    setCurrent(prevIdx);
    setSelected(answers[prevIdx] ?? null);
    const prevAnswer = answers[prevIdx];
    if (prevAnswer !== null && prevQuestion) {
      setAnswerState(prevAnswer === prevQuestion.correct ? "correct" : "wrong");
      setShowAnswer(true);
    } else {
      setAnswerState("idle");
      setShowAnswer(false);
    }
  }, [current, answers, activeQuestions]);

  const handleRestart = () => {
    const fresh = pickQuestions(quiz.questions);
    setActiveQuestions(fresh);
    setCurrent(0);
    setSelected(null);
    setAnswerState("idle");
    setScore(0);
    setAnswers(Array(fresh.length).fill(null));
    setFinished(false);
    setShowAnswer(false);
  };

  if (!isOpen) return null;

  const currentShareUrl = shareUrl ?? "";
  const pageLink =
    currentShareUrl ||
    (typeof window !== "undefined" ? window.location.href : "");

  const shareToX = useCallback(() => {
    if (!shareMessage) return;
    const text = encodeURIComponent(shareMessage);
    const url = encodeURIComponent(pageLink);
    window.open(
      `https://x.com/intent/tweet?text=${text}&url=${url}`,
      "_blank",
      "width=600,height=450",
    );
  }, [pageLink, shareMessage]);

  const shareToLinkedIn = useCallback(() => {
    const url = encodeURIComponent(pageLink);
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      "_blank",
      "width=600,height=450",
    );
  }, [pageLink]);

  const quizPanel = (
    <motion.div
      key="quiz-panel"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.25 }}
      className="relative w-full max-w-4xl mx-auto"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Border gradient wrapper */}
      <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-zinc-700/70 via-zinc-800/30 to-transparent" />
      {/* Subtle grid backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Emerald glow blob */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-[-10%] right-[-5%] h-[300px] w-[300px] rounded-full blur-[120px]"
        style={{ background: "rgba(34,197,94,0.08)" }}
      />

      <motion.div
        key="quiz-modal"
        initial={{ opacity: 0, y: 28, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full"
      >
        {/* Border gradient wrapper */}
        <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-zinc-700/70 via-zinc-800/30 to-transparent" />

        <div className="relative flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-zinc-800/60">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 ring-1 ring-emerald-500/30">
                <Brain className="h-4 w-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-100 leading-none">
                  {quiz.title}
                </p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Showing {total} Questions
                </p>
              </div>
            </div>
            <button
              id="quiz-close-btn"
              aria-label="Close quiz"
              onClick={back}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 ring-1 ring-zinc-800 hover:bg-zinc-800 hover:text-zinc-300 transition-all"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Progress bar */}
          {!finished && (
            <div className="px-6 pt-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-zinc-500">
                  Question {current + 1} of {total}
                </span>
                <span className="text-xs font-medium text-emerald-400">
                  {score} correct
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-emerald-500"
                  initial={false}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
              </div>

              {/* Dot indicators */}
              <div className="mt-3 flex items-center gap-1 flex-wrap">
                {activeQuestions.map((q, i) => {
                  const ans = answers[i];
                  let color = "bg-zinc-700";
                  if (ans !== null) {
                    color = ans === q.correct ? "bg-emerald-500" : "bg-red-500";
                  } else if (i === current) {
                    color = "bg-zinc-400";
                  }
                  return (
                    <div
                      key={i}
                      className={`h-1 rounded-full transition-all duration-300 ${color}`}
                      style={{
                        width: `${Math.max(4, 100 / total - 0.5)}%`,
                      }}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Content */}
          <div className="px-6 py-5 flex-1">
            {!finished ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={current}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  {/* Question */}
                  <div className="mb-6">
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-800 ring-1 ring-zinc-700/60 text-xs font-semibold text-zinc-400">
                        {current + 1}
                      </span>
                      <h3 className="text-base font-medium text-zinc-100 leading-relaxed">
                        {question.question}
                      </h3>
                    </div>
                  </div>

                  {/* Options */}
                  <div className="space-y-2.5">
                    {question.options.map((opt, idx) => {
                      const isSelected = selected === idx;
                      const isCorrect = idx === question.correct;
                      const revealed = showAnswer;

                      let optClass =
                        "w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-left ring-1 transition-all duration-200 cursor-pointer ";

                      if (!revealed) {
                        optClass +=
                          "bg-zinc-900 ring-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:ring-zinc-700 hover:text-zinc-100";
                      } else if (isCorrect) {
                        optClass +=
                          "bg-emerald-500/10 ring-emerald-500/40 text-emerald-300";
                      } else if (isSelected && !isCorrect) {
                        optClass +=
                          "bg-red-500/10 ring-red-500/40 text-red-300";
                      } else {
                        optClass +=
                          "bg-zinc-800 ring-zinc-800/40 text-zinc-500";
                      }

                      return (
                        <button
                          key={idx}
                          id={`quiz-option-${current}-${idx}`}
                          className={optClass}
                          onClick={() => handleSelect(idx)}
                          disabled={revealed}
                        >
                          <span
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ring-1 transition-all ${
                              revealed && isCorrect
                                ? "bg-emerald-500/20 ring-emerald-500/50 text-emerald-400"
                                : revealed && isSelected && !isCorrect
                                  ? "bg-red-500/20 ring-red-500/50 text-red-400"
                                  : "bg-zinc-800 ring-zinc-700 text-zinc-400"
                            }`}
                          >
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span className="flex-1">{opt}</span>
                          {revealed && isCorrect && (
                            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                          )}
                          {revealed && isSelected && !isCorrect && (
                            <XCircle className="h-4 w-4 text-red-400 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Answer feedback */}
                  {showAnswer && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`mt-4 rounded-xl px-4 py-3 text-sm ring-1 ${
                        answerState === "correct"
                          ? "bg-emerald-500/8 ring-emerald-500/25 text-emerald-300"
                          : "bg-red-500/8 ring-red-500/25 text-red-300"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {answerState === "correct" ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <div className="font-medium">
                            {answerState === "correct"
                              ? "Correct! Well done."
                              : `Incorrect. The correct answer is: ${question.options[question.correct]}`}
                          </div>
                          {question.explanation && (
                            <div className="mt-2 text-sm text-zinc-400">
                              {question.explanation}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>
            ) : (
              /* Results screen */
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col items-center py-4 text-center"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 ring-1 ring-emerald-500/25 mb-5 text-3xl">
                  {ScoreEmoji(score, total)}
                </div>
                <p className="text-xs font-medium tracking-widest text-zinc-500 uppercase mb-1">
                  Quiz Complete
                </p>
                <h2
                  className={`text-2xl font-semibold tracking-tight mb-1 ${getScoreColor(pct)}`}
                >
                  {getScoreLabel(pct)}
                </h2>
                <p className="text-4xl font-black text-zinc-100 mb-1">
                  {score}
                  <span className="text-xl font-medium text-zinc-500">
                    /{total}
                  </span>
                </p>
                <p className="text-sm text-zinc-500 mb-6">{pct}% accuracy</p>

                {/* Score bar */}
                <div className="w-full max-w-xs mb-6">
                  <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${pct >= 80 ? "bg-emerald-500" : pct >= 60 ? "bg-yellow-500" : pct >= 40 ? "bg-orange-500" : "bg-red-500"}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{
                        duration: 0.8,
                        delay: 0.2,
                        ease: "easeOut",
                      }}
                    />
                  </div>
                </div>

                {/* Per-question summary mini dots */}
                <div className="flex flex-wrap gap-1.5 justify-center mb-6 max-w-sm">
                  {activeQuestions.map((q, i) => {
                    const ans = answers[i];
                    const correct = ans === q.correct;
                    return (
                      <div
                        key={i}
                        title={`Q${i + 1}: ${correct ? "Correct" : "Wrong"}`}
                        className={`h-2 w-2 rounded-full ${correct ? "bg-emerald-500" : "bg-red-500"}`}
                      />
                    );
                  })}
                </div>

                <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                  <button
                    id="quiz-restart-btn"
                    onClick={handleRestart}
                    className="flex items-center gap-2 rounded-xl bg-zinc-800 px-5 py-2.5 text-sm font-medium text-zinc-200 ring-1 ring-zinc-700/60 transition-all hover:bg-zinc-700 hover:ring-zinc-600 active:scale-[0.98]"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Retry
                  </button>
                  <button
                    id="quiz-finish-btn"
                    onClick={onClose}
                    className="flex items-center gap-2 rounded-xl bg-emerald-500/15 px-5 py-2.5 text-sm font-medium text-emerald-300 ring-1 ring-emerald-500/30 transition-all hover:bg-emerald-500/20 hover:ring-emerald-500/50 active:scale-[0.98]"
                  >
                    <Trophy className="h-4 w-4" />
                    Done
                  </button>
                </div>
                {pct >= 60 && (
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <button
                      type="button"
                      onClick={shareToX}
                      className="flex items-center justify-center gap-2 rounded-md border border-zinc-700 bg-zinc-800/60 px-3 py-1.5 text-sm text-zinc-300 transition hover:border-zinc-500 hover:text-white"
                    >
                      <XIcon className="h-4 w-4 shrink-0" />
                      Share on X
                    </button>
                    <button
                      type="button"
                      onClick={shareToLinkedIn}
                      className="flex items-center justify-center gap-2 rounded-md border border-zinc-700 bg-zinc-800/60 px-3 py-1.5 text-sm text-zinc-300 transition hover:border-zinc-500 hover:text-white"
                    >
                      <span className="text-base">in</span>
                      Share on LinkedIn
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Footer navigation */}
          {!finished && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800/60">
              <button
                id="quiz-prev-btn"
                onClick={handlePrev}
                disabled={current === 0}
                className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium text-zinc-400 ring-1 ring-zinc-800 transition-all hover:bg-zinc-800 hover:text-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                <ChevronLeft className="h-4 w-4" />
                Prev
              </button>

              <div className="flex items-center gap-1.5 text-xs text-zinc-600">
                <Zap className="h-3 w-3 text-zinc-700" />
                {answerState === "idle" ? "Select an answer" : ""}
              </div>

              <button
                id="quiz-next-btn"
                onClick={handleNext}
                disabled={answerState === "idle"}
                className="flex items-center gap-1.5 rounded-xl bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-200 ring-1 ring-zinc-700/60 transition-all hover:bg-zinc-700 hover:ring-zinc-600 disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                {current + 1 === total ? "Finish" : "Next"}
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );

  if (inline) {
    return (
      <div className="mt-6 mx-auto w-full max-w-4xl">
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={back}
            className="text-sm text-zinc-400 hover:text-zinc-200 underline"
          >
            ← Back to resource
          </button>
        </div>
        {quizPanel}
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 sm:px-6 sm:py-8"
      >
        <div
          className="absolute inset-0 bg-zinc-950/85 backdrop-blur-sm"
          onClick={onClose}
        />
        {quizPanel}
      </motion.div>
    </AnimatePresence>
  );
}
