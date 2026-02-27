import { useAuth } from "@tbe/auth";
import { SEO } from '@tbe/components';
import { PAGE_REFRESH_TIMEOUT, routes } from '@tbe/constants';
import type { PageProps } from '@tbe/interface';
import { cn, getPreFetchProps } from '@tbe/utils';
import { Button } from "@ui/button";
import { Card, CardContent } from "@ui/card";
import { Progress } from "@ui/progress";
import {
    CheckCircle2,
    Code2,
    Github,
    Linkedin,
    Monitor,
    TrendingUp,
    PieChart,
    Home,
    Target,
    FileText,
    ClipboardList,
    Settings
} from "lucide-react";
import Link from "next/link";
import { Fragment, useState, useEffect } from 'react';
import { userService } from "@tbe/services";
import type { UserProfile } from "@tbe/interface";
import { EditDsaOnboardingModal } from "@tbe/components";
import { toast } from "sonner";
import { usePrepStats, useTimeTracker } from "@tbe/hooks";

const SIDEBAR_ITEMS = [
    { name: 'Dashboard', href: '/dashboard', active: true, icon: Home },
    { name: 'Questions', href: '/questions', icon: Target },
    { name: 'Revisions', href: '/revisions', icon: FileText },
    { name: 'Topics', href: '/topics', icon: ClipboardList },
    { name: 'Progress', href: '/progress', icon: TrendingUp },
    { name: 'Goals', href: '/goals', icon: Settings }
];

const TOPICS = [
    { name: 'Arrays', solved: 28, total: 30 },
    { name: 'Strings', solved: 15, total: 25 },
    { name: 'Trees', solved: 10, total: 20 },
    { name: 'Graphs', solved: 5, total: 15 },
    { name: 'DP', solved: 8, total: 25 },
    { name: 'Heap/Queue', solved: 12, total: 15 },
    { name: 'Hashing', solved: 14, total: 15 },
    { name: 'Greedy', solved: 6, total: 12 }
];

const REVISIONS = [
    { title: 'Two Sum (Arrays)', meta: '3 days after solving • Revision #2', completed: false },
    { title: 'Reverse Linked List', meta: '1 week after solving • Revision #3', completed: true },
    { title: 'Merge Intervals', meta: 'Fresh Revision • Revision #1', completed: false }
];

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
                                    : "text-[#a0a0a0] hover:bg-[#1a1a1a] hover:text-[#e0e0e0]"
                            )}
                        >
                            <item.icon className={cn(
                                "w-3.5 h-3.5 transition-colors shrink-0",
                                item.active ? "text-white" : "text-[#a0a0a0] group-hover:text-[#e0e0e0]"
                            )} />
                            <span className="truncate">{item.name}</span>
                        </Link>
                    ))}
                </nav>
            </div>
        </aside>
    );
}

function StatCard({ title, value, subtext, icon: Icon, progress, status, secondaryInfo }: any) {
    return (
        <Card className="bg-[#1a1a1a] border-[#2a2a2a] hover:border-[#3a3a3a] transition-all duration-200 hover:-translate-y-0.5 group rounded-[10px] p-[16px] h-full">
            <div className="flex flex-row items-center justify-between pb-1.5">
                <p className="text-[11px] font-[600] text-[#a0a0a0] uppercase tracking-[0.5px]">
                    {title}
                </p>
                {Icon && <Icon className="w-3.5 h-3.5 text-[#ff5757]" />}
            </div>
            <div className="mt-1">
                <div className="text-[28px] font-[700] text-[#e0e0e0] leading-tight">{value}</div>
                {(subtext || secondaryInfo) && (
                    <div className="mt-1">
                        {subtext && <p className="text-[11px] font-[500] text-[#a0a0a0]">{subtext}</p>}
                        {secondaryInfo && <p className="text-[10px] text-[#606060]">{secondaryInfo}</p>}
                    </div>
                )}
                {status && (
                    <div className={cn(
                        "mt-2 text-[9px] font-[600] px-[7px] py-[3px] rounded-[4px] inline-block uppercase",
                        status === 'ON TRACK' ? "bg-green-500/20 text-[#51cf66]" : "bg-red-500/20 text-[#ff6b6b]"
                    )}>
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

    // Automatic time tracking for current session
    const { seconds, formattedTime } = useTimeTracker(user?.id);

    // Fetch historical stats from database
    const { totalTimeSpent, stats } = usePrepStats(user?.id || "");

    useEffect(() => {
        if (user?.id) {
            userService.getProfile(user.id).then(setProfile);
        }
    }, [user?.id]);

    const targetLabel = profile?.dsaYatra?.target || "Product-based";
    const timelineLabel = profile?.dsaYatra?.timeline || "4-6 months";

    // Daily time spent calculation (Database Sum + Current Unsynced seconds)
    const todayLog = stats?.weeklyLogs?.find(log => {
        const logDate = new Date(log.createdAt).toDateString();
        const todayDate = new Date().toDateString();
        return logDate === todayDate;
    });

    const sessionMinutes = Math.floor(seconds / 60);
    const todayTotalMinutes = (todayLog?.timeSpent || 0) + sessionMinutes;
    const todayTotalHours = (todayTotalMinutes / 60).toFixed(1);

    const dailyGoalHours = 3; // Standard goal
    const dailyGoalProgress = Math.min(100, Math.round((todayTotalMinutes / (dailyGoalHours * 60)) * 100));

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
                            Welcome back, {user?.name?.split(' ')[0] || "Yatree"}! 👋
                        </h2>
                        <p className="text-[#a0a0a0] text-[13px] mt-0.5">Ready to master DSA today?</p>
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
                                    {user?.name?.split(' ').map(n => n[0]).join('') || "SJ"}
                                </div>
                            )}
                        </div>
                        <h3 className="text-[16px] font-bold text-[#e0e0e0] leading-tight">{user?.name || "Shivani Jha"}</h3>
                        <p className="text-[#a0a0a0] text-[11px] mt-0.5">@{user?.userName || "shivanijhavats"}</p>

                        <div className="flex gap-3 my-4">
                            {[
                                { icon: Linkedin, label: 'Linkedin', url: profile?.linkedInUrl },
                                { icon: Github, label: 'Github', url: profile?.githubUrl },
                                { icon: Monitor, label: 'Portfolio', url: profile?.portfolioUrl }
                            ].map((social) => (
                                <a
                                    key={social.label}
                                    href={social.url ? (social.url.startsWith('http') ? social.url : `https://${social.url}`) : '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={cn(
                                        "rounded-md border border-[#2a2a2a] text-[#ff5757] hover:border-[#ff5757] hover:bg-[#ff5757]/10 flex items-center gap-2 px-4 py-2 text-[11px] font-[600] transition-all uppercase",
                                        !social.url && "opacity-50 cursor-not-allowed"
                                    )}
                                    onClick={(e) => !social.url && e.preventDefault()}
                                >
                                    <social.icon className="w-4 h-4" /> {social.label}
                                </a>
                            ))}
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 w-full max-w-2xl text-center mb-5 px-4">
                            {[
                                { label: 'Goal Timeline', value: timelineLabel },
                                { label: 'Experience', value: profile?.dsaYatra?.experienceLevel || user?.occupation || 'Tech Student' },
                                { label: 'Joined', value: profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '6/2/2025' },
                                { label: 'Focus', value: 'DSA Yatra' }
                            ].map((stat, i) => (
                                <div key={i} className="bg-[#0f0f0f] p-2.5 rounded-lg border border-[#2a2a2a]">
                                    <p className="text-[10px] text-[#a0a0a0] uppercase mb-0.5 font-bold">{stat.label}</p>
                                    <p className="text-[12px] font-bold text-[#ff5757]">{stat.value}</p>
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
                    <Card className="md:col-span-2 bg-[#1a1a1a] border-[#2a2a2a] p-3.5 lg:row-span-2 flex flex-col items-center justify-center rounded-[10px]">
                        <div className="flex items-center justify-between w-full mb-5">
                            <p className="text-[11px] font-[600] text-[#a0a0a0] uppercase tracking-[0.5px]">Overall Progress</p>
                            <TrendingUp className="w-3.5 h-3.5 text-[#ff5757]" />
                        </div>
                        <div className="relative w-[120px] h-[120px] mb-5">
                            <div
                                className="w-full h-full rounded-full flex items-center justify-center"
                                style={{
                                    background: `conic-gradient(#ff5757 ${68 * 3.6}deg, #2a2a2a 0deg)`
                                }}
                            >
                                <div className="w-[102px] h-[102px] rounded-full bg-[#1a1a1a] flex flex-col items-center justify-center">
                                    <span className="text-[28px] font-bold text-[#e0e0e0]">68%</span>
                                    <span className="text-[9px] text-[#a0a0a0]">164/240 Q's</span>
                                </div>
                            </div>
                        </div>
                        <div className="w-full space-y-1.5">
                            <div className="flex justify-between text-[11px] text-[#a0a0a0]">
                                <span>Expected vs Actual</span>
                                <span className="font-bold">On Track</span>
                            </div>
                            <Progress value={68} className="h-[7px] bg-[#2a2a2a] rounded-[4px]" />
                            <div className="pt-3 text-center">
                                <span className="bg-green-500/20 text-[#51cf66] text-[9px] font-[600] px-[7px] py-[3px] rounded-[4px] uppercase">
                                    ON TRACK
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
                        value="164"
                        subtext="Out of 240 questions"
                        progress={68}
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
                <Card className="bg-[#1a1a1a] border-[#2a2a2a] p-3.5 rounded-[10px]">
                    <div className="flex items-center gap-2 mb-3.5">
                        <PieChart className="w-4.5 h-4.5 text-[#ff5757]" />
                        <h3 className="text-[16px] font-bold text-[#e0e0e0]">Topic-wise Progress</h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
                        {TOPICS.map((topic) => (
                            <div
                                key={topic.name}
                                className="bg-[#0f0f0f] border border-[#2a2a2a] p-4 rounded-[8px] text-center cursor-pointer hover:border-[#ff5757] transition-all group"
                            >
                                <p className="text-[11px] font-bold text-[#e0e0e0] uppercase">{topic.name}</p>
                                <p className="text-[10px] text-[#a0a0a0] my-1.5">{topic.solved}/{topic.total}</p>
                                <Progress value={(topic.solved / topic.total) * 100} className="h-[7px] bg-[#1a1a1a] rounded-[4px]" />
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Today's View Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Today's Schedule Card */}
                    <Card className="lg:col-span-2 bg-[#1a1a1a] border-[#2a2a2a] p-3.5 rounded-[10px]">
                        <p className="text-[11px] font-[600] text-[#a0a0a0] uppercase tracking-[0.5px] mb-3.5">Today's Schedule</p>
                        <div className="grid grid-cols-4 gap-3.5 text-center">
                            {[
                                { label: 'To Solve', value: '4' },
                                { label: 'Solved', value: '5' },
                                { label: 'Due Revisions', value: '3' },
                                { label: 'Completed', value: '2' }
                            ].map((item, i) => (
                                <div key={i} className="flex flex-col items-center">
                                    <p className="text-[30px] font-bold text-[#e0e0e0] leading-none">{item.value}</p>
                                    <p className="text-[9px] font-[600] text-[#a0a0a0] uppercase mt-1.5">{item.label}</p>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* This Week Card */}
                    <Card className="bg-[#1a1a1a] border-[#2a2a2a] p-3.5 rounded-[10px]">
                        <p className="text-[11px] font-[600] text-[#a0a0a0] uppercase tracking-[0.5px] mb-2.5">This Week</p>
                        <p className="text-[20px] font-bold text-[#e0e0e0]">80% Complete</p>
                        <Progress value={80} className="h-[7px] bg-[#2a2a2a] my-3.5 rounded-[4px]" />
                        <div className="space-y-1.5 mt-3.5">
                            <p className="text-[11px] text-[#51cf66] flex items-center gap-1.5 font-[600]">
                                ✓ Ahead of schedule
                            </p>
                            <p className="text-[11px] text-[#a0a0a0]">ETA: 12 weeks left</p>
                        </div>
                    </Card>
                </div>

                {/* Daily Revisions Queue Section */}
                <Card className="bg-[#1a1a1a] border-[#2a2a2a] p-3.5 rounded-[10px]">
                    <div className="mb-3.5">
                        <h3 className="text-[16px] font-bold text-[#e0e0e0]">Today's Revisions Queue</h3>
                        <p className="text-[10px] text-[#a0a0a0] mt-0.5">3 new + 2 old questions</p>
                    </div>
                    <div className="space-y-[10px]">
                        {REVISIONS.map((item, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "flex justify-between items-center p-[10px] bg-[#0f0f0f] border-l-[3px] rounded-r-[4px] transition-all",
                                    item.completed ? "border-green-500 opacity-[0.7]" : "border-[#ff5757]"
                                )}
                            >
                                <div>
                                    <p className="text-[12px] font-bold text-[#e0e0e0]">{item.title}</p>
                                    <p className="text-[10px] text-[#a0a0a0] mt-0.5">{item.meta}</p>
                                </div>
                                <button
                                    className={cn(
                                        "h-auto text-[10px] font-[600] px-[10px] py-[5px] rounded-[4px] transition-all",
                                        item.completed
                                            ? "bg-green-500 text-white"
                                            : "bg-[#2a2a2a] text-[#a0a0a0] hover:bg-[#ff5757] hover:text-white"
                                    )}
                                >
                                    {item.completed ? '✓ Done' : 'Attempt'}
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 flex items-center justify-between">
                        <p className="text-[11px] text-[#a0a0a0]">2 completed today</p>
                        <Button className="bg-[#ff6b6b] text-white hover:bg-[#ff5252] text-[12px] font-[600] px-[18px] py-[8px] rounded-[6px] h-auto">
                            Start Revisions
                        </Button>
                    </div>
                </Card>

                {/* Weekly Performance Card */}
                <Card className="bg-[#1a1a1a] border-[#2a2a2a] p-3.5 rounded-[10px]">
                    <p className="text-[11px] font-[600] text-[#a0a0a0] uppercase tracking-[0.5px] mb-3.5">Weekly Performance</p>
                    <div className="flex gap-3.5">
                        {['W1', 'W2', 'W3', 'W4'].map((week, i) => (
                            <div
                                key={week}
                                className={cn(
                                    "flex-1 bg-[#0f0f0f] border border-[#2a2a2a] p-3 rounded-[8px] text-center",
                                    week === 'W3' && "border-[#ff6b6b] bg-[#ff6b6b]/10"
                                )}
                            >
                                <p className={cn("text-[15px] font-bold", week === 'W3' ? "text-[#ff6b6b]" : "text-[#e0e0e0]")}>{week}</p>
                                <p className="text-[10px] text-[#a0a0a0] mt-0.5 font-medium">{i * 20 + 20}%</p>
                            </div>
                        ))}
                    </div>
                    <div className="mt-5 text-center">
                        <p className="text-[11px] text-[#51cf66] font-[600]">Estimated finish: October 2025</p>
                        <p className="text-[11px] text-[#a0a0a0] mt-0.5 font-[600]">12 weeks remaining</p>
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
}

export const getStaticProps = async () => ({
    ...(await getPreFetchProps({ slug: routes.dsayatra.home, appId: "dsayatra" })),
    revalidate: PAGE_REFRESH_TIMEOUT.veryVeryLong,
});

export default Dashboard;
