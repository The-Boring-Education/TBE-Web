import {
  FlexContainer,
  LoadingSpinner,
  Text,
} from "@tbe/components";
import { routes } from "@tbe/constants";
import { useUser } from "@tbe/hooks";
import type { PrimaryCardWithCTAProps } from "@tbe/interface";
import { CACHE_TIMES, queryKeys, useQuery } from "@tbe/query";
import { cn, mapInterviewSheetResponseToCard, sendRequest } from "@tbe/utils";
import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  Folder,
  FolderOpen,
  Lock,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

import { MobileNav } from "@/components/MobileNav";
import OnCampusLearningLayout from "@/components/OnCampusLearningLayout";

const InterviewPrepDashboardPage = () => {
  const router = useRouter();
  const { user, loading: userLoading, isAuth } = useUser();

  const selectedRoadmap =
    typeof router.query.roadmap === "string"
      ? router.query.roadmap.toLowerCase()
      : "all";

  const { data: response, isLoading: sheetsLoading } = useQuery<any>({
    queryKey: queryKeys.interviewPrep.list({ roadmap: "all" }),
    queryFn: () =>
      sendRequest({
        url: `${routes.api.base}${routes.api.interviewPrep}`,
      }),
    ...CACHE_TIMES.STATIC,
  });

  const sheetsData = useMemo(() => {
    const payload = response?.data;
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
  }, [response]);

  const [purchaseStatuses, setPurchaseStatuses] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    if (!userLoading && !isAuth) {
      router.push("/login");
    }
  }, [userLoading, isAuth, router]);

  useEffect(() => {
    if (sheetsData.length > 0 && user?.id) {
      const checkPurchaseStatuses = async () => {
        const statuses: Record<string, boolean> = {};
        for (const sheet of sheetsData) {
          if (sheet.isPremium) {
            try {
              const res = await fetch(
                `${routes.api.base}${routes.api.checkStatus}?userId=${user.id}&productId=${sheet._id}`,
              );
              const result = await res.json();
              statuses[sheet._id] = result.status && result.data?.purchased;
            } catch {
              statuses[sheet._id] = false;
            }
          } else {
            statuses[sheet._id] = false;
          }
        }
        setPurchaseStatuses(statuses);
      };
      checkPurchaseStatuses();
    }
  }, [sheetsData, user?.id]);

  const sheets: PrimaryCardWithCTAProps[] = useMemo(() => {
    if (!sheetsData.length) return [];
    return sheetsData.map((sheet: any) => {
      const baseCard = mapInterviewSheetResponseToCard([sheet])[0];
      const isPurchased = purchaseStatuses[sheet._id] || false;
      return {
        ...baseCard,
        href: `/interview-sheets/${sheet.slug}`,
        isPurchased: sheet.isPremium ? isPurchased : false,
        isPremium: sheet.isPremium && !isPurchased,
      };
    });
  }, [sheetsData, purchaseStatuses]);

  const groupedByRoadmap = useMemo(() => {
    const groups: Record<string, PrimaryCardWithCTAProps[]> = {};
    sheetsData.forEach((sheet: any) => {
      let roadmap = sheet?.roadmap || "Tech";
      const title = (sheet.name || sheet.title || "").toLowerCase();
      const slug = sheet.slug?.toLowerCase() || "";
      if (
        title.includes("database") ||
        title.includes("dbms") ||
        title.includes("sql") ||
        slug.includes("database") ||
        slug.includes("dbms") ||
        slug.includes("sql")
      ) {
        roadmap = "Database";
      }
      if (!groups[roadmap]) groups[roadmap] = [];
      const card = sheets.find((c) => c.id === sheet._id);
      if (card) groups[roadmap].push(card);
    });
    return groups;
  }, [sheetsData, sheets]);

  const roadmapKeys = useMemo(() => {
    const keys = Object.keys(groupedByRoadmap).sort((a, b) => {
      const order = ["DSA", "Tech", "Frontend", "Database"];
      const indexA = order.indexOf(a);
      const indexB = order.indexOf(b);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.localeCompare(b);
    });
    return keys;
  }, [groupedByRoadmap]);

  const activeRoadmapLabel = useMemo(() => {
    if (selectedRoadmap === "all") return "All Sheets";
    const key = roadmapKeys.find((k) => k.toLowerCase() === selectedRoadmap);
    return key || "Interview Prep";
  }, [selectedRoadmap, roadmapKeys]);

  const visibleRoadmaps = useMemo(() => {
    if (selectedRoadmap === "all") return groupedByRoadmap;
    const entry = Object.entries(groupedByRoadmap).find(
      ([roadmap]) => roadmap.toLowerCase() === selectedRoadmap,
    );
    return entry ? { [entry[0]]: entry[1] } : {};
  }, [groupedByRoadmap, selectedRoadmap]);

  const handleRoadmapClick = (slug: string) => {
    if (slug === "all") {
      router.push("/interview-sheets");
    } else {
      router.push({ pathname: "/interview-sheets", query: { roadmap: slug } });
    }
  };

  const overallLoading = userLoading || sheetsLoading;

  if (overallLoading) {
    return (
      <OnCampusLearningLayout
        backHref={routes.oncampus.dashboard}
        layoutMode="workspace"
        isLoading
      >
        <div className="flex-1 flex items-center justify-center gap-3">
          <LoadingSpinner height={6} width={6} />
          <Text level="p" className="text-white/30 text-sm">Loading sheets…</Text>
        </div>
      </OnCampusLearningLayout>
    );
  }

  const hasSheets = sheets.length > 0;
  const totalSheets = sheets.length;

  return (
    <OnCampusLearningLayout
      backHref={routes.oncampus.dashboard}
      layoutMode="workspace"
    >
      <div className="flex flex-col h-full w-full items-center">

        {/* ── TOP HEADER ── */}
        <div className="w-full border-b border-white/[0.05] bg-[#080808] flex shrink-0" style={{ minHeight: 60 }}>
          {/* Left: sidebar header */}
          <div className="border-r border-white/[0.05] px-4 py-3 flex items-center justify-between shrink-0 w-full lg:w-[264px]">
            <div>
              <p className="text-[13px] font-bold text-white leading-tight">
                Interview Sheets
              </p>
              <p className="text-[9px] font-semibold text-white/30 uppercase tracking-widest mt-0.5">
                {totalSheets} sheet{totalSheets !== 1 ? "s" : ""} available
              </p>
            </div>
            {selectedRoadmap !== "all" && (
              <button
                onClick={() => handleRoadmapClick("all")}
                className="flex items-center justify-center w-7 h-7 rounded-lg border border-white/[0.07] bg-white/[0.03] text-zinc-400 hover:text-white hover:border-white/[0.14] transition-all shrink-0"
                title="Show all"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Right: active label */}
          <div className="hidden lg:flex flex-1 items-center px-6">
            <div>
              <p className="text-sm font-bold text-white leading-tight">
                {activeRoadmapLabel}
              </p>
              <p className="text-[10px] text-white/30 font-medium mt-0.5 uppercase tracking-wider">
                {selectedRoadmap === "all"
                  ? "Select a category or browse all"
                  : `Browsing ${activeRoadmapLabel} sheets`}
              </p>
            </div>
          </div>
        </div>

        {/* Mobile horizontal category scroll */}
        <div className="lg:hidden w-full border-b border-white/[0.05] bg-[#080808] shrink-0">
          <div className="flex items-center gap-2 overflow-x-auto px-3 py-2.5 scrollbar-none">
            <button
              onClick={() => handleRoadmapClick("all")}
              className={cn(
                "flex items-center gap-1.5 shrink-0 px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all duration-200 active:scale-95",
                selectedRoadmap === "all"
                  ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400"
                  : "bg-white/[0.03] border-white/[0.07] text-white/40 hover:text-white",
              )}
            >
              {selectedRoadmap === "all" ? (
                <FolderOpen className="w-3 h-3" />
              ) : (
                <Folder className="w-3 h-3" />
              )}
              All
            </button>
            {roadmapKeys.map((roadmap) => {
              const slug = roadmap.toLowerCase();
              const isActive = selectedRoadmap === slug;
              return (
                <button
                  key={roadmap}
                  onClick={() => handleRoadmapClick(slug)}
                  className={cn(
                    "flex items-center gap-1.5 shrink-0 px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all duration-200 active:scale-95",
                    isActive
                      ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400"
                      : "bg-white/[0.03] border-white/[0.07] text-white/40 hover:text-white",
                  )}
                >
                  {isActive ? (
                    <FolderOpen className="w-3 h-3" />
                  ) : (
                    <Folder className="w-3 h-3" />
                  )}
                  {roadmap}
                </button>
              );
            })}
          </div>
        </div>

        <FlexContainer
          direction="col"
          className="lg:flex-row flex-1 min-h-0 w-full"
          itemCenter={false}
          justifyCenter={false}
          wrap={false}
        >
          {/* ── DESKTOP LEFT SIDEBAR ── */}
          <div className="hidden lg:flex w-[264px] flex-shrink-0 border-r border-white/[0.05] flex-col bg-[#080808]">
            <div className="flex-1 overflow-y-auto px-2 py-3 scrollbar-thin-grey">
              <div className="space-y-0.5">
                {/* All option */}
                <button
                  onClick={() => handleRoadmapClick("all")}
                  className={cn(
                    "w-full group flex items-center gap-2.5 px-3 py-2.5 rounded-lg border transition-all duration-200 cursor-pointer text-left",
                    selectedRoadmap === "all"
                      ? "bg-indigo-500/8 border-indigo-500/20 text-white sheets-cat-item--active"
                      : "border-transparent bg-transparent hover:bg-white/[0.03] hover:border-white/[0.05] text-white/40 hover:text-white/70",
                  )}
                >
                  {selectedRoadmap === "all" ? (
                    <FolderOpen className="w-4 h-4 shrink-0 text-indigo-400" />
                  ) : (
                    <Folder className="w-4 h-4 shrink-0 text-white/25 group-hover:text-white/50 transition-colors" />
                  )}
                  <span className="text-[13px] font-semibold leading-none flex-1">
                    All Sheets
                  </span>
                  <span className={cn(
                    "text-[10px] font-bold tabular-nums px-1.5 py-0.5 rounded-full",
                    selectedRoadmap === "all"
                      ? "bg-indigo-500/15 text-indigo-400"
                      : "bg-white/[0.04] text-white/25",
                  )}>
                    {totalSheets}
                  </span>
                </button>

                {/* Divider */}
                <div className="my-2 border-t border-white/[0.04]" />

                {/* Category options */}
                {roadmapKeys.map((roadmap) => {
                  const slug = roadmap.toLowerCase();
                  const isActive = selectedRoadmap === slug;
                  const count = groupedByRoadmap[roadmap]?.length || 0;
                  return (
                    <button
                      key={roadmap}
                      onClick={() => handleRoadmapClick(slug)}
                      className={cn(
                        "w-full group flex items-center gap-2.5 px-3 py-2.5 rounded-lg border transition-all duration-200 cursor-pointer text-left sheets-cat-item",
                        isActive
                          ? "bg-indigo-500/8 border-indigo-500/20 text-white sheets-cat-item--active"
                          : "border-transparent bg-transparent hover:bg-white/[0.03] hover:border-white/[0.05] text-white/40 hover:text-white/70",
                      )}
                    >
                      {isActive ? (
                        <FolderOpen className="w-4 h-4 shrink-0 text-indigo-400" />
                      ) : (
                        <Folder className="w-4 h-4 shrink-0 text-white/25 group-hover:text-white/50 transition-colors" />
                      )}
                      <span className="text-[13px] font-semibold leading-none flex-1">
                        {roadmap}
                      </span>
                      <span className={cn(
                        "text-[10px] font-bold tabular-nums px-1.5 py-0.5 rounded-full",
                        isActive
                          ? "bg-indigo-500/15 text-indigo-400"
                          : "bg-white/[0.04] text-white/25",
                      )}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── MAIN CONTENT ── */}
          <div className="flex-1 flex flex-col lg:h-full w-full lg:overflow-y-auto bg-[#050505] p-4 lg:p-8 pb-[calc(5rem+env(safe-area-inset-bottom,0px))] lg:pb-10 scrollbar-thin-grey">
            {!hasSheets ? (
              <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] gap-3">
                <BookOpen className="w-10 h-10 text-white/10" />
                <Text level="p" className="text-white/30 text-sm">
                  No interview sheets available right now.
                </Text>
              </div>
            ) : (
              <div className="space-y-10 pb-10 max-w-5xl mx-auto w-full">
                {Object.entries(visibleRoadmaps).map(([roadmap, cards]) => (
                  <section key={roadmap}>
                    {/* Category heading */}
                    <div className="category-section-heading">
                      <div className="category-section-line" />
                      <span className="category-section-label">
                        {roadmap}
                      </span>
                      <div className="category-section-line" />
                    </div>

                    {/* Cards grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                      {cards.map((card) => {
                        const rawSheet = sheetsData.find(
                          (s: any) => s._id === card.id,
                        );
                        const isLocked = card.isPremium && !card.isPurchased;
                        return (
                          <Link
                            key={card.id}
                            href={card.href || `/interview-sheets/${rawSheet?.slug}`}
                            className="group block"
                          >
                            <div className={cn(
                              "relative h-full rounded-xl border p-4 transition-all duration-200",
                              "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.1]",
                              "hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99]",
                            )}>
                              {/* Premium badge */}
                              {isLocked && (
                                <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                                  <Lock className="w-2.5 h-2.5 text-amber-400" />
                                  <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider">
                                    Premium
                                  </span>
                                </div>
                              )}
                              {card.isPurchased && (
                                <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                  <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
                                  <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider">
                                    Purchased
                                  </span>
                                </div>
                              )}

                              {/* Card body */}
                              <div className="flex flex-col gap-2 pr-16">
                                <p className="text-[13px] font-bold text-white/85 leading-snug group-hover:text-white transition-colors line-clamp-2">
                                  {card.title}
                                </p>
                              </div>

                              {/* Footer */}
                              <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/[0.05]">
                                <span className="text-[10px] font-semibold text-white/25 uppercase tracking-wider">
                                  {roadmap}
                                </span>
                                <ChevronRight className="w-3.5 h-3.5 text-white/20 group-hover:text-white/50 group-hover:translate-x-0.5 transition-all" />
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </div>
        </FlexContainer>

        {/* Mobile bottom nav */}
        <MobileNav />
      </div>
    </OnCampusLearningLayout>
  );
};

export default InterviewPrepDashboardPage;
