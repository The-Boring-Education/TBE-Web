import { LoadingSpinner } from "@tbe/components";
import { routes } from "@tbe/constants";
import { useUser } from "@tbe/hooks";
import { CACHE_TIMES, queryKeys, useQuery } from "@tbe/query";
import { sendRequest } from "@tbe/utils";
import {
  BarChart2,
  BookOpen,
  FileText,
  Play,
  Target,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMemo } from "react";

interface EnrolledSheet {
  _id: string;
  name: string;
  slug: string;
  lastUpdated?: string;
  progress?: {
    completed: number;
    total: number;
    percentage: number;
  };
}

interface QuizAttempt {
  _id: string;
  quizId: string;
  categoryName: string;
  score: number;
  completedAt: string;
  totalTimeSpent: number;
}

interface QuizPerformance {
  totalAttempts: number;
  totalQuizzes: number;
  averageScore: number;
  bestScore: number;
  totalTimeSpent: number;
  categoryBreakdown: {
    categoryName: string;
    attempts: number;
    averageScore: number;
    bestScore: number;
  }[];
  recentAttempts: QuizAttempt[];
}

const CampusPrepDashboard = () => {
  const { user, loading, isAuth } = useUser();
  const router = useRouter();

  const { data: enrolledSheetsResponse, isLoading: sheetsLoading } =
    useQuery<any>({
      queryKey: queryKeys.interviewPrep.lists(),
      queryFn: () =>
        sendRequest({
          url: `${routes.api.base}${routes.api.mySheets}?userId=${user?.id}`,
        }),
      ...CACHE_TIMES.STANDARD,
      enabled: !!user?.id,
    });

  const { data: quizPerformanceResponse, isLoading: quizLoading } =
    useQuery<any>({
      queryKey: queryKeys.quiz.performance(user?.id ?? ""),
      queryFn: () =>
        sendRequest({
          url: `${routes.api.base}/quiz/performance/${user?.id}`,
        }),
      ...CACHE_TIMES.STANDARD,
      enabled: !!user?.id,
    });

  const enrolledSheets: EnrolledSheet[] = useMemo(() => {
    if (!enrolledSheetsResponse?.status || !enrolledSheetsResponse?.data)
      return [];
    const sheets = Array.isArray(enrolledSheetsResponse.data)
      ? enrolledSheetsResponse.data
      : [];
    return sheets.slice(0, 3);
  }, [enrolledSheetsResponse]);

  const quizPerformance: QuizPerformance | null = useMemo(() => {
    if (!quizPerformanceResponse) return null;

    const response = quizPerformanceResponse as any;
    if (response.status && response.data) {
      if (response.data.success && response.data.data) {
        return response.data.data as QuizPerformance;
      }
      if (response.data.totalAttempts !== undefined) {
        return response.data as QuizPerformance;
      }
    }

    if (response.success && response.data) {
      return response.data as QuizPerformance;
    }

    if (response.totalAttempts !== undefined) {
      return response as QuizPerformance;
    }

    return null;
  }, [quizPerformanceResponse]);

  const quizAttempts: QuizAttempt[] = useMemo(() => {
    return quizPerformance?.recentAttempts || [];
  }, [quizPerformance]);

  const totalQuizAttempts = useMemo(() => {
    return quizPerformance?.totalAttempts || 0;
  }, [quizPerformance]);

  const averageScore = useMemo(() => {
    return quizPerformance?.averageScore || 0;
  }, [quizPerformance]);

  if (!loading && !isAuth) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 space-y-6 pb-6">
      {/* 1. Hero Card: Welcome + Laptop Illustration + CTA */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-[#222227] bg-white dark:bg-[#111114] p-6 sm:p-7 shadow-xs">
        {/* Subtle red ambient glow behind laptop illustration */}
        <div className="hidden md:block absolute -top-10 right-8 lg:right-20 w-[340px] h-[340px] rounded-full bg-[#FF4D4D]/15 blur-[90px] pointer-events-none z-0" />

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 relative z-10 min-h-[140px] sm:min-h-[160px]">
          {/* Left Column: Welcome greetings */}
          <div className="space-y-2 max-w-sm sm:max-w-md lg:max-w-lg z-10">
            <p className="text-[11px] font-bold tracking-[0.16em] text-slate-400 dark:text-[#9CA3AF] uppercase">
              OnCampus
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-[#F5F5F5] tracking-tight leading-tight">
              Welcome back,{" "}
              <span className="text-[#FF4D4D]">{user?.name || "Learner"}</span>!{" "}
              <span aria-hidden className="inline-block">
                👋
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-[#9CA3AF] font-medium leading-relaxed">
              Ready to master your interviews today?
            </p>
          </div>

          {/* Laptop Graphic on Right */}
          <div className="hidden md:flex absolute -bottom-6 lg:-bottom-8 right-6 lg:right-16 xl:right-24 z-0 pointer-events-none select-none">
            <img
              src="https://ik.imagekit.io/riufvimprm/TBE/dsayatra-dashboard-laptop.png"
              alt="Laptop Illustration"
              className="w-[280px] sm:w-[330px] md:w-[380px] lg:w-[430px] h-auto object-contain drop-shadow-[0_15px_35px_rgba(255,77,77,0.25)]"
            />
          </div>
        </div>
      </div>

      {/* 2. Middle Grid: Continue Learning + Quiz Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Continue Learning Column */}
        <div className="bg-white dark:bg-[#111114] border border-slate-200/80 dark:border-[#222227] rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-[#202026]">
              <div className="flex items-center gap-2.5">
                <Play className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF4D4D] fill-[#FF4D4D] shrink-0" />
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    Continue Learning
                  </h3>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                    Recent Sheets
                  </p>
                </div>
              </div>
              <Target className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF4D4D] shrink-0" />
            </div>

            <div className="space-y-3">
              {sheetsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : enrolledSheets.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-slate-200 dark:border-[#26262E] rounded-xl space-y-2">
                  <p className="text-xs font-semibold text-slate-400">
                    No sheets started yet
                  </p>
                  <Link
                    href="/interview-sheets"
                    className="text-xs font-bold text-[#FF4D4D] hover:underline inline-block"
                  >
                    Browse interview sheets →
                  </Link>
                </div>
              ) : (
                enrolledSheets.map((sheet) => (
                  <div
                    key={sheet._id}
                    className="bg-slate-50 dark:bg-[#18181D] border border-slate-200/60 dark:border-[#26262E] p-4 rounded-xl space-y-3 hover:border-[#FF4D4D]/40 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate pr-2">
                        {sheet.name}
                      </h4>
                      <button
                        type="button"
                        onClick={() =>
                          router.push(`/interview-sheets?topic=${sheet.slug}`)
                        }
                        className="border border-[#FF4D4D] text-[#FF4D4D] hover:bg-[#FF4D4D] hover:text-white px-3 py-1 rounded-md text-[11px] font-bold transition-all uppercase tracking-wider cursor-pointer shrink-0"
                      >
                        Resume
                      </button>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                        <span>Progress</span>
                        <span className="text-[#FF4D4D]">
                          {sheet.progress?.percentage ?? 0}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 dark:bg-[#25252D] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#FF4D4D] rounded-full transition-all duration-500"
                          style={{
                            width: `${sheet.progress?.percentage ?? 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Quiz Insights Column */}
        <div className="bg-white dark:bg-[#111114] border border-slate-200/80 dark:border-[#222227] rounded-2xl p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-[#202026]">
            <div className="flex items-center gap-2.5">
              <BarChart2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF4D4D] shrink-0" />
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  Quiz Insights
                </h3>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                  Performance Data
                </p>
              </div>
            </div>
            <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 shrink-0" />
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-slate-50 dark:bg-[#18181D] border border-slate-200/60 dark:border-[#26262E] p-3.5 rounded-xl">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                TOTAL ATTEMPTS
              </p>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                {quizLoading ? "..." : totalQuizAttempts}
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-[#18181D] border border-slate-200/60 dark:border-[#26262E] p-3.5 rounded-xl">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                AVG. SCORE
              </p>
              <p className="text-2xl sm:text-3xl font-extrabold text-[#FF4D4D] mt-1">
                {quizLoading ? "..." : `${averageScore}%`}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
              RECENT PERFORMANCE
            </p>
            {quizAttempts.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-slate-200 dark:border-[#26262E] rounded-xl space-y-1">
                <p className="text-xs font-semibold text-slate-400">
                  No quiz attempts yet
                </p>
                <Link
                  href="/dashboard/quizzes"
                  className="text-xs font-bold text-[#FF4D4D] hover:underline inline-block"
                >
                  Start your first quiz →
                </Link>
              </div>
            ) : (
              quizAttempts.slice(0, 3).map((attempt) => (
                <div
                  key={attempt._id}
                  className="flex items-center justify-between p-3 bg-slate-50 dark:bg-[#18181D] border border-slate-200/60 dark:border-[#26262E] rounded-xl text-xs"
                >
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-xs">
                      {attempt.categoryName || "Challenge"}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                      {new Date(attempt.completedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#FF4D4D] text-xs">
                      {attempt.score}%
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {Math.round((attempt.totalTimeSpent || 0) / 60)}m
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 3. Practice Modules Section Header with centered text and divider line */}
      <div className="relative my-6 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200 dark:border-[#222227]" />
        </div>
        <div className="relative bg-[#FAFAFA] dark:bg-[#0A0A0C] px-4">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
            Practice Modules
          </span>
        </div>
      </div>

      {/* 4. Practice Modules Cards (Quizzes & Interview Sheets) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Quizzes Module */}
        <div className="bg-white dark:bg-[#111114] border border-slate-200/80 dark:border-[#222227] rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-2xs hover:border-[#FF4D4D]/40 transition-all">
          <div className="flex items-center gap-3.5">
            <FileText className="w-6 h-6 text-[#FF4D4D] shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Quizzes
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Topic-wise MCQs with instant results
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => router.push("/dashboard/quizzes")}
            className="px-4 py-2 bg-[#FF4D4D] hover:bg-[#EE3126] text-white font-bold text-xs rounded-xl transition-all shadow-xs cursor-pointer shrink-0"
          >
            Explore →
          </button>
        </div>

        {/* Interview Sheets Module */}
        <div className="bg-white dark:bg-[#111114] border border-slate-200/80 dark:border-[#222227] rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-2xs hover:border-[#FF4D4D]/40 transition-all">
          <div className="flex items-center gap-3.5">
            <BookOpen className="w-6 h-6 text-[#FF4D4D] shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Interview Sheets
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Practice Q&amp;As and track progress
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => router.push("/interview-sheets")}
            className="px-4 py-2 bg-[#FF4D4D] hover:bg-[#EE3126] text-white font-bold text-xs rounded-xl transition-all shadow-xs cursor-pointer shrink-0"
          >
            Open →
          </button>
        </div>
      </div>
    </div>
  );
};

export default CampusPrepDashboard;
