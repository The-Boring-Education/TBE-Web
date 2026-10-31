import { useAuth } from "@tbe/auth";
import {
  ContentFeedbackWidget,
  LoadingSpinner,
  QuizCatalogSpace,
  QuizPlaySpace,
} from "@tbe/components";
import { useQuizData, useUser } from "@tbe/hooks";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { Fragment, useEffect, useState } from "react";

export default function QuizzesDashboardPage() {
  const router = useRouter();
  const { user } = useUser();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { categories, loading: quizLoading, error, refetch } = useQuizData();

  const queryQuizId =
    typeof router.query.quizId === "string" ? router.query.quizId : null;
  const [activeQuizId, setActiveQuizId] = useState<string | null>(queryQuizId);
  const [activeQuizName, setActiveQuizName] = useState<string | undefined>(
    undefined,
  );

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (queryQuizId) {
      setActiveQuizId(queryQuizId);
      const matched = categories.find((c) => c._id === queryQuizId);
      if (matched) {
        setActiveQuizName(matched.categoryName);
      }
    } else {
      setActiveQuizId(null);
      setActiveQuizName(undefined);
    }
  }, [queryQuizId, categories]);

  const handleSelectQuiz = (id: string, name?: string) => {
    setActiveQuizId(id);
    setActiveQuizName(name);
    router.push(
      { pathname: "/dashboard/quizzes", query: { quizId: id } },
      undefined,
      {
        shallow: true,
      },
    );
  };

  const handleBackToCatalog = () => {
    setActiveQuizId(null);
    setActiveQuizName(undefined);
    router.push("/dashboard/quizzes", undefined, { shallow: true });
  };

  if (authLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <Fragment>
      <Head>
        <title>Technical Quizzes | OnCampus</title>
        <meta
          name="description"
          content="Practice topic-wise tech quizzes for campus recruitment tests and interviews."
        />
      </Head>

      <div className="w-full min-w-0 max-w-full font-sans px-1 sm:px-2 py-1 space-y-2.5 pb-4">
        {/* Breadcrumb Navigation on Top */}
        <nav className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 dark:text-slate-500">
          <Link
            href="/dashboard"
            className="hover:text-slate-800 dark:hover:text-white transition-colors"
          >
            OnCampus
          </Link>
          <span className="text-slate-300 dark:text-slate-600">›</span>
          <button
            type="button"
            onClick={handleBackToCatalog}
            className={`cursor-pointer transition-colors ${
              activeQuizId
                ? "hover:text-slate-800 dark:hover:text-white"
                : "font-bold text-[#FF4D4D]"
            }`}
          >
            Quizzes
          </button>
          {activeQuizId && (
            <>
              <span className="text-slate-300 dark:text-slate-600">›</span>
              <span className="font-bold text-[#FF4D4D] truncate max-w-[200px]">
                {activeQuizName || "Assessment"}
              </span>
            </>
          )}
        </nav>

        {error ? (
          <div className="p-6 text-center bg-white dark:bg-[#16161A] rounded-2xl border border-red-500/20 text-red-500 space-y-3">
            <p className="text-sm font-semibold">{error}</p>
            <button
              type="button"
              onClick={refetch}
              className="px-4 py-1.5 rounded-lg text-xs font-bold bg-red-500 text-white hover:bg-red-600 transition-colors cursor-pointer"
            >
              Try Again
            </button>
          </div>
        ) : activeQuizId ? (
          <div className="w-full max-w-4xl mx-auto pt-1 pb-4">
            <QuizPlaySpace
              quizId={activeQuizId}
              quizName={activeQuizName}
              user={user}
              onBack={handleBackToCatalog}
            />
          </div>
        ) : (
          <QuizCatalogSpace
            categories={categories}
            loading={quizLoading}
            onSelectQuiz={handleSelectQuiz}
          />
        )}
      </div>

      <ContentFeedbackWidget
        contentType="QUIZ"
        contentId={activeQuizId || "quizzes-catalog"}
        title="Rate your quiz experience"
        meta={{
          quizId: activeQuizId || "catalog",
          quizName: activeQuizName || "OnCampus Quizzes",
        }}
        theme="dark"
      />
    </Fragment>
  );
}
