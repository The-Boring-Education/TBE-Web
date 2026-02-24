import {
  CardContainerB,
  Text,
} from "@tbe/components";
import { routes } from "@tbe/constants";
import { useApi, useUser } from "@tbe/hooks";
import type { PrimaryCardWithCTAProps } from "@tbe/interface";
import { mapInterviewSheetResponseToCard } from "@tbe/utils";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

const InterviewPrepDashboardPage = () => {
  const router = useRouter();
  const { user, loading: userLoading, isAuth } = useUser();

  const selectedRoadmap =
    typeof router.query.roadmap === "string"
      ? router.query.roadmap.toLowerCase()
      : "all";

  const { response, loading: sheetsLoading } = useApi("interview-prep", {
    url: `${routes.api.base}${routes.api.interviewPrep}`,
  });

  const [purchaseStatuses, setPurchaseStatuses] = useState<Record<string, boolean>>({});

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
                `${routes.api.base}${routes.api.checkStatus}?userId=${user.id}&productId=${sheet._id}`
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

    return response.data
      .filter((sheet: any) => sheet?.roadmap?.toLowerCase() !== "dsa")
      .map((sheet: any) => {
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
      if (title.includes("database") || title.includes("dbms") || title.includes("sql") ||
        slug.includes("database") || slug.includes("dbms") || slug.includes("sql")) {
        roadmap = "Database";
      }

      if (roadmap.toLowerCase() === "dsa") return;

      if (!groups[roadmap]) groups[roadmap] = [];
      const card = sheets.find((c) => c.id === sheet._id);
      if (card) groups[roadmap].push(card);
    });

    return groups;
  }, [response?.data, sheets]);

  const visibleRoadmaps = useMemo(() => {
    if (selectedRoadmap === "all") return groupedByRoadmap;

    const entry = Object.entries(groupedByRoadmap).find(
      ([roadmap]) => roadmap.toLowerCase() === selectedRoadmap
    );

    return entry ? { [entry[0]]: entry[1] } : {};
  }, [groupedByRoadmap, selectedRoadmap]);

  if (sheetsLoading) {
    return <div>loading.....</div>;
  }

  const roadmapKeys = Object.keys(groupedByRoadmap).sort((a, b) => {
    const order = ["Tech", "Frontend", "Database"];
    const indexA = order.indexOf(a);
    const indexB = order.indexOf(b);
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    return a.localeCompare(b);
  });
  const hasSheets = sheets.length > 0;

  return (
    <div className="space-y-3">
      {hasSheets && (
        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/interview-prep"
            className={`px-2 py-1 rounded-md text-sm font-medium
              ${selectedRoadmap === "all"
                ? "bg-primary text-white"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
          >
            All Roadmaps
          </Link>

          {roadmapKeys.map((roadmap) => {
            const slug = roadmap.toLowerCase();
            return (
              <Link
                key={roadmap}
                href={{
                  pathname: "/dashboard/interview-prep",
                  query: { roadmap: slug },
                }}
                className={`px-2 py-1 rounded-md text-sm font-medium
                  ${selectedRoadmap === slug
                    ? "bg-primary text-white"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
              >
                {roadmap}
              </Link>
            );
          })}
        </div>
      )}

      {!hasSheets && (
        <div className="flex items-center justify-center min-h-[40vh]">
          <Text level="p" className="text-gray-400">
            No interview sheets are available right now.
          </Text>
        </div>
      )}

      {hasSheets && (
        <div className="space-y-10">
          {Object.entries(visibleRoadmaps).map(([roadmap, cards]) => (
            <section key={roadmap} className="space-y-3">
              <Text level="h3" className="text-lg font-semibold text-white">
                {roadmap} Sheets
              </Text>

              <CardContainerB
                borderColour={2}
                cards={cards}
                focusText={`${cards.length} Sheet${cards.length > 1 ? "s" : ""} Available`}
                heading=""
                sectionClassName="px-0"
                subtext=""
              />
            </section>
          ))}
        </div>
      )}
    </div>
  );
};

export default InterviewPrepDashboardPage;
