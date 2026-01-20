"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useUser } from "@tbe/hooks";
import {
  LoadingSpinner,
  QuestionDetails,
  QuestionSidebar,
} from "@tbe/components";
import { ArrowLeft } from "lucide-react";
import axios from "axios";

export interface Question {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  tags: string[];
  description: string;
}

interface BackendQuestion {
  _id: string;
  title: string;
  content: string;
  domain: string[];
  difficulty: "EASY" | "MEDIUM" | "HARD";
}

const DSAPrepPage = () => {
  const router = useRouter();
  const { user, loading: userLoading, isAuth } = useUser();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [selected, setSelected] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  // Mobile view state: 'list' shows questions, 'details' shows selected question
  const [mobileView, setMobileView] = useState<"list" | "details">("list");

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get(
          "http://localhost:3004/api/v1/interview-prep/dsa-sheet"
        );

        const backendQuestions: BackendQuestion[] =
          response.data.data.questions;

        const formatted: Question[] = backendQuestions.map((q) => ({
          id: q._id,
          title: q.title,
          description: q.content,
          tags: q.domain ?? [],
          difficulty:
            q.difficulty === "EASY"
              ? "Easy"
              : q.difficulty === "MEDIUM"
                ? "Medium"
                : "Hard",
        }));

        setQuestions(formatted);
        setSelected(formatted[0]);
      } catch (error) {
        console.error("Error fetching questions:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (userLoading || loading || !selected) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Sticky Header with Back Button */}
      <header className="sticky top-0 z-10 bg-[#0A0A0A]/90 backdrop-blur border-b border-gray-800">
        <div className="max-w-[1600px] mx-auto px-3 md:px-4 py-2 md:py-3 flex items-center justify-between">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 text-gray-300 hover:text-primary transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Dashboard</span>
          </button>
          <div className="text-right">
            <h1 className="text-base md:text-lg font-semibold text-white">DSA Practice</h1>
            <p className="text-xs text-gray-500">{questions.length} Questions</p>
          </div>
        </div>
      </header>

      {/* Two-Column Layout */}
      <div className="flex h-[calc(100vh-57px)]">
        <QuestionSidebar
          questions={questions}
          selected={selected}
          onSelect={(q) => {
            setSelected(q);
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
