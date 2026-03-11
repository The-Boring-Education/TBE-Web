import { useAuth } from "@tbe/auth";
import { SEO } from "@tbe/components";
import { EditDsaOnboardingModal } from "@tbe/components";
import { PAGE_REFRESH_TIMEOUT, routes, TOPIC_LABELS } from "@tbe/constants";
import { useApi, usePrepStats, useTimeTracker } from "@tbe/hooks";
import type { PageProps } from "@tbe/interface";
import type { UserProfile } from "@tbe/interface";
import { userService } from "@tbe/services";
import { cn, getPreFetchProps } from "@tbe/utils";
import { Button } from "@ui/button";
import { Card, CardContent } from "@ui/card";
import { Progress } from "@ui/progress";
import {
  CheckCircle2,
  ClipboardList,
  Code2,
  FileText,
  Github,
  Home,
  Linkedin,
  Monitor,
  PieChart,
  Settings,
  Target,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Fragment, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const SIDEBAR_ITEMS = [
  { name: "Dashboard", href: "/dashboard", active: true, icon: Home },
  { name: "Sheets", href: "/sheets", icon: Target },
  { name: "Revisions", href: "/revisions", icon: FileText },
  { name: "Topics", href: "/topics", icon: ClipboardList },
  { name: "Progress", href: "/progress", icon: TrendingUp },
  { name: "Goals", href: "/goals", icon: Settings },
];

// TOPICS is now computed from real API data inside DsaClient

// Dynamic revisions now fetched inline using weekly assignments and progress

function Sidebar() {
  return (
    <aside className="sticky top-[72px] h-[calc(100vh-72px)] w-[210px] bg-[#0f0f0f] border-r border-[#2a2a2a] z-40 hidden lg:block shrink-0">
      <div className="py-2 px-2">
        <nav className="space-y-0.5">
          {SIDEBAR_ITEMS.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-2 px-2.5 py-1.5 text-[12px] font-semibold transition-all duration-200 rounded-lg group",
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
}: any) {
  return (
    <Card className="bg-[#1a1a1a] border-[#2a2a2a] hover:border-[#ff5757]/40 hover:shadow-[0_0_20px_rgba(255,87,87,0.15)] transition-all duration-300 hover:scale-[1.02] group rounded-[10px] p-[16px] h-full relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#ff5757]/0 to-[#ff5757]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      <div className="flex flex-row items-center justify-between pb-1.5 relative z-10">
        <p className="text-[11px] font-[600] text-[#a0a0a0] uppercase tracking-[0.5px]">
          {title}
        </p>
        {Icon && <Icon className="w-3.5 h-3.5 text-[#ff5757]" />}
      </div>
      <div className="mt-1">
        <div className="text-[28px] font-[700] text-[#e0e0e0] leading-tight">
          {value}
        </div>
        {(subtext || secondaryInfo) && (
          <div className="mt-1">
            {subtext && (
              <p className="text-[11px] font-[500] text-[#a0a0a0]">{subtext}</p>
            )}
            {secondaryInfo && (
              <p className="text-[10px] text-[#606060]">{secondaryInfo}</p>
            )}
          </div>
        )}
        {status && (
          <div
            className={cn(
              "mt-2 text-[9px] font-[600] px-[7px] py-[3px] rounded-[4px] inline-block uppercase",
              status === "ON TRACK"
                ? "bg-green-500/20 text-[#51cf66]"
                : "bg-red-500/20 text-[#ff6b6b]",
            )}
          >
            {status}
          </div>
        )}
        {progress !== undefined && (
          <div className="mt-3">
            <Progress
              value={progress}
              className="h-[6px] bg-[#2a2a2a] rounded-[4px]"
            />
          </div>
        )}
      </div>
    </Card>
  );
}

function DsaClient() {
  "use client";
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeScheduleItem, setActiveScheduleItem] = useState<number | null>(
    null,
  );

  // Automatic time tracking for current session
  const { seconds, formattedTime } = useTimeTracker(user?.id);

  // Fetch historical stats from database
  const { totalTimeSpent, stats, weeklyLogs } = usePrepStats(user?.id || "");

  // Fetch all DSA questions from the API (same source as sheets page)
  const { response: dsaResponse } = useApi("dashboard-dsa-sheet", {
    url: `${routes.api.base}${routes.api.dsaSheet}?limit=1000`,
  });

  // Read completed questions from localStorage (same source as sheets page)
  const [completedQuestions, setCompletedQuestions] = useState<
    (string | number)[]
  >([]);
  const [solvedToday, setSolvedToday] = useState(0);

  // New revision state handling
  const [weeklyAssignments, setWeeklyAssignments] = useState<
    Record<number, string[]>
  >({});
  const [weekProgress, setWeekProgress] = useState<Record<number, string[]>>(
    {},
  );

  useEffect(() => {
    const saved = localStorage.getItem("dsayatra_completed_questions");
    if (saved) {
      try {
        setCompletedQuestions(JSON.parse(saved));
      } catch {}
    }

    const todayStr = new Date().toDateString();
    const statsStr = localStorage.getItem("dsayatra_today_stats");
    if (statsStr) {
      try {
        const data = JSON.parse(statsStr);
        if (data.date === todayStr) {
          setSolvedToday(data.solvedCount || 0);
        }
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

  // Parse all DSA questions from API response
  const allQuestions = useMemo(() => {
    const data = dsaResponse?.data?.questions;
    if (!Array.isArray(data)) return [];
    return data;
  }, [dsaResponse]);

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
        const qId = q._id;
        if (qId && completedQuestions.includes(qId)) {
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
    allQuestions.some((q: any) => q._id === id),
  ).length;
  const overallPercentage =
    totalQuestions > 0 ? Math.round((totalSolved / totalQuestions) * 100) : 0;

  // Weekly performance strictly mapped from join date
  const weeklyPerformance = useMemo(() => {
    if (!profile?.createdAt) return [];

    const joinDate = new Date(profile.createdAt);
    joinDate.setHours(0, 0, 0, 0);

    const now = new Date();
    const daysSinceJoin = Math.floor(
      (now.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    const currentWeekIndex = Math.floor(daysSinceJoin / 7);

    // Map logs to their respective week indices relative to join date
    const weekMap: Record<number, number> = {};
    if (weeklyLogs) {
      weeklyLogs.forEach((log: any) => {
        const logDate = new Date(log.createdAt);
        if (logDate >= joinDate) {
          const daysOffset = Math.floor(
            (logDate.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24),
          );
          const wIndex = Math.floor(daysOffset / 7);
          weekMap[wIndex] = (weekMap[wIndex] || 0) + (log.timeSpent || 0);
        }
      });
    }

    // Generate the 4 most recent structured weeks leading up to the current one
    const weeks: { label: string; minutes: number; isCurrent: boolean }[] = [];
    const startIdx = Math.max(0, currentWeekIndex - 3);

    for (let i = startIdx; i <= currentWeekIndex; i++) {
      weeks.push({
        label: `Week ${i + 1}`,
        minutes: weekMap[i] || 0,
        isCurrent: i === currentWeekIndex,
      });
    }

    return weeks;
  }, [weeklyLogs, profile?.createdAt]);

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

  const targetLabel = profile?.dsaYatra?.target || "Product-based";
  const timelineLabel = profile?.dsaYatra?.timeline || "4-6 months";

  // Daily time spent calculation (Database Sum + Current Unsynced seconds)
  const todayLog = stats?.weeklyLogs?.find((log) => {
    const logDate = new Date(log.createdAt).toDateString();
    const todayDate = new Date().toDateString();
    return logDate === todayDate;
  });

  const sessionMinutes = Math.floor(seconds / 60);
  const todayTotalMinutes = (todayLog?.timeSpent || 0) + sessionMinutes;
  const todayTotalHours = (todayTotalMinutes / 60).toFixed(1);

  const dailyGoalHours = 3; // Standard goal
  const dailyGoalProgress = Math.min(
    100,
    Math.round((todayTotalMinutes / (dailyGoalHours * 60)) * 100),
  );

  // Revisions Data Generation
  const allRevisions = useMemo(() => {
    const questions: {
      id: string;
      title: string;
      completed: boolean;
      weekInfo: string;
    }[] = [];
    Object.keys(weeklyAssignments).forEach((weekKey) => {
      const weekIndex = parseInt(weekKey);
      const assignments = weeklyAssignments[weekIndex] || [];
      const completedIds = weekProgress[weekIndex] || [];
      assignments.forEach((id) => {
        const q = allQuestions.find(
          (q: any) => String(q._id || q.id || q.name) === String(id),
        );
        if (q) {
          questions.push({
            id: String(id),
            title: q.name || q.title || "DSA Question",
            completed: completedIds.includes(String(id)),
            weekInfo: `Week ${weekIndex + 1} Revision`,
          });
        }
      });
    });
    return questions;
  }, [allQuestions, weeklyAssignments, weekProgress]);

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

  // Total invested
  const totalMinutes = totalTimeSpent + sessionMinutes;
  const totalHours = (totalMinutes / 60).toFixed(1);

  return (
    <div className="flex bg-[#0f0f0f] font-sans selection:bg-[#ff5757]/30 selection:text-white">
      <Sidebar />

      <main className="flex-1 px-4 pt-2.5 space-y-4 pb-10">
        {/* Header Section */}
        <header className="flex justify-between items-center">
          <div>
            <h2 className="text-[26px] font-bold text-[#e0e0e0]">
              Welcome back, {user?.name?.split(" ")[0] || "Yatree"}! 👋
            </h2>
            <p className="text-[#a0a0a0] text-[13px] mt-0.5">
              Ready to master DSA today?
            </p>
          </div>
          <div className="flex gap-3">
            <Button className="bg-[#ff6b6b] hover:bg-[#ff5252] text-white px-[16px] py-[8px] h-auto font-[600] text-[12px] rounded-[6px] transition-all hover:scale-105">
              Continue Learning
            </Button>
            <Button className="bg-[#2a2a2a] border border-[#3a3a3a] text-[#e0e0e0] hover:bg-[#333] h-auto px-[16px] py-[8px] font-[600] text-[12px] rounded-[6px]">
              Edit Goal
            </Button>
          </div>
        </header>

        {/* Profile Card Section */}
        <Card className="w-full bg-gradient-to-b from-[#1a1a1a] to-[#252525] border-[#2a2a2a] rounded-[10px] p-3.5">
          <div className="flex flex-col items-center">
            <div className="w-[64px] h-[64px] rounded-full overflow-hidden mb-3 shadow-lg border-2 border-[#ff6b6b]/20 flex items-center justify-center">
              {user?.image ? (
                <img
                  src={user.image}
                  alt={user.name || "Profile"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#ff6b6b] to-[#ff9b9b] flex items-center justify-center text-white text-[20px] font-bold">
                  {user?.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("") || "SJ"}
                </div>
              )}
            </div>
            <h3 className="text-[16px] font-bold text-[#e0e0e0] leading-tight">
              {user?.name || "Shivani Jha"}
            </h3>
            <p className="text-[#a0a0a0] text-[11px] mt-0.5">
              @{user?.userName || "shivanijhavats"}
            </p>

            <div className="flex gap-3 my-4">
              {[
                {
                  icon: Linkedin,
                  label: "Linkedin",
                  url: profile?.linkedInUrl,
                },
                { icon: Github, label: "Github", url: profile?.githubUrl },
                {
                  icon: Monitor,
                  label: "Portfolio",
                  url: profile?.portfolioUrl,
                },
              ].map((social) => (
                <a
                  key={social.label}
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
                    "rounded-md border border-[#2a2a2a] text-[#ff5757] hover:border-[#ff5757] hover:bg-[#ff5757]/10 flex items-center gap-2 px-4 py-2 text-[11px] font-[600] transition-all uppercase",
                    !social.url && "opacity-50 cursor-not-allowed",
                  )}
                  onClick={(e) => !social.url && e.preventDefault()}
                >
                  <social.icon className="w-4 h-4" /> {social.label}
                </a>
              ))}
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 w-full max-w-2xl text-center mb-5 px-4">
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
                  label: "Focus",
                  value: profile?.dsaYatra?.target || "Software Eng",
                },
                {
                  label: "Target",
                  value:
                    (profile as any)?.dsaYatra?.companies &&
                    (profile as any).dsaYatra.companies.length > 0
                      ? (profile as any).dsaYatra.companies[0]
                      : "Top Tech",
                },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="bg-[#0f0f0f] p-2.5 rounded-lg border border-[#2a2a2a]"
                >
                  <p className="text-[10px] text-[#a0a0a0] uppercase mb-0.5 font-bold">
                    {stat.label}
                  </p>
                  <p className="text-[12px] font-bold text-[#ff5757]">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex gap-3 w-full max-w-sm">
              <Button
                onClick={() => setIsEditModalOpen(true)}
                className="flex-1 bg-[#2a2a2a] text-[#a0a0a0] hover:bg-[#333] font-[600] text-[12px] rounded-[6px] py-[8px] h-auto"
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
                className="flex-1 bg-[#ff6b6b] text-white hover:bg-[#ff5252] font-[600] text-[12px] rounded-[6px] py-[8px] h-auto px-6"
              >
                Share Journey
              </Button>
            </div>
          </div>
        </Card>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Overall Progress Card */}
          <Card className="md:col-span-2 bg-[#1a1a1a] border-[#2a2a2a] p-3.5 lg:row-span-2 flex flex-col items-center justify-center rounded-[10px] hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(255,87,87,0.15)] hover:border-[#ff5757]/40 transition-all duration-300">
            <div className="flex items-center justify-between w-full mb-5">
              <p className="text-[11px] font-[600] text-[#a0a0a0] uppercase tracking-[0.5px]">
                Overall Progress
              </p>
              <TrendingUp className="w-3.5 h-3.5 text-[#ff5757]" />
            </div>
            <div className="relative w-[120px] h-[120px] mb-5">
              <div
                className="w-full h-full rounded-full flex items-center justify-center"
                style={{
                  background: `conic-gradient(#ff5757 ${overallPercentage * 3.6}deg, #2a2a2a 0deg)`,
                }}
              >
                <div className="w-[102px] h-[102px] rounded-full bg-[#1a1a1a] flex flex-col items-center justify-center">
                  <span className="text-[28px] font-bold text-[#e0e0e0]">
                    {overallPercentage}%
                  </span>
                  <span className="text-[9px] text-[#a0a0a0]">
                    {totalSolved}/{totalQuestions} Questions
                  </span>
                </div>
              </div>
            </div>
            <div className="w-full space-y-1.5">
              <div className="flex justify-between text-[11px] text-[#a0a0a0]">
                <span>Expected vs Actual</span>
                <span className="font-bold">
                  {overallPercentage >= 50 ? "On Track" : "Needs Focus"}
                </span>
              </div>
              <Progress
                value={overallPercentage}
                className="h-[7px] bg-[#2a2a2a] rounded-[4px]"
              />
              <div className="pt-3 text-center">
                <span
                  className={cn(
                    "text-[9px] font-[600] px-[7px] py-[3px] rounded-[4px] uppercase",
                    overallPercentage >= 50
                      ? "bg-green-500/20 text-[#51cf66]"
                      : "bg-orange-500/20 text-[#ffa94d]",
                  )}
                >
                  {overallPercentage >= 50 ? "ON TRACK" : "KEEP GOING"}
                </span>
              </div>
            </div>
          </Card>

          <StatCard
            title="Today's Progress"
            value={todayTotalHours}
            subtext="Questions solved today"
            icon={Code2}
            secondaryInfo={`Active: ${formattedTime}`}
          />
          <StatCard
            title="Total Solved"
            value={String(totalSolved)}
            subtext={`Out of ${totalQuestions} questions`}
            progress={overallPercentage}
          />
          <StatCard
            title="Time Invested"
            value={totalHours}
            subtext="Hours total"
            secondaryInfo={`Last: ${todayLog?.timeSpent || 0}m`}
          />
          <StatCard
            title="Daily Goal"
            value={`${todayTotalHours}/${dailyGoalHours}`}
            subtext="Hours completed"
            progress={dailyGoalProgress}
          />
        </div>

        {/* Topic-wise Progress Section */}
        <Card className="bg-[#1a1a1a] border-[#2a2a2a] p-3.5 rounded-[10px] hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(255,87,87,0.15)] hover:border-[#ff5757]/40 transition-all duration-300">
          <div className="flex items-center gap-2 mb-3.5">
            <PieChart className="w-4.5 h-4.5 text-[#ff5757]" />
            <h3 className="text-[16px] font-bold text-[#e0e0e0]">
              Topic-wise Progress
            </h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            {topicProgress.length > 0 ? (
              topicProgress.map((topic) => (
                <div
                  key={topic.key}
                  className="bg-[#0f0f0f] border border-[#2a2a2a] p-4 rounded-[8px] text-center cursor-pointer hover:border-[#ff5757] transition-all group"
                >
                  <p className="text-[11px] font-bold text-[#e0e0e0] uppercase">
                    {topic.name}
                  </p>
                  <p className="text-[10px] text-[#a0a0a0] my-1.5">
                    {topic.solved}/{topic.total}
                  </p>
                  <Progress
                    value={
                      topic.total > 0 ? (topic.solved / topic.total) * 100 : 0
                    }
                    className="h-[7px] bg-[#1a1a1a] rounded-[4px]"
                  />
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-6">
                <p className="text-[12px] text-[#a0a0a0]">Loading topics...</p>
              </div>
            )}
          </div>
        </Card>

        {/* Today's View Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Today's Schedule Card */}
          <Card className="lg:col-span-2 bg-[#1a1a1a] border-[#2a2a2a] p-3.5 rounded-[10px] hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(255,87,87,0.15)] hover:border-[#ff5757]/40 transition-all duration-300">
            <p className="text-[11px] font-[600] text-[#a0a0a0] uppercase tracking-[0.5px] mb-3.5">
              Today's Schedule
            </p>
            <div className="flex justify-around items-center px-2 py-4 gap-4 flex-wrap">
              {todaysScheduleData.map((item, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center cursor-pointer group"
                  onClick={() =>
                    setActiveScheduleItem(activeScheduleItem === i ? null : i)
                  }
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="relative w-[70px] h-[70px] rounded-full border-2 border-[#ff5757]/20 bg-[#0f0f0f] flex items-center justify-center group-hover:border-[#ff5757]/60 group-hover:shadow-[0_0_20px_rgba(255,87,87,0.3)] transition-all duration-300"
                  >
                    <p className="text-[32px] font-bold text-[#e0e0e0] leading-none mb-0.5">
                      {item.value}
                    </p>
                    <AnimatePresence>
                      {activeScheduleItem === i && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.5, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: -40 }}
                          exit={{ opacity: 0, scale: 0.5, y: -10 }}
                          className="absolute -top-6 whitespace-nowrap bg-gradient-to-r from-[#ff5757] to-[#ff3030] text-white px-3 py-1.5 rounded-lg text-[11px] shadow-xl pointer-events-none z-10 font-[700] border border-white/20"
                        >
                          {item.value} {item.details}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                  <p className="text-[10px] font-[600] text-[#a0a0a0] uppercase mt-3 group-hover:text-[#e0e0e0] transition-colors">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          {/* This Week Card */}
          <Card className="bg-[#1a1a1a] border-[#2a2a2a] p-3.5 rounded-[10px] hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(255,87,87,0.15)] hover:border-[#ff5757]/40 transition-all duration-300">
            <p className="text-[11px] font-[600] text-[#a0a0a0] uppercase tracking-[0.5px] mb-2.5">
              This Week
            </p>
            <p className="text-[20px] font-bold text-[#e0e0e0]">
              {thisWeekPercentage}% Complete
            </p>
            <Progress
              value={thisWeekPercentage}
              className="h-[7px] bg-[#2a2a2a] my-3.5 rounded-[4px]"
            />
            <div className="space-y-1.5 mt-3.5">
              <p
                className={cn(
                  "text-[11px] flex items-center gap-1.5 font-[600]",
                  thisWeekPercentage >= 60
                    ? "text-[#51cf66]"
                    : "text-[#ffa94d]",
                )}
              >
                {thisWeekPercentage >= 60
                  ? "✓ Ahead of schedule"
                  : "⚡ Keep pushing"}
              </p>
              <p className="text-[11px] text-[#a0a0a0]">
                {Math.round(thisWeekMinutes / 60)}h / {weeklyGoalHours}h this
                week
              </p>
            </div>
          </Card>
        </div>

        {/* Daily Revisions Queue Section */}
        <Card className="bg-[#1a1a1a] border-[#2a2a2a] p-3.5 rounded-[10px] hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(255,87,87,0.15)] hover:border-[#ff5757]/40 transition-all duration-300">
          <div className="mb-3.5">
            <h3 className="text-[16px] font-bold text-[#e0e0e0]">
              Today's Revisions Queue
            </h3>
            <p className="text-[10px] text-[#a0a0a0] mt-0.5">
              {dueRevisionsCount} pending{" "}
              {dueRevisionsCount === 1 ? "question" : "questions"}
            </p>
          </div>
          <div className="space-y-[10px]">
            {displayRevisions.length === 0 ? (
              completedQuestions.length < 10 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center space-y-2 border border-dashed border-[#2a2a2a] rounded-lg bg-[#0f0f0f]/50">
                  <div className="text-[36px] mb-2 animate-bounce">🔒</div>
                  <p className="text-[14px] font-bold text-[#e0e0e0]">
                    Revisions Locked!
                  </p>
                  <p className="text-[11px] text-[#a0a0a0] max-w-[220px]">
                    Solve at least{" "}
                    <span className="text-[#ff5757] font-bold">
                      10 questions
                    </span>{" "}
                    to unlock your first set of revisions!
                  </p>
                  <span className="text-[#ff5757] font-semibold text-[10px] italic mt-2">
                    You're at {completedQuestions.length}/10. Go crush some
                    code! 🚀
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center space-y-2 border border-dashed border-[#2a2a2a] rounded-lg bg-[#0f0f0f]/50">
                  <div className="text-[40px] text-green-500 mb-1">
                    <CheckCircle2 size={40} className="fill-green-500/20" />
                  </div>
                  <p className="text-[14px] font-bold text-[#e0e0e0]">
                    You are all caught up!
                  </p>
                  <p className="text-[11px] text-[#a0a0a0] max-w-[220px]">
                    <span className="text-[#ff5757] font-semibold text-[10px] italic mt-1 flex items-center justify-center gap-1">
                      You're doing great, not everyone gets caught up till here!
                      ✨
                    </span>
                  </p>
                </div>
              )
            ) : (
              displayRevisions.map((item, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center p-[10px] bg-[#0f0f0f] border-l-[3px] rounded-r-[4px] transition-all hover:bg-[#151515] border-[#ff5757]"
                >
                  <div>
                    <p className="text-[12px] font-bold text-[#e0e0e0]">
                      {item.title}
                    </p>
                    <p className="text-[10px] text-[#a0a0a0] mt-0.5">
                      {item.weekInfo}
                    </p>
                  </div>
                  <Link
                    href="/revisions"
                    className="h-auto flex items-center justify-center text-[10px] font-[600] px-[10px] py-[5px] rounded-[4px] transition-all bg-[#ff5757] text-white hover:bg-[#ff5252]"
                  >
                    Attempt
                  </Link>
                </div>
              ))
            )}
          </div>
          <div className="mt-6 flex items-center justify-between">
            <p className="text-[11px] text-[#a0a0a0]">
              {completedRevisionsCount} overall completed
            </p>
            <Link
              href="/revisions"
              className="bg-[#ff6b6b] text-white inline-flex hover:bg-[#ff5252] text-[12px] font-[600] px-[18px] py-[8px] rounded-[6px] transition-all"
            >
              Go to Revisions
            </Link>
          </div>
        </Card>

        {/* Weekly Performance Card */}
        <Card className="bg-[#1a1a1a] border-[#2a2a2a] p-3.5 rounded-[10px] hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(255,87,87,0.15)] hover:border-[#ff5757]/40 transition-all duration-300">
          <p className="text-[11px] font-[600] text-[#a0a0a0] uppercase tracking-[0.5px] mb-3.5">
            Weekly Performance
          </p>
          <div className="flex gap-3.5">
            {(weeklyPerformance.length > 0
              ? weeklyPerformance
              : [
                  { label: "Week 1", minutes: 0, isCurrent: false },
                  { label: "Week 2", minutes: 0, isCurrent: false },
                  { label: "Week 3", minutes: 0, isCurrent: false },
                  { label: "Week 4", minutes: 0, isCurrent: true },
                ]
            ).map((week) => {
              const weekPct = Math.min(
                100,
                Math.round((week.minutes / (weeklyGoalHours * 60)) * 100),
              );
              return (
                <div
                  key={week.label}
                  className={cn(
                    "flex-1 bg-[#0f0f0f] border border-[#2a2a2a] p-3 rounded-[8px] text-center",
                    week.isCurrent && "border-[#ff6b6b] bg-[#ff6b6b]/10",
                  )}
                >
                  <p
                    className={cn(
                      "text-[15px] font-bold",
                      week.isCurrent ? "text-[#ff6b6b]" : "text-[#e0e0e0]",
                    )}
                  >
                    {week.label}
                  </p>
                  <p className="text-[10px] text-[#a0a0a0] mt-0.5 font-medium">
                    {Math.round(week.minutes / 60)}h
                  </p>
                </div>
              );
            })}
          </div>
          <div className="mt-5 text-center">
            <p
              className={cn(
                "text-[11px] font-[600]",
                overallPercentage >= 50 ? "text-[#51cf66]" : "text-[#ffa94d]",
              )}
            >
              {totalSolved} of {totalQuestions} questions completed
            </p>
            <p className="text-[11px] text-[#a0a0a0] mt-0.5 font-[600]">
              {totalQuestions - totalSolved} questions remaining
            </p>
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
}

const Dashboard = ({ seoMeta }: PageProps) => {
  return (
    <Fragment>
      <SEO seoMeta={seoMeta} />
      <DsaClient />
    </Fragment>
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
