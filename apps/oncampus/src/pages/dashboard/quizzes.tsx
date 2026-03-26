import { useAuth } from "@tbe/auth";
import {
  Button,
  FlexContainer,
  LearningEnvironmentLayout,
  LoadingSpinner,
  Text,
} from "@tbe/components";
import { routes } from "@tbe/constants";
import { useQuizData } from "@tbe/hooks";
import { cn } from "@tbe/utils";
import { ArrowLeft, Folder, FolderOpen, Monitor, Play } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

const QuizzesDashboardPage = () => {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { categories, loading: quizLoading, error, refetch } = useQuizData();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  const activeCategory = useMemo(() => {
    if (selectedCategoryId === "all") return null;
    return categories.find((cat) => cat._id === selectedCategoryId);
  }, [selectedCategoryId, categories]);

  const filteredCategories = useMemo(() => {
    if (selectedCategoryId === "all") return categories;
    return categories.filter((cat) => cat._id === selectedCategoryId);
  }, [selectedCategoryId, categories]);

  if (authLoading || quizLoading) {
    return (
      <LearningEnvironmentLayout
        backHref={routes.oncampus.dashboard}
        layoutMode="workspace"
        isLoading
      >
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner height={8} width={8} />
          <Text level="p" className="text-gray-400 ml-3">
            Loading quizzes...
          </Text>
        </div>
      </LearningEnvironmentLayout>
    );
  }

  if (error) {
    return (
      <LearningEnvironmentLayout
        backHref={routes.oncampus.dashboard}
        layoutMode="workspace"
      >
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <Button
              onClick={refetch}
              variant="OUTLINE"
              className="border-gray-700 text-white hover:bg-gray-800"
              text="Try Again"
            />
          </div>
        </div>
      </LearningEnvironmentLayout>
    );
  }

  const startQuiz = (categoryId: string) => {
    router.push(`/quiz/${categoryId}`);
  };

  return (
    <LearningEnvironmentLayout
      backHref={routes.oncampus.dashboard}
      layoutMode="workspace"
    >
      <div className="flex flex-col h-full w-full">
        {/* Header Section */}
        <div className="w-full min-h-[72px] border-b border-gray-800 bg-[#0A0A0A] flex shrink-0">
          <div className="border-r border-gray-800/60 px-3 py-3.5 flex items-center justify-between shrink-0 transition-all duration-300 w-full lg:w-[260px]">
            <div>
              <Text
                level="h2"
                className="text-[13px] font-black text-white mb-0.5 tracking-tight"
              >
                Explore Quizzes
              </Text>
              <Text
                level="p"
                className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.1em]"
              >
                Choose a category
              </Text>
            </div>
            {selectedCategoryId !== "all" && (
              <button
                onClick={() => setSelectedCategoryId("all")}
                className="flex items-center justify-center w-[28px] h-[28px] rounded-[6px] border border-red-500/40 bg-red-500/5 text-red-500 hover:bg-red-500/10 hover:border-red-500 transition-all duration-300 shrink-0 shadow-[0_0_10px_rgba(239,68,68,0.1)] active:scale-95"
                title="View All Quizzes"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="hidden lg:flex flex-1 items-center justify-between px-4">
            <FlexContainer wrap={false} className="gap-2">
              <FlexContainer
                direction="col"
                itemCenter={false}
                justifyCenter={false}
                wrap={false}
              >
                <Text
                  level="h1"
                  className="strong-text font-bold text-white mb-0.5 tracking-tight"
                >
                  {activeCategory ? activeCategory.categoryName : "All Quizzes"}
                </Text>
                <Text
                  level="p"
                  className="text-[10px] font-medium text-gray-500 uppercase tracking-wider"
                >
                  {activeCategory
                    ? `Practicing ${activeCategory.categoryName} questions`
                    : "Select a category to start practicing"}
                </Text>
              </FlexContainer>
            </FlexContainer>
          </div>
        </div>

        <FlexContainer
          className="lg:flex-row flex-1 min-h-0 w-full"
          direction="col"
          itemCenter={false}
          justifyCenter={false}
          wrap={false}
        >
          {/* Categories Sidebar */}
          <div className="w-full lg:w-[260px] flex-shrink-0 border-r border-gray-800 flex flex-col bg-[#0A0A0A]">
            <div className="flex-1 overflow-y-auto px-3 py-3 scrollbar-thin-grey">
              <div className="space-y-1">
                <FlexContainer
                  direction="col"
                  fullWidth
                  itemCenter={false}
                  justifyCenter={false}
                  wrap={false}
                  className="gap-1"
                >
                  {/* All option */}
                  <button
                    onClick={() => setSelectedCategoryId("all")}
                    className={cn(
                      "w-full group relative py-2.5 px-4 rounded-r-lg border-l-[3px] transition-all duration-300 cursor-pointer text-left focus:outline-none",
                      selectedCategoryId === "all"
                        ? "bg-red-500/[0.03] border-red-500 shadow-[0_1px_6px_rgba(239,68,68,0.02)] text-white"
                        : "border-transparent bg-transparent hover:bg-white/[0.02] hover:border-gray-800 text-gray-400 group-hover:text-gray-300",
                    )}
                  >
                    <FlexContainer
                      className="items-center w-full gap-3"
                      itemCenter
                      justifyCenter={false}
                    >
                      {selectedCategoryId === "all" ? (
                        <FolderOpen className="w-[15px] h-[15px] shrink-0 text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                      ) : (
                        <Folder className="w-[15px] h-[15px] shrink-0 text-gray-600 group-hover:text-gray-400 transition-colors" />
                      )}
                      <Text
                        level="p"
                        className={cn(
                          "text-[13px] font-semibold leading-tight transition-colors duration-300 py-0.5 text-left break-words whitespace-normal flex-1",
                          selectedCategoryId === "all"
                            ? "text-white"
                            : "text-gray-400 group-hover:text-gray-300",
                        )}
                      >
                        All Categories
                      </Text>
                    </FlexContainer>
                  </button>

                  {categories.map((category) => {
                    const isActive = selectedCategoryId === category._id;
                    return (
                      <button
                        key={category._id}
                        onClick={() => setSelectedCategoryId(category._id)}
                        className={cn(
                          "w-full group relative py-2.5 px-4 rounded-r-lg border-l-[3px] transition-all duration-300 cursor-pointer text-left focus:outline-none",
                          isActive
                            ? "bg-red-500/[0.03] border-red-500 shadow-[0_1px_6px_rgba(239,68,68,0.02)] text-white"
                            : "border-transparent bg-transparent hover:bg-white/[0.02] hover:border-gray-800 text-gray-400 group-hover:text-gray-300",
                        )}
                      >
                        <FlexContainer
                          className="items-center w-full gap-3"
                          itemCenter
                          justifyCenter={false}
                        >
                          <span className="w-[15px] h-[15px] flex items-center justify-center shrink-0">
                            <Monitor
                              className={cn(
                                "w-3.5 h-3.5",
                                isActive
                                  ? "text-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                                  : "text-gray-500 group-hover:text-gray-400 transition-colors",
                              )}
                            />
                          </span>
                          <Text
                            level="p"
                            className={cn(
                              "text-[13px] font-semibold leading-tight transition-colors duration-300 py-0.5 text-left break-words whitespace-normal flex-1",
                              isActive
                                ? "text-white"
                                : "text-gray-400 group-hover:text-gray-300",
                            )}
                          >
                            {category.categoryName}
                          </Text>
                        </FlexContainer>
                      </button>
                    );
                  })}
                </FlexContainer>
              </div>
            </div>
          </div>

          {/* Main Quiz Grid Area */}
          <div className="flex-1 flex flex-col h-full w-full overflow-y-auto bg-[#050505] p-6 lg:p-8 scrollbar-thin-grey">
            {filteredCategories.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[40vh]">
                <Text level="p" className="text-gray-400">
                  No quizzes available in this category.
                </Text>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCategories.map((category) => (
                  <button
                    key={category._id}
                    type="button"
                    onClick={() => startQuiz(category._id)}
                    className="group text-left"
                  >
                    <div
                      className="relative bg-[#0A0A0A] rounded-xl overflow-hidden border border-gray-800 hover:border-red-500/30 transition-all duration-300 shadow-lg group-hover:-translate-y-1"
                      style={{ boxShadow: "0 4px 20px rgba(0, 0, 0, 0.4)" }}
                    >
                      {/* Red accent bar */}
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                      <div className="relative p-4 flex flex-col h-full">
                        {/* Icon & Badge */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-2xl bg-gray-900/50 w-10 h-10 flex items-center justify-center rounded-lg border border-gray-800 group-hover:scale-110 transition-transform duration-300">
                            <Monitor
                              className="w-3.5 h-3.5 text-gray-400 group-hover:text-red-500 transition-colors duration-300"
                              strokeWidth={2}
                            />
                          </div>
                          <div className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-900 text-gray-500 uppercase tracking-tighter border border-gray-800 group-hover:border-red-500/20 group-hover:text-red-500/70 transition-colors">
                            Quiz Module
                          </div>
                        </div>

                        {/* Title Section */}
                        <div className="mb-1">
                          <h3 className="text-lg font-bold text-white group-hover:text-red-500 transition-colors duration-300 tracking-tight">
                            {category.categoryName}
                          </h3>
                        </div>

                        {/* Description */}
                        <p className="text-gray-500 text-xs leading-relaxed mb-3 line-clamp-2 group-hover:text-gray-300 transition-colors duration-300">
                          {category.categoryDescription}
                        </p>

                        {/* Footer Action */}
                        <div className="mt-auto pt-3 border-t border-gray-800/50 flex items-center justify-between">
                          <Text
                            level="p"
                            className="text-[10px] font-bold text-gray-600 uppercase"
                          >
                            Ready to start?
                          </Text>
                          <div className="flex items-center gap-1.5 text-red-500 font-bold text-xs group-hover:translate-x-1 transition-transform">
                            <span>Start Now</span>
                            <Play className="fill-current w-2.5 h-2.5" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </FlexContainer>
      </div>
    </LearningEnvironmentLayout>
  );
};

export default QuizzesDashboardPage;
