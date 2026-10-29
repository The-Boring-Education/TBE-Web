import { quizApi } from "@tbe/services";
import type { QuizCategoryAPI } from "@tbe/types";
import React, { useMemo, useState } from "react";
import { FiArrowRight, FiHelpCircle, FiSearch, FiZap } from "react-icons/fi";

// In-memory cache for questions to eliminate loading lag
export const quizQuestionsCache = new Map<string, any>();

export const prefetchQuizData = async (quizId: string) => {
  if (!quizId || quizQuestionsCache.has(quizId)) return;
  try {
    const res = await quizApi.getQuestions(quizId, false);
    if (res?.data) {
      quizQuestionsCache.set(quizId, res.data);
    }
  } catch (err) {
    console.error("Failed to prefetch quiz data", err);
  }
};

const QUIZ_CATEGORY_LOGOS: Record<string, string> = {
  node: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg",
  nodejs:
    "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg",
  "node.js":
    "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg",
  react:
    "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg",
  "react.js":
    "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg",
  reactjs:
    "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg",
  nextjs:
    "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nextjs/nextjs-original.svg",
  "next.js":
    "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nextjs/nextjs-original.svg",
  typescript:
    "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg",
  ts: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg",
  python:
    "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg",
  html: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg",
  css: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg",
  "html & css":
    "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg",
  cpp: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/cplusplus/cplusplus-original.svg",
  "c++":
    "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/cplusplus/cplusplus-original.svg",
  java: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/java/java-original.svg",
  sql: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postgresql/postgresql-original.svg",
  postgresql:
    "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postgresql/postgresql-original.svg",
  postgres:
    "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postgresql/postgresql-original.svg",
  mongodb:
    "https://raw.githubusercontent.com/devicons/devicon/master/icons/mongodb/mongodb-original.svg",
  git: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/git/git-original.svg",
  logic: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg",
  backend:
    "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg",
  frontend:
    "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg",
  javascript:
    "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg",
  js: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg",
};

export const getQuizLogo = (name?: string, fallbackIcon?: string) => {
  if (!name) return null;
  const lower = name.toLowerCase().trim();

  // Specific technology checks first to prevent 'js' from matching node.js, react.js, etc.
  if (lower.includes("node") || lower.includes("backend")) {
    return "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg";
  }
  if (lower.includes("react") || lower.includes("frontend")) {
    return "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg";
  }
  if (lower.includes("next")) {
    return "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nextjs/nextjs-original.svg";
  }
  if (lower.includes("typescript") || /\bts\b/.test(lower)) {
    return "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg";
  }
  if (lower.includes("python")) {
    return "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg";
  }
  if (lower.includes("html")) {
    return "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg";
  }
  if (lower.includes("css")) {
    return "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg";
  }
  if (lower.includes("postgres") || lower.includes("sql")) {
    return "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postgresql/postgresql-original.svg";
  }
  if (lower.includes("mongo")) {
    return "https://raw.githubusercontent.com/devicons/devicon/master/icons/mongodb/mongodb-original.svg";
  }
  if (lower.includes("c++") || lower.includes("cpp")) {
    return "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/cplusplus/cplusplus-original.svg";
  }
  if (lower.includes("java") && !lower.includes("javascript")) {
    return "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/java/java-original.svg";
  }
  if (lower.includes("git")) {
    return "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/git/git-original.svg";
  }
  if (lower.includes("logic") || lower.includes("c lang") || lower === "c") {
    return "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg";
  }

  // Pure JavaScript matches only
  if (lower.includes("javascript") || lower === "js" || /\bjs\b/.test(lower)) {
    return "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg";
  }

  return null;
};

interface QuizCatalogSpaceProps {
  categories: QuizCategoryAPI[];
  loading?: boolean;
  onSelectQuiz: (quizId: string, quizName?: string) => void;
}

export const QuizCatalogSpace: React.FC<QuizCatalogSpaceProps> = ({
  categories = [],
  loading = false,
  onSelectQuiz,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      const name = (cat.categoryName || "").toLowerCase();
      const desc = (cat.categoryDescription || "").toLowerCase();

      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!name.includes(q) && !desc.includes(q)) return false;
      }

      // Filter match
      if (selectedFilter === "frontend") {
        return (
          name.includes("react") ||
          name.includes("html") ||
          name.includes("css") ||
          name.includes("javascript") ||
          name.includes("js") ||
          name.includes("frontend")
        );
      }
      if (selectedFilter === "backend") {
        return (
          name.includes("node") ||
          name.includes("sql") ||
          name.includes("database") ||
          name.includes("backend") ||
          name.includes("api")
        );
      }
      if (selectedFilter === "programming") {
        return (
          name.includes("python") ||
          name.includes("java") ||
          name.includes("c++") ||
          name.includes("cpp") ||
          name.includes("dsa")
        );
      }
      return true;
    });
  }, [categories, selectedFilter, searchQuery]);

  return (
    <div className="space-y-3 sm:space-y-3.5">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#16161A] p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-[#24242A] shadow-2xs">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-red-500/10 text-[#FF3B30] border border-red-500/20">
              Skill Assessments
            </span>
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
              {categories.length} Topics Available
            </span>
          </div>
          <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
            Technical Quizzes &amp; Assessments
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-normal max-w-xl">
            Test conceptual depth, debug real code snippets, and assess
            interview readiness topic-by-topic.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/[0.07] border border-amber-500/20 text-xs font-bold text-amber-600 dark:text-amber-400">
            <FiZap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>Earn XP &amp; Badges</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white dark:bg-[#16161A] p-1.5 sm:p-2 rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-[#24242A] shadow-2xs">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none flex-nowrap">
          {[
            { id: "all", label: "All Topics" },
            { id: "frontend", label: "Frontend" },
            { id: "backend", label: "Backend" },
            { id: "programming", label: "Languages" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedFilter(tab.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                selectedFilter === tab.id
                  ? "bg-[#FF3B30] text-white shadow-2xs"
                  : "bg-slate-50 dark:bg-[#202026] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#282830] hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-60 shrink-0">
          <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-3.5 h-3.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-7.5 pr-3 py-1 bg-slate-50 dark:bg-[#202026] border border-slate-200 dark:border-[#282830] rounded-lg text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:bg-white dark:focus:bg-[#1A1A20] focus:border-[#FF3B30] transition-all"
          />
        </div>
      </div>

      {/* Quizzes Grid (Clean, Compact, Responsive) */}
      {loading ? (
        <div className="py-12 text-center text-xs font-bold text-slate-400">
          Loading available quizzes...
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="py-12 bg-white dark:bg-[#16161A] border border-slate-200/80 dark:border-[#24242A] rounded-xl sm:rounded-2xl text-center p-6 space-y-2">
          <FiHelpCircle className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">
            No quizzes found
          </h3>
          <p className="text-xs text-slate-400">
            Try adjusting your search query or topic filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {filteredCategories.map((category) => {
            const logo = getQuizLogo(category.categoryName);
            const questionCount =
              category.questions?.length || category.questionCount || 10;

            return (
              <div
                key={category._id}
                onMouseEnter={() => prefetchQuizData(category._id)}
                className="bg-white dark:bg-[#16161A] border border-slate-200/80 dark:border-[#24242A] hover:border-slate-300 dark:hover:border-[#383844] rounded-xl p-3 flex flex-col justify-between shadow-2xs hover:shadow-xs hover:-translate-y-0.5 transition-all duration-200 group cursor-pointer"
                onClick={() =>
                  onSelectQuiz(category._id, category.categoryName)
                }
              >
                <div>
                  {/* Top: Icon + Title */}
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center shrink-0">
                      {logo ? (
                        <img
                          src={logo}
                          alt={category.categoryName}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <span className="text-sm sm:text-base leading-none">
                          {category.categoryIcon || "⚡"}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-white group-hover:text-[#FF3B30] transition-colors leading-tight truncate">
                        {category.categoryName}
                      </h3>
                    </div>
                  </div>

                  {/* Description: Clean, 2-line clamp */}
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mt-1.5 mb-2 font-normal">
                    {category.categoryDescription ||
                      "Curated timed questions covering core concepts, edge cases, and best practices."}
                  </p>
                </div>

                {/* Footer: Metadata & Start Action */}
                <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-slate-100 dark:border-[#202026]">
                  <div className="flex items-center gap-2 text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    <div className="flex items-center gap-1">
                      <FiHelpCircle className="w-3 h-3 text-[#FF3B30] shrink-0" />
                      <span>{questionCount} Qs</span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
                      <FiZap className="w-3 h-3 shrink-0" />
                      <span>+50 XP</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectQuiz(category._id, category.categoryName);
                    }}
                    className="px-2.5 py-1 rounded-md text-[11px] font-bold transition-all shadow-2xs flex items-center gap-1 cursor-pointer bg-[#FF3B30] hover:bg-[#EE3126] text-white group/btn"
                  >
                    <span>Start</span>
                    <FiArrowRight className="w-2.5 h-2.5 group-hover/btn:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
