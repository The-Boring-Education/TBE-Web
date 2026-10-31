import { useAuth } from "@tbe/auth";
import { LoadingSpinner, QuizPlaySpace } from "@tbe/components";
import { useUser } from "@tbe/hooks";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { Fragment, useEffect } from "react";

export default function QuizDetailPage() {
  const router = useRouter();
  const { user } = useUser();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const quizId = router.query.id as string | undefined;

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading || !quizId) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <Fragment>
      <Head>
        <title>Assessment | OnCampus Quizzes</title>
        <meta
          name="description"
          content="Timed conceptual and coding assessment for campus preparation."
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
          <Link
            href="/dashboard/quizzes"
            className="hover:text-slate-800 dark:hover:text-white transition-colors"
          >
            Quizzes
          </Link>
          <span className="text-slate-300 dark:text-slate-600">›</span>
          <span className="font-bold text-[#FF4D4D]">Assessment</span>
        </nav>

        <div className="w-full max-w-4xl mx-auto pt-1 pb-4">
          <QuizPlaySpace
            quizId={quizId}
            user={user}
            onBack={() => router.push("/dashboard/quizzes")}
          />
        </div>
      </div>
    </Fragment>
  );
}
