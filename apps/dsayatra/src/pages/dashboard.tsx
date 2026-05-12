"use client";

import { ProtectedRoute, useAuth } from "@tbe/auth";
import { EditDsaOnboardingModal, SEO, StatCard } from "@tbe/components";
import { PAGE_REFRESH_TIMEOUT, routes, TOPIC_LABELS } from "@tbe/constants";
import { useDsaCompletedQuestions, useDsaTopicSummaries } from "@tbe/hooks";
import type { PageProps, UserProfile } from "@tbe/interface";
import { userService } from "@tbe/services";
import { cn, encodeDsaTopicForUrl, getPreFetchProps } from "@tbe/utils";
import { Button } from "@ui/button";
import { Card } from "@ui/card";
import { Progress } from "@ui/progress";
import {
  Code2,
  Github,
  Linkedin,
  Monitor,
  PenLine,
  PieChart,
  Target,
  TrendingUp,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Fragment, useEffect, useMemo, useState } from "react";

const DsaClient = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { data: topicRows } = useDsaTopicSummaries();
  const { solvedToday } = useDsaCompletedQuestions({ userId: user?.id });

  const topicProgress = useMemo(() => {
    if (!topicRows?.length) return [];
    return topicRows.map((row) => ({
      name: row.label || TOPIC_LABELS[row.topic] || row.topic,
      key: row.topic,
      solved: row.solved ?? 0,
      total: row.count,
    }));
  }, [topicRows]);

  const totalQuestions = useMemo(
    () => topicProgress.reduce((acc, t) => acc + t.total, 0),
    [topicProgress],
  );
  const totalSolved = useMemo(
    () => topicProgress.reduce((acc, t) => acc + t.solved, 0),
    [topicProgress],
  );
  const overallPercentage =
    totalQuestions > 0 ? Math.round((totalSolved / totalQuestions) * 100) : 0;

  useEffect(() => {
    if (user?.id) {
      userService.getProfile(user.id).then(setProfile);
    }
  }, [user?.id]);

  const targetLabel = profile?.dsaYatra?.target || "Product-based";
  const timelineLabel = profile?.dsaYatra?.timeline || "4-6 months";
  const expLabel = profile?.dsaYatra?.experienceLevel || "Fresher (0-1 yr)";

  return (
    <div className="w-full min-w-0 max-w-full font-sans selection:bg-[#ff5757]/30 selection:text-white">
      <div className="w-full min-w-0 max-w-full space-y-5 pb-2 sm:space-y-6 sm:pb-4 lg:pb-6">
        {/* Profile + goals — single scan-friendly panel */}
        <Card className="w-full min-w-0 max-w-full border-[#252525] bg-gradient-to-b from-[#151515] to-[#111] shadow-[0_0_0_1px_rgba(255,87,87,0.06)] rounded-2xl p-5 sm:p-6 lg:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 size-[min(380px,100%)] rounded-full bg-[#ff5757]/[0.06] blur-[90px] pointer-events-none translate-x-1/4 -translate-y-1/4" />
          <div className="relative z-10 flex min-w-0 flex-col gap-6 lg:gap-8">
            <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
              <div className="min-w-0 space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#707070]">
                  DSA Yatra
                </p>
                <h2 className="break-words text-xl font-black leading-snug tracking-tight text-[#f5f5f5] sm:text-2xl md:text-[1.65rem]">
                  Welcome back, {user?.name}!{" "}
                  <span aria-hidden className="inline-block">
                    👋
                  </span>
                </h2>
                <p className="max-w-xl text-[0.9375rem] leading-relaxed text-[#989898]">
                  Here’s where you’re headed—tweak your goals anytime when your
                  plan changes.
                </p>
              </div>
              <Button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className="h-auto shrink-0 gap-2 self-stretch px-5 py-3 text-[13px] font-bold rounded-xl border border-[#333] bg-[#1c1c1c] text-[#f0f0f0] hover:border-[#ff5757]/40 hover:bg-[#222] sm:self-auto sm:w-auto sm:self-start"
              >
                <PenLine
                  className="size-4 shrink-0 text-[#ff5757]"
                  aria-hidden
                />
                Edit goal
              </Button>
            </div>

            <div className="h-px w-full bg-gradient-to-r from-transparent via-[#2a2a2a] to-transparent" />

            <div className="grid min-w-0 grid-cols-1 gap-8 lg:grid-cols-[minmax(0,17rem)_1fr] lg:gap-10 xl:grid-cols-[minmax(0,19rem)_1fr]">
              {/* Identity */}
              <div className="flex min-w-0 flex-col items-center gap-5 sm:flex-row sm:items-center lg:flex-col lg:items-center xl:items-start">
                <div className="relative shrink-0">
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-[#ff5757]/50 to-transparent opacity-60 blur-[2px]" />
                  <div className="relative size-24 overflow-hidden rounded-full border-[3px] border-[#252525] bg-[#1a1a1a] shadow-inner sm:size-[5.75rem]">
                    {user?.image ? (
                      <Image
                        src={user.image}
                        alt={user.name || "Profile"}
                        width={112}
                        height={112}
                        className="size-full object-cover"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center bg-gradient-to-br from-[#ff5757] to-[#cc4444] text-2xl font-black text-white sm:text-3xl">
                        {user?.name
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("") || "SJ"}
                      </div>
                    )}
                  </div>
                </div>
                <div className="min-w-0 text-center lg:max-w-none lg:text-center xl:text-left xl:w-full">
                  <h3 className="truncate text-lg font-black tracking-tight text-[#fafafa] sm:text-xl lg:max-w-[16rem] lg:truncate xl:max-w-none">
                    {user?.name}
                  </h3>
                  <p className="mt-2 text-[11px] font-bold uppercase leading-snug tracking-widest text-[#757575]">
                    {expLabel}
                  </p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2 lg:justify-center xl:justify-start">
                    {(
                      [
                        {
                          icon: Linkedin,
                          url: profile?.linkedInUrl,
                          label: "LinkedIn profile",
                        },
                        {
                          icon: Github,
                          url: profile?.githubUrl,
                          label: "GitHub profile",
                        },
                        {
                          icon: Monitor,
                          url: profile?.portfolioUrl,
                          label: "Portfolio website",
                        },
                      ] as const
                    ).map((social, i) => (
                      <a
                        key={i}
                        href={
                          social.url
                            ? social.url.startsWith("http")
                              ? social.url
                              : `https://${social.url}`
                            : "#"
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          "rounded-lg border border-[#2e2e2e] bg-[#191919] p-2.5 text-[#9a9a9a] transition-colors hover:border-[#ff5757]/45 hover:bg-[#ff5757]/08 hover:text-[#f0f0f0]",
                          !social.url && "opacity-25 cursor-not-allowed",
                        )}
                        onClick={(e) => !social.url && e.preventDefault()}
                        aria-label={social.label}
                      >
                        <social.icon className="size-4" aria-hidden />
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {/* Goal metrics — 2×2 for readability */}
              <div className="min-w-0 space-y-4">
                <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                  <h4 className="text-xs font-black uppercase tracking-[0.18em] text-[#858585]">
                    Interview plan
                  </h4>
                  <span className="hidden text-[11px] text-[#5c5c5c] sm:inline">
                    Updated from onboarding
                  </span>
                </div>
                <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
                  {[
                    { label: "Goal timeline", value: timelineLabel },
                    {
                      label: "Experience",
                      value:
                        profile?.dsaYatra?.experienceLevel ||
                        user?.occupation ||
                        "Tech student",
                    },
                    { label: "Current focus", value: targetLabel },
                    {
                      label: "Primary target",
                      value: profile?.dsaYatra?.companies?.[0] || "Top tech",
                    },
                  ].map((stat, i) => (
                    <div
                      key={i}
                      className="flex min-h-[5.25rem] min-w-0 flex-col justify-center rounded-xl border border-[#2a2a2a] bg-[#161616]/90 px-4 py-4 transition-colors hover:border-[#393939]"
                    >
                      <p className="text-[10px] font-black uppercase tracking-wider text-[#6e6e6e]">
                        {stat.label}
                      </p>
                      <p className="mt-2 break-words text-sm font-black leading-snug text-[#ff6b6b] sm:text-[0.9375rem]">
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Dashboard Grid */}
        <div className="grid min-w-0 grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          {/* Overall Progress Card */}
          <Card
            id="overall-progress"
            className="flex min-w-0 max-w-full flex-col items-center justify-center rounded-2xl border-[#2a2a2a] bg-[#1a1a1a] p-6 transition-all duration-500 hover:border-[#ff5757]/40 hover:shadow-[0_0_30px_rgba(255,87,87,0.1)] md:col-span-2 lg:row-span-2 lg:p-8 group"
          >
            <div className="flex w-full min-w-0 items-center justify-between mb-6 lg:mb-8">
              <p className="text-[10px] lg:text-[11px] font-black text-[#a0a0a0] uppercase tracking-widest">
                Overall Progress
              </p>
              <div className="p-2 lg:p-2.5 bg-[#ff5757]/10 rounded-lg">
                <TrendingUp className="w-4 h-4 lg:w-4.5 lg:h-4.5 text-[#ff5757]" />
              </div>
            </div>

            <div className="relative w-32 h-32 lg:w-40 lg:h-40 mb-6 lg:mb-8">
              <div className="absolute inset-0 rounded-full bg-[#252525]" />
              <div
                className="absolute inset-0 rounded-full transition-all duration-1000 ease-out"
                style={{
                  background: `conic-gradient(#ff5757 ${overallPercentage * 3.6}deg, transparent 0deg)`,
                }}
              />
              <div className="absolute inset-2 lg:inset-2.5 rounded-full bg-[#1a1a1a] flex flex-col items-center justify-center border-4 border-[#1a1a1a]">
                <span className="text-4xl lg:text-5xl font-black text-[#f0f0f0]">
                  {overallPercentage}%
                </span>
                <span className="text-[10px] lg:text-[11px] font-bold text-[#606060] uppercase mt-1 lg:mt-1.5">
                  {totalSolved}/{totalQuestions} Qs
                </span>
              </div>
            </div>

            <div className="w-full min-w-0 space-y-3 lg:space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-[11px] lg:text-[11px] font-bold text-[#808080] uppercase tracking-wider">
                  Pace Analysis
                </span>
                <span
                  className={cn(
                    "text-[10px] lg:text-[11px] font-black px-2 py-0.5 rounded uppercase",
                    overallPercentage >= 50
                      ? "text-[#51cf66]"
                      : "text-[#ffa94d]",
                  )}
                >
                  {overallPercentage >= 50 ? "On Track" : "Needs Focus"}
                </span>
              </div>
              <Progress
                value={overallPercentage}
                className="h-2 lg:h-2.5 bg-[#252525] rounded-full overflow-hidden"
              />
              <div className="pt-2 text-center">
                <span
                  className={cn(
                    "text-[10px] lg:text-[11px] font-black px-4 py-2 lg:px-5 lg:py-2 rounded-lg uppercase tracking-widest border",
                    overallPercentage >= 50
                      ? "bg-[#51cf66]/10 text-[#51cf66] border-[#51cf66]/20"
                      : "bg-[#ffa94d]/10 text-[#ffa94d] border-[#ffa94d]/20",
                  )}
                >
                  {overallPercentage >= 50 ? "ON TRACK" : "KEEP PUSHING"}
                </span>
              </div>
            </div>
          </Card>

          <StatCard
            title="Today's Stats"
            value={solvedToday}
            description="Questions solved today"
            icon={Code2}
            className="md:col-span-1 lg:col-span-2"
          />
          <StatCard
            title="Total Solved"
            value={String(totalSolved)}
            description={`Out of ${totalQuestions} questions`}
            progress={overallPercentage}
            icon={Target}
            className="md:col-span-1 lg:col-span-2"
          />
        </div>

        {/* Topic-wise Progress Section */}
        <Card className="min-w-0 max-w-full rounded-2xl border-[#222] bg-[#111] p-6 sm:p-8">
          <div className="mb-8 flex min-w-0 items-center gap-3">
            <div className="p-2.5 bg-[#ff5757]/10 rounded-xl">
              <PieChart className="w-5 h-5 text-[#ff5757]" />
            </div>
            <h3 className="text-xl font-black text-[#f0f0f0] tracking-tight">
              Topic Wise Progress
            </h3>
          </div>

          <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {topicProgress.length > 0 ? (
              topicProgress.map((topic) => (
                <Link
                  key={topic.key}
                  href={`/sheets?topic=${encodeDsaTopicForUrl(topic.key)}`}
                  className="block group"
                >
                  <div className="min-w-0 cursor-pointer rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] p-5 transition-all group-hover:-translate-y-1 group-hover:bg-[#1f1f1f] hover:border-[#ff5757]/50">
                    <div className="mb-4 flex min-w-0 items-start justify-between gap-2">
                      <p className="min-w-0 flex-1 break-words text-xs font-black uppercase leading-tight tracking-widest text-[#f0f0f0] lg:text-sm">
                        {topic.name}
                      </p>
                      <span className="shrink-0 text-[11px] font-black text-[#ff5757] lg:text-xs">
                        {Math.round((topic.solved / (topic.total || 1)) * 100)}%
                      </span>
                    </div>
                    <div className="flex items-end justify-between mb-3">
                      <p className="text-[11px] lg:text-xs font-bold text-[#606060]">
                        <span className="text-[#a0a0a0]">{topic.solved}</span> /{" "}
                        {topic.total} Solved
                      </p>
                    </div>
                    <Progress
                      value={
                        topic.total > 0 ? (topic.solved / topic.total) * 100 : 0
                      }
                      className="h-1.5 bg-[#252525] rounded-full overflow-hidden"
                    />
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-12 border-2 border-dashed border-[#222] rounded-3xl">
                <p className="text-xs font-bold text-[#606060] uppercase tracking-widest animate-pulse">
                  Initializing your roadmap...
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>

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
    slug: routes.dsayatra.home,
    appId: "dsayatra",
  })),
  revalidate: PAGE_REFRESH_TIMEOUT.veryVeryLong,
});

export default Dashboard;
