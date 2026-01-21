import { useMemo } from "react";
import { useUser, useApi } from "@tbe/hooks";
import { routes } from "@tbe/constants";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Progress,
  Button,
  LoadingSpinner,
} from "@tbe/components";
import {
  Trophy,
  ClipboardList,
  TrendingUp,
} from "lucide-react";
import { useRouter } from "next/router";

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

  // Fetch enrolled sheets
  const { response: enrolledSheetsResponse, loading: sheetsLoading } = useApi(
    "user-interview-prep",
    user?.id
      ? {
        url: `${routes.api.base}${routes.api.mySheets}?userId=${user.id}`,
      }
      : undefined,
    { enabled: !!user?.id }
  );

  // Fetch quiz performance (includes recent attempts and stats)
  const { response: quizPerformanceResponse, loading: quizLoading } = useApi(
    "quiz-performance",
    user?.id
      ? {
        url: `${routes.api.base}/quiz/performance/${user.id}`,
      }
      : undefined,
    { enabled: !!user?.id }
  );

  // Process enrolled sheets - All hooks must be before any early returns
  const enrolledSheets: EnrolledSheet[] = useMemo(() => {
    if (!enrolledSheetsResponse?.status || !enrolledSheetsResponse?.data) return [];
    const sheets = Array.isArray(enrolledSheetsResponse.data)
      ? enrolledSheetsResponse.data
      : [];
    return sheets.slice(0, 3); // Get last 3 sheets (already sorted by lastUpdated)
  }, [enrolledSheetsResponse]);

  // Process quiz performance data
  const quizPerformance: QuizPerformance | null = useMemo(() => {
    if (!quizPerformanceResponse) return null;

    // Handle different response formats
    // API returns: { success: true, data: {...} }
    // useApi returns: { status: true, data: { success: true, data: {...} } }
    const response = quizPerformanceResponse as any;

    // Debug: Log the response structure
    if (process.env.NODE_ENV === 'development') {
      console.log('Quiz Performance Response:', response);
    }

    // Case 1: Response has status and data (useApi wrapper)
    if (response.status && response.data) {
      // If data has success and data properties, extract nested data
      if (response.data.success && response.data.data) {
        return response.data.data as QuizPerformance;
      }
      // If data is directly the performance object
      if (response.data.totalAttempts !== undefined) {
        return response.data as QuizPerformance;
      }
    }

    // Case 2: Response has success and data (direct API response)
    if (response.success && response.data) {
      return response.data as QuizPerformance;
    }

    // Case 3: Response is directly the performance object
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

  // Redirect to login if not authenticated - Early returns AFTER all hooks
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
    <div className="space-y-6">
      {/* Welcome Card */}
      <Card className=" border-gray-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">
                Welcome back, {userName} 👋
              </h1>
              <p className="text-gray-400">Ready to prepare today?</p>
            </div>
            <Button
              variant="PRIMARY"
              text="Continue learning"
              size="MEDIUM"
            />
          </div>
        </CardContent>
      </Card>

      {/* Continue Learning Card - Last Sheets Studied */}
      <Card className=" border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Continue where you left off</CardTitle>
          <CardDescription className="text-gray-400">
            Your recently studied interview sheets
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {sheetsLoading ? (
            <div className="flex items-center justify-center py-4">
              <LoadingSpinner height={4} width={4} />
            </div>
          ) : enrolledSheets.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">
              No sheets studied yet. Start your first sheet!
            </p>
          ) : (
            enrolledSheets.map((sheet) => (
              <div
                key={sheet._id}
                className="flex items-center justify-between p-3 bg-[#1A1A1A] rounded-lg border border-gray-800"
              >
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-white mb-1">
                    {sheet.name}
                  </h4>
                  {sheet.progress && sheet.progress.total > 0 && (
                    <div className="space-y-1">
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
                  className="border-gray-700 text-white hover:bg-gray-800 ml-3"
                  text="Continue"
                  onClick={() => router.push(`/dashboard/interview-prep/${sheet.slug}`)}
                />
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Quiz Insights Section */}
      <Card className="border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            Quiz Insights
          </CardTitle>
          <CardDescription className="text-gray-400">
            Your recent quiz performance and statistics
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-[#1A1A1A] rounded-lg border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-400">Total Attempts</p>
                <Trophy className="w-4 h-4 text-yellow-500" />
              </div>
              <p className="text-2xl font-bold text-white">
                {quizLoading ? "..." : totalQuizAttempts}
              </p>
              <p className="text-xs text-gray-500 mt-1">Quizes completed</p>
            </div>

            <div className="p-4 bg-[#1A1A1A] rounded-lg border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-400">Average Score</p>
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-white">
                {quizLoading ? "..." : averageScore}%
              </p>
              <p className="text-xs text-gray-500 mt-1">Based on recent attempts</p>
            </div>
          </div>

          {quizAttempts.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-400">Recent Scores</p>
              <div className="space-y-2">
                {quizAttempts.slice(0, 3).map((attempt) => (
                  <div
                    key={attempt._id}
                    className="flex items-center justify-between p-3 bg-[#1A1A1A] rounded-lg border border-gray-800"
                  >
                    <div className="flex-1">
                      <p className="text-sm text-white">
                        {attempt.categoryName}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(attempt.completedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
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

      {/* Practice Section */}
      <Card className="border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            Practice
          </CardTitle>
          <CardDescription className="text-gray-400">
            Quick practice modules to keep your streak going
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-4 bg-[#1A1A1A] rounded-lg border border-gray-800">
            <div>
              <p className="text-white font-semibold">Quizes</p>
              <p className="text-xs text-gray-400 mt-1">
                Topic-wise MCQs with instant results
              </p>
            </div>
            <Button
              variant="OUTLINE"
              size="SMALL"
              className="border-gray-700 text-white hover:bg-gray-800"
              text="Explore"
              onClick={() => router.push("/dashboard/quizzes")}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-[#1A1A1A] rounded-lg border border-gray-800">
            <div>
              <p className="text-white font-semibold">Interview Sheets</p>
              <p className="text-xs text-gray-400 mt-1">
                Practice interview questions and mark progress
              </p>
            </div>
            <Button
              variant="OUTLINE"
              size="SMALL"
              className="border-gray-700 text-white hover:bg-gray-800"
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
