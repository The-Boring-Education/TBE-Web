import { useAuth } from "@tbe/auth";
import { Button } from "@tbe/components";
import { useQuizData } from "@tbe/hooks";
import type { QuizCategoryAPI } from "@tbe/types";
import { Play } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect } from "react";

const QuizzesDashboardPage = () => {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const { categories, loading, error, refetch } = useQuizData();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="text-gray-300">Loading quizes...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
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
    <div className="px-3 py-0">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="mb-3">
          <h1 className="text-xl font-bold text-white mb-1">Available Quizes</h1>
          <p className="text-xs text-gray-400">Pick a category to start</p>
        </div>

        {/* Quiz Cards Grid */}
        {categories.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-gray-400 text-xs mb-3">No quizes available right now.</p>
            <Button
              onClick={refetch}
              variant="OUTLINE"
              className="border-gray-700 text-white hover:bg-gray-800"
              text="Refresh"
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {categories.map((category: QuizCategoryAPI) => (
              <button
                key={category._id}
                type="button"
                onClick={() => startQuiz(category._id)}
                className="group text-left"
              >
                <div className="relative bg-black rounded-lg overflow-hidden border border-gray-800 hover:border-[#ff5757]/50 transition-all duration-300 shadow-lg" style={{ boxShadow: '0 0 20px rgba(255, 87, 87, 0.1)' }}>
                  {/* Left accent bar */}
                  <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: '#ff5757' }} />

                  <div className="relative p-2.5 flex flex-col h-full">
                    {/* Icon Section */}
                    <div className="mb-1">
                      <div className="text-2xl group-hover:scale-110 transition-transform duration-300 inline-block">
                        {category.categoryIcon}
                      </div>
                    </div>

                    {/* Title Section */}
                    <div className="mb-1">
                      <h3 className="text-base font-bold text-white group-hover:text-[#ff5757] transition-colors duration-300">
                        {category.categoryName}
                      </h3>
                    </div>

                    {/* Description */}
                    <p className="text-gray-400 text-[11px] leading-snug mb-2 line-clamp-2 group-hover:text-gray-300 transition-colors duration-300">
                      {category.categoryDescription}
                    </p>

                    {/* Button */}
                    <div className="flex justify-center">
                      <Button
                        variant="OUTLINE"
                        size="SMALL"
                        className="rounded-lg font-medium text-white bg-[#FF5757] hover:bg-[#FF5757]/90 text-sm px-1 py-1"
                        icon={<Play className="h-2.5 w-2.5 text-white" />}
                        text="Start"
                      />
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizzesDashboardPage;