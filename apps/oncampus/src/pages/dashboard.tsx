import { Button, Card, LoadingSpinner, Progress } from "@tbe/components";
import { routes } from "@tbe/constants";
import { useUser } from "@tbe/hooks";
import { CACHE_TIMES, queryKeys, useQuery } from "@tbe/query";
import { sendRequest } from "@tbe/utils";
import { Target, Trophy } from "lucide-react";
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
    return sheets.slice(0, 3); // Get last 3 sheets (already sorted by lastUpdated)
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
      <div className="flex items-center justify-center min-h-screen bg-[#0A0A0A]">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 space-y-6 pb-6">
      {/* Header Section */}
      <header className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between mb-2">
        <div>
          <h2 className="text-[1.35rem] font-black leading-snug tracking-tight text-[#f0f0f0] sm:text-2xl md:text-3xl">
            Welcome back, {user?.name}! 👋
          </h2>
          <p className="text-[#808080] text-sm font-medium mt-1">
            Ready to master your interviews today?
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="PRIMARY"
            className="w-full sm:w-auto bg-[#ff5757] hover:bg-[#ff4040] text-white px-6 py-2.5 h-auto font-bold text-xs rounded-xl transition-all hover:shadow-[0_4px_20px_rgba(255,87,87,0.25)] hover:scale-[1.02]"
            text="Continue Learning"
            onClick={() => router.push("/dashboard/interview-prep")}
          />
        </div>
      </header>

      {/* Grid for main sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Continue Learning Column */}
        <div className="space-y-6">
          <Card className="bg-[#111] border-[#222] rounded-2xl p-6 relative overflow-hidden group h-full">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff5757]/5 blur-[60px] pointer-events-none" />

            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-black text-[#f0f0f0] tracking-tight">
                  Continue Learning
                </h3>
                <p className="text-[#606060] text-sm font-medium mt-1 uppercase tracking-widest">
                  Recent Sheets
                </p>
              </div>
              <div className="p-2.5 bg-[#ff5757]/10 rounded-xl">
                <Target className="w-5 h-5 text-[#ff5757]" />
              </div>
            </div>

            <div className="space-y-3">
              {sheetsLoading ? (
                <div className="flex items-center justify-center py-10">
                  <LoadingSpinner />
                </div>
              ) : enrolledSheets.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed border-[#222] rounded-2xl">
                  <p className="text-sm font-bold text-[#606060] uppercase tracking-widest">
                    No sheets studied yet
                  </p>
                </div>
              ) : (
                enrolledSheets.map((sheet) => (
                  <div
                    key={sheet._id}
                    className="bg-[#1a1a1a] border border-[#2a2a2a] p-4 rounded-xl hover:border-[#ff5757]/40 transition-all group/item"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-black text-[#f0f0f0] truncate pr-4">
                        {sheet.name}
                      </h4>
                      <Button
                        variant="OUTLINE"
                        className="bg-transparent border-[#333] text-[#a0a0a0] hover:text-[#ff5757] hover:border-[#ff5757]/50 text-xs font-black h-8 px-4 rounded-lg uppercase tracking-tight"
                        text="Resume"
                        onClick={() =>
                          router.push(`/dashboard/interview-prep/${sheet.slug}`)
                        }
                      />
                    </div>
                    {sheet.progress && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                          <span className="text-[#606060]">Progress</span>
                          <span className="text-[#ff5757]">
                            {sheet.progress.percentage}%
                          </span>
                        </div>
                        <Progress
                          value={sheet.progress.percentage}
                          className="h-1.5 bg-[#252525] rounded-full overflow-hidden"
                        />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Quiz Insights Column */}
        <div className="space-y-6">
          <Card className="bg-[#111] border-[#222] rounded-2xl p-6 h-full relative overflow-hidden group">
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#ff5757]/5 blur-[60px] pointer-events-none" />

            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-black text-[#f0f0f0] tracking-tight">
                  Quiz Insights
                </h3>
                <p className="text-[#606060] text-sm font-medium mt-1 uppercase tracking-widest">
                  Performance Data
                </p>
              </div>
              <div className="p-2.5 bg-[#ff5757]/10 rounded-xl">
                <Trophy className="w-5 h-5 text-yellow-500" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-4 rounded-xl">
                <p className="text-xs text-[#606060] uppercase font-black tracking-widest mb-1">
                  Total Attempts
                </p>
                <p className="text-2xl font-black text-[#f0f0f0]">
                  {quizLoading ? "..." : totalQuizAttempts}
                </p>
              </div>
              <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-4 rounded-xl">
                <p className="text-xs text-[#606060] uppercase font-black tracking-widest mb-1">
                  Avg. Score
                </p>
                <p className="text-2xl font-black text-[#ff5757]">
                  {quizLoading ? "..." : averageScore}%
                </p>
              </div>
            </div>

            {quizAttempts.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs font-black text-[#606060] uppercase tracking-widest">
                  Recent Performance
                </p>
                <div className="space-y-2">
                  {quizAttempts.slice(0, 3).map((attempt) => (
                    <div
                      key={attempt._id}
                      className="flex items-center justify-between p-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl"
                    >
                      <div>
                        <p className="text-xs font-bold text-[#f0f0f0]">
                          {attempt.categoryName}
                        </p>
                        <p className="text-xs text-[#505050] font-medium">
                          {new Date(attempt.completedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-black text-[#ff5757]">
                          {attempt.score}%
                        </p>
                        <p className="text-xs text-[#505050] font-bold">
                          {Math.round(attempt.totalTimeSpent / 60)}m
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Practice Modules */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-px bg-[#222] flex-1" />
          <h3 className="text-xs font-black text-[#505050] uppercase tracking-[0.3em] whitespace-nowrap">
            Practice Modules
          </h3>
          <div className="h-px bg-[#222] flex-1" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#111] border border-[#222] p-5 rounded-2xl hover:border-[#ff5757]/40 transition-all flex items-center justify-between group">
            <div>
              <h4 className="text-sm font-black text-[#f0f0f0]">Quizzes</h4>
              <p className="text-[11px] text-[#606060] font-medium mt-0.5">
                Topic-wise MCQs with instant results
              </p>
            </div>
            <Button
              variant="PRIMARY"
              className="bg-[#1a1a1a] border border-[#2a2a2a] text-[#a0a0a0] group-hover:text-white group-hover:bg-[#ff5757] group-hover:border-transparent transition-all font-black text-xs h-10 px-5 rounded-xl uppercase"
              text="Explore"
              onClick={() => router.push("/dashboard/quizzes")}
            />
          </div>

          <div className="bg-[#111] border border-[#222] p-5 rounded-2xl hover:border-[#ff5757]/40 transition-all flex items-center justify-between group">
            <div>
              <h4 className="text-sm font-black text-[#f0f0f0]">
                Interview Sheets
              </h4>
              <p className="text-[11px] text-[#606060] font-medium mt-0.5">
                Practice Q&As and mark progress
              </p>
            </div>
            <Button
              variant="PRIMARY"
              className="bg-[#1a1a1a] border border-[#2a2a2a] text-[#a0a0a0] group-hover:text-white group-hover:bg-[#ff5757] group-hover:border-transparent transition-all font-black text-xs h-10 px-5 rounded-xl uppercase"
              text="Open"
              onClick={() => router.push("/dashboard/interview-prep")}
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default CampusPrepDashboard;
