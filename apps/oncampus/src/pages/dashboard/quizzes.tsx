import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@tbe/auth";
import { Button } from "@tbe/components";
import { useQuizData } from "@tbe/hooks";
import type { QuizCategoryAPI } from "@tbe/types";
import { Play } from "lucide-react";

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
    <div className=" py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Available Quizes</h1>
          <p className="text-sm text-gray-400">Pick a category to start</p>
        </div>

        {/* Quiz Cards Grid */}
        {categories.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm mb-4">No quizes available right now.</p>
            <Button
              onClick={refetch}
              variant="OUTLINE"
              className="border-gray-700 text-white hover:bg-gray-800"
              text="Refresh"
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

                  <div className="relative p-5 flex flex-col h-full">
                    {/* Icon Section */}
                    <div className="mb-3">
                      <div className="text-4xl group-hover:scale-110 transition-transform duration-300 inline-block">
                        {category.categoryIcon}
                      </div>
                    </div>

                    {/* Title Section */}
                    <div className="mb-2">
                      <h3 className="text-lg font-bold text-white group-hover:text-[#ff5757] transition-colors duration-300">
                        {category.categoryName}
                      </h3>
                      <p className="text-xs font-medium" style={{ color: '#ff5757' }}>Quiz</p>
                    </div>

                    {/* Description */}
                    <p className="text-gray-400 text-xs leading-relaxed mb-4 line-clamp-2 group-hover:text-gray-300 transition-colors duration-300">
                      {category.categoryDescription}
                    </p>

                    {/* Button */}
                    <div className="flex justify-center">
                      <Button
                        variant="PRIMARY"
                        size="SMALL"
                        className="rounded-md text-white bg-[#FF5757] hover:bg-[#FF5757]/90 ml-1 flex items-center justify-center px-2"
                        icon={<Play className="h-3 w-3 " />}
                        text="Start Quiz"
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