import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { useApi, useUser } from "@tbe/hooks";
import { PAGE_REFRESH_TIMEOUT, routes } from "@tbe/constants";
import type { PrimaryCardWithCTAProps } from "@tbe/interface";
import { mapInterviewSheetResponseToCard } from "@tbe/utils";
import {
  Card,
  CardContent,
  LoadingSpinner,
  Text,
  CardContainerB,
} from "@tbe/components";

const InterviewPrepDashboardPage = () => {
  const router = useRouter();
  const { user, loading: userLoading, isAuth } = useUser();

  const { response, loading: sheetsLoading } = useApi("interview-prep", {
    url: `${routes.api.base}${routes.api.interviewPrep}`,
  });

  const [purchaseStatuses, setPurchaseStatuses] = useState<Record<string, boolean>>({});

  // Redirect to login if not authenticated
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
                { method: "GET" }
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
        isPurchased: sheet.isPremium ? isPurchased : false,
        isPremium: sheet.isPremium && !isPurchased,
      };
    });
  }, [response?.data, purchaseStatuses]);

  const groupedByRoadmap = useMemo(() => {
    const groups: Record<string, PrimaryCardWithCTAProps[]> = {};
    (response?.data || []).forEach((sheet: any) => {
      const roadmap = sheet?.roadmap || "Tech";
      if (!groups[roadmap]) groups[roadmap] = [];
      const card = (sheets || []).find((c) => c.id === sheet._id);
      if (card) groups[roadmap].push(card);
    });
    return groups;
  }, [response?.data, sheets]);

  const hasSheets = sheets && sheets.length > 0;

  return (
      <div className="space-y-6">
        {!hasSheets && (
          <div className="flex items-center justify-center min-h-[40vh]">
            <Text level="p" className="text-gray-400">
              No interview sheets are available right now.
            </Text>
          </div>
        )}

        {hasSheets && (
          <div className="space-y-10">
            {Object.entries(groupedByRoadmap).map(([roadmap, cards]) => (
              <section key={roadmap} className="space-y-4">
                <Text level="h3" className="text-lg font-semibold text-white">
                  {roadmap} Sheets
                </Text>

                <CardContainerB
                  borderColour={2}
                  cards={cards || []}
                  focusText={`${cards?.length || 0} Sheet${
                    (cards?.length || 0) > 1 ? "s" : ""
                  } Available`}
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


