"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useApi, useUser } from "@tbe/hooks";
import { routes } from "@tbe/constants";
import type { DSAQuestion } from "@tbe/types";
import {
  LoadingSpinner,
  PageHeader,
  QuestionDetails,
  QuestionSidebar,
} from "@tbe/components";

interface BackendQuestion {
  _id: string;
  title: string;
  content: string;
  domain: string[];
  difficulty: "EASY" | "MEDIUM" | "HARD";
  isPremium?: boolean;
}

interface BackendSheet {
  _id: string;
  questions: BackendQuestion[];
  isPremium?: boolean;
}

const DSAPrepPage = () => {
  const router = useRouter();
  const { user, loading: userLoading, isAuth } = useUser();

  const [questions, setQuestions] = useState<DSAQuestion[]>([]);
  const [selected, setSelected] = useState<DSAQuestion | null>(null);
  const [purchaseStatuses, setPurchaseStatuses] = useState<Record<string, boolean>>({});
  const [mobileView, setMobileView] = useState<"list" | "details">("list");

  const { response, loading: sheetsLoading } = useApi("dsa-prep", {
    url: `${routes.api.base}/interview-prep/dsa-sheet`,
  });

  // Check purchase status for premium content
  useEffect(() => {
    if (response?.data && user?.id) {
      const checkPurchaseStatuses = async () => {
        const statuses: Record<string, boolean> = {};
        const sheetData = response.data as BackendSheet;

        if (sheetData.isPremium) {
          try {
            const res = await fetch(
              `${routes.api.base}${routes.api.checkStatus}?userId=${user.id}&productId=${sheetData._id}`,
              { method: "GET" }
            );
            const result = await res.json();
            statuses[sheetData._id] = result.status && result.data?.purchased;
          } catch {
            statuses[sheetData._id] = false;
          }
        }

        setPurchaseStatuses(statuses);
      };

      checkPurchaseStatuses();
    }
  }, [response?.data, user?.id]);

  // Format the backend response into DSAQuestion format
  useEffect(() => {
    if (response?.data?.questions) {
      const backendQuestions: BackendQuestion[] = response.data.questions;

      const formatted: DSAQuestion[] = backendQuestions.map((question) => ({
        id: question._id,
        title: question.title,
        description: question.content,
        tags: question.domain ?? [],
        difficulty:
          question.difficulty === "EASY"
            ? "Easy"
            : question.difficulty === "MEDIUM"
              ? "Medium"
              : "Hard",
      }));

      setQuestions(formatted);
      if (formatted.length > 0 && !selected) {
        setSelected(formatted[0]);
      }
    }
  }, [response?.data?.questions, selected]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!userLoading && !isAuth) {
      router.push("/login");
    }
  }, [userLoading, isAuth, router]);

  const loading = userLoading || sheetsLoading;

  if (loading || !selected) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col">
      {/* Reusable Sticky Header Component */}
      <PageHeader
        title="DSA Practice"
        subtitle={`${questions.length} Questions`}
        backHref="/dashboard"
        backText="Back to Dashboard"
      />

      {/* Two-Column Layout - using flex-1 for dynamic height */}
      <div className="flex flex-1 overflow-hidden">
        <QuestionSidebar
          questions={questions}
          selected={selected}
          onSelect={(question) => {
            setSelected(question);
            setMobileView("details");
          }}
          className={mobileView === "details" ? "hidden md:block" : ""}
        />

        <QuestionDetails
          question={selected}
          className={mobileView === "list" ? "hidden md:block" : ""}
          onBack={() => setMobileView("list")}
        />
      </div>
    </div>
  );
};

export default DSAPrepPage;
