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
import { toast } from "@ui/sonner";
import {
  Code2,
  Github,
  Linkedin,
  Monitor,
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
        {/* Header Section */}
        <header className="flex w-full min-w-0 flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h2 className="break-words text-[1.35rem] font-black leading-snug tracking-tight text-[#f0f0f0] sm:text-2xl md:text-3xl">
              Welcome back, {user?.name}! 👋
            </h2>
            <p className="text-[#808080] text-sm font-medium mt-1">
              Ready to master DSA today?
            </p>
          </div>
          <div className="flex w-full min-w-0 shrink-0 flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <Link href="/sheets" className="min-w-0 flex-1 sm:flex-none">
              <Button className="w-full sm:w-auto bg-[#ff5757] hover:bg-[#ff4040] text-white px-6 py-2.5 h-auto font-bold text-xs rounded-xl transition-all hover:shadow-[0_4px_20px_rgba(255,87,87,0.25)] hover:scale-[1.02]">
                Continue Learning
              </Button>
            </Link>
            <Button
              onClick={() => setIsEditModalOpen(true)}
              className="w-full flex-1 sm:w-auto sm:flex-none bg-[#1a1a1a] border border-[#2a2a2a] text-[#f0f0f0] hover:bg-[#222] hover:border-[#ff5757]/30 h-auto px-6 py-2.5 font-bold text-xs rounded-xl"
            >
              Edit Goal
            </Button>
          </div>
        </header>

        {/* Profile Card Section - Redesigned to be more compact and legible */}
        <Card className="w-full min-w-0 max-w-full bg-[#111] border-[#222] rounded-2xl p-5 sm:p-6 lg:p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff5757]/5 blur-[100px] pointer-events-none" />

          <div className="flex min-w-0 flex-col lg:flex-row items-center lg:items-start gap-6 lg:gap-12 relative z-10">
            {/* Left: Identity Section */}
            <div className="flex flex-col items-center lg:items-start shrink-0">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-[#ff5757] to-[#ff9b9b] rounded-full blur-md opacity-20 group-hover:opacity-40 transition-opacity" />
                <div className="relative w-20 h-20 lg:w-24 lg:h-24 rounded-full overflow-hidden border-4 border-[#1a1a1a] shadow-2xl flex items-center justify-center bg-[#1a1a1a]">
                  {user?.image ? (
                    <Image
                      src={user.image}
                      alt={user.name || "Profile"}
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#ff5757] to-[#ff8888] flex items-center justify-center text-white text-2xl lg:text-3xl font-black">
                      {user?.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("") || "SJ"}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 text-center lg:text-left">
                <h3 className="max-w-full break-words text-xl lg:text-2xl font-black text-[#f0f0f0] tracking-tight leading-none">
                  {user?.name}
                </h3>
                <p className="text-[#606060] text-[10px] lg:text-xs font-bold uppercase tracking-widest mt-2">
                  {expLabel}
                </p>
              </div>

              {/* Social Links - More compact row */}
              <div className="flex items-center justify-center lg:justify-start gap-2 mt-5">
                {[
                  {
                    icon: Linkedin,
                    url: profile?.linkedInUrl,
                    color: "#0077b5",
                  },
                  { icon: Github, url: profile?.githubUrl, color: "#ffffff" },
                  {
                    icon: Monitor,
                    url: profile?.portfolioUrl,
                    color: "#ff5757",
                  },
                ].map((social, i) => (
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
                      "p-2.5 rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] text-[#a0a0a0] hover:text-white hover:border-[#ff5757]/50 hover:bg-[#ff5757]/10 transition-all",
                      !social.url && "opacity-20 cursor-not-allowed",
                    )}
                    onClick={(e) => !social.url && e.preventDefault()}
                  >
                    <social.icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Right: Stats & Actions Section */}
            <div className="min-w-0 flex-1 w-full space-y-6">
              <div className="grid min-w-0 grid-cols-2 gap-3 md:grid-cols-4">
                {[
                  { label: "Goal Timeline", value: timelineLabel },
                  {
                    label: "Experience",
                    value:
                      profile?.dsaYatra?.experienceLevel ||
                      user?.occupation ||
                      "Tech Student",
                  },
                  {
                    label: "Current Focus",
                    value: targetLabel,
                  },
                  {
                    label: "Primary Target",
                    value: profile?.dsaYatra?.companies?.[0] || "Top Tech",
                  },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className="min-w-0 bg-[#1a1a1a]/50 p-3 lg:p-4 rounded-xl border border-[#222] transition-colors hover:border-[#333]"
                  >
                    <p className="text-[9px] lg:text-[10px] text-[#606060] uppercase mb-1 font-black tracking-widest">
                      {stat.label}
                    </p>
                    <p className="text-xs lg:text-sm font-black text-[#ff5757] truncate">
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => setIsEditModalOpen(true)}
                  className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] text-[#f0f0f0] hover:bg-[#222] font-bold text-xs lg:text-sm rounded-xl py-3 lg:py-4 h-auto shadow-sm"
                >
                  Edit Profile
                </Button>
                <Button
                  onClick={() => {
                    if (profile?.userName) {
                      const url = `${window.location.origin}/journey/${profile.userName}`;
                      navigator.clipboard.writeText(url);
                      toast.success("Journey link copied!");
                    }
                  }}
                  className="flex-1 bg-[#ff5757] text-white hover:bg-[#ff4040] font-bold text-xs lg:text-sm rounded-xl py-3 lg:py-4 h-auto px-6 shadow-[0_4px_20px_rgba(255,87,87,0.2)] hover:shadow-[0_4px_25px_rgba(255,87,87,0.3)]"
                >
                  Share Journey
                </Button>
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
