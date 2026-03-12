import {
  Button,
  FlexContainer,
  LeetCodeIcon,
  LoadingSpinner,
  SEO,
  Text,
  YouTubeIcon,
} from "@tbe/components";
import { routes } from "@tbe/constants";
import { useApi, useUser } from "@tbe/hooks";
import type { DsaQuestion, PageProps } from "@tbe/interface";
import { cn, getPreFetchProps } from "@tbe/utils";
import { Check, ChevronRight, Info, Lock, Target } from "lucide-react";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { Fragment, useEffect, useMemo, useState } from "react";

import { transformDsaQuestion } from "../utils/dsaHelpers";

export default function RevisionsUI({ seoMeta }: PageProps) {
  const router = useRouter();
  const { loading: userLoading, isAuth } = useUser();
  const [globalCompleted, setGlobalCompleted] = useState<string[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [weeklyAssignments, setWeeklyAssignments] = useState<
    Record<number, string[]>
  >({});
  const [weekProgress, setWeekProgress] = useState<Record<number, string[]>>(
    {},
  );

  const { response, loading: sheetsLoading } = useApi("dsa-sheet", {
    url: `${routes.api.base}${routes.api.dsaSheet}?limit=1000`,
  });

  const dsaQuestions = useMemo(() => {
    const data = response?.data?.questions;
    if (!Array.isArray(data)) return [];
    return data.map(transformDsaQuestion);
  }, [response]);

  useEffect(() => {
    if (!userLoading && !isAuth) {
      router.push("/login");
    }
  }, [userLoading, isAuth, router]);

  useEffect(() => {
    const savedGlobal = localStorage.getItem("dsayatra_completed_questions");
    if (savedGlobal) {
      try {
        setGlobalCompleted(JSON.parse(savedGlobal));
      } catch {}
    }

    const savedAssignments = localStorage.getItem("dsayatra_weekly_revisions");
    if (savedAssignments) {
      try {
        setWeeklyAssignments(JSON.parse(savedAssignments));
      } catch {}
    }

    const savedProgress = localStorage.getItem("dsayatra_revision_completed");
    if (savedProgress) {
      try {
        setWeekProgress(JSON.parse(savedProgress));
      } catch {}
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
      <div className="flex bg-[#0A0A0A] font-sans h-[calc(100vh-72px)]">
        <main className="flex-1 flex items-center justify-center">
          <LoadingSpinner height={8} width={8} />
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
          className="flex-1 min-h-screen w-full bg-[#0A0A0A] mt-0 font-sans px-4 sm:px-8 py-8"
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
              className="mb-6 border-[#2a2a2a] text-white hover:border-[#ff5757] hover:bg-[#ff5757]/10 bg-transparent flex items-center justify-center transition-all duration-300 w-max"
            />
            <header className="mb-10 text-center sm:text-left">
              <h1 className="text-3xl font-bold text-white mb-2">
                Weekly Revisions
              </h1>
              <p className="text-sm text-gray-400">
                Unlock a new revision week for every 10 questions you complete
                in the sheet!
              </p>
              <p className="text-sm text-[#ff5757] font-semibold mt-1">
                Total Completed: {globalCompleted.length} / {totalWeeks * 10}{" "}
                for fully unlocked.
              </p>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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
                      "w-full border rounded-xl p-5 flex items-center justify-between transition-all duration-300",
                      isUnlocked
                        ? "cursor-pointer border-[#2a2a2a] bg-[#111] hover:border-[#ff5757] hover:bg-[#1a1a1a] hover:shadow-[0_0_15px_rgba(255,87,87,0.3)] hover:-translate-y-1"
                        : "cursor-not-allowed border-[#1a1a1a] bg-[#0A0A0A] opacity-60",
                      isCompleted &&
                        "border-green-500/30 bg-green-500/5 hover:border-green-500/50 hover:bg-green-500/10 hover:shadow-[0_0_15px_rgba(74,222,128,0.2)]",
                    )}
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <h3
                          className={cn(
                            "text-lg font-bold",
                            isUnlocked ? "text-white" : "text-gray-500",
                            isCompleted && "text-green-500",
                          )}
                        >
                          Week {i + 1}
                        </h3>
                        {!isUnlocked && (
                          <Lock className="w-4 h-4 text-gray-500" />
                        )}
                        {isCompleted && (
                          <Check className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        {isUnlocked
                          ? weekQuestions.length > 0
                            ? `${weekDone.length}/${weekQuestions.length} Completed`
                            : "Ready to start"
                          : `Unlocks at ${(i + 1) * 10} overall questions`}
                      </p>
                    </div>
                    {isUnlocked ? (
                      <ChevronRight className="w-5 h-5 text-gray-500" />
                    ) : null}
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
      <div className="min-h-screen bg-[#0A0A0A] text-white font-sans p-4 sm:p-8 pb-32 w-full">
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
            transition: transform 0.6s;
            transform-style: preserve-3d;
          }
          .flip-card:hover .flip-card-inner {
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
            className="mb-8 border-[#2a2a2a] text-white hover:border-[#ff5757] hover:bg-[#ff5757]/10 bg-transparent flex items-center justify-center transition-all duration-300 w-max"
          />

          <header className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#FF5757] to-[#ff8888] bg-clip-text text-transparent inline-block mb-1">
              Week {selectedWeek + 1} Revision
            </h1>
          </header>

          <section className="grid grid-cols-1 md:grid-cols-12 gap-5 mb-10 animate-fadeUp">
            {/* Left: Interactive Flip Graph */}
            <div className="md:col-span-8 flip-card h-[280px]">
              <div className="flip-card-inner">
                <div className="flip-card-front glass-panel rounded-xl p-5 relative overflow-hidden flex flex-col items-start justify-start border border-[#2a2a2a] hover:border-[#ff5757] hover:shadow-[0_0_15px_rgba(255,87,87,0.3)] transition-all duration-300">
                  <div className="w-full flex justify-between items-start z-10">
                    <div className="text-left">
                      <h3 className="text-sm font-semibold text-[#ff5757]">
                        Memory Retention
                      </h3>
                      <p className="text-[10px] text-gray-400">
                        Ebbinghaus Curve Visualization
                      </p>
                    </div>
                    <div className="flex items-center gap-1 bg-[#ff5757]/10 border border-[#ff5757]/30 px-2 py-1 rounded-full text-[10px] text-[#ff5757]">
                      <Info className="w-3 h-3" />
                      <span>Learn more about the graph</span>
                    </div>
                  </div>

                  <div className="w-full h-full relative -mt-4">
                    <svg
                      width="100%"
                      height="100%"
                      viewBox="0 0 500 240"
                      preserveAspectRatio="none"
                    >
                      {[0, 1, 2, 3].map((i) => (
                        <g key={i}>
                          <line
                            x1={i * 125 + 62.5}
                            y1="0"
                            x2={i * 125 + 62.5}
                            y2="220"
                            stroke="rgba(255,255,255,0.05)"
                            strokeWidth="1"
                            strokeDasharray="4 4"
                          />
                          <text
                            x={i * 125 + 62.5}
                            y="235"
                            fill="#8a8f9d"
                            fontSize="10"
                            textAnchor="middle"
                          >
                            {i}d
                          </text>
                        </g>
                      ))}
                      <path
                        d="M 0 50 Q 80 180, 187.5 200 T 312.5 220 T 500 225"
                        fill="none"
                        stroke="rgba(255,87,87,0.15)"
                        strokeWidth="2"
                        strokeDasharray="6 6"
                      />
                      <g
                        style={{
                          filter: `drop-shadow(0 0 ${progress * 0.1}px rgba(255,87,87,0.8))`,
                          transition: "filter 0.6s ease",
                        }}
                      >
                        <path
                          d="M 0 50 Q 40 120, 62.5 140 L 62.5 50 Q 120 95, 187.5 110 L 187.5 50 Q 250 80, 312.5 90 L 312.5 50 Q 400 65, 500 70"
                          fill="none"
                          stroke="url(#revision-gradient)"
                          strokeWidth="3"
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
                </div>

                <div className="flip-card-back text-left hover:border-[#ff5757] hover:shadow-[0_0_15px_rgba(255,87,87,0.3)] transition-all duration-300">
                  <div>
                    <h3 className="text-xl font-bold text-[#ff5757] mb-3 flex items-center gap-2">
                      <Info className="w-5 h-5" /> The Forgetting Curve
                    </h3>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      After every three days, we begin to forget what we have
                      newly learned. To remember and deeply retain concepts,
                      spaced revision is required. This is why the forgetting
                      curve drops sharply. By reviewing these questions now,
                      you're flattening the curve and committing them to
                      long-term memory!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Compact Stats */}
            <div className="md:col-span-4 flex flex-col gap-3">
              <div className="bg-[#111] rounded-xl p-4 border border-[#2a2a2a] flex items-center justify-between hover:border-[#ff5757] hover:shadow-[0_0_15px_rgba(255,87,87,0.3)] hover:-translate-y-1 transition-all duration-300">
                <span className="text-xs text-gray-400 uppercase tracking-widest">
                  Completed
                </span>
                <span className="text-2xl font-bold text-[#FF5757]">
                  {completedWeekIds.length}
                </span>
              </div>
              <div className="bg-[#111] rounded-xl p-4 border border-[#2a2a2a] flex items-center justify-between hover:border-[#ff5757] hover:shadow-[0_0_15px_rgba(255,87,87,0.3)] hover:-translate-y-1 transition-all duration-300">
                <span className="text-xs text-gray-400 uppercase tracking-widest">
                  Remaining
                </span>
                <span className="text-2xl font-bold text-gray-300">
                  {remaining}
                </span>
              </div>
              <div className="bg-[#111] rounded-xl p-4 border border-[#2a2a2a] flex flex-col justify-center hover:border-[#ff5757] hover:shadow-[0_0_15px_rgba(255,87,87,0.3)] hover:-translate-y-1 transition-all duration-300">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-gray-400 uppercase tracking-widest">
                    Progress
                  </span>
                  <span className="text-lg font-bold text-[#ff5757]">
                    {Math.round(progress)}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[#2a2a2a] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#ff5757] to-[#ff8888] fill-transition"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          </section>

          <section
            className="animate-fadeUp"
            style={{ animationDelay: "0.1s" }}
          >
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-[#ff5757]" /> Revision Questions
            </h2>

            <div className="space-y-2">
              {currentQuestions.map((q) => {
                const qIdStr = String(q.id || q.name);
                const isChecked = completedWeekIds.includes(qIdStr);

                return (
                  <div
                    key={qIdStr}
                    className={`hover-sweep flex gap-3 p-3 rounded-xl border transition-all duration-300 cursor-pointer hover:-translate-y-0.5
                                            ${
                                              isChecked
                                                ? "bg-green-500/5 border-green-500/30 hover:shadow-[0_0_15px_rgba(74,222,128,0.2)]"
                                                : "bg-[#111] border-[#2a2a2a] hover:border-[#ff5757] hover:shadow-[0_0_15px_rgba(255,87,87,0.3)]"
                                            }`}
                    onClick={() => toggleRevisionQuestion(qIdStr)}
                  >
                    <div className="flex-shrink-0 pt-0">
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center transition-all duration-300
                                                ${
                                                  isChecked
                                                    ? "bg-green-500 border-green-500"
                                                    : "border-[#444]"
                                                }`}
                      >
                        {isChecked && (
                          <Check size={10} className="text-black font-bold" />
                        )}
                      </div>
                    </div>

                    <div className="flex-grow min-w-0">
                      <h3
                        className={`text-sm font-bold mb-1 truncate transition-all duration-300 ${isChecked ? "line-through text-gray-500" : "text-gray-200"}`}
                      >
                        {q.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2">
                        {q.topics?.slice(0, 3).map((topic, i) => (
                          <div
                            key={i}
                            className="bg-[#1a1a1a] border border-[#333] px-2 py-0.5 text-[10px] text-gray-400 rounded"
                          >
                            {topic}
                          </div>
                        ))}
                        <div className="flex items-center gap-2 flex-grow justify-end pr-2">
                          {q.resources?.leetcodeURL && (
                            <a
                              href={q.resources.leetcodeURL}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="grayscale hover:grayscale-0 transition-all duration-300 opacity-50 hover:opacity-100"
                              title="Solve on LeetCode"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <LeetCodeIcon className="w-4 h-4" />
                            </a>
                          )}
                          {q.resources?.youtubeURL && (
                            <a
                              href={q.resources.youtubeURL}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="grayscale hover:grayscale-0 transition-all duration-300 opacity-50 hover:opacity-100"
                              title="Watch explanation on YouTube"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <YouTubeIcon className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {currentQuestions.length === 0 && (
                <div className="text-center p-8 bg-[#111] rounded-xl border border-[#2a2a2a]">
                  <p className="text-gray-400 text-sm">
                    No questions found! Make sure you have completed questions.
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
