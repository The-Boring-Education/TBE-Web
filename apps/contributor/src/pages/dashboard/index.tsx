import { useAuth } from "@tbe/auth";
import {
  BookOpen,
  Calendar,
  ChevronRight,
  Code,
  FileText,
  Home,
  Instagram,
  MoreVertical,
  Users,
  Youtube,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";

import {
  fetchContributorProfile,
  fetchUserSubmissions,
} from "@/api/contributor";
import SubmitContributionModal from "@/components/SubmitContributionModal";
import { LANDING } from "@/config/landing";

interface ContributorData {
  name: string;
  email: string;
  role: string;
  totalXp: number;
  approvedCount: number;
  pendingCount: number;
  isCaptain: boolean;
  avatar?: string;
}

interface ContributionItem {
  _id: string;
  category: string;
  typeGroup: "blogs" | "code" | "content" | "community";
  title: string;
  proofUrl: string;
  standardXp: number;
  awardedXp: number;
  status: "pending" | "approved" | "rejected";
  adminFeedback?: string;
  createdAt: string;
}

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<ContributorData | null>(null);
  const [submissions, setSubmissions] = useState<ContributionItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const activeRequestId = useRef(0);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, router]);

  const loadData = async (typeGroup = activeFilter, targetPage = 1) => {
    setLoadingData(true);
    setFetchError(null);
    const reqId = ++activeRequestId.current;

    try {
      const [profileResult, subsResult] = await Promise.allSettled([
        fetchContributorProfile(),
        fetchUserSubmissions(typeGroup, targetPage),
      ]);

      if (reqId !== activeRequestId.current) return;

      if (profileResult.status === "fulfilled" && profileResult.value.status) {
        setProfile(profileResult.value.data);
      }

      if (subsResult.status === "fulfilled" && subsResult.value.status) {
        setSubmissions(subsResult.value.data?.items || []);
        setTotalPages(subsResult.value.data?.totalPages || 1);
        setPage(targetPage);
      } else if (subsResult.status === "rejected") {
        setFetchError("Failed to load submissions. Please retry.");
      }
    } catch {
      if (reqId === activeRequestId.current) {
        setFetchError("Failed to load dashboard data. Please retry.");
      }
    } finally {
      if (reqId === activeRequestId.current) {
        setLoadingData(false);
      }
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      setPage(1);
      loadData(activeFilter, 1);
    }
  }, [isAuthenticated, activeFilter]);

  if (isLoading || (!isAuthenticated && !profile)) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 text-gray-500 text-sm">
        Loading dashboard...
      </div>
    );
  }

  const firstName =
    profile?.name?.split(" ")[0] || user?.name?.split(" ")[0] || "Contributor";
  const totalXp = profile?.totalXp || 0;
  const isCaptain = profile?.isCaptain || totalXp >= 100;
  const xpProgress = Math.min(100, isCaptain ? 100 : totalXp);

  const getCategoryIcon = (category: string, typeGroup: string) => {
    if (typeGroup === "code" || category === "PR_BUG_FIX") {
      return (
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
          <Code className="h-5 w-5" />
        </div>
      );
    }
    if (typeGroup === "blogs" || category === "BLOG") {
      return (
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <FileText className="h-5 w-5" />
        </div>
      );
    }
    if (category === "POST") {
      return (
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-50 text-pink-600">
          <Instagram className="h-5 w-5" />
        </div>
      );
    }
    if (typeGroup === "community" || category === "EVENT_SESSION") {
      return (
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
          <Users className="h-5 w-5" />
        </div>
      );
    }
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
        <Youtube className="h-5 w-5" />
      </div>
    );
  };

  const getStatusBadge = (item: ContributionItem) => {
    if (item.status === "approved") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
          <span>Approved</span>
          <span className="rounded bg-emerald-100/80 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
            +{item.awardedXp || item.standardXp} XP
          </span>
        </span>
      );
    }
    if (item.status === "rejected") {
      return (
        <span
          title={item.adminFeedback || "Rejected"}
          className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 cursor-help"
        >
          Rejected
        </span>
      );
    }
    return (
      <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-600">
        Pending
      </span>
    );
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
      return "Recent";
    }
  };

  return (
    <div className="flex min-h-screen bg-[#FBFBFC]">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-gray-100 bg-white p-6 flex flex-col justify-between hidden md:flex">
        <div>
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 mb-10">
            <Image
              src={LANDING.assets.logo}
              alt="TBE"
              width={36}
              height={28}
              className="h-8 w-auto object-contain"
            />
            <span className="text-sm font-bold text-gray-900 leading-tight">
              The Boring Education
            </span>
          </Link>

          {/* Navigation */}
          <nav className="space-y-1.5">
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-[#EF4444]"
            >
              <Home className="h-4 w-4" />
              <span>Dashboard</span>
            </button>

            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              <FileText className="h-4 w-4" />
              <span>Submit Contribution</span>
            </button>

            <a
              href="#contributions"
              className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              <Calendar className="h-4 w-4" />
              <span>My Contributions</span>
            </a>
          </nav>
        </div>

        {/* Profile Card Footer */}
        <div className="flex items-center justify-between rounded-2xl border border-gray-100 p-3 bg-gray-50/50">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="h-9 w-9 rounded-full bg-red-100 flex items-center justify-center overflow-hidden flex-shrink-0 text-red-600 font-bold text-xs">
              {profile?.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                firstName[0]
              )}
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-gray-900 truncate">
                {profile?.name || user?.name || "Contributor"}
              </p>
              <p className="text-[10px] text-gray-500 font-medium">
                {profile?.role || "TBE Contributor"}
              </p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 max-w-6xl mx-auto w-full">
        {/* Header Hero */}
        <div className="mb-8">
          <span className="inline-block rounded-full bg-red-50 px-3 py-1 text-[11px] font-bold tracking-wider text-[#EF4444] uppercase mb-2">
            TBE CONTRIBUTOR
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
            Hey <span className="text-[#EF4444]">{firstName}!</span> 👋
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">
            Keep building, sharing and growing with TBE.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {/* Card 1: Level & XP */}
          <div className="rounded-3xl border border-red-100/60 bg-red-50/30 p-6 flex flex-col justify-between">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EF4444] text-white shadow-md shadow-red-200">
                <BookOpen className="h-7 w-7" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500">
                  Your Current Level
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <h3 className="text-xl font-extrabold text-gray-900">
                    {isCaptain ? "TBE Captain" : "TBE Contributor"}
                  </h3>
                  <span className="rounded-full bg-[#EF4444] px-2.5 py-0.5 text-[10px] font-bold text-white uppercase">
                    {isCaptain ? "Captain" : "Level 1"}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-bold text-gray-700 mb-2">
                <span>XP Progress</span>
                <span>{totalXp} / 100 XP</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-red-100/80 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#EF4444] transition-all duration-500"
                  style={{ width: `${xpProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Card 2: Submit Action CTA */}
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm flex flex-col justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-[#EF4444] flex-shrink-0">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-gray-900">
                  Submit a Contribution
                </h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  Share your blogs, code, content or anything valuable with the
                  TBE community.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#EF4444] px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#DC2626] active:scale-[0.99] transition-all"
            >
              <span>Submit Contribution</span>
              <span>→</span>
            </button>
          </div>
        </div>

        {/* Contributions List Section */}
        <section
          id="contributions"
          className="rounded-3xl bg-white border border-gray-100 p-6 md:p-8 shadow-sm"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">
              Your Contributions
            </h2>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {["all", "blogs", "code", "content", "community"].map(
                (filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setActiveFilter(filter)}
                    className={`rounded-full px-4 py-1.5 text-xs font-semibold capitalize transition-all ${
                      activeFilter === filter
                        ? "bg-red-50 text-[#EF4444]"
                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    {filter}
                  </button>
                ),
              )}
            </div>
          </div>

          {/* Table / List */}
          <div className="divide-y divide-gray-50 mt-2">
            {fetchError ? (
              <div className="py-12 text-center">
                <p className="text-sm font-semibold text-red-600">
                  {fetchError}
                </p>
                <button
                  type="button"
                  onClick={() => loadData(activeFilter, page)}
                  className="mt-2 rounded-xl bg-gray-900 px-4 py-2 text-xs font-semibold text-white hover:bg-black"
                >
                  Retry
                </button>
              </div>
            ) : loadingData ? (
              <div className="py-12 text-center text-sm text-gray-400">
                Loading contributions...
              </div>
            ) : submissions.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm font-semibold text-gray-600">
                  No contributions yet
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Click Submit Contribution above to make your first submission.
                </p>
              </div>
            ) : (
              <>
                {submissions.map((sub) => (
                  <div
                    key={sub._id}
                    className="flex items-center justify-between py-4 group hover:bg-gray-50/50 rounded-xl px-2 transition-colors border-b border-gray-50 last:border-b-0"
                  >
                    <div className="flex items-center gap-3.5 min-w-0 pr-4">
                      {getCategoryIcon(sub.category, sub.typeGroup)}
                      <div className="min-w-0">
                        <a
                          href={sub.proofUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-bold text-gray-900 hover:text-[#EF4444] transition-colors truncate block"
                        >
                          {sub.title}
                        </a>
                        {sub.adminFeedback && sub.status === "rejected" && (
                          <details className="mt-1 text-[11px] text-red-500">
                            <summary className="cursor-pointer font-medium hover:underline inline-flex items-center gap-1">
                              <span>Reviewer Feedback Note</span>
                            </summary>
                            <p className="mt-1 p-2 rounded-lg bg-red-50 border border-red-100 text-red-700">
                              {sub.adminFeedback}
                            </p>
                          </details>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 flex-shrink-0">
                      <span className="hidden sm:inline-block rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] font-semibold text-gray-600 capitalize">
                        {sub.typeGroup}
                      </span>
                      <span className="text-xs text-gray-400 font-medium hidden md:inline">
                        {formatDate(sub.createdAt)}
                      </span>
                      {getStatusBadge(sub)}
                      <button
                        type="button"
                        className="text-gray-400 hover:text-gray-600 p-1"
                        aria-label="More options"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {totalPages > 1 && (
                  <div className="flex items-center justify-between border-t border-gray-100 px-2 py-3 mt-4 text-xs font-medium text-gray-500">
                    <button
                      type="button"
                      disabled={page <= 1 || loadingData}
                      onClick={() => {
                        const prev = Math.max(1, page - 1);
                        setPage(prev);
                        loadData(activeFilter, prev);
                      }}
                      className="rounded-lg border border-gray-200 px-3 py-1.5 hover:bg-gray-50 disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <span>
                      Page {page} of {totalPages}
                    </span>
                    <button
                      type="button"
                      disabled={page >= totalPages || loadingData}
                      onClick={() => {
                        const next = Math.min(totalPages, page + 1);
                        setPage(next);
                        loadData(activeFilter, next);
                      }}
                      className="rounded-lg border border-gray-200 px-3 py-1.5 hover:bg-gray-50 disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>

      {/* Submission Modal */}
      <SubmitContributionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => loadData(activeFilter)}
      />
    </div>
  );
}
