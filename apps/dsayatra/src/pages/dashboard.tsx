import { ProtectedRoute, useAuth } from "@tbe/auth";
import { EditDsaOnboardingModal, SEO } from "@tbe/components";
import { PAGE_REFRESH_TIMEOUT, routes, TOPIC_LABELS } from "@tbe/constants";
import {
  useDsaCompletedQuestions,
  useDsaQuestions,
  usePrepStats,
} from "@tbe/hooks";
import type { PageProps, UserProfile } from "@tbe/interface";
import { userService } from "@tbe/services";
import { cn, encodeDsaTopicForUrl, getPreFetchProps } from "@tbe/utils";
import { Button } from "@ui/button";
import { Card } from "@ui/card";
import { Progress } from "@ui/progress";
import { toast } from "@ui/sonner";
import {
  ClipboardList,
  Code2,
  FileText,
  Github,
  Home,
  Linkedin,
  Monitor,
  PieChart,
  Target,
  TrendingUp,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Fragment, useEffect, useMemo, useState } from "react";

const SIDEBAR_ITEMS = [
  { name: "Dashboard", href: "/dashboard", active: true, icon: Home },
  { name: "Sheets", href: "/sheets", icon: Target },
  { name: "Revisions", href: "/revisions", icon: FileText },
  { name: "Topics", href: "/topics", icon: ClipboardList },
  { name: "Progress", href: "#overall-progress", icon: TrendingUp },
];

function Sidebar() {
  return (
    <aside className="sticky top-[72px] h-[calc(100vh-72px)] w-52 bg-[#0f0f0f] border-r border-[#2a2a2a] z-40 hidden lg:block shrink-0">
      <div className="py-2 px-2">
        <nav className="space-y-0.5">
          {SIDEBAR_ITEMS.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-2 px-3 py-2 strong-text font-semibold transition-all duration-200 rounded-lg group",
                item.active
                  ? "bg-[#ff5757] text-white shadow-md shadow-[#ff5757]/10"
                  : "text-[#a0a0a0] hover:bg-[#1a1a1a] hover:text-[#e0e0e0]",
              )}
            >
              <item.icon
                className={cn(
                  "w-3.5 h-3.5 transition-colors shrink-0",
                  item.active
                    ? "text-white"
                    : "text-[#a0a0a0] group-hover:text-[#e0e0e0]",
                )}
              />
              <span className="truncate">{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}

function StatCard({
  title,
  value,
  subtext,
  icon: Icon,
  progress,
  status,
  secondaryInfo,
  className,
}: any) {
  return (
    <Card
      className={cn(
        "bg-[#1a1a1a] border-[#2a2a2a] hover:border-[#ff5757]/40 hover:shadow-[0_0_20px_rgba(255,87,87,0.15)] transition-all duration-300 group rounded-xl p-5 h-full relative overflow-hidden flex flex-col justify-center",
        className,
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#ff5757]/0 to-[#ff5757]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      <div className="flex flex-row items-center justify-between pb-2 relative z-10">
        <p className="text-[10px] lg:text-xs font-black text-[#a0a0a0] uppercase tracking-widest">
          {title}
        </p>
        {Icon && <Icon className="w-4 h-4 text-[#ff5757]" />}
      </div>
      <div className="mt-1">
        <div className="text-3xl lg:text-4xl font-black text-[#f0f0f0] leading-tight">
          {value}
        </div>
        {(subtext || secondaryInfo) && (
          <div className="mt-1.5 space-y-0.5">
            {subtext && (
              <p className="text-xs lg:text-sm font-medium text-[#808080]">
                {subtext}
              </p>
            )}
            {secondaryInfo && (
              <p className="text-[10px] lg:text-xs text-[#505050] font-medium tracking-tight">
                {secondaryInfo}
              </p>
            )}
          </div>
        )}
        {status && (
          <div
            className={cn(
              "mt-3 text-[9px] font-bold px-2 py-0.5 rounded inline-block uppercase tracking-wider",
              status === "ON TRACK"
                ? "bg-[#51cf66]/10 text-[#51cf66] border border-[#51cf66]/20"
                : "bg-[#ff6b6b]/10 text-[#ff6b6b] border border-[#ff6b6b]/20",
            )}
          >
            {status}
          </div>
        )}
        {progress !== undefined && (
          <div className="mt-4">
            <Progress
              value={progress}
              className="h-1.5 bg-[#252525] rounded-full overflow-hidden"
            />
          </div>
        )}
      </div>
    </Card>
  );
}

const DsaClient = () => {
  "use client";
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeScheduleItem, setActiveScheduleItem] = useState<number | null>(
    null,
  );

  const { totalTimeSpent, stats, weeklyLogs } = usePrepStats(user?.id || "");

  const { rawQuestions: allQuestions } = useDsaQuestions({
    queryKey: "dashboard-dsa-sheet",
  });
  const { completedIds: completedQuestions, solvedToday } =
    useDsaCompletedQuestions({ userId: user?.id });

  const [weeklyAssignments, setWeeklyAssignments] = useState<
    Record<number, string[]>
  >({});
  const [weekProgress, setWeekProgress] = useState<Record<number, string[]>>(
    {},
  );

  useEffect(() => {
    const savedAssignments = localStorage.getItem("dsayatra_weekly_revisions");
    if (savedAssignments) {
      try {
        setWeeklyAssignments(JSON.parse(savedAssignments));
      } catch {
        /* corrupted data */
      }
    }

    const savedProgress = localStorage.getItem("dsayatra_revision_completed");
    if (savedProgress) {
      try {
        setWeekProgress(JSON.parse(savedProgress));
      } catch {
        /* corrupted data */
      }
    }
  }, []);

  // Compute topic-wise progress from real data
  const topicProgress = useMemo(() => {
    const topicMap = new Map<string, { total: number; solved: number }>();
    allQuestions.forEach((q: any) => {
      const primaryTopic = q.topics?.[0];
      if (primaryTopic) {
        if (!topicMap.has(primaryTopic)) {
          topicMap.set(primaryTopic, { total: 0, solved: 0 });
        }
        const entry = topicMap.get(primaryTopic)!;
        entry.total += 1;
        const qId = q._id || q.id;
        if (qId && completedQuestions.includes(String(qId))) {
          entry.solved += 1;
        }
      }
    });
    return Array.from(topicMap.entries()).map(([topic, data]) => ({
      name: TOPIC_LABELS[topic] || topic,
      key: topic,
      solved: data.solved,
      total: data.total,
    }));
  }, [allQuestions, completedQuestions]);

  // Overall progress
  const totalQuestions = allQuestions.length;
  const totalSolved = completedQuestions.filter((id) =>
    allQuestions.some((q: any) => String(q._id || q.id) === String(id)),
  ).length;
  const overallPercentage =
    totalQuestions > 0 ? Math.round((totalSolved / totalQuestions) * 100) : 0;

  // Weekly performance strictly mapped from join date (the day they first loaded DSA Yatra)
  const [joinDateStr, setJoinDateStr] = useState<string | null>(null);

  useEffect(() => {
    let storedJoinDate = localStorage.getItem("dsayatra_join_date");
    if (!storedJoinDate) {
      storedJoinDate = new Date().toISOString();
      localStorage.setItem("dsayatra_join_date", storedJoinDate);
    }
    setJoinDateStr(storedJoinDate);
  }, []);

  const weeklyPerformance = useMemo(() => {
    if (!joinDateStr) return [];

    const joinDate = new Date(joinDateStr);
    joinDate.setHours(0, 0, 0, 0);

    const now = new Date();
    const msInWeek = 1000 * 60 * 60 * 24 * 7;
    const currentWeekIndex = Math.max(
      0,
      Math.floor((now.getTime() - joinDate.getTime()) / msInWeek),
    );

    // Map logs to their respective week indices relative to exact join date
    const weekMap: Record<number, number> = {};
    if (weeklyLogs) {
      weeklyLogs.forEach((log: any) => {
        const logDate = new Date(log.createdAt);
        if (logDate >= joinDate) {
          const wIndex = Math.floor(
            (logDate.getTime() - joinDate.getTime()) / msInWeek,
          );
          weekMap[wIndex] = (weekMap[wIndex] || 0) + (log.timeSpent || 0);
        }
      });
    }

    // Always generate exactly 4 contiguous blocks for the UI
    const weeks: { label: string; minutes: number; isCurrent: boolean }[] = [];
    const startIdx = Math.max(0, currentWeekIndex - 3);
    const endIdx = startIdx + 3;

    for (let i = startIdx; i <= endIdx; i++) {
      weeks.push({
        label: `Week ${i + 1}`,
        minutes: weekMap[i] || 0,
        isCurrent: i === currentWeekIndex,
      });
    }

    return weeks;
  }, [weeklyLogs, joinDateStr]);

  // This week's progress (based on time logged this week vs a weekly goal)
  const thisWeekMinutes =
    weeklyPerformance.length > 0
      ? weeklyPerformance[weeklyPerformance.length - 1]?.minutes || 0
      : 0;
  const weeklyGoalHours = 15; // 15 hours/week goal
  const thisWeekPercentage = Math.min(
    100,
    Math.round((thisWeekMinutes / (weeklyGoalHours * 60)) * 100),
  );

  useEffect(() => {
    if (user?.id) {
      userService.getProfile(user.id).then(setProfile);
    }
  }, [user?.id]);

  // Resolve dynamic revisions
  const allRevisions = useMemo(() => {
    const revs: { title: string; weekInfo: string; completed: boolean }[] = [];
    Object.keys(weeklyAssignments).forEach((weekIdx) => {
      const idx = parseInt(weekIdx);
      const qIds = weeklyAssignments[idx] || [];
      const completedQs = weekProgress[idx] || [];

      qIds.forEach((qId) => {
        const q = allQuestions.find(
          (q: any) => String(q._id || q.id) === String(qId),
        );
        if (q) {
          revs.push({
            title: q.name,
            weekInfo: `Week ${idx + 1} Assignment`,
            completed: completedQs.includes(qId),
          });
        }
      });
    });
    return revs;
  }, [weeklyAssignments, weekProgress, allQuestions]);

  const incompleteRevisions = allRevisions.filter((r) => !r.completed);
  const completedRevisionsCount = allRevisions.filter(
    (r) => r.completed,
  ).length;
  const dueRevisionsCount = incompleteRevisions.length;
  const displayRevisions = incompleteRevisions.slice(0, 3);

  // Dynamic Schedule Data
  const expectedDailyQuestions = 5;
  const toSolve = Math.max(0, expectedDailyQuestions - solvedToday);

  const todaysScheduleData = [
    { label: "To Solve", value: toSolve, details: "Goal calculation" },
    { label: "Solved", value: solvedToday, details: "Cleared today" },
    {
      label: "Due Revisions",
      value: dueRevisionsCount,
      details: "Pending queue",
    },
    {
      label: "Completed",
      value: completedRevisionsCount,
      details: "Revisions done",
    },
  ];

  const targetLabel = profile?.dsaYatra?.target || "Product-based";
  const timelineLabel = profile?.dsaYatra?.timeline || "4-6 months";
  const expLabel = profile?.dsaYatra?.experienceLevel || "Fresher (0-1 yr)";

  const dailyGoalHours = 4;
  const dailyGoalProgress = Math.min(
    100,
    Math.round((solvedToday / expectedDailyQuestions) * 100),
  );
  const todayTotalHours = solvedToday;

  const todayLog = weeklyLogs?.find(
    (log: any) =>
      new Date(log.createdAt).toDateString() === new Date().toDateString(),
  );

  // Total invested (minutes from prep logs only)
  const totalHours = (totalTimeSpent / 60).toFixed(1);

  return (
    <div className="flex bg-[#0f0f0f] font-sans selection:bg-[#ff5757]/30 selection:text-white min-h-screen">
      <Sidebar />

      <main className="flex-1 px-4 sm:px-6 pt-6 space-y-6 pb-24 lg:pb-10 overflow-x-hidden">
        {/* Header Section */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#f0f0f0] tracking-tight">
              Welcome back, {user?.name?.split(" ")[0]}! 👋
            </h2>
            <p className="text-[#808080] text-sm font-medium mt-1">
              Ready to master DSA today?
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/sheets" className="flex-1 sm:flex-none">
              <Button className="w-full sm:w-auto bg-[#ff5757] hover:bg-[#ff4040] text-white px-6 py-2.5 h-auto font-bold text-xs rounded-xl transition-all hover:shadow-[0_4px_20px_rgba(255,87,87,0.25)] hover:scale-[1.02]">
                Continue Learning
              </Button>
            </Link>
            <Button
              onClick={() => setIsEditModalOpen(true)}
              className="flex-1 sm:flex-none bg-[#1a1a1a] border border-[#2a2a2a] text-[#f0f0f0] hover:bg-[#222] hover:border-[#ff5757]/30 h-auto px-6 py-2.5 font-bold text-xs rounded-xl"
            >
              Edit Goal
            </Button>
          </div>
        </header>

        {/* Profile Card Section - Redesigned to be more compact and legible */}
        <Card className="w-full bg-[#111] border-[#222] rounded-2xl p-5 sm:p-6 lg:p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff5757]/5 blur-[100px] pointer-events-none" />

          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6 lg:gap-12 relative z-10">
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
                <h3 className="text-xl lg:text-2xl font-black text-[#f0f0f0] tracking-tight leading-none">
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
            <div className="flex-1 w-full space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
                    className="bg-[#1a1a1a]/50 p-3 lg:p-4 rounded-xl border border-[#222] transition-colors hover:border-[#333]"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Overall Progress Card */}
          <Card
            id="overall-progress"
            className="md:col-span-2 lg:row-span-2 bg-[#1a1a1a] border-[#2a2a2a] p-6 lg:p-10 flex flex-col items-center justify-center rounded-2xl hover:border-[#ff5757]/40 hover:shadow-[0_0_30px_rgba(255,87,87,0.1)] transition-all duration-500 group"
          >
            <div className="flex items-center justify-between w-full mb-8 lg:mb-12">
              <p className="text-[10px] lg:text-xs font-black text-[#a0a0a0] uppercase tracking-widest">
                Overall Progress
              </p>
              <div className="p-2 lg:p-3 bg-[#ff5757]/10 rounded-lg">
                <TrendingUp className="w-4 h-4 lg:w-5 lg:h-5 text-[#ff5757]" />
              </div>
            </div>

            <div className="relative w-36 h-36 lg:w-48 lg:h-48 mb-8 lg:mb-12">
              <div className="absolute inset-0 rounded-full bg-[#252525]" />
              <div
                className="absolute inset-0 rounded-full transition-all duration-1000 ease-out"
                style={{
                  background: `conic-gradient(#ff5757 ${overallPercentage * 3.6}deg, transparent 0deg)`,
                }}
              />
              <div className="absolute inset-2 lg:inset-3 rounded-full bg-[#1a1a1a] flex flex-col items-center justify-center border-4 border-[#1a1a1a]">
                <span className="text-4xl lg:text-6xl font-black text-[#f0f0f0]">
                  {overallPercentage}%
                </span>
                <span className="text-[10px] lg:text-xs font-bold text-[#606060] uppercase mt-1 lg:mt-2">
                  {totalSolved}/{totalQuestions} Qs
                </span>
              </div>
            </div>

            <div className="w-full space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-[11px] lg:text-xs font-bold text-[#808080] uppercase tracking-wider">
                  Pace Analysis
                </span>
                <span
                  className={cn(
                    "text-[10px] lg:text-xs font-black px-2 py-0.5 rounded uppercase",
                    overallPercentage >= 50
                      ? "text-[#51cf66]"
                      : "text-[#ffa94d]",
                  )}
                >
                  {overallPercentage >= 50 ? "Optimal" : "Slow pace"}
                </span>
              </div>
              <Progress
                value={overallPercentage}
                className="h-2.5 lg:h-3 bg-[#252525] rounded-full overflow-hidden"
              />
              <div className="pt-2 text-center">
                <span
                  className={cn(
                    "text-[10px] lg:text-xs font-black px-4 py-2 lg:px-6 lg:py-2.5 rounded-lg uppercase tracking-widest border",
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
            subtext="Questions solved today"
            icon={Code2}
            secondaryInfo={
              todayLog
                ? `${todayLog.timeSpent || 0}m logged in prep today`
                : "No time logged yet"
            }
            className="md:col-span-1 lg:col-span-2"
          />
          <StatCard
            title="Consistency"
            value={String(totalSolved)}
            subtext="Total milestones reached"
            progress={overallPercentage}
            icon={Target}
            className="md:col-span-1 lg:col-span-2"
          />
        </div>

        {/* Topic-wise Progress Section */}
        <Card className="bg-[#111] border-[#222] p-6 sm:p-8 rounded-2xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 bg-[#ff5757]/10 rounded-xl">
              <PieChart className="w-5 h-5 text-[#ff5757]" />
            </div>
            <h3 className="text-xl font-black text-[#f0f0f0] tracking-tight">
              Topic Wise Progress
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {topicProgress.length > 0 ? (
              topicProgress.map((topic) => (
                <Link
                  key={topic.key}
                  href={`/sheets?topic=${encodeDsaTopicForUrl(topic.key)}`}
                  className="block group"
                >
                  <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-5 rounded-2xl cursor-pointer hover:border-[#ff5757]/50 transition-all group-hover:bg-[#1f1f1f] group-hover:-translate-y-1">
                    <div className="flex justify-between items-start mb-4">
                      <p className="text-xs lg:text-sm font-black text-[#f0f0f0] uppercase tracking-widest leading-tight pr-4">
                        {topic.name}
                      </p>
                      <span className="text-[11px] lg:text-xs font-black text-[#ff5757]">
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
      </main>

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
