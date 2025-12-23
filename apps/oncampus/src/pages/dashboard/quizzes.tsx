import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@tbe/auth";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@tbe/components";
import { useQuizData } from "@tbe/hooks";
import type { QuizCategoryAPI } from "@tbe/types";
import { BookOpen, Play } from "lucide-react";

const QuizzesDashboardPage = () => {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const { categories, loading, error, refetch } = useQuizData();

  // Keep behavior similar to other protected dashboard pages
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-gray-300">Loading quizzes...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <Button onClick={refetch} variant="OUTLINE" className="border-gray-700 text-white hover:bg-gray-800" text="Try Again" />
        </div>
      </div>
    );
  }

  const startQuiz = (categoryId: string) => {
    router.push(`/quiz/${categoryId}`);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Practice Quizzes</h1>
        <p className="text-gray-400">
          Choose a quiz category and start practicing. You&apos;ll see results instantly after completion.
        </p>
      </div>

      <Card className="border-gray-800 bg-[#0F0F0F]">
        <CardHeader className="border-b border-gray-800">
          <CardTitle className="flex items-center gap-2 text-white">
            <BookOpen className="h-5 w-5 text-[#FF5757]" />
            Available Quizzes
          </CardTitle>
          <CardDescription className="text-gray-400">
            Pick a category to start
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6">
          {categories.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 mb-6">No quizzes available right now.</p>
              <Button
                onClick={refetch}
                variant="OUTLINE"
                className="border-gray-700 text-white hover:bg-gray-800"
                text="Refresh"
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {categories.map((category: QuizCategoryAPI) => (
                <button
                  key={category._id}
                  type="button"
                  onClick={() => startQuiz(category._id)}
                  className="text-left"
                >
                  <Card className="h-full border-gray-800 bg-[#0A0A0A] hover:border-[#FF5757]/50 hover:shadow-[0_0_0_1px_rgba(255,87,87,0.25)] transition-all">
                    <CardContent className="p-6">
                      <div className="text-center">
                        <div className="text-4xl mb-4">{category.categoryIcon}</div>
                        <h3 className="text-lg font-semibold text-white mb-2">
                          {category.categoryName}
                        </h3>
                        <p className="text-sm text-gray-400 mb-5 line-clamp-3">
                          {category.categoryDescription}
                        </p>
                        <Button
                          variant="PRIMARY"
                          size="SMALL"
                          className="rounded-md mx-auto text-white bg-[#FF5757] hover:bg-[#FF5757]/90"
                          icon={<Play className="h-4 w-4 mr-2" />}
                          text="Start Quiz"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizzesDashboardPage;

