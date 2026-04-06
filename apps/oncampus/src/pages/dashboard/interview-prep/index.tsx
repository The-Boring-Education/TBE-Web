import {
  CardContainerB,
  FlexContainer,
  LoadingSpinner,
  Text,
} from "@tbe/components";
import { routes } from "@tbe/constants";
import { useUser } from "@tbe/hooks";
import type { PrimaryCardWithCTAProps } from "@tbe/interface";
import { CACHE_TIMES, queryKeys, useQuery } from "@tbe/query";
import { cn, mapInterviewSheetResponseToCard, sendRequest } from "@tbe/utils";
import { ArrowLeft, Folder, FolderOpen } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

import OnCampusLearningLayout from "@/components/OnCampusLearningLayout";

const InterviewPrepDashboardPage = () => {
  const router = useRouter();
  const { user, loading: userLoading, isAuth } = useUser();

  const selectedRoadmap =
    typeof router.query.roadmap === "string"
      ? router.query.roadmap.toLowerCase()
      : "all";

  const { data: response, isLoading: sheetsLoading } = useQuery<any>({
    queryKey: queryKeys.interviewPrep.lists(),
    queryFn: () =>
      sendRequest({
        url: `${routes.api.base}${routes.api.interviewPrep}`,
      }),
    ...CACHE_TIMES.STATIC,
  });

  const [purchaseStatuses, setPurchaseStatuses] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    if (!userLoading && !isAuth) {
      router.push("/login");
    }
  }, [userLoading, isAuth, router]);

  useEffect(() => {
    if (response?.data && user?.id) {
      const checkPurchaseStatuses = async () => {
        const statuses: Record<string, boolean> = {};

        for (const sheet of response.data) {
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
  }, [response?.data, user?.id]);

  const sheets: PrimaryCardWithCTAProps[] = useMemo(() => {
    if (!response?.data) return [];

    return response.data.map((sheet: any) => {
      const baseCard = mapInterviewSheetResponseToCard([sheet])[0];
      const isPurchased = purchaseStatuses[sheet._id] || false;

      return {
        ...baseCard,
        href: `/dashboard/interview-prep/${sheet.slug}`,
        isPurchased: sheet.isPremium ? isPurchased : false,
        isPremium: sheet.isPremium && !isPurchased,
      };
    });
  }, [response?.data, purchaseStatuses]);

  const groupedByRoadmap = useMemo(() => {
    const groups: Record<string, PrimaryCardWithCTAProps[]> = {};

    (response?.data || []).forEach((sheet: any) => {
      let roadmap = sheet?.roadmap || "Tech";

      // Auto-categorize Database related sheets
      const title = sheet.title?.toLowerCase() || "";
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
  }, [response?.data, sheets]);

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
    if (selectedRoadmap === "all") return "All Roadmaps";
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
      router.push("/dashboard/interview-prep");
    } else {
      router.push({
        pathname: "/dashboard/interview-prep",
        query: { roadmap: slug },
      });
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
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner height={8} width={8} />
          <Text level="p" className="text-gray-400 ml-3">
            Loading...
          </Text>
        </div>
      </OnCampusLearningLayout>
    );
  }

  const hasSheets = sheets.length > 0;

  return (
    <OnCampusLearningLayout
      backHref={routes.oncampus.dashboard}
      layoutMode="workspace"
    >
      <div className="flex flex-col h-full w-full">
        {/* Header Section */}
        <div className="w-full min-h-[72px] border-b border-gray-800 bg-[#0A0A0A] flex shrink-0">
          {/* Left Column — aligns with sidebar width */}
          <div className="border-r border-gray-800/60 px-3 py-3.5 flex items-center justify-between shrink-0 transition-all duration-300 w-full lg:w-[260px]">
            <div>
              <Text
                level="h2"
                className="text-[13px] font-black text-white mb-0.5 tracking-tight"
              >
                Explore Sheets
              </Text>
              <Text
                level="p"
                className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.1em]"
              >
                Choose a category
              </Text>
            </div>
            {selectedRoadmap !== "all" && (
              <button
                onClick={() => handleRoadmapClick("all")}
                className="flex items-center justify-center w-[28px] h-[28px] rounded-[6px] border border-red-500/40 bg-red-500/5 text-red-500 hover:bg-red-500/10 hover:border-red-500 transition-all duration-300 shrink-0 shadow-[0_0_10px_rgba(239,68,68,0.1)] active:scale-95"
                title="View All Roadmaps"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="hidden lg:flex flex-1 items-center justify-between px-4">
            <FlexContainer wrap={false} className="gap-2">
              <FlexContainer
                direction="col"
                itemCenter={false}
                justifyCenter={false}
                wrap={false}
              >
                <Text
                  level="h1"
                  className="strong-text font-bold text-white mb-0.5 tracking-tight"
                >
                  {activeRoadmapLabel}
                </Text>
                <Text
                  level="p"
                  className="text-[10px] font-medium text-gray-500 uppercase tracking-wider"
                >
                  {selectedRoadmap === "all"
                    ? "Select a category to practicing specific sheets"
                    : `Practicing ${activeRoadmapLabel} interview questions`}
                </Text>
              </FlexContainer>
            </FlexContainer>
          </div>
        </div>

        <FlexContainer
          direction="col"
          className="lg:flex-row flex-1 min-h-0 w-full"
          itemCenter={false}
          justifyCenter={false}
          wrap={false}
        >
          {/* Always Visible Left Sidebar - Categories List */}
          <div className="w-full lg:w-[260px] flex-shrink-0 border-r border-gray-800 flex flex-col bg-[#0A0A0A]">
            <div className="flex-1 overflow-y-auto px-3 py-3 scrollbar-thin-grey">
              <div className="space-y-1">
                <FlexContainer
                  direction="col"
                  fullWidth
                  itemCenter={false}
                  justifyCenter={false}
                  wrap={false}
                  className="gap-1"
                >
                  {/* All Roadmaps option */}
                  <button
                    onClick={() => handleRoadmapClick("all")}
                    className={cn(
                      "w-full group relative py-2.5 px-4 rounded-r-lg border-l-[3px] transition-all duration-300 cursor-pointer text-left focus:outline-none",
                      selectedRoadmap === "all"
                        ? "bg-red-500/[0.03] border-red-500 shadow-[0_1px_6px_rgba(239,68,68,0.02)] text-white"
                        : "border-transparent bg-transparent hover:bg-white/[0.02] hover:border-gray-800 text-gray-400 group-hover:text-gray-300",
                    )}
                  >
                    <FlexContainer className="items-center w-full gap-3">
                      {selectedRoadmap === "all" ? (
                        <FolderOpen className="w-[15px] h-[15px] shrink-0 text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                      ) : (
                        <Folder className="w-[15px] h-[15px] shrink-0 text-gray-600 group-hover:text-gray-400 transition-colors" />
                      )}
                      <Text
                        level="p"
                        className="text-[13px] font-semibold leading-tight py-0.5"
                      >
                        All Sheets
                      </Text>
                    </FlexContainer>
                  </button>

                  {roadmapKeys.map((roadmap) => {
                    const slug = roadmap.toLowerCase();
                    const isActive = selectedRoadmap === slug;
                    return (
                      <button
                        key={roadmap}
                        onClick={() => handleRoadmapClick(slug)}
                        className={cn(
                          "w-full group relative py-2.5 px-4 rounded-r-lg border-l-[3px] transition-all duration-300 cursor-pointer text-left focus:outline-none",
                          isActive
                            ? "bg-red-500/[0.03] border-red-500 shadow-[0_1px_6px_rgba(239,68,68,0.02)] text-white"
                            : "border-transparent bg-transparent hover:bg-white/[0.02] hover:border-gray-800 text-gray-400 group-hover:text-gray-300",
                        )}
                      >
                        <FlexContainer className="items-center w-full gap-3">
                          {isActive ? (
                            <FolderOpen className="w-[15px] h-[15px] shrink-0 text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                          ) : (
                            <Folder className="w-[15px] h-[15px] shrink-0 text-gray-600 group-hover:text-gray-400 transition-colors" />
                          )}
                          <Text
                            level="p"
                            className="text-[13px] font-semibold leading-tight py-0.5"
                          >
                            {roadmap}
                          </Text>
                        </FlexContainer>
                      </button>
                    );
                  })}
                </FlexContainer>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col h-full w-full overflow-y-auto bg-[#050505] p-6 lg:p-8 scrollbar-thin-grey">
            {!hasSheets ? (
              <div className="flex flex-col items-center justify-center min-h-[40vh]">
                <Text level="p" className="text-gray-400">
                  No interview sheets are available right now.
                </Text>
              </div>
            ) : (
              <div className="space-y-12 pb-10">
                {Object.entries(visibleRoadmaps).map(([roadmap, cards]) => (
                  <section key={roadmap} className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="h-px bg-gray-800 flex-1" />
                      <Text
                        level="h3"
                        className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.2em] px-2 whitespace-nowrap"
                      >
                        {roadmap} Category
                      </Text>
                      <div className="h-px bg-gray-800 flex-1" />
                    </div>

                    <CardContainerB
                      borderColour={2}
                      cards={cards}
                      focusText={`${cards.length} Sheet${cards.length > 1 ? "s" : ""} Available`}
                      heading=""
                      sectionClassName="px-0 py-0"
                      subtext=""
                    />
                  </section>
                ))}
              </div>
            )}
          </div>
        </FlexContainer>
      </div>
    </OnCampusLearningLayout>
  );
};

export default InterviewPrepDashboardPage;
