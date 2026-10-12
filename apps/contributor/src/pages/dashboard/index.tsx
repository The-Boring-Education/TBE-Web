import { useAuth } from "@tbe/auth";
import {
  Award,
  BookOpen,
  BookOpenCheck,
  Calendar,
  Code,
  Code2,
  FileText,
  Gift,
  Globe,
  Instagram,
  LayoutDashboard,
  LogOut,
  MoreVertical,
  Plus,
  Rocket,
  Scroll,
  Sparkles,
  Users,
  X,
  Youtube,
} from "lucide-react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { LANDING } from "@/config/landing";
import {
  createContributionSubmission,
  fetchContributorProfile,
  fetchMySubmissions,
} from "@/utils/api";

interface ContributorProfile {
  name: string;
  email: string;
  avatar?: string;
  role: string;
  totalXp: number;
  approvedCount: number;
  pendingCount: number;
  isCaptain: boolean;
}

interface SubmissionItem {
  _id: string;
  category: string;
  title: string;
  proofUrl: string;
  description?: string;
  standardXp: number;
  awardedXp: number;
  status: "pending" | "approved" | "rejected";
  adminFeedback?: string;
  createdAt: string;
}

const CATEGORIES = [
  { key: "PR_BUG_FIX", label: "Pull Request / Bug Fix (+5 XP)", base: "Code" },
  {
    key: "CREATE_ISSUE",
    label: "Create Issue / Bug Report (+3 XP)",
    base: "Code",
  },
  { key: "REVIEW_PR", label: "Review a PR (+2 XP)", base: "Code" },
  { key: "POST", label: "Social Media Post (+5 XP)", base: "Content" },
  {
    key: "EVENT_SESSION",
    label: "Organize Event / Session (+15 XP)",
    base: "Community",
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const {
    user,
    isAuthenticated,
    isLoading: authLoading,
    signIn,
    signOut,
  } = useAuth();

  const [currentTab, setCurrentTab] = useState<"dashboard" | "guidelines">(
    "dashboard",
  );
  const [profile, setProfile] = useState<ContributorProfile | null>(null);
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  // Submit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formCategory, setFormCategory] = useState("PR_BUG_FIX");
  const [formTitle, setFormTitle] = useState("");
  const [formProofUrl, setFormProofUrl] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formError, setFormError] = useState("");
  const [activeItemDetails, setActiveItemDetails] =
    useState<SubmissionItem | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [profileRes, subsRes] = await Promise.all([
        fetchContributorProfile(),
        fetchMySubmissions(),
      ]);

      if (profileRes.status && profileRes.data) {
        setProfile(profileRes.data);
      }
      if (subsRes.status && subsRes.data) {
        setSubmissions(subsRes.data);
      }
    } catch (err) {
      console.error("Failed to load contributor data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const handleSubmitContribution = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formTitle.trim() || !formProofUrl.trim()) {
      setFormError("Title and Proof URL are required.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await createContributionSubmission({
        category: formCategory,
        title: formTitle,
        proofUrl: formProofUrl,
        description: formDescription,
      });

      if (res.status) {
        setIsModalOpen(false);
        setFormTitle("");
        setFormProofUrl("");
        setFormDescription("");
        await loadData();
      } else {
        setFormError(res.message || "Failed to submit contribution.");
      }
    } catch {
      setFormError("An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const getFilteredSubmissions = () => {
    if (activeFilter === "All") return submissions;
    if (activeFilter === "Code") {
      return submissions.filter((s) =>
        ["PR_BUG_FIX", "CREATE_ISSUE", "REVIEW_PR"].includes(s.category),
      );
    }
    if (activeFilter === "Content") {
      return submissions.filter((s) => s.category === "POST");
    }
    if (activeFilter === "Community") {
      return submissions.filter((s) => s.category === "EVENT_SESSION");
    }
    if (activeFilter === "Blogs") {
      return submissions.filter(
        (s) =>
          s.title.toLowerCase().includes("blog") ||
          (s.description && s.description.toLowerCase().includes("blog")),
      );
    }
    return submissions;
  };

  const getItemCategoryLabel = (category: string) => {
    switch (category) {
      case "PR_BUG_FIX":
      case "CREATE_ISSUE":
      case "REVIEW_PR":
        return "Code";
      case "POST":
        return "Content";
      case "EVENT_SESSION":
        return "Community";
      default:
        return "General";
    }
  };

  const getItemIcon = (item: SubmissionItem) => {
    const url = (item.proofUrl || "").toLowerCase();

    if (url.includes("instagram.com")) {
      return (
        <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center">
          <Instagram className="w-5 h-5" />
        </div>
      );
    }
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      return (
        <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
          <Youtube className="w-5 h-5" />
        </div>
      );
    }
    if (url.includes("github.com") || item.category === "PR_BUG_FIX") {
      return (
        <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
          <Code className="w-5 h-5" />
        </div>
      );
    }
    if (item.category === "EVENT_SESSION") {
      return (
        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
          <Users className="w-5 h-5" />
        </div>
      );
    }
    return (
      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
        <FileText className="w-5 h-5" />
      </div>
    );
  };

  const getStatusBadge = (status: string, awardedXp?: number) => {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600">
            Approved {awardedXp ? `(+${awardedXp} XP)` : ""}
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600">
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-600">
            Pending
          </span>
        );
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-[#EA4544] rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const currentXp = profile?.totalXp || 0;
  const progressPercent = Math.min(100, Math.round((currentXp / 100) * 100));
  const displayName = profile?.name || user?.name || "Contributor";
  const firstName = displayName.split(" ")[0];
  const roleName = profile?.isCaptain ? "TBE Captain" : "TBE Contributor";

  return (
    <>
      <Head>
        <title>Dashboard – TBE Contributor Program</title>
      </Head>

      <div className="min-h-screen bg-[#FBFBFB] flex">
        {/* Left Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-100 flex flex-col justify-between shrink-0 min-h-screen sticky top-0 h-screen">
          <div className="p-6">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 mb-8 group">
              <Image
                src={LANDING.assets.logo}
                alt="The Boring Education Logo"
                width={36}
                height={28}
                className="h-8 w-auto object-contain transition-transform group-hover:scale-105"
                priority
              />
              <div className="border-l border-gray-300 pl-2.5">
                <span className="text-sm font-bold text-gray-900 leading-tight block">
                  The Boring Education
                </span>
                <span className="text-[11px] text-gray-400 block font-normal">
                  Contributor
                </span>
              </div>
            </Link>

            {/* Navigation Menu */}
            <nav className="space-y-1.5">
              <button
                onClick={() => setCurrentTab("dashboard")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition ${
                  currentTab === "dashboard"
                    ? "bg-[#FFF0F0] text-[#EA4544]"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <LayoutDashboard className="w-5 h-5 text-[#EA4544]" />
                Dashboard
              </button>

              <button
                onClick={() => setCurrentTab("guidelines")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition ${
                  currentTab === "guidelines"
                    ? "bg-[#FFF0F0] text-[#EA4544]"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <BookOpenCheck className="w-5 h-5 text-gray-400" />
                Guidelines & XP
              </button>

              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium text-sm transition text-left"
              >
                <FileText className="w-5 h-5 text-gray-400" />
                Submit Contribution
              </button>

              <button
                onClick={() => {
                  setCurrentTab("dashboard");
                  setTimeout(() => {
                    const el = document.getElementById("your-contributions");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }, 50);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium text-sm transition text-left"
              >
                <Calendar className="w-5 h-5 text-gray-400" />
                My Contributions
              </button>
            </nav>
          </div>

          {/* User Profile at bottom */}
          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 transition group">
              <div className="flex items-center gap-3 min-w-0">
                {profile?.avatar || user?.image ? (
                  <img
                    src={profile?.avatar || user?.image}
                    alt={displayName}
                    className="w-10 h-10 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-red-100 text-[#EA4544] flex items-center justify-center font-bold text-sm shrink-0">
                    {displayName.charAt(0)}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">
                    {displayName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{roleName}</p>
                </div>
              </div>
              <button
                onClick={() => signOut("/login")}
                title="Sign out"
                className="text-gray-400 hover:text-[#EA4544] transition p-1"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-8 max-w-6xl overflow-y-auto">
          {currentTab === "dashboard" ? (
            <>
              {/* Header Greeting Banner */}
              <div className="bg-white rounded-3xl border border-gray-100 p-8 mb-6 relative overflow-hidden flex items-center justify-between shadow-sm">
                <div className="max-w-xl z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-block bg-[#FFEAE8] text-[#EA4544] text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      TBE CONTRIBUTOR
                    </span>
                    <button
                      onClick={() => setCurrentTab("guidelines")}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-500 hover:text-[#EA4544] transition bg-gray-100 hover:bg-red-50 px-2.5 py-1 rounded-full"
                    >
                      <Sparkles className="w-3 h-3 text-[#EA4544]" />
                      XP Guidelines
                    </button>
                  </div>
                  <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
                    Hey <span className="text-[#EA4544]">{firstName}!</span> 👋
                  </h1>
                  <p className="text-gray-600 text-sm font-medium">
                    Keep building, sharing and growing with TBE.
                  </p>
                </div>

                {/* Illustration */}
                <div className="hidden md:block w-72 h-44 relative shrink-0">
                  <Image
                    src={LANDING.assets.heroIllustration}
                    alt="TBE Contributor Illustration"
                    fill
                    className="object-contain object-right"
                    priority
                  />
                </div>
              </div>

              {/* Middle Two Cards Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Card 1: Level & XP Progress */}
                <div className="bg-white rounded-3xl border border-gray-100 p-6 flex flex-col justify-between shadow-sm">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-100 to-rose-50 text-[#EA4544] flex items-center justify-center shrink-0 border border-red-100">
                      <BookOpen className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Your Current Level
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <h2 className="text-xl font-extrabold text-gray-900">
                          {roleName}
                        </h2>
                        <span className="bg-[#EA4544] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                          {profile?.isCaptain ? "Captain" : "Level 1"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden mb-2">
                      <div
                        className="bg-[#EA4544] h-full rounded-full transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-xs font-semibold text-gray-500">
                      <span>{progressPercent}% completed</span>
                      <span className="text-gray-900 font-bold">
                        {currentXp} / 100 XP
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card 2: Quick Action Submit a Contribution */}
                <div className="bg-white rounded-3xl border border-gray-100 p-6 flex flex-col justify-between shadow-sm">
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-[#FFF0F0] text-[#EA4544] flex items-center justify-center mb-3">
                      <FileText className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Submit a Contribution
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                      Share your blogs, code, content or anything valuable with
                      the TBE community.
                    </p>
                  </div>

                  <div className="mt-4 flex items-center gap-3">
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="inline-flex items-center gap-2 bg-[#EA4544] hover:bg-[#d93837] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition shadow-sm"
                    >
                      Submit Contribution →
                    </button>
                    <button
                      onClick={() => setCurrentTab("guidelines")}
                      className="text-xs font-semibold text-gray-600 hover:text-gray-900 px-3 py-2 rounded-xl hover:bg-gray-50 transition"
                    >
                      View Rules
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Card: Your Contributions List */}
              <div
                id="your-contributions"
                className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                  <h2 className="text-xl font-bold text-gray-900">
                    Your Contributions
                  </h2>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {["All", "Blogs", "Code", "Content", "Community"].map(
                      (tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveFilter(tab)}
                          className={`text-xs px-3.5 py-1.5 rounded-full font-medium transition ${
                            activeFilter === tab
                              ? "bg-[#FFEAE8] text-[#EA4544] font-bold"
                              : "text-gray-500 hover:bg-gray-100"
                          }`}
                        >
                          {tab}
                        </button>
                      ),
                    )}
                  </div>
                </div>

                {/* List */}
                {loading ? (
                  <div className="py-12 text-center text-sm text-gray-400">
                    Loading your contributions...
                  </div>
                ) : getFilteredSubmissions().length === 0 ? (
                  <div className="py-12 text-center">
                    <p className="text-sm text-gray-500 mb-3">
                      No contributions found for this category.
                    </p>
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="text-xs font-semibold text-[#EA4544] hover:underline"
                    >
                      + Submit a new contribution
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {getFilteredSubmissions().map((item) => (
                      <div
                        key={item._id}
                        className="py-4 flex items-center justify-between gap-4 hover:bg-gray-50/50 px-2 rounded-xl transition"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          {getItemIcon(item)}
                          <div className="min-w-0">
                            <a
                              href={item.proofUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sm font-bold text-gray-900 hover:text-[#EA4544] transition truncate block"
                            >
                              {item.title}
                            </a>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[11px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                                {getItemCategoryLabel(item.category)}
                              </span>
                              <span className="text-xs text-gray-400">•</span>
                              <span className="text-xs text-gray-400">
                                {formatDate(item.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          {getStatusBadge(item.status, item.awardedXp)}
                          <button
                            onClick={() => setActiveItemDetails(item)}
                            className="text-gray-400 hover:text-gray-700 p-1 rounded-lg transition"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Guidelines Tab View */
            <div className="space-y-6">
              {/* Header banner */}
              <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <span className="inline-block bg-[#FFEAE8] text-[#EA4544] text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3">
                    OFFICIAL GUIDELINES
                  </span>
                  <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
                    TBE Contributor Guidelines & XP Rules
                  </h1>
                  <p className="text-sm text-gray-600 max-w-xl">
                    Contributors earn XP based on quality, effort, and impact.
                    Reach 100 XP to become an official TBE Captain!
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center gap-2 bg-[#EA4544] hover:bg-[#d93837] text-white text-sm font-semibold px-6 py-3 rounded-2xl transition shadow-sm shrink-0"
                >
                  <Plus className="w-4 h-4" /> Submit Contribution
                </button>
              </div>

              {/* Two Tracks Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 💻 Code Track */}
                <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                  <div className="flex items-center gap-3 pb-4 mb-4 border-b border-gray-100">
                    <div className="w-10 h-10 rounded-xl bg-red-50 text-[#EA4544] flex items-center justify-center">
                      <Code2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">
                        💻 Code Track
                      </h2>
                      <p className="text-xs text-gray-500">
                        For developers and technical builders
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {[
                      { action: "Find a valid bug", xp: "+3 XP" },
                      { action: "Fix a small bug", xp: "+5 XP" },
                      { action: "Fix a medium bug", xp: "+10 XP" },
                      { action: "Small UI/UX improvement", xp: "+5 XP" },
                      { action: "Small feature", xp: "+10 XP" },
                      { action: "Medium feature", xp: "+15 XP" },
                      { action: "Major feature", xp: "+25 XP" },
                      { action: "Merged PR", xp: "+5 XP" },
                      { action: "Documentation improvement", xp: "+3 XP" },
                      { action: "Write / improve tests", xp: "+5 XP" },
                      {
                        action: "Technical help to another contributor",
                        xp: "+2 XP",
                      },
                      {
                        action: "Major code/performance improvement",
                        xp: "+10–20 XP",
                      },
                    ].map((row, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between text-xs py-1.5 px-3 rounded-lg hover:bg-gray-50"
                      >
                        <span className="text-gray-700 font-medium">
                          {row.action}
                        </span>
                        <span className="font-bold text-[#EA4544] bg-red-50 px-2 py-0.5 rounded-full">
                          {row.xp}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 🌐 Community Track */}
                <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                  <div className="flex items-center gap-3 pb-4 mb-4 border-b border-gray-100">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">
                        🌐 Community Track
                      </h2>
                      <p className="text-xs text-gray-500">
                        For creators, community leaders, and mentors
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {[
                      { action: "Start a meaningful discussion", xp: "+3 XP" },
                      { action: "Lead a meaningful conversation", xp: "+5 XP" },
                      {
                        action: "Create useful content (YT, LinkedIn, etc.)",
                        xp: "+5 XP",
                      },
                      { action: "Help a new contributor", xp: "+3 XP" },
                      {
                        action: "Organise a small online session",
                        xp: "+10–20 XP",
                      },
                      {
                        action: "Organise a small college event",
                        xp: "+30 XP",
                      },
                      {
                        action: "Run a successful campaign/initiative",
                        xp: "+10–20 XP",
                      },
                    ].map((row, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between text-xs py-2 px-3 rounded-lg hover:bg-gray-50"
                      >
                        <span className="text-gray-700 font-medium">
                          {row.action}
                        </span>
                        <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                          {row.xp}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* ⭐ XP Rules box */}
                  <div className="mt-6 pt-5 border-t border-gray-100 bg-[#FAF9F6] p-4 rounded-2xl">
                    <h3 className="text-xs font-bold text-gray-900 mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />⭐ Core
                      XP Rules
                    </h3>
                    <ul className="text-[11px] text-gray-600 space-y-1.5 list-disc list-inside">
                      <li>
                        XP is based on{" "}
                        <strong>quality, effort, and impact</strong>.
                      </li>
                      <li>Low-effort or spam activity will not count.</li>
                      <li>
                        Repeating the same basic activity will not give
                        unlimited XP.
                      </li>
                      <li>
                        Major contributions can receive{" "}
                        <strong>bonus XP</strong> from reviewers.
                      </li>
                      <li>
                        For bigger contributions, share proof or results with
                        your submission.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* 🏆 TBE Captain Milestone Card */}
              <div className="bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white rounded-3xl p-8 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-[#EA4544]/20 rounded-full blur-3xl pointer-events-none" />

                <div className="max-w-2xl">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-[#EA4544] text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      MILESTONE
                    </span>
                    <span className="text-amber-400 font-bold text-xs flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" /> 100 XP
                    </span>
                  </div>

                  <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-2">
                    Become a TBE Captain 🏆
                  </h2>
                  <p className="text-gray-400 text-xs md:text-sm mb-6">
                    Reach 100 XP across any combination of Code and Community
                    contributions to become a recognized TBE Captain.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-xl p-3">
                      <Award className="w-4 h-4 text-[#EA4544] shrink-0" />
                      <span className="text-gray-200">
                        Official TBE recognition
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-xl p-3">
                      <Scroll className="w-4 h-4 text-amber-400 shrink-0" />
                      <span className="text-gray-200">
                        TBE Captain Certificate
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-xl p-3">
                      <Gift className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="text-gray-200">
                        Exclusive TBE Swag pack
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-xl p-3">
                      <Rocket className="w-4 h-4 text-blue-400 shrink-0" />
                      <span className="text-gray-200">
                        Opportunity to lead initiatives
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Submission Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">
                Submit a Contribution
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleSubmitContribution}
              className="mt-4 space-y-4"
            >
              {formError && (
                <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-medium">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">
                  Category
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#EA4544] bg-white"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.key} value={cat.key}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">
                  Contribution Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Fixed typo in DSA Sheet"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#EA4544]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">
                  Proof URL (PR link, LinkedIn, YouTube, etc.)
                </label>
                <input
                  type="url"
                  placeholder="https://github.com/... or https://linkedin.com/..."
                  value={formProofUrl}
                  onChange={(e) => setFormProofUrl(e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#EA4544]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">
                  Optional Notes / Context
                </label>
                <textarea
                  rows={3}
                  placeholder="Any details you'd like the reviewer to know..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#EA4544]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 text-xs font-semibold bg-[#EA4544] hover:bg-[#d93837] text-white rounded-xl transition disabled:opacity-50 shadow-sm"
                >
                  {submitting ? "Submitting..." : "Submit Contribution"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Item Details Modal */}
      {activeItemDetails && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-gray-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">
                Contribution Details
              </h3>
              <button
                onClick={() => setActiveItemDetails(null)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-sm">
              <div>
                <p className="text-xs text-gray-500">Title</p>
                <p className="font-bold text-gray-900">
                  {activeItemDetails.title}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Status</p>
                <div className="mt-1">
                  {getStatusBadge(
                    activeItemDetails.status,
                    activeItemDetails.awardedXp,
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500">Proof URL</p>
                <a
                  href={activeItemDetails.proofUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-blue-600 hover:underline break-all"
                >
                  {activeItemDetails.proofUrl}
                </a>
              </div>

              {activeItemDetails.description && (
                <div>
                  <p className="text-xs text-gray-500">Description</p>
                  <p className="text-xs text-gray-700 bg-gray-50 p-2.5 rounded-xl mt-1">
                    {activeItemDetails.description}
                  </p>
                </div>
              )}

              {activeItemDetails.adminFeedback && (
                <div>
                  <p className="text-xs font-bold text-gray-700">
                    Reviewer Feedback
                  </p>
                  <p className="text-xs text-gray-800 bg-amber-50/70 border border-amber-200 p-2.5 rounded-xl mt-1">
                    {activeItemDetails.adminFeedback}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setActiveItemDetails(null)}
                className="px-4 py-2 text-xs font-semibold bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
