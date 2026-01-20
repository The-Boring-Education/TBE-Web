"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useUser } from "@tbe/hooks";
import {
  LoadingSpinner,
  QuestionDetails,
  QuestionSidebar,
} from "@tbe/components";
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
      <div className="flex items-center justify-center min-h-[40vh]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex h-screen text-white">
      <QuestionSidebar
        questions={questions}
        selected={selected}
        onSelect={setSelected}
      />

      <QuestionDetails question={selected} />
    </div>
  );
};

export default DSAPrepPage;
