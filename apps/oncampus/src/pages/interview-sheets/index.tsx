import { FlexContainer, LoadingSpinner, Text } from "@tbe/components";
import { routes } from "@tbe/constants";
import { useUser } from "@tbe/hooks";
import type { PrimaryCardWithCTAProps, SheetPageProps } from "@tbe/interface";
import { CACHE_TIMES, queryKeys, useQuery } from "@tbe/query";
import {
  cn,
  getSheetPageProps,
  mapInterviewSheetResponseToCard,
  sendRequest,
} from "@tbe/utils";
import {
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

import { InterviewSheetWorkspace } from "@/components/InterviewSheetWorkspace";
import { MobileNav } from "@/components/MobileNav";
import OnCampusLearningLayout from "@/components/OnCampusLearningLayout";

const InterviewPrepDashboardPage = (props: SheetPageProps) => {
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
        href: {
          pathname: "/interview-sheets",
          query: { topic: sheet.slug },
        },
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

  // Flat list of cards for the selected roadmap (or all)
  const visibleSheets = useMemo(() => {
    if (selectedRoadmap === "all") return sheets;
    const matchedRoadmap = roadmapKeys.find(
      (k) => k.toLowerCase() === selectedRoadmap,
    );
    return matchedRoadmap ? (groupedByRoadmap[matchedRoadmap] ?? []) : [];
  }, [sheets, selectedRoadmap, roadmapKeys, groupedByRoadmap]);

  const handleRoadmapClick = (slug: string) => {
    if (slug === "all") {
      router.push("/interview-sheets");
    } else {
      router.push({ pathname: "/interview-sheets", query: { roadmap: slug } });
    }
  };

  const overallLoading = userLoading || sheetsLoading;

  // If a topic is selected, render the workspace
  if (router.query.topic && props.sheet) {
    return <InterviewSheetWorkspace {...props} />;
  }

  if (overallLoading) {
    return (
      <OnCampusLearningLayout
        backHref={routes.oncampus.dashboard}
        layoutMode="workspace"
        isLoading
      >
        <div className="flex-1 flex items-center justify-center gap-3">
          <LoadingSpinner height={6} width={6} />
          <Text level="p" className="text-white/30 text-sm">
            Loading sheets…
          </Text>
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
        <div
          className="w-full border-b border-white/[0.05] bg-[#080808] flex shrink-0"
          style={{ minHeight: 60 }}
        >
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
          </div>

          {/* Right: active label */}
          <div className="hidden lg:flex flex-1 items-center px-6">
            <div>
              <p className="text-sm font-bold text-white leading-tight">
                {selectedRoadmap === "all"
                  ? "Interview Sheets"
                  : `${activeRoadmapLabel} Interview Sheets`}
              </p>
              <p className="text-[10px] text-white/30 font-medium mt-0.5 uppercase tracking-wider">
                {selectedRoadmap === "all"
                  ? "Browse all available sheets"
                  : `Browsing ${activeRoadmapLabel} sheets`}
              </p>
            </div>
          </div>
        </div>

        {/* Mobile category pills (wrapped, no horizontal scroll) */}
        <div className="lg:hidden w-full border-b border-white/[0.05] bg-[#080808] shrink-0">
          <div className="flex flex-wrap items-center gap-1.5 px-3 py-2">
            <button
              onClick={() => handleRoadmapClick("all")}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all duration-200 active:scale-95",
                selectedRoadmap === "all"
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "bg-white/[0.03] border-white/[0.07] text-white/40 hover:text-white",
              )}
            >
              {selectedRoadmap === "all" ? (
                <FolderOpen className="w-2.5 h-2.5" />
              ) : (
                <Folder className="w-2.5 h-2.5" />
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
                    "flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all duration-200 active:scale-95",
                    isActive
                      ? "bg-primary/10 border-primary/30 text-primary"
                      : "bg-white/[0.03] border-white/[0.07] text-white/40 hover:text-white",
                  )}
                >
                  {isActive ? (
                    <FolderOpen className="w-2.5 h-2.5" />
                  ) : (
                    <Folder className="w-2.5 h-2.5" />
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
                      ? "bg-primary/[0.08] border-primary/25 text-white"
                      : "border-transparent bg-transparent hover:bg-white/[0.03] hover:border-white/[0.05] text-white/40 hover:text-white/70",
                  )}
                >
                  {selectedRoadmap === "all" ? (
                    <FolderOpen className="w-4 h-4 shrink-0 text-primary" />
                  ) : (
                    <Folder className="w-4 h-4 shrink-0 text-white/25 group-hover:text-white/50 transition-colors" />
                  )}
                  <span className="text-[13px] font-semibold leading-none flex-1">
                    All Sheets
                  </span>
                  <span
                    className={cn(
                      "text-[10px] font-bold tabular-nums px-1.5 py-0.5 rounded-full",
                      selectedRoadmap === "all"
                        ? "bg-primary/15 text-primary"
                        : "bg-white/[0.04] text-white/25",
                    )}
                  >
                    {totalSheets}
                  </span>
                </button>

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
                        "w-full group flex items-center gap-2.5 px-3 py-2.5 rounded-lg border transition-all duration-200 cursor-pointer text-left",
                        isActive
                          ? "bg-primary/[0.08] border-primary/25 text-white"
                          : "border-transparent bg-transparent hover:bg-white/[0.03] hover:border-white/[0.05] text-white/40 hover:text-white/70",
                      )}
                    >
                      {isActive ? (
                        <FolderOpen className="w-4 h-4 shrink-0 text-primary" />
                      ) : (
                        <Folder className="w-4 h-4 shrink-0 text-white/25 group-hover:text-white/50 transition-colors" />
                      )}
                      <span className="text-[13px] font-semibold leading-none flex-1">
                        {roadmap}
                      </span>
                      <span
                        className={cn(
                          "text-[10px] font-bold tabular-nums px-1.5 py-0.5 rounded-full",
                          isActive
                            ? "bg-primary/15 text-primary"
                            : "bg-white/[0.04] text-white/25",
                        )}
                      >
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
              <div className="max-w-5xl mx-auto w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                  {visibleSheets.map((card) => {
                    const rawSheet = sheetsData.find(
                      (s: any) => s._id === card.id,
                    );
                    const isLocked = card.isPremium && !card.isPurchased;

                    const coverImage =
                      card.image ||
                      rawSheet?.coverImageURL ||
                      (rawSheet as any)?.coverImageUrl ||
                      (rawSheet as any)?.cover_image_url ||
                      (rawSheet as any)?.thumbnail;

                    return (
                      <Link
                        key={card.id}
                        href={
                          card.href ||
                          `/interview-sheets?topic=${rawSheet?.slug}`
                        }
                        className="group block"
                      >
                        <div
                          className={cn(
                            "relative h-full rounded-xl border overflow-hidden transition-all duration-300",
                            "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.1]",
                            "hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99]",
                          )}
                        >
                          {/* Cover image */}
                          {coverImage ? (
                            <div className="relative w-full aspect-[16/9] overflow-hidden">
                              <img
                                src={coverImage}
                                alt={card.imageAltText || card.title}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover opacity-95 group-hover:opacity-100 group-hover:scale-[1.03] transition-all duration-500"
                                onError={(e) => {
                                  (
                                    e.currentTarget as HTMLImageElement
                                  ).style.display = "none";
                                }}
                              />
                              {/* Subtle gradient at bottom only */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                              {/* Badge overlaid on image */}
                              {isLocked && (
                                <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 border border-white/[0.12] backdrop-blur-sm">
                                  <Lock className="w-2.5 h-2.5 text-white/50" />
                                  <span className="text-[9px] font-bold text-white/50 uppercase tracking-wider">
                                    Premium
                                  </span>
                                </div>
                              )}
                              {card.isPurchased && (
                                <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 border border-white/[0.12] backdrop-blur-sm">
                                  <Sparkles className="w-2.5 h-2.5 text-white/50" />
                                  <span className="text-[9px] font-bold text-white/50 uppercase tracking-wider">
                                    Purchased
                                  </span>
                                </div>
                              )}
                            </div>
                          ) : (
                            /* Fallback when no cover image */
                            <div className="relative w-full aspect-[16/9] bg-white/[0.03] flex items-center justify-center">
                              <BookOpen className="w-8 h-8 text-white/10" />
                              {isLocked && (
                                <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 border border-white/[0.12]">
                                  <Lock className="w-2.5 h-2.5 text-white/50" />
                                  <span className="text-[9px] font-bold text-white/50 uppercase tracking-wider">
                                    Premium
                                  </span>
                                </div>
                              )}
                              {card.isPurchased && (
                                <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 border border-white/[0.12]">
                                  <Sparkles className="w-2.5 h-2.5 text-white/50" />
                                  <span className="text-[9px] font-bold text-white/50 uppercase tracking-wider">
                                    Purchased
                                  </span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Card body */}
                          <div className="p-3.5">
                            <p className="text-[13px] font-semibold text-white/85 leading-snug group-hover:text-white transition-colors line-clamp-2">
                              {card.title}
                            </p>

                            {card.content && (
                              <p className="text-[11px] text-white/35 leading-relaxed mt-1.5 line-clamp-2 group-hover:text-white/50 transition-colors">
                                {card.content}
                              </p>
                            )}

                            {/* Footer */}
                            <div className="flex items-center justify-end mt-3 pt-2.5 border-t border-white/[0.04]">
                              <ChevronRight className="w-3.5 h-3.5 text-white/15 group-hover:text-white/40 group-hover:translate-x-0.5 transition-all" />
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
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

export const getServerSideProps = async (context: any) => {
  const { topic } = context.query;
  if (topic) {
    return getSheetPageProps(context);
  }
  return { props: {} };
};

export default InterviewPrepDashboardPage;
