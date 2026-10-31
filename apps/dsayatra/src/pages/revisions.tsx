import {
  LeetCodeIcon,
  LoadingSpinner,
  SEO,
  Text,
  YouTubeIcon,
} from "@tbe/components";
import { useDsaCompletedQuestions, useDsaQuestions, useUser } from "@tbe/hooks";
import type { DsaQuestion, PageProps } from "@tbe/interface";
import { cn, getPreFetchProps } from "@tbe/utils";
import { Check, ChevronRight, Info, Link, Lock, Target } from "lucide-react";
import Head from "next/head";
import { useRouter } from "next/router";
import { Fragment, useEffect, useState } from "react";

export default function RevisionsUI({ seoMeta }: PageProps) {
  const router = useRouter();
  const { loading: userLoading, isAuth, user } = useUser();
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [weeklyAssignments, setWeeklyAssignments] = useState<
    Record<number, string[]>
  >({});
  const [weekProgress, setWeekProgress] = useState<Record<number, string[]>>(
    {},
  );

  const { questions: dsaQuestions, loading: sheetsLoading } = useDsaQuestions();
  const { completedIds } = useDsaCompletedQuestions({ userId: user?.id });
  const globalCompleted = completedIds.map(String);

  useEffect(() => {
    if (!userLoading && !isAuth) {
      router.push("/login");
    }
  }, [userLoading, isAuth, router]);

  useEffect(() => {
    const savedAssignments = localStorage.getItem("dsayatra_weekly_revisions");
    if (savedAssignments) {
      try {
        setWeeklyAssignments(JSON.parse(savedAssignments));
      } catch {
        // Ignore parsing errors
      }
    }

    const savedProgress = localStorage.getItem("dsayatra_revision_completed");
    if (savedProgress) {
      try {
        setWeekProgress(JSON.parse(savedProgress));
      } catch {
        // Ignore parsing errors
      }
    }
  }, []);

  const numUnlockedWeeks = Math.floor(globalCompleted.length / 10);
  const totalWeeks = 10;

  useEffect(() => {
    if (!dsaQuestions.length || !globalCompleted.length) return;

    let modified = false;
    const newAssignments = { ...weeklyAssignments };

    const validGlobalCompleted = globalCompleted.filter((id) =>
      dsaQuestions.some((q) => String(q.id || q.name) === String(id)),
    );

    const usedQuestions = new Set<string>();

    for (let i = 0; i < numUnlockedWeeks; i++) {
      const weekQs = newAssignments[i] || [];
      const validWeekQs = weekQs.filter((id: string) =>
        dsaQuestions.some((q) => String(q.id || q.name) === String(id)),
      );

      // Keep track of what we've already used in earlier weeks so we don't overlap as heavily if we can avoid it.
      validWeekQs.forEach((id) => usedQuestions.add(id));

      if (
        validWeekQs.length < 7 &&
        validGlobalCompleted.length > validWeekQs.length
      ) {
        // Determine what can still be drawn. Prefer drawing unused questions.
        let availablePool = validGlobalCompleted.filter(
          (id) => !validWeekQs.includes(id) && !usedQuestions.has(id),
        );

        // If we ran out of unused questions, we just use anything randomly that isn't inside THIS week already.
        if (availablePool.length < 7 - validWeekQs.length) {
          availablePool = validGlobalCompleted.filter(
            (id) => !validWeekQs.includes(id),
          );
        }

        const shuffled = [...availablePool].sort(() => 0.5 - Math.random());
        const needed = 7 - validWeekQs.length;
        const newAdditions = shuffled.slice(0, needed);

        newAssignments[i] = [...validWeekQs, ...newAdditions];
        newAdditions.forEach((id) => usedQuestions.add(id));
        modified = true;
      } else if (validWeekQs.length !== weekQs.length) {
        newAssignments[i] = validWeekQs;
        modified = true;
      }
    }

    if (modified) {
      setWeeklyAssignments(newAssignments);
      localStorage.setItem(
        "dsayatra_weekly_revisions",
        JSON.stringify(newAssignments),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dsaQuestions, globalCompleted, numUnlockedWeeks]);

  const handleSelectWeek = (weekIndex: number) => {
    if (weekIndex >= numUnlockedWeeks) return; // Locked

    const assignments = { ...weeklyAssignments };
    if (!assignments[weekIndex] || assignments[weekIndex].length < 7) {
      const validGlobalCompleted = globalCompleted.filter((id) =>
        dsaQuestions.some((q) => String(q.id || q.name) === String(id)),
      );
      const currentValid = (assignments[weekIndex] || []).filter((id) =>
        dsaQuestions.some((q) => String(q.id || q.name) === String(id)),
      );

      // Re-verify the needed amount incase
      if (
        currentValid.length < 7 &&
        validGlobalCompleted.length > currentValid.length
      ) {
        const availablePool = validGlobalCompleted.filter(
          (id) => !currentValid.includes(id),
        );
        const shuffled = [...availablePool].sort(() => 0.5 - Math.random());
        const needed = 7 - currentValid.length;
        assignments[weekIndex] = [
          ...currentValid,
          ...shuffled.slice(0, needed),
        ];
        setWeeklyAssignments(assignments);
        localStorage.setItem(
          "dsayatra_weekly_revisions",
          JSON.stringify(assignments),
        );
      }
    }
    setSelectedWeek(weekIndex);
  };

  const handleBack = () => {
    setSelectedWeek(null);
  };

  const toggleRevisionQuestion = (qId: string) => {
    if (selectedWeek === null) return;
    setWeekProgress((prev) => {
      const weekData = prev[selectedWeek] || [];
      const isCompleted = weekData.includes(qId);
      const newWeekData = isCompleted
        ? weekData.filter((id) => id !== qId)
        : [...weekData, qId];
      const next = { ...prev, [selectedWeek]: newWeekData };
      localStorage.setItem("dsayatra_revision_completed", JSON.stringify(next));
      return next;
    });
  };

  if (sheetsLoading || userLoading) {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-[400px]">
        <LoadingSpinner height={4} width={4} borderColour="white" />
        <Text level="p" className="text-slate-400 ml-3 text-xs font-medium">
          Loading Revisions...
        </Text>
      </div>
    );
  }

  // Render Tiles View
  if (selectedWeek === null) {
    return (
      <Fragment>
        <SEO seoMeta={seoMeta} appId="dsayatra" />
        <Head>
          <title>Revision Session | DSA Yatra</title>
        </Head>
        <div className="w-full h-full overflow-y-auto px-3 sm:px-6 py-2 sm:py-3 space-y-3 font-sans scrollbar-thin-grey">
          {/* Breadcrumb Navigation on Top */}
          <nav className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 dark:text-slate-500">
            <Link
              href="/dashboard"
              className="hover:text-slate-800 dark:hover:text-white transition-colors"
            >
              DSA Yatra
            </Link>
            <span className="text-slate-300 dark:text-slate-600">›</span>
            <span className="font-bold text-[#FF4D4D]">Weekly Revisions</span>
          </nav>

          <header className="space-y-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              Weekly <span className="text-[#FF4D4D]">Revisions</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium max-w-2xl leading-normal">
              Unlock a new revision week for every 10 questions you complete in
              the sheet! Master the forgetting curve.
            </p>
            <div className="pt-1 flex flex-wrap items-center gap-2">
              <span className="text-[10px] bg-red-50 dark:bg-red-950/40 text-[#FF4D4D] border border-red-100 dark:border-red-900/30 px-2.5 py-0.5 rounded-md font-bold uppercase tracking-wider">
                Total Completed: {globalCompleted.length} Qs
              </span>
              <span className="text-[10px] bg-slate-100 dark:bg-[#1E1E24] text-slate-600 dark:text-slate-400 border border-slate-200/90 dark:border-[#2C2C36] px-2.5 py-0.5 rounded-md font-bold uppercase tracking-wider">
                Progress:{" "}
                {Math.min(
                  100,
                  Math.round(
                    (globalCompleted.length / (totalWeeks * 10)) * 100,
                  ),
                )}
                % Unlocked
              </span>
            </div>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-3.5">
            {Array.from({ length: totalWeeks }).map((_, i) => {
              const isUnlocked = i < numUnlockedWeeks;
              const weekQuestions = (weeklyAssignments[i] || []).filter((id) =>
                dsaQuestions.some((q) => String(q.id || q.name) === String(id)),
              );
              const weekDone = weekProgress[i] || [];
              const isCompleted =
                weekQuestions.length > 0 &&
                weekDone.length === weekQuestions.length;

              return (
                <div
                  key={i}
                  onClick={() => isUnlocked && handleSelectWeek(i)}
                  className={cn(
                    "w-full rounded-xl border p-4 flex items-center justify-between transition-all duration-200 relative overflow-hidden group shadow-2xs",
                    isUnlocked
                      ? "cursor-pointer border-slate-200/90 dark:border-[#24242A] bg-white dark:bg-[#131316] hover:dark:bg-[#18181D] hover:border-[#FF4D4D]/50 dark:hover:border-[#FF4D4D]/50 hover:-translate-y-0.5"
                      : "cursor-not-allowed border-slate-100 dark:border-[#1E1E24] bg-slate-50/50 dark:bg-[#0E0E12] opacity-40",
                    isCompleted &&
                      "border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/20 hover:border-emerald-500/50",
                  )}
                >
                  <div className="flex flex-col gap-1 z-10">
                    <div className="flex items-center gap-2">
                      <h3
                        className={cn(
                          "text-base sm:text-lg font-black tracking-tight",
                          isUnlocked
                            ? "text-slate-900 dark:text-white"
                            : "text-slate-500",
                          isCompleted && "text-emerald-500",
                        )}
                      >
                        Week {i + 1}
                      </h3>
                      {!isUnlocked && (
                        <Lock className="w-3.5 h-3.5 text-slate-500" />
                      )}
                      {isCompleted && (
                        <div className="p-0.5 bg-emerald-500 rounded-full">
                          <Check className="w-2.5 h-2.5 text-black stroke-[3px]" />
                        </div>
                      )}
                    </div>
                    <p className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400">
                      {isUnlocked
                        ? weekQuestions.length > 0
                          ? `${weekDone.length} / ${weekQuestions.length} COMPLETED`
                          : "READY TO START"
                        : `UNLOCKS AT ${(i + 1) * 10} Qs`}
                    </p>
                  </div>
                  {isUnlocked ? (
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#FF4D4D] transition-colors" />
                  ) : null}

                  {/* Progress bar background on the card */}
                  {isUnlocked && (
                    <div className="absolute bottom-0 left-0 h-1 bg-slate-100 dark:bg-[#1E1E24] w-full">
                      <div
                        className={cn(
                          "h-full transition-all duration-700",
                          isCompleted ? "bg-emerald-500" : "bg-[#FF4D4D]",
                        )}
                        style={{
                          width: `${(weekDone.length / (weekQuestions.length || 1)) * 100}%`,
                        }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </Fragment>
    );
  }

  // Detail View Render
  const currentAssignmentIds = weeklyAssignments[selectedWeek] || [];
  const currentQuestions = currentAssignmentIds
    .map((id) =>
      dsaQuestions.find((q) => String(q.id || q.name) === String(id)),
    )
    .filter(Boolean) as DsaQuestion[];
  const completedWeekIds = weekProgress[selectedWeek] || [];
  const progress =
    currentQuestions.length > 0
      ? (completedWeekIds.length / currentQuestions.length) * 100
      : 0;
  const remaining = currentQuestions.length - completedWeekIds.length;

  return (
    <Fragment>
      <SEO seoMeta={seoMeta} appId="dsayatra" />
      <Head>
        <title>Revision Week {selectedWeek + 1} | DSA Yatra</title>
      </Head>
      <div className="w-full h-full overflow-y-auto px-3 sm:px-6 py-2 sm:py-3 space-y-3 font-sans scrollbar-thin-grey">
        <style
          dangerouslySetInnerHTML={{
            __html: `
          @keyframes fadeUp {
            from { transform: translateY(8px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          .animate-fadeUp { animation: fadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

          .flip-card {
            background-color: transparent;
            perspective: 1000px;
          }
          .flip-card-inner {
            position: relative;
            width: 100%;
            height: 100%;
            text-align: center;
            transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
            transform-style: preserve-3d;
          }
          .flip-card:hover .flip-card-inner, .flip-card.flipped .flip-card-inner {
            transform: rotateY(180deg);
          }
          .flip-card-front, .flip-card-back {
            position: absolute;
            width: 100%;
            height: 100%;
            -webkit-backface-visibility: hidden;
            backface-visibility: hidden;
            border-radius: 16px;
          }
          .flip-card-front {
            background-color: transparent;
          }
          .flip-card-back {
            transform: rotateY(180deg);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1.5rem;
          }
          .fill-transition {
            transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          }
        `,
          }}
        />

        {/* Top bar with Breadcrumb and Back */}
        <div className="flex items-center justify-between gap-2">
          <nav className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 dark:text-slate-500">
            <Link
              href="/dashboard"
              className="hover:text-slate-800 dark:hover:text-white transition-colors"
            >
              DSA Yatra
            </Link>
            <span className="text-slate-300 dark:text-slate-600">›</span>
            <button
              type="button"
              onClick={handleBack}
              className="hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
            >
              Weekly Revisions
            </button>
            <span className="text-slate-300 dark:text-slate-600">›</span>
            <span className="font-bold text-[#FF4D4D]">
              Week {selectedWeek + 1}
            </span>
          </nav>

          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200/90 dark:border-[#26262E] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-[#1A1A20] transition-colors cursor-pointer"
          >
            <span>← All Weeks</span>
          </button>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Week {selectedWeek + 1} Revision
            </h1>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Commit these problems to your long-term memory.
            </p>
          </div>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-12 gap-3 animate-fadeUp">
          {/* Left: Interactive Flip Graph */}
          <div className="md:col-span-8 flip-card min-h-[260px] md:h-[280px]">
            <div className="flip-card-inner h-full">
              <div className="flip-card-front rounded-xl sm:rounded-2xl p-5 relative overflow-hidden flex flex-col items-start justify-start border border-slate-200/90 dark:border-[#24242A] bg-white dark:bg-[#131316] hover:border-[#FF4D4D]/40 transition-all duration-300">
                <div className="w-full flex justify-between items-start z-10 mb-2">
                  <div className="text-left">
                    <h3 className="text-xs font-black text-[#FF4D4D] uppercase tracking-wider">
                      Memory Retention
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">
                      Ebbinghaus Curve Visualization
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 bg-[#FF4D4D]/10 border border-[#FF4D4D]/20 px-2.5 py-1 rounded-full text-[9px] font-black text-[#FF4D4D] uppercase tracking-wider">
                    <Info className="w-3 h-3" />
                    <span>The Forgetting Curve</span>
                  </div>
                </div>

                <div className="w-full h-full relative -mt-4">
                  <svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 500 240"
                    preserveAspectRatio="none"
                    className="opacity-90"
                  >
                    {[0, 1, 2, 3].map((i) => (
                      <g key={i}>
                        <line
                          x1={i * 125 + 62.5}
                          y1="0"
                          x2={i * 125 + 62.5}
                          y2="220"
                          stroke="currentColor"
                          strokeWidth="1"
                          strokeDasharray="4 4"
                          className="text-slate-200 dark:text-slate-800"
                        />
                        <text
                          x={i * 125 + 62.5}
                          y="235"
                          fill="currentColor"
                          fontSize="9"
                          fontWeight="bold"
                          textAnchor="middle"
                          className="text-slate-400 dark:text-slate-600 uppercase tracking-tighter"
                        >
                          DAY {i}
                        </text>
                      </g>
                    ))}
                    <path
                      d="M 0 50 Q 80 180, 187.5 200 T 312.5 220 T 500 225"
                      fill="none"
                      stroke="rgba(255,77,77,0.15)"
                      strokeWidth="2"
                      strokeDasharray="6 6"
                    />
                    <g
                      style={{
                        filter: `drop-shadow(0 0 ${progress * 0.15}px rgba(255,77,77,0.6))`,
                        transition: "filter 1s ease",
                      }}
                    >
                      <path
                        d="M 0 50 Q 40 120, 62.5 140 L 62.5 50 Q 120 95, 187.5 110 L 187.5 50 Q 250 80, 312.5 90 L 312.5 50 Q 400 65, 500 70"
                        fill="none"
                        stroke="url(#revision-gradient)"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                      />
                    </g>
                    <defs>
                      <linearGradient
                        id="revision-gradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                      >
                        <stop offset="0%" stopColor="#FF4D4D" />
                        <stop offset="100%" stopColor="#ff7b7b" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>

                <p className="absolute bottom-3 left-5 text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                  Hover to understand why you forget
                </p>
              </div>

              <div className="flip-card-back text-left bg-white dark:bg-[#131316] rounded-xl sm:rounded-2xl border border-slate-200/90 dark:border-[#24242A] hover:border-[#FF4D4D]/40 transition-all duration-300">
                <div>
                  <h3 className="text-lg font-black text-[#FF4D4D] mb-3 flex items-center gap-2.5 tracking-tight">
                    <div className="p-1.5 bg-[#FF4D4D]/10 rounded-lg">
                      <Info className="w-4 h-4" />
                    </div>
                    Brain Hack: Spaced Repetition
                  </h3>
                  <div className="space-y-3 text-slate-600 dark:text-slate-400 text-xs leading-relaxed font-medium">
                    <p>
                      The human brain is optimized to forget information it
                      doesn't use. The{" "}
                      <span className="text-slate-900 dark:text-white font-bold">
                        Ebbinghaus Forgetting Curve
                      </span>{" "}
                      shows we forget 50-80% of new knowledge within days.
                    </p>
                    <p>
                      By reviewing these{" "}
                      <span className="text-[#FF4D4D] font-bold">
                        {currentQuestions.length} problems
                      </span>{" "}
                      now, you're "flattening the curve." Each revision session
                      signals to your brain that this data is critical, moving
                      it from short-term to{" "}
                      <span className="text-slate-900 dark:text-white font-bold underline decoration-[#FF4D4D] underline-offset-4">
                        long-term memory
                      </span>
                      .
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Compact Stats */}
          <div className="md:col-span-4 flex flex-col gap-3 h-full">
            <div className="bg-white dark:bg-[#131316] rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-[#24242A] flex items-center justify-between hover:border-[#FF4D4D]/40 transition-all duration-300">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">
                  Completed
                </span>
                <span className="text-2xl font-black text-emerald-500">
                  {completedWeekIds.length}
                </span>
              </div>
              <div className="p-2.5 bg-emerald-500/10 rounded-xl">
                <Check className="w-5 h-5 text-emerald-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-[#131316] rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-[#24242A] flex items-center justify-between hover:border-[#FF4D4D]/40 transition-all duration-300">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">
                  Pending
                </span>
                <span className="text-2xl font-black text-slate-800 dark:text-slate-200">
                  {remaining}
                </span>
              </div>
              <div className="p-2.5 bg-slate-100 dark:bg-[#1C1C22] rounded-xl text-slate-400 dark:text-slate-500">
                <Target className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white dark:bg-[#131316] rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-[#24242A] flex flex-col justify-center hover:border-[#FF4D4D]/40 transition-all duration-300 flex-1">
              <div className="flex justify-between items-end mb-2">
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Retention Progress
                </span>
                <span className="text-base font-black text-[#FF4D4D]">
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-[#202026] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#FF4D4D] fill-transition rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="animate-fadeUp space-y-2.5">
          <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
            <div className="p-1 bg-[#FF4D4D]/10 rounded-md">
              <Target className="w-4 h-4 text-[#FF4D4D]" />
            </div>
            Assigned Problems
          </h2>

          <div className="grid grid-cols-1 gap-2">
            {currentQuestions.map((q) => {
              const qIdStr = String(q.id || q.name);
              const isChecked = completedWeekIds.includes(qIdStr);

              return (
                <div
                  key={qIdStr}
                  className={cn(
                    "group flex items-center gap-3.5 p-3 sm:p-3.5 rounded-xl border transition-all duration-300 cursor-pointer",
                    isChecked
                      ? "bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40"
                      : "bg-white dark:bg-[#131316] border-slate-200/90 dark:border-[#24242A] hover:border-[#FF4D4D]/40 hover:dark:bg-[#18181D]",
                  )}
                  onClick={() => toggleRevisionQuestion(qIdStr)}
                >
                  <div className="flex-shrink-0">
                    <div
                      className={cn(
                        "w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-300",
                        isChecked
                          ? "bg-emerald-500 border-emerald-500 text-white"
                          : "border-slate-300 dark:border-[#33333E] group-hover:border-[#FF4D4D]",
                      )}
                    >
                      {isChecked && (
                        <Check size={12} className="stroke-[3.5px]" />
                      )}
                    </div>
                  </div>

                  <div className="flex-grow min-w-0">
                    <h3
                      className={cn(
                        "text-xs sm:text-sm font-bold truncate transition-all duration-300",
                        isChecked
                          ? "line-through text-slate-400 dark:text-slate-500"
                          : "text-slate-800 dark:text-slate-100",
                      )}
                    >
                      {q.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-1 mt-0.5">
                      {q.topics?.slice(0, 2).map((topic, i) => (
                        <span
                          key={i}
                          className="bg-slate-100 dark:bg-[#1C1C22] border border-slate-200 dark:border-[#282830] px-1.5 py-0.5 text-[9px] font-bold text-slate-500 dark:text-slate-400 rounded uppercase tracking-wider"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!q.isRealWorldProblem && q.resources?.leetcodeURL && (
                      <a
                        href={q.resources.leetcodeURL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 bg-slate-100 dark:bg-[#1C1C22] hover:bg-amber-500/10 rounded-lg transition-all border border-slate-200 dark:border-[#282830] hover:border-amber-500/30 group/icon"
                        onClick={(e) => e.stopPropagation()}
                        title="LeetCode Problem"
                      >
                        <LeetCodeIcon className="w-3.5 h-3.5 opacity-70 group-hover/icon:opacity-100 transition-all" />
                      </a>
                    )}
                    {!q.isRealWorldProblem && q.resources?.youtubeURL && (
                      <a
                        href={q.resources.youtubeURL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 bg-slate-100 dark:bg-[#1C1C22] hover:bg-red-500/10 rounded-lg transition-all border border-slate-200 dark:border-[#282830] hover:border-red-500/30 group/icon"
                        onClick={(e) => e.stopPropagation()}
                        title="YouTube Solution"
                      >
                        <YouTubeIcon className="w-3.5 h-3.5 opacity-70 group-hover/icon:opacity-100 transition-all" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}

            {currentQuestions.length === 0 && (
              <div className="text-center p-10 bg-white dark:bg-[#131316] rounded-xl border border-dashed border-slate-200 dark:border-[#24242A]">
                <p className="text-slate-500 dark:text-slate-400 font-semibold text-xs uppercase tracking-wider">
                  No revision questions mapped for this week yet.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </Fragment>
  );
}

export const getServerSideProps = async () =>
  getPreFetchProps({ slug: "/revisions", appId: "dsayatra" });
