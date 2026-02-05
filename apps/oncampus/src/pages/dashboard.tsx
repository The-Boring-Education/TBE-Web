import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  LoadingSpinner,
  Progress,
} from "@tbe/components";
import { routes } from "@tbe/constants";
import { useApi, useUser } from "@tbe/hooks";
import {
  TrendingUp,
  Trophy,
} from "lucide-react";
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

  const { response: enrolledSheetsResponse, loading: sheetsLoading } = useApi(
    "user-interview-prep",
    user?.id
      ? {
        url: `${routes.api.base}${routes.api.mySheets}?userId=${user.id}`,
      }
      : undefined,
    { enabled: !!user?.id }
  );

  const { response: quizPerformanceResponse, loading: quizLoading } = useApi(
    "quiz-performance",
    user?.id
      ? {
        url: `${routes.api.base}/quiz/performance/${user.id}`,
      }
      : undefined,
    { enabled: !!user?.id }
  );

  const enrolledSheets: EnrolledSheet[] = useMemo(() => {
    if (!enrolledSheetsResponse?.status || !enrolledSheetsResponse?.data) return [];
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

  const userName = user?.name || user?.email?.split('@')[0] || "Student";

  return (
    <div className="space-y-2">
      {/* Welcome Card with gradient overlay */}
      <Card className="rounded-lg border border-gray-800 transition-all duration-300 ease-in-out cursor-pointer hover:shadow-lg relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-gray-400/15 to-gray-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        <CardContent className="p-2 relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white mb-px">
                Welcome back, {userName} 👋
              </h1>
              <p className="text-gray-400">Ready to prepare today?</p>
            </div>
            <Button
              variant="PRIMARY"
              text="Continue learning"
              size="MEDIUM"
              onClick={() => router.push("/dashboard/interview-prep")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Continue Learning Card with gradient overlay */}
      <Card className="rounded-lg border border-gray-800 transition-all duration-300 ease-in-out cursor-pointer hover:border-primary hover:shadow-lg relative overflow-hidden group">

        <CardHeader className="p-2 relative z-10">
          <CardTitle className="text-white">Continue where you left off</CardTitle>
          <CardDescription className="text-gray-400">
            Your recently studied interview sheets
          </CardDescription>
        </CardHeader>
        <CardContent className="p-2 space-y-1.5 relative z-10">
          {sheetsLoading ? (
            <div className="flex items-center justify-center py-2">
              <LoadingSpinner height={4} width={4} />
            </div>
          ) : enrolledSheets.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-2">
              No sheets studied yet. Start your first sheet!
            </p>
          ) : (
            enrolledSheets.map((sheet) => (
              <div
                key={sheet._id}
                className="flex items-center justify-between p-2 bg-[#1A1A1A] rounded-lg border border-gray-400/60 transition-all duration-300 ease-in-out cursor-pointer hover:shadow-lg relative overflow-hidden group/sheet"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-gray-400/15 to-gray-600/20 opacity-0 group-hover/sheet:opacity-100 transition-opacity duration-500 pointer-events-none" />

                <div className="flex-1 relative z-10">
                  <h4 className="text-sm font-medium text-white mb-px">
                    {sheet.name}
                  </h4>
                  {sheet.progress && sheet.progress.total > 0 && (
                    <div className="space-y-px">
                      <Progress
                        value={sheet.progress.percentage}
                        className="h-1.5 bg-gray-800"
                      />
                      <p className="text-xs text-gray-400">
                        {sheet.progress.completed} of {sheet.progress.total} questions completed ({sheet.progress.percentage}%)
                      </p>
                    </div>
                  )}
                </div>
                <Button
                  variant="OUTLINE"
                  size="SMALL"
                  className="border-gray-700 text-white hover:bg-gray-800 ml-2 relative z-10"
                  text="Continue"
                  onClick={() => router.push(`/dashboard/interview-prep/${sheet.slug}`)}
                />
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Quiz Insights Card with gradient overlay */}
      <Card className="rounded-lg border border-gray-800 transition-all duration-300 ease-in-out cursor-pointer hover:border-primary hover:shadow-lg relative overflow-hidden group">

        <CardHeader className="p-2 relative z-10">
          <CardTitle className="text-white flex items-center gap-1">
            Quiz Insights
          </CardTitle>
          <CardDescription className="text-gray-400">
            Your recent quiz performance and statistics
          </CardDescription>
        </CardHeader>
        <CardContent className="p-2 space-y-2 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {/* Total Attempts Card */}
            <div className="p-2 bg-[#1A1A1A] rounded-lg border border-gray-400/60 transition-all duration-300 ease-in-out cursor-pointer hover:shadow-lg relative overflow-hidden group/stat">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-gray-400/15 to-gray-600/20 opacity-0 group-hover/stat:opacity-100 transition-opacity duration-500 pointer-events-none" />

              <div className="flex items-center justify-between mb-1 relative z-10">
                <p className="text-sm text-gray-400 group-hover/stat:text-white transition-colors">Total Attempts</p>
                <Trophy className="w-4 h-4 text-yellow-500" />
              </div>
              <p className="text-2xl font-bold text-white relative z-10">
                {quizLoading ? "..." : totalQuizAttempts}
              </p>
              <p className="text-xs text-gray-500 mt-px relative z-10">Quizes completed</p>
            </div>

            {/* Average Score Card */}
            <div className="p-2 bg-[#1A1A1A] rounded-lg border border-gray-400/60 transition-all duration-300 ease-in-out cursor-pointer hover:shadow-lg relative overflow-hidden group/stat">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-gray-400/15 to-gray-600/20 opacity-0 group-hover/stat:opacity-100 transition-opacity duration-500 pointer-events-none" />

              <div className="flex items-center justify-between mb-1 relative z-10">
                <p className="text-sm text-gray-400 group-hover/stat:text-white transition-colors">Average Score</p>
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-white relative z-10">
                {quizLoading ? "..." : averageScore}%
              </p>
              <p className="text-xs text-gray-500 mt-px relative z-10">
                Based on recent attempts
              </p>
            </div>
          </div>

          {quizAttempts.length > 0 && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-400">Recent Scores</p>
              <div className="space-y-1">
                {quizAttempts.slice(0, 3).map((attempt) => (
                  <div
                    key={attempt._id}
                    className="p-2 bg-[#1A1A1A] rounded-lg border border-gray-400/60 transition-all duration-300 ease-in-out cursor-pointer hover:shadow-lg flex items-center justify-between relative overflow-hidden group/attempt"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-gray-400/15 to-gray-600/20 opacity-0 group-hover/attempt:opacity-100 transition-opacity duration-500 pointer-events-none" />

                    <div className="flex-1 relative z-10">
                      <p className="text-sm text-white">
                        {attempt.categoryName}
                      </p>
                      <p className="text-xs text-gray-400 mt-px">
                        {new Date(attempt.completedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right relative z-10">
                      <p className="text-sm font-semibold text-white">
                        {attempt.score}%
                      </p>
                      <p className="text-xs text-gray-400">
                        {Math.round(attempt.totalTimeSpent / 60)} min
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Practice Card with gradient overlay */}
      <Card className="rounded-lg border border-gray-800 transition-all duration-300 ease-in-out cursor-pointer hover:border-primary hover:shadow-lg relative overflow-hidden group">

        <CardHeader className="p-2 relative z-10">
          <CardTitle className="text-white flex items-center gap-1">
            Practice
          </CardTitle>
          <CardDescription className="text-gray-400">
            Quick practice modules to keep your streak going
          </CardDescription>
        </CardHeader>
        <CardContent className="p-2 grid grid-cols-1 md:grid-cols-2 gap-2 relative z-10">
          {/* Quizzes Card */}
          <div className="p-2 bg-[#1A1A1A] rounded-lg border border-gray-400/60 transition-all duration-300 ease-in-out cursor-pointer hover:shadow-lg flex items-center justify-between relative overflow-hidden group/quiz">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-gray-400/15 to-gray-600/20 opacity-0 group-hover/quiz:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <div className="relative z-10">
              <p className="text-white font-semibold">Quizes</p>
              <p className="text-xs text-gray-400 mt-px">
                Topic-wise MCQs with instant results
              </p>
            </div>
            <Button
              variant="OUTLINE"
              size="SMALL"
              className="border-gray-700 text-white hover:bg-gray-800 relative z-10"
              text="Explore"
              onClick={() => router.push("/dashboard/quizzes")}
            />
          </div>

          {/* Interview Sheets Card */}
          <div className="p-2 bg-[#1A1A1A] rounded-lg border border-gray-400/60 transition-all duration-300 ease-in-out cursor-pointer hover:shadow-lg flex items-center justify-between relative overflow-hidden group/interview">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-gray-400/15 to-gray-600/20 opacity-0 group-hover/interview:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <div className="relative z-10">
              <p className="text-white font-semibold">Interview Sheets</p>
              <p className="text-xs text-gray-400 mt-px">
                Practice interview questions and mark progress
              </p>
            </div>
            <Button
              variant="OUTLINE"
              size="SMALL"
              className="border-gray-700 text-white hover:bg-gray-800 w-20 h-15 relative z-10"
              text="Open"
              onClick={() => router.push("/dashboard/interview-prep")}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CampusPrepDashboard;