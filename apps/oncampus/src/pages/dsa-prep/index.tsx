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

const DSAPrepPage = () => {
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

  // Filter only DSA roadmap sheets
  const dsaSheets: PrimaryCardWithCTAProps[] = useMemo(() => {
    if (!response?.data) return [];

    return response.data
      .filter((sheet: any) => {
        // Filter sheets where roadmap is "DSA" (case-insensitive)
        const roadmap = sheet?.roadmap || "";
        return roadmap.toLowerCase() === "dsa";
      })
      .map((sheet: any) => {
        const baseCard = mapInterviewSheetResponseToCard([sheet])[0];
        const isPurchased = purchaseStatuses[sheet._id] || false;

        return {
          ...baseCard,
          href: `/dsa-prep/${sheet.slug}`, // Use dsa-prep route
          isPurchased: sheet.isPremium ? isPurchased : false,
          isPremium: sheet.isPremium && !isPurchased,
        };
      });
  }, [response?.data, purchaseStatuses]);

  const hasSheets = dsaSheets && dsaSheets.length > 0;

  if (sheetsLoading || userLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="space-y-2">
        <Text level="h1" className="text-3xl font-bold text-white">
          DSA Interview Sheets
        </Text>
        <Text level="p" className="text-gray-400">
          Master Data Structures and Algorithms with real interview questions asked by top companies
        </Text>
      </div>

      {!hasSheets && (
        <div className="flex items-center justify-center min-h-[40vh]">
          <Text level="p" className="text-gray-400">
            No DSA interview sheets are available right now.
          </Text>
        </div>
      )}

      {hasSheets && (
        <div className="space-y-2">
          <CardContainerB
            borderColour={2}
            cards={dsaSheets}
            heading=""
            sectionClassName="px-0"
            subtext=""
          />
        </div>
      )}
    </div>
  );
};

export default DSAPrepPage;

