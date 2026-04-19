import {
  Button,
  FlexContainer,
  LeetCodeIcon,
  LoadingSpinner,
  SEO,
  Text,
  YouTubeIcon,
} from "@tbe/components";
import { useDsaCompletedQuestions, useDsaQuestions, useUser } from "@tbe/hooks";
import type { DsaQuestion, PageProps } from "@tbe/interface";
import { cn, getPreFetchProps } from "@tbe/utils";
import { Check, ChevronRight, Info, Lock, Target } from "lucide-react";
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
      <div className="flex bg-[#0f0f0f] font-sans h-[calc(100vh-72px)]">
        <main className="flex-1 flex items-center justify-center">
          <LoadingSpinner height={4} width={4} borderColour="white" />
          <Text level="p" className="text-gray-400 ml-3">
            Loading Revisions...
          </Text>
        </main>
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
        <FlexContainer
          direction="col"
          className="flex-1 min-h-screen w-full bg-[#0f0f0f] mt-0 font-sans px-4 sm:px-8 py-8 pb-24 lg:pb-8"
          itemCenter={false}
          justifyCenter={false}
          wrap={false}
        >
          <div className="max-w-[1400px] w-full mx-auto">
            <Button
              onClick={() => router.push("/dashboard")}
              variant="OUTLINE"
              size="SMALL"
              text="← Back to Dashboard"
              className="mb-8 border-[#2a2a2a] text-white hover:border-[#ff5757] hover:bg-[#ff5757]/10 bg-transparent flex items-center justify-center transition-all duration-300 w-max h-auto py-2.5 px-5 font-bold text-xs rounded-xl"
            />
            <header className="mb-12 text-center sm:text-left">
              <h1 className="text-3xl sm:text-4xl font-black text-white mb-3 tracking-tight">
                Weekly Revisions
              </h1>
              <p className="text-sm text-gray-500 font-medium max-w-2xl">
                Unlock a new revision week for every 10 questions you complete
                in the sheet! Master the forgetting curve.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <p className="text-[11px] bg-[#ff5757]/10 text-[#ff5757] border border-[#ff5757]/20 px-3 py-1 rounded-full font-black uppercase tracking-widest">
                  Total Completed: {globalCompleted.length} Qs
                </p>
                <p className="text-[11px] bg-[#2a2a2a] text-gray-400 px-3 py-1 rounded-full font-black uppercase tracking-widest">
                  Progress:{" "}
                  {Math.min(
                    100,
                    Math.round(
                      (globalCompleted.length / (totalWeeks * 10)) * 100,
                    ),
                  )}
                  % Unlocked
                </p>
              </div>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
              {Array.from({ length: totalWeeks }).map((_, i) => {
                const isUnlocked = i < numUnlockedWeeks;
                const weekQuestions = (weeklyAssignments[i] || []).filter(
                  (id) =>
                    dsaQuestions.some(
                      (q) => String(q.id || q.name) === String(id),
                    ),
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
                      "w-full border-2 rounded-2xl p-6 flex items-center justify-between transition-all duration-500 relative overflow-hidden group",
                      isUnlocked
                        ? "cursor-pointer border-[#2a2a2a] bg-[#1a1a1a]/40 hover:border-[#ff5757]/50 hover:bg-[#1a1a1a] hover:shadow-[0_10px_30px_rgba(255,87,87,0.1)] hover:-translate-y-1.5"
                        : "cursor-not-allowed border-[#1a1a1a] bg-[#0f0f0f] opacity-40",
                      isCompleted &&
                        "border-[#51cf66]/30 bg-[#51cf66]/5 hover:border-[#51cf66]/50 hover:bg-[#51cf66]/10 hover:shadow-[0_10px_30px_rgba(81,207,102,0.1)]",
                    )}
                  >
                    <div className="flex flex-col gap-1.5 z-10">
                      <div className="flex items-center gap-2.5">
                        <h3
                          className={cn(
                            "text-xl font-black tracking-tight",
                            isUnlocked ? "text-white" : "text-gray-600",
                            isCompleted && "text-[#51cf66]",
                          )}
                        >
                          Week {i + 1}
                        </h3>
                        {!isUnlocked && (
                          <Lock className="w-4 h-4 text-gray-700" />
                        )}
                        {isCompleted && (
                          <div className="p-0.5 bg-[#51cf66] rounded-full">
                            <Check className="w-3 h-3 text-black stroke-[4px]" />
                          </div>
                        )}
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                        {isUnlocked
                          ? weekQuestions.length > 0
                            ? `${weekDone.length} / ${weekQuestions.length} COMPLETED`
                            : "READY TO START"
                          : `UNLOCKS AT ${(i + 1) * 10} Qs`}
                      </p>
                    </div>
                    {isUnlocked ? (
                      <ChevronRight className="w-6 h-6 text-gray-700 group-hover:text-[#ff5757] transition-colors" />
                    ) : null}

                    {/* Progress bar background on the card */}
                    {isUnlocked && (
                      <div className="absolute bottom-0 left-0 h-1 bg-gray-800/50 w-full">
                        <div
                          className={cn(
                            "h-full transition-all duration-1000",
                            isCompleted ? "bg-[#51cf66]" : "bg-[#ff5757]",
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
        </FlexContainer>
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
      <div className="min-h-screen bg-[#0f0f0f] text-white font-sans p-4 sm:p-8 pb-32 w-full">
        <style
          dangerouslySetInnerHTML={{
            __html: `
          @keyframes fadeUp {
            from { transform: translateY(10px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          @keyframes lightSweep {
            0% { left: -100%; top: -100%; }
            100% { left: 200%; top: 200%; }
          }
          
          .animate-fadeUp { animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

          .hover-sweep {
            position: relative;
            overflow: hidden;
          }
          .hover-sweep::before {
            content: '';
            position: absolute;
            background: linear-gradient(rgba(255,255,255,0), rgba(255,255,255,0.05), rgba(255,255,255,0));
            width: 50%;
            height: 300%;
            transform: rotate(45deg);
            left: -100%;
            top: -100%;
            transition: all 0.5s ease;
            pointer-events: none;
          }
          .hover-sweep:hover::before {
            animation: lightSweep 0.5s forwards;
          }

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
            border-radius: 12px;
          }
          .flip-card-front {
            background-color: transparent;
          }
          .flip-card-back {
            background-color: #111;
            transform: rotateY(180deg);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
            border: 1px solid #2a2a2a;
          }
          .glass-panel {
            background-color: rgba(255, 87, 87, 0.05);
            border: 1px solid rgba(255, 87, 87, 0.2);
          }
          .fill-transition {
            transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          }
        `,
          }}
        />

        <div className="max-w-[1000px] w-full mx-auto">
          <Button
            onClick={handleBack}
            variant="OUTLINE"
            size="SMALL"
            text="← Back to Weeks"
            className="mb-10 border-[#2a2a2a] text-white hover:border-[#ff5757] hover:bg-[#ff5757]/10 bg-transparent flex items-center justify-center transition-all duration-300 w-max h-auto py-2.5 px-5 font-bold text-xs rounded-xl"
          />

          <header className="mb-10 text-center sm:text-left">
            <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-[#FF5757] to-[#ff8888] bg-clip-text text-transparent inline-block mb-2 tracking-tight">
              Week {selectedWeek + 1} Revision
            </h1>
            <p className="text-gray-500 text-sm font-medium">
              Commit these problems to your long-term memory.
            </p>
          </header>

          <section className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-12 animate-fadeUp">
            {/* Left: Interactive Flip Graph */}
            <div className="md:col-span-8 flip-card min-h-[300px] md:h-[320px]">
              <div className="flip-card-inner h-full">
                <div className="flip-card-front glass-panel rounded-2xl p-6 relative overflow-hidden flex flex-col items-start justify-start border-2 border-[#2a2a2a] hover:border-[#ff5757]/50 hover:shadow-[0_10px_40px_rgba(255,87,87,0.15)] transition-all duration-500">
                  <div className="w-full flex justify-between items-start z-10 mb-2">
                    <div className="text-left">
                      <h3 className="text-xs font-black text-[#ff5757] uppercase tracking-widest">
                        Memory Retention
                      </h3>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">
                        Ebbinghaus Curve Visualization
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 bg-[#ff5757]/10 border border-[#ff5757]/20 px-3 py-1.5 rounded-full text-[9px] font-black text-[#ff5757] uppercase tracking-widest">
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
                      className="opacity-80"
                    >
                      {[0, 1, 2, 3].map((i) => (
                        <g key={i}>
                          <line
                            x1={i * 125 + 62.5}
                            y1="0"
                            x2={i * 125 + 62.5}
                            y2="220"
                            stroke="rgba(255,255,255,0.03)"
                            strokeWidth="1"
                            strokeDasharray="4 4"
                          />
                          <text
                            x={i * 125 + 62.5}
                            y="235"
                            fill="#444"
                            fontSize="9"
                            fontWeight="bold"
                            textAnchor="middle"
                            className="uppercase tracking-tighter"
                          >
                            DAY {i}
                          </text>
                        </g>
                      ))}
                      <path
                        d="M 0 50 Q 80 180, 187.5 200 T 312.5 220 T 500 225"
                        fill="none"
                        stroke="rgba(255,87,87,0.1)"
                        strokeWidth="2"
                        strokeDasharray="6 6"
                      />
                      <g
                        style={{
                          filter: `drop-shadow(0 0 ${progress * 0.15}px rgba(255,87,87,0.6))`,
                          transition: "filter 1s ease",
                        }}
                      >
                        <path
                          d="M 0 50 Q 40 120, 62.5 140 L 62.5 50 Q 120 95, 187.5 110 L 187.5 50 Q 250 80, 312.5 90 L 312.5 50 Q 400 65, 500 70"
                          fill="none"
                          stroke="url(#revision-gradient)"
                          strokeWidth="4"
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
                          <stop offset="0%" stopColor="#FF5757" />
                          <stop offset="100%" stopColor="#ff8888" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>

                  <p className="absolute bottom-4 left-6 text-[9px] text-gray-600 font-bold uppercase tracking-[0.2em] animate-pulse">
                    Hover to understand why you forget
                  </p>
                </div>

                <div className="flip-card-back text-left bg-[#1a1a1a] rounded-2xl border-2 border-[#2a2a2a] hover:border-[#ff5757]/50 hover:shadow-[0_10px_40px_rgba(255,87,87,0.15)] transition-all duration-500">
                  <div>
                    <h3 className="text-2xl font-black text-[#ff5757] mb-5 flex items-center gap-3 tracking-tight">
                      <div className="p-2 bg-[#ff5757]/10 rounded-lg">
                        <Info className="w-5 h-5" />
                      </div>
                      Brain Hack: Spaced Repetition
                    </h3>
                    <div className="space-y-4 text-gray-400 text-sm leading-relaxed font-medium">
                      <p>
                        The human brain is optimized to forget information it
                        doesn't use. The{" "}
                        <span className="text-white font-bold">
                          Ebbinghaus Forgetting Curve
                        </span>{" "}
                        shows we forget 50-80% of new knowledge within days.
                      </p>
                      <p>
                        By reviewing these{" "}
                        <span className="text-[#ff5757] font-bold">
                          {currentQuestions.length} problems
                        </span>{" "}
                        now, you're "flattening the curve." Each revision
                        session signals to your brain that this data is
                        critical, moving it from short-term to{" "}
                        <span className="text-white font-bold underline decoration-[#ff5757] underline-offset-4">
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
            <div className="md:col-span-4 flex flex-col gap-4 h-full">
              <div className="bg-[#1a1a1a] rounded-2xl p-6 border-2 border-[#2a2a2a] flex items-center justify-between hover:border-[#ff5757]/40 transition-all duration-300">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">
                    Completed
                  </span>
                  <span className="text-3xl font-black text-[#FF5757]">
                    {completedWeekIds.length}
                  </span>
                </div>
                <div className="p-3 bg-[#51cf66]/10 rounded-xl">
                  <Check className="w-6 h-6 text-[#51cf66]" />
                </div>
              </div>

              <div className="bg-[#1a1a1a] rounded-2xl p-6 border-2 border-[#2a2a2a] flex items-center justify-between hover:border-[#ff5757]/40 transition-all duration-300">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">
                    Pending
                  </span>
                  <span className="text-3xl font-black text-gray-200">
                    {remaining}
                  </span>
                </div>
                <div className="p-3 bg-gray-800/50 rounded-xl text-gray-500">
                  <Target className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-[#1a1a1a] rounded-2xl p-6 border-2 border-[#2a2a2a] flex flex-col justify-center hover:border-[#ff5757]/40 transition-all duration-300 flex-1">
                <div className="flex justify-between items-end mb-3">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                    Retention Progress
                  </span>
                  <span className="text-xl font-black text-[#ff5757]">
                    {Math.round(progress)}%
                  </span>
                </div>
                <div className="w-full h-2.5 bg-[#2a2a2a] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#ff5757] to-[#ff8888] fill-transition rounded-full shadow-[0_0_15px_rgba(255,87,87,0.3)]"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          </section>

          <section
            className="animate-fadeUp"
            style={{ animationDelay: "0.2s" }}
          >
            <h2 className="text-xl font-black text-white mb-6 flex items-center gap-3 tracking-tight">
              <div className="p-2 bg-[#ff5757]/10 rounded-lg">
                <Target className="w-5 h-5 text-[#ff5757]" />
              </div>
              Assigned Problems
            </h2>

            <div className="grid grid-cols-1 gap-3">
              {currentQuestions.map((q) => {
                const qIdStr = String(q.id || q.name);
                const isChecked = completedWeekIds.includes(qIdStr);

                return (
                  <div
                    key={qIdStr}
                    className={cn(
                      "hover-sweep group flex items-center gap-5 p-4 sm:p-5 rounded-2xl border-2 transition-all duration-500 cursor-pointer hover:-translate-y-1 shadow-lg",
                      isChecked
                        ? "bg-[#51cf66]/5 border-[#51cf66]/20 hover:border-[#51cf66]/40 hover:shadow-[0_10px_30px_rgba(81,207,102,0.1)]"
                        : "bg-[#1a1a1a] border-[#222] hover:border-[#ff5757]/50 hover:bg-[#1f1f1f] hover:shadow-[0_10px_30px_rgba(255,87,87,0.1)]",
                    )}
                    onClick={() => toggleRevisionQuestion(qIdStr)}
                  >
                    <div className="flex-shrink-0">
                      <div
                        className={cn(
                          "w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all duration-500",
                          isChecked
                            ? "bg-[#51cf66] border-[#51cf66] scale-110 shadow-[0_0_15px_rgba(81,207,102,0.4)]"
                            : "border-[#333] group-hover:border-[#ff5757]/60",
                        )}
                      >
                        {isChecked && (
                          <Check
                            size={14}
                            className="text-black stroke-[4px]"
                          />
                        )}
                      </div>
                    </div>

                    <div className="flex-grow min-w-0">
                      <h3
                        className={cn(
                          "text-base font-black mb-1.5 truncate transition-all duration-500 tracking-tight",
                          isChecked
                            ? "line-through text-gray-600"
                            : "text-gray-200",
                        )}
                      >
                        {q.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2">
                        {q.topics?.slice(0, 2).map((topic, i) => (
                          <div
                            key={i}
                            className="bg-[#252525] border border-[#333] px-2.5 py-1 text-[9px] font-black text-gray-500 rounded-lg uppercase tracking-widest"
                          >
                            {topic}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 flex-shrink-0">
                      {q.resources?.leetcodeURL && (
                        <a
                          href={q.resources.leetcodeURL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2.5 bg-gray-800/50 hover:bg-[#ffb946]/20 rounded-xl transition-all border border-transparent hover:border-[#ffb946]/30 group/icon"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <LeetCodeIcon className="w-5 h-5 opacity-60 group-hover/icon:opacity-100 grayscale group-hover/icon:grayscale-0 transition-all" />
                        </a>
                      )}
                      {q.resources?.youtubeURL && (
                        <a
                          href={q.resources.youtubeURL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2.5 bg-gray-800/50 hover:bg-[#ff0000]/20 rounded-xl transition-all border border-transparent hover:border-[#ff0000]/30 group/icon"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <YouTubeIcon className="w-5 h-5 opacity-60 group-hover/icon:opacity-100 grayscale group-hover/icon:grayscale-0 transition-all" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}

              {currentQuestions.length === 0 && (
                <div className="text-center p-16 bg-[#111] rounded-3xl border-2 border-dashed border-[#222]">
                  <p className="text-gray-600 font-bold uppercase tracking-widest text-xs">
                    Initialization error: No questions mapped yet.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </Fragment>
  );
}

export const getServerSideProps = async () =>
  getPreFetchProps({ slug: "/revisions", appId: "dsayatra" });
