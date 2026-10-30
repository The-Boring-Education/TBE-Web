"use client";

import { ProtectedRoute, useAuth } from "@tbe/auth";
import { EditDsaOnboardingModal, SEO } from "@tbe/components";
import { PAGE_REFRESH_TIMEOUT } from "@tbe/constants";
import { useDsaCompletedQuestions, useDsaQuestions } from "@tbe/hooks";
import type { PageProps, UserProfile } from "@tbe/interface";
import { userService } from "@tbe/services";
import { cn, getPreFetchProps } from "@tbe/utils";
import {
  ArrowRight,
  Bookmark,
  Briefcase,
  Calendar,
  ChevronDown,
  Clock,
  Crosshair,
  FileText,
  Hexagon,
  Lightbulb,
  PenLine,
  Play,
  Target,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Fragment, useEffect, useMemo, useState } from "react";

/* -------------------------------------------------------------------------- */
/* Circular Progress Component for Overall Progress Card                      */
/* -------------------------------------------------------------------------- */
function CircularProgress({
  percentage,
  solved,
  total,
}: {
  percentage: number;
  solved: number;
  total: number;
}) {
  const size = 168;
  const strokeWidth = 11;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference -
    (Math.min(100, Math.max(0, percentage)) / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center my-2 sm:my-3">
      <svg
        width={size}
        height={size}
        className="rotate-[-90deg] transition-all duration-700 ease-out"
      >
        {/* Track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#1F1F24"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Active progress stroke */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#FF4D4D"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      {/* Centered text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
        <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          {percentage}%
        </span>
        <span className="text-xs text-slate-400 font-medium mt-0.5">
          {solved} / {total}
        </span>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Weekly 7-Day Activity Mini Bar Chart                                       */
/* -------------------------------------------------------------------------- */
function WeeklyActivityChart() {
  const days = [
    { label: "Mon", dayIndex: 1 },
    { label: "Tue", dayIndex: 2 },
    { label: "Wed", dayIndex: 3 },
    { label: "Thu", dayIndex: 4 },
    { label: "Fri", dayIndex: 5 },
    { label: "Sat", dayIndex: 6 },
    { label: "Sun", dayIndex: 0 },
  ];

  const currentDayIndex = new Date().getDay();

  return (
    <div className="flex items-end gap-1.5 sm:gap-2">
      {days.map((d) => {
        const isToday = d.dayIndex === currentDayIndex;
        return (
          <div key={d.label} className="flex flex-col items-center gap-1">
            <div
              className={cn(
                "w-2.5 sm:w-3.5 h-9 sm:h-10 rounded-xs transition-all",
                isToday
                  ? "bg-[#FF4D4D] shadow-sm shadow-red-500/30"
                  : "bg-[#1E1E24]",
              )}
            />
            <span
              className={cn(
                "text-[9px] sm:text-[10px] font-medium transition-colors",
                isToday ? "text-slate-300 font-semibold" : "text-slate-500",
              )}
            >
              {d.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Main DsaClient Component Matching Design Exactly                           */
/* -------------------------------------------------------------------------- */
const DsaClient = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { completedIds, solvedToday } = useDsaCompletedQuestions({
    userId: user?.id,
  });

  const { questions } = useDsaQuestions({ productType: "DSA_YATRA" });

  const validCompletedIds = useMemo(() => {
    return (completedIds || []).filter((id) =>
      /^[0-9a-fA-F]{24}$/.test(String(id)),
    );
  }, [completedIds]);

  const totalQuestions = 399;
  const totalSolved = validCompletedIds.length;
  const remainingQuestions = Math.max(0, totalQuestions - totalSolved);
  const overallPercentage =
    totalQuestions > 0
      ? Math.min(100, Math.round((totalSolved / totalQuestions) * 100))
      : 0;

  // Calculate difficulty dynamically from user's solved question IDs
  const { easyCount, mediumCount, hardCount } = useMemo(() => {
    if (!validCompletedIds?.length) {
      return { easyCount: 0, mediumCount: 0, hardCount: 0 };
    }
    if (!questions?.length) {
      return {
        easyCount: totalSolved,
        mediumCount: 0,
        hardCount: 0,
      };
    }
    const completedSet = new Set(validCompletedIds.map(String));
    let easy = 0;
    let medium = 0;
    let hard = 0;

    for (const q of questions) {
      const id = String(q.id ?? q._id ?? q.name);
      if (completedSet.has(id)) {
        const diff = (q.difficultyLevel || "MEDIUM").toUpperCase();
        if (diff === "EASY") easy++;
        else if (diff === "HARD") hard++;
        else medium++;
      }
    }

    // Fallback if completedIds are from different keys
    if (easy === 0 && medium === 0 && hard === 0 && totalSolved > 0) {
      easy = totalSolved;
    }

    return { easyCount: easy, mediumCount: medium, hardCount: hard };
  }, [completedIds, questions, totalSolved]);

  useEffect(() => {
    if (user?.id) {
      userService.getProfile(user.id).then(setProfile);
    }
  }, [user?.id]);

  const displayName = user?.name || "Nitin";
  const firstName = displayName.split(" ")[0] || "Nitin";
  const targetLabel = profile?.dsaYatra?.target || "Product-based";
  const timelineLabel = profile?.dsaYatra?.timeline || "4 - 6 months";
  const expLabel = profile?.dsaYatra?.experienceLevel || "Tech student";
  const primaryTargetLabel = profile?.dsaYatra?.companies?.[0] || "Top tech";

  return (
    <div className="w-full min-w-0 max-w-full font-sans space-y-3 pb-3">
      {/* 1. Hero Block: Welcome + Goal Cards + Repositioned & Tilted Laptop Illustration */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-[#29292F] bg-white dark:bg-[#111113] shadow-2xs p-5 sm:p-6 lg:p-7 relative overflow-hidden">
        {/* Subtle red ambient glow behind laptop illustration */}
        <div className="hidden md:block absolute -top-8 right-12 lg:right-24 w-[320px] h-[320px] rounded-full bg-[#FF4D4D]/10 blur-[90px] pointer-events-none z-0" />

        {/* Top Header Row with Welcome text, Edit Goal CTA & Tilted Laptop Illustration */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 relative z-10 min-h-[140px] md:min-h-[160px] lg:min-h-[175px]">
          {/* Left Column: Welcome greetings */}
          <div className="space-y-1.5 max-w-sm sm:max-w-md lg:max-w-lg z-10">
            <p className="text-[11px] font-bold tracking-[0.16em] text-slate-400 dark:text-[#9CA3AF] uppercase">
              DSA Yatra
            </p>
            <h1 className="text-2xl sm:text-[28px] lg:text-[30px] font-bold text-slate-900 dark:text-[#F5F5F5] tracking-tight leading-tight">
              Welcome back, {firstName}!{" "}
              <span aria-hidden className="inline-block">
                👋
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-[#9CA3AF] font-medium leading-relaxed">
              Consistency today, better opportunities tomorrow.
            </p>
          </div>

          {/* Edit Goal Button on top right */}
          <div className="z-20 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] border border-slate-200/90 dark:border-[#29292F] bg-slate-50 dark:bg-[#19191D] hover:bg-slate-100 dark:hover:bg-[#202026] hover:dark:border-[#383842] text-slate-700 dark:text-[#F5F5F5] text-xs font-semibold transition-all cursor-pointer shrink-0 shadow-2xs"
            >
              <PenLine className="w-3.5 h-3.5 text-[#FF4D4D]" />
              <span>Edit Goal</span>
            </button>
          </div>

          {/* Tilted & Centered Laptop Illustration (Right Half) */}
          <div className="w-full md:w-auto md:absolute md:top-1 lg:-top-1 md:right-12 lg:right-24 xl:right-32 z-0 flex justify-center pointer-events-none select-none">
            <img
              src="https://ik.imagekit.io/riufvimprm/TBE/dsayatra-dashboard-laptop.png"
              alt="DSA Yatra Laptop"
              className="w-[280px] sm:w-[340px] md:w-[390px] lg:w-[450px] xl:w-[480px] h-auto object-contain transform -rotate-6 transition-transform duration-500 drop-shadow-[0_15px_35px_rgba(255,77,77,0.15)]"
            />
          </div>
        </div>

        {/* Bottom Row inside Hero: 4 Goal Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6 lg:mt-8 relative z-10">
          {[
            {
              icon: Target,
              label: "Goal Timeline",
              value: timelineLabel,
            },
            {
              icon: Briefcase,
              label: "Your Experience",
              value: expLabel,
            },
            {
              icon: Crosshair,
              label: "Current Focus",
              value: targetLabel,
            },
            {
              icon: TrendingUp,
              label: "Target",
              value: primaryTargetLabel,
            },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-[16px] border border-slate-200/90 dark:border-[#29292F] bg-slate-50 dark:bg-[#19191D] hover:dark:bg-[#1E1E23] hover:dark:border-[#383842] p-4 sm:p-5 flex flex-col justify-between gap-3.5 transition-all duration-200 shadow-2xs group"
            >
              <card.icon className="w-9 h-9 sm:w-10 sm:h-10 text-[#FF4D4D] stroke-[1.75] shrink-0 transition-transform duration-200 group-hover:scale-105" />
              <div className="space-y-1">
                <p className="text-[13px] sm:text-[14px] font-medium text-slate-500 dark:text-[#9CA3AF] leading-none">
                  {card.label}
                </p>
                <p className="text-[19px] sm:text-[20px] font-semibold text-slate-900 dark:text-[#F5F5F5] tracking-tight leading-snug">
                  {card.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Middle Row: Overall Progress (Left) & Stacked Activities (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-3.5">
        {/* Left Column: Overall Progress Card */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200/90 dark:border-[#24242A] bg-white dark:bg-[#131316] shadow-2xs p-4 sm:p-5 flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between gap-2 pb-1.5">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-[#FF4D4D] shrink-0" />
                <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                  Overall Progress
                </span>
              </div>

              <button
                type="button"
                className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200/90 dark:border-[#2C2C36] bg-slate-50 dark:bg-[#18181D] text-slate-600 dark:text-slate-300 flex items-center gap-1.5 cursor-default"
              >
                <span>All Time</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>

            {/* Circular Progress Ring */}
            <CircularProgress
              percentage={overallPercentage}
              solved={totalSolved}
              total={totalQuestions}
            />

            <div className="h-px w-full bg-slate-100 dark:bg-[#1E1E24] my-2.5" />

            {/* Solved & Remaining 2 Stat Boxes */}
            <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
              <div className="rounded-xl border border-slate-200/90 dark:border-[#26262E] bg-slate-50 dark:bg-[#18181D] p-2.5 sm:p-3 flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-tight">
                    {totalSolved}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-tight">
                    Solved
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200/90 dark:border-[#26262E] bg-slate-50 dark:bg-[#18181D] p-2.5 sm:p-3 flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-tight">
                    {remainingQuestions}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-tight">
                    Remaining
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom CTA Button */}
          <button
            type="button"
            onClick={() => router.push("/sheets")}
            className="w-full mt-3.5 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-[#FF4D4D] hover:bg-[#FF3333] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-red-500/20 active:scale-[0.99]"
          >
            <span>Start Solving</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right Column: Stacked Today's Activity & Total Solved Cards */}
        <div className="lg:col-span-7 flex flex-col gap-3 sm:gap-3.5">
          {/* Card 1: Today's Activity */}
          <div className="rounded-2xl border border-slate-200/90 dark:border-[#24242A] bg-white dark:bg-[#131316] shadow-2xs p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-[#1E1E24]">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#FF4D4D] shrink-0" />
                <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                  Today's Activity
                </span>
              </div>

              <Link
                href="/revisions"
                className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200/90 dark:border-[#2C2C36] bg-slate-50 dark:bg-[#18181D] hover:bg-slate-100 dark:hover:bg-[#202026] text-slate-600 dark:text-slate-300 flex items-center gap-1.5 transition-colors"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="flex items-center justify-between gap-4 mt-4">
              <div>
                <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {solvedToday ?? 0}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                  Questions solved today
                </div>
              </div>

              <WeeklyActivityChart />
            </div>
          </div>

          {/* Card 2: Total Solved */}
          <div className="rounded-2xl border border-slate-200/90 dark:border-[#24242A] bg-white dark:bg-[#131316] shadow-2xs p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-[#1E1E24]">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-[#FF4D4D] shrink-0" />
                <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                  Total Solved
                </span>
              </div>

              <Link
                href="/sheets"
                className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200/90 dark:border-[#2C2C36] bg-slate-50 dark:bg-[#18181D] hover:bg-slate-100 dark:hover:bg-[#202026] text-slate-600 dark:text-slate-300 flex items-center gap-1.5 transition-colors"
              >
                <span>View Stats</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="mt-3.5 space-y-2">
              <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {totalSolved}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Out of {totalQuestions} questions
              </div>

              {/* Progress Bar with Thumb Dot */}
              <div className="relative w-full h-1.5 bg-slate-100 dark:bg-[#1F1F24] rounded-full overflow-visible my-3">
                <div
                  className="h-full bg-[#FF4D4D] rounded-full transition-all duration-700"
                  style={{ width: `${overallPercentage}%` }}
                />
                <span
                  className="absolute -top-1 w-3.5 h-3.5 rounded-full bg-[#FF4D4D] ring-2 ring-white dark:ring-[#131316] shadow-sm pointer-events-none transition-all duration-700"
                  style={{
                    left: `calc(${Math.min(98, Math.max(0, overallPercentage))}% - 6px)`,
                  }}
                />
              </div>

              {/* 3 Difficulty Badges (Icons have no border/bg box) */}
              <div className="grid grid-cols-3 gap-2 sm:gap-2.5 pt-1.5">
                <div className="rounded-xl border border-slate-200/90 dark:border-[#26262E] bg-slate-50 dark:bg-[#18181D] p-2 sm:p-2.5 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-tight">
                      {easyCount}
                    </div>
                    <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      Easy
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200/90 dark:border-[#26262E] bg-slate-50 dark:bg-[#18181D] p-2 sm:p-2.5 flex items-center gap-2">
                  <Hexagon className="w-4 h-4 text-amber-400 fill-amber-400/20 shrink-0" />
                  <div>
                    <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-tight">
                      {mediumCount}
                    </div>
                    <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      Medium
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200/90 dark:border-[#26262E] bg-slate-50 dark:bg-[#18181D] p-2 sm:p-2.5 flex items-center gap-2">
                  <Target className="w-4 h-4 text-[#FF4D4D] shrink-0" />
                  <div>
                    <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-tight">
                      {hardCount}
                    </div>
                    <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      Hard
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bottom Section: Recommended for you */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-[#24242A] bg-white dark:bg-[#131316] shadow-2xs p-4 sm:p-5">
        <div className="flex items-center gap-2.5">
          <Lightbulb className="w-5 h-5 text-[#FF4D4D] shrink-0" />
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              Recommended for you
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Quick actions to keep your momentum going.
            </p>
          </div>
        </div>

        {/* 3 Action Cards (Icons have no border/bg box) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3 mt-4">
          {/* Card 1: Continue Solving */}
          <Link
            href="/sheets"
            className="p-3.5 sm:p-4 rounded-xl bg-slate-50 dark:bg-[#18181D] hover:bg-slate-100 dark:hover:bg-[#1E1E24] border border-slate-200/90 dark:border-[#26262E] hover:border-slate-300 dark:hover:border-slate-700/80 transition-all flex flex-col justify-between group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <Play className="w-5 h-5 fill-current text-[#FF4D4D] shrink-0" />
              <ArrowRight className="w-4 h-4 text-[#FF4D4D] group-hover:translate-x-0.5 transition-transform" />
            </div>
            <div className="mt-3.5">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#FF4D4D] transition-colors">
                Continue Solving
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Pick up where you left off.
              </p>
            </div>
          </Link>

          {/* Card 2: Explore Sheets */}
          <Link
            href="/sheets"
            className="p-3.5 sm:p-4 rounded-xl bg-slate-50 dark:bg-[#18181D] hover:bg-slate-100 dark:hover:bg-[#1E1E24] border border-slate-200/90 dark:border-[#26262E] hover:border-slate-300 dark:hover:border-slate-700/80 transition-all flex flex-col justify-between group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <FileText className="w-5 h-5 text-[#FF4D4D] shrink-0" />
              <ArrowRight className="w-4 h-4 text-[#FF4D4D] group-hover:translate-x-0.5 transition-transform" />
            </div>
            <div className="mt-3.5">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#FF4D4D] transition-colors">
                Explore Sheets
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Structured practice by topic.
              </p>
            </div>
          </Link>

          {/* Card 3: Revise Mistakes */}
          <Link
            href="/revisions"
            className="p-3.5 sm:p-4 rounded-xl bg-slate-50 dark:bg-[#18181D] hover:bg-slate-100 dark:hover:bg-[#1E1E24] border border-slate-200/90 dark:border-[#26262E] hover:border-slate-300 dark:hover:border-slate-700/80 transition-all flex flex-col justify-between group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <Bookmark className="w-5 h-5 text-[#FF4D4D] shrink-0" />
              <ArrowRight className="w-4 h-4 text-[#FF4D4D] group-hover:translate-x-0.5 transition-transform" />
            </div>
            <div className="mt-3.5">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#FF4D4D] transition-colors">
                Revise Mistakes
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Strengthen weak topics.
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* Edit Onboarding Goals Modal */}
      <EditDsaOnboardingModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onUpdate={() => {
          if (user?.id) {
            userService.getProfile(user.id).then(setProfile);
          }
        }}
        currentData={profile as any}
        userId={user?.id || ""}
      />
    </div>
  );
};

const Dashboard = ({ seoMeta }: PageProps) => {
  return (
    <ProtectedRoute redirectTo="/login">
      <Fragment>
        <SEO seoMeta={seoMeta} />
        <DsaClient />
      </Fragment>
    </ProtectedRoute>
  );
};

export const getStaticProps = async () => ({
  ...(await getPreFetchProps({
    slug: "/dashboard",
    appId: "dsayatra",
  })),
  revalidate: PAGE_REFRESH_TIMEOUT.veryVeryLong,
});

export default Dashboard;
