import { routes } from "@tbe/constants";
import { useGamificationFeedback } from "@tbe/gamification";
import { sendRequest } from "@tbe/utils";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiBookOpen,
  FiCheck,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
  FiList,
  FiSearch,
} from "react-icons/fi";

import MDXRenderer from "../common/MDXRenderer";
import { LearnButton } from "./LearnButton";
import { PersonalizationLoader } from "./PersonalizationLoader";
import { getQuizLogo } from "./QuizCatalogSpace";

export interface CourseChapter {
  _id: string;
  name: string;
  content: string;
  isCompleted?: boolean;
}

export interface CourseLearningSpaceProps {
  courseSlug: string;
  initialCourse?: any;
  user?: any;
  onBack: () => void;
  onNavigateToDashboard?: () => void;
  onChapterChange?: (chapterName: string) => void;
}

export const courseDataCache = new Map<string, any>();

export const prefetchCourseData = async (
  courseSlug: string,
  userId?: string,
) => {
  if (!courseSlug || courseDataCache.has(courseSlug))
    return courseDataCache.get(courseSlug);
  try {
    const url = userId
      ? `${routes.api.shiksha}?slug=${encodeURIComponent(courseSlug)}&userId=${userId}`
      : `${routes.api.shiksha}?slug=${encodeURIComponent(courseSlug)}`;
    const res = await sendRequest({ method: "GET", url });
    if (res?.data) {
      const courseData = Array.isArray(res.data) ? res.data[0] : res.data;
      if (courseData) {
        courseDataCache.set(courseSlug, courseData);
        return courseData;
      }
    }
  } catch (err) {
    // Ignore prefetch error
  }
  return null;
};

export const CourseLearningSpace: React.FC<CourseLearningSpaceProps> = ({
  courseSlug,
  initialCourse,
  user,
  onBack,
  onNavigateToDashboard,
  onChapterChange,
}) => {
  const cachedCourse = courseDataCache.get(courseSlug);
  const [course, setCourse] = useState<any>(
    cachedCourse || initialCourse || null,
  );
  const [chapters, setChapters] = useState<CourseChapter[]>(
    cachedCourse?.chapters || initialCourse?.chapters || [],
  );
  const [currentChapterId, setCurrentChapterId] = useState<string>(
    cachedCourse?.chapters?.[0]?._id?.toString?.() ||
      initialCourse?.chapters?.[0]?._id?.toString?.() ||
      "",
  );
  const [isLoading, setIsLoading] = useState<boolean>(
    !cachedCourse?.chapters?.length && !initialCourse?.chapters?.length,
  );
  const [isUpdatingChapter, setIsUpdatingChapter] = useState<boolean>(false);
  const [isChapterNavCollapsed, setIsChapterNavCollapsed] =
    useState<boolean>(false);
  const [filterQuery, setFilterQuery] = useState<string>("");
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setIsChapterNavCollapsed(true);
    }
  }, []);

  useEffect(() => {
    const checkDark = () => {
      if (typeof document !== "undefined") {
        setIsDarkMode(document.documentElement.classList.contains("dark"));
      }
    };
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  const { celebrate } = useGamificationFeedback();

  // Fetch course details with chapters & completion status
  useEffect(() => {
    let isMounted = true;
    const fetchCourse = async () => {
      const inMemory = courseDataCache.get(courseSlug);
      if (
        !inMemory?.chapters?.length &&
        !initialCourse?.chapters?.length &&
        (!course || !chapters.length)
      ) {
        setIsLoading(true);
      }
      try {
        const userId = user?.id || user?._id;
        const url = userId
          ? `${routes.api.shiksha}?slug=${encodeURIComponent(courseSlug)}&userId=${userId}`
          : `${routes.api.shiksha}?slug=${encodeURIComponent(courseSlug)}`;

        const res = await sendRequest({
          method: "GET",
          url,
        });

        if (!isMounted) return;

        if (res?.data) {
          const courseData = Array.isArray(res.data) ? res.data[0] : res.data;
          if (courseData) {
            courseDataCache.set(courseSlug, courseData);
            setCourse(courseData);
            const chList = courseData.chapters || [];
            setChapters(chList);
            if (chList.length > 0 && !currentChapterId) {
              const first = chList[0];
              if (first) {
                setCurrentChapterId(first._id.toString());
                onChapterChange?.(first.name);
              }
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch course for learning space", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchCourse();

    return () => {
      isMounted = false;
    };
  }, [courseSlug, user?.id, user?._id]);

  // Set default initial chapter if available
  useEffect(() => {
    if (chapters.length > 0 && !currentChapterId) {
      const first = chapters[0];
      if (first) {
        setCurrentChapterId(first._id.toString());
        onChapterChange?.(first.name);
      }
    }
  }, [chapters, currentChapterId, onChapterChange]);

  const activeChapterIndex = useMemo(() => {
    return chapters.findIndex((c) => c._id.toString() === currentChapterId);
  }, [chapters, currentChapterId]);

  const activeChapter = useMemo(() => {
    return chapters[activeChapterIndex] || chapters[0] || null;
  }, [chapters, activeChapterIndex]);

  const completedCount = useMemo(() => {
    return chapters.filter((c) => c.isCompleted).length;
  }, [chapters]);

  const totalCount = chapters.length;
  const progressPercentage =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleSelectChapter = (ch: CourseChapter) => {
    const id = ch._id.toString();
    setCurrentChapterId(id);
    onChapterChange?.(ch.name);
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setIsChapterNavCollapsed(true);
    }
  };

  const handleToggleCompletion = useCallback(async () => {
    if (!activeChapter || !user) return;
    const chId = activeChapter._id.toString();
    const newStatus = !activeChapter.isCompleted;

    setIsUpdatingChapter(true);
    // Optimistic UI update
    setChapters((prev) =>
      prev.map((c) =>
        c._id.toString() === chId ? { ...c, isCompleted: newStatus } : c,
      ),
    );

    try {
      const response = await sendRequest({
        method: "PATCH",
        url: routes.api.markCourseChapterAsCompleted,
        body: {
          userId: user?.id || user?._id,
          courseId: course?._id,
          chapterId: chId,
          isCompleted: newStatus,
        },
      });

      if (newStatus && response?.gamification) {
        celebrate(response.gamification, {
          message: "Chapter completed! Keep up the great work!",
        });
      }
    } catch (err) {
      console.error("Failed to mark chapter completion", err);
      // Revert on error
      setChapters((prev) =>
        prev.map((c) =>
          c._id.toString() === chId ? { ...c, isCompleted: !newStatus } : c,
        ),
      );
    } finally {
      setIsUpdatingChapter(false);
    }
  }, [activeChapter, user, course?._id, celebrate]);

  const handleNextChapter = () => {
    if (activeChapterIndex >= 0 && activeChapterIndex < chapters.length - 1) {
      const next = chapters[activeChapterIndex + 1];
      if (next) {
        setCurrentChapterId(next._id.toString());
        onChapterChange?.(next.name);
      }
    }
  };

  const handlePrevChapter = () => {
    if (activeChapterIndex > 0) {
      const prev = chapters[activeChapterIndex - 1];
      if (prev) {
        setCurrentChapterId(prev._id.toString());
        onChapterChange?.(prev.name);
      }
    }
  };

  const filteredChapters = useMemo(() => {
    if (!filterQuery.trim()) return chapters;
    const q = filterQuery.toLowerCase();
    return chapters.filter((c) => c.name.toLowerCase().includes(q));
  }, [chapters, filterQuery]);

  // Strip leading redundant h1 Markdown heading if matches chapter name
  const cleanContent = useMemo(() => {
    if (!activeChapter?.content) return "";
    return activeChapter.content.replace(/^#+\s+[^\n]+\n*/, "").trim();
  }, [activeChapter?.content]);

  if (isLoading && (!course || chapters.length === 0)) {
    return (
      <div className="w-full h-full min-h-[550px] flex items-center justify-center bg-black rounded-2xl overflow-hidden p-6">
        <PersonalizationLoader
          fullScreen={false}
          theme="dark"
          title="Loading Course Workspace..."
          subtitle="Preparing chapters & interactive workspace..."
          className="bg-black text-white"
        />
      </div>
    );
  }

  return (
    <div className="space-y-2.5 sm:space-y-3">
      {/* Breadcrumb Navigation: Outside the rectangle card */}
      <nav className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 flex-wrap px-0.5">
        <button
          type="button"
          onClick={onNavigateToDashboard || onBack}
          className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          Learn
        </button>
        <span className="text-slate-300 dark:text-slate-600">›</span>
        <button
          type="button"
          onClick={onBack}
          className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          Shiksha Courses
        </button>
        <span className="text-slate-300 dark:text-slate-600">›</span>
        <span className="font-bold text-[#FF4D4D] truncate max-w-[240px] sm:max-w-xs">
          {course?.name || "Course Workspace"}
        </span>
      </nav>

      {/* 1. Shiksha Course Header Card */}
      <div className="relative overflow-hidden rounded-2xl border border-[#FED7D7]/80 dark:border-red-950/80 p-3.5 sm:p-4 bg-[#FFF5F4] dark:bg-[#1A1113] flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-2xs">
        {/* Left Column: Title & Description */}
        <div className="space-y-1 z-10 max-w-xl">
          <h1 className="text-lg sm:text-xl font-black text-[#101828] dark:text-white tracking-tight leading-snug">
            {course?.name || "Course Workspace"}
          </h1>
          <p className="text-xs text-[#64748B] dark:text-slate-400 font-medium mt-0.5 line-clamp-2 leading-relaxed">
            {course?.description ||
              "Master core principles and build production-ready engineering skills step by step."}
          </p>
        </div>

        {/* Center: Course Logo from CDN without border or white background */}
        <div className="hidden md:flex items-center justify-center shrink-0 z-10 mx-auto lg:mx-0">
          <div className="w-12 h-12 flex items-center justify-center">
            {getQuizLogo(`${courseSlug} ${course?.name}`) ? (
              <img
                src={getQuizLogo(`${courseSlug} ${course?.name}`)!}
                alt={course?.name || "Course"}
                className="w-10 h-10 object-contain"
              />
            ) : course?.coverImageURL ? (
              <img
                src={course.coverImageURL}
                alt={course.name}
                className="w-10 h-10 object-contain"
              />
            ) : (
              <FiBookOpen className="w-8 h-8 text-[#FF4D4D]" />
            )}
          </div>
        </div>

        {/* Right Column: Progress & Reusable LearnButton */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end gap-3.5 z-10 shrink-0">
          <div className="space-y-1.5 w-full sm:w-48 lg:w-52">
            <div className="flex items-center justify-between text-xs font-black text-[#101828] dark:text-white">
              <span>{progressPercentage}% Completed</span>
              <span className="text-[#64748B] dark:text-slate-400 font-semibold text-[11px]">
                {completedCount}/{totalCount}
              </span>
            </div>
            <div className="w-full bg-slate-200/80 dark:bg-[#282830] rounded-full h-2 overflow-hidden">
              <div
                className="bg-[#FF4D4D] h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          <LearnButton
            isCompleted={Boolean(activeChapter?.isCompleted)}
            isLoading={isUpdatingChapter}
            onClick={handleToggleCompletion}
            disabled={!activeChapter}
            completedLabel="Completed"
            incompleteLabel="Mark Chapter Done"
          />
        </div>
      </div>

      {/* Main Learning Split Workspace */}
      <div className="flex flex-col lg:flex-row gap-3 sm:gap-3.5 items-start">
        {/* Chapters Left Nav Panel */}
        {!isChapterNavCollapsed && (
          <aside className="w-full lg:w-[320px] xl:w-[350px] p-1 sm:p-1.5 shrink-0 bg-white dark:bg-[#16161A] border border-slate-200/90 dark:border-[#26262C] rounded-2xl shadow-2xs transition-all duration-300 flex flex-col gap-1.5 self-start lg:sticky lg:top-1 max-h-none lg:max-h-[calc(100vh-2rem)] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-1.5 pt-0.5 pb-0.5">
              <div className="flex items-center gap-1.5">
                <FiList className="w-4 h-4 text-[#FF4D4D] shrink-0" />
                <h2 className="text-xs sm:text-sm font-bold text-[#101828] dark:text-white">
                  Chapters ({chapters.length})
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsChapterNavCollapsed(true)}
                className="w-6 h-6 rounded-lg border border-slate-200/90 dark:border-[#2A2A32] bg-white dark:bg-[#1E1E24] hover:bg-slate-50 dark:hover:bg-[#26262E] flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer shrink-0 shadow-2xs"
                title="Collapse chapters sidebar"
              >
                <FiChevronsLeft className="w-3 h-3" />
              </button>
            </div>

            {/* Quick chapter search */}
            <div className="relative px-0.5">
              <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 w-3 h-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Search chapters..."
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                className="w-full pl-7 pr-2.5 py-1.5 bg-[#F8FAFC] dark:bg-[#1E1E24] border border-[#E2E8F0] dark:border-[#2C2C34] rounded-lg text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 text-[#101828] dark:text-white focus:outline-none focus:bg-white dark:focus:bg-[#22222A] focus:border-[#FF4D4D] focus:ring-1 focus:ring-[#FF4D4D]/20 transition-all font-normal"
              />
            </div>

            {/* Scrollable Chapters List */}
            <div className="space-y-0.5 overflow-y-auto max-h-52 sm:max-h-64 lg:max-h-[calc(100vh-10rem)] px-0.5 scrollbar-none sm:[&::-webkit-scrollbar]:w-1 sm:[&::-webkit-scrollbar-thumb]:bg-slate-200 dark:sm:[&::-webkit-scrollbar-thumb]:bg-[#2C2C34] sm:[&::-webkit-scrollbar-thumb]:rounded-full">
              {filteredChapters.map((ch, index) => {
                const isCurrent = ch._id.toString() === currentChapterId;
                const isCompleted = ch.isCompleted;

                return (
                  <button
                    key={ch._id}
                    type="button"
                    onClick={() => handleSelectChapter(ch)}
                    title={ch.name}
                    className={`w-full text-left rounded-lg transition-all flex items-center justify-between px-1.5 py-1 gap-2 cursor-pointer group ${
                      isCurrent
                        ? "bg-[#FFF0F0] dark:bg-red-950/40"
                        : "hover:bg-[#F8FAFC] dark:hover:bg-[#202026]"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {isCurrent ? (
                        <div className="w-5 h-5 rounded-full bg-[#FF4D4D] text-white flex items-center justify-center text-[10px] font-bold leading-none shrink-0 p-0 shadow-2xs">
                          {index + 1}
                        </div>
                      ) : isCompleted ? (
                        <div className="w-5 h-5 rounded-full bg-[#10B981] text-white flex items-center justify-center text-[10px] font-bold leading-none shrink-0 p-0">
                          <FiCheck className="w-2.5 h-2.5 stroke-[2.5]" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-[#EEF2F6] dark:bg-[#222228] text-[#334155] dark:text-slate-300 flex items-center justify-center text-[10px] font-bold leading-none shrink-0 p-0">
                          {index + 1}
                        </div>
                      )}
                      <span
                        className={`text-xs leading-snug break-words flex-1 ${
                          isCurrent
                            ? "font-bold text-[#101828] dark:text-white"
                            : isCompleted
                              ? "font-medium text-[#101828] dark:text-slate-200"
                              : "font-normal text-[#334155] dark:text-slate-300 group-hover:text-[#101828] dark:group-hover:text-white"
                        }`}
                      >
                        {ch.name}
                      </span>
                    </div>

                    <FiChevronRight
                      className={`w-3 h-3 shrink-0 transition-transform ${
                        isCurrent
                          ? "text-[#FF4D4D]"
                          : "text-slate-400 group-hover:text-slate-600 dark:text-slate-500"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </aside>
        )}

        {/* Chapter Content Right Reader Area — Takes all width when sidebar is closed */}
        <div
          className={`flex-1 min-w-0 bg-white dark:bg-[#16161A] border border-slate-200/90 dark:border-[#26262C] rounded-2xl p-5 sm:p-7 md:p-8 shadow-2xs space-y-6 ${isChapterNavCollapsed ? "w-full" : ""}`}
        >
          {/* Active Chapter Header */}
          <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-[#26262C]">
            <div className="flex items-center gap-2 text-xs font-semibold flex-wrap">
              {isChapterNavCollapsed && (
                <button
                  type="button"
                  onClick={() => setIsChapterNavCollapsed(false)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200/90 dark:border-[#2A2A32] bg-[#F8FAFC] dark:bg-[#1E1E24] text-xs font-bold text-[#101828] dark:text-white hover:bg-slate-100 dark:hover:bg-[#26262E] transition-colors shadow-2xs cursor-pointer mr-1"
                  title="Open chapters list"
                >
                  <FiList className="w-3.5 h-3.5 text-[#FF4D4D]" />
                  <span>Chapters ({chapters.length})</span>
                  <FiChevronsRight className="w-3 h-3 text-slate-400" />
                </button>
              )}
              <span className="text-[#FF4D4D] font-bold">
                Chapter {activeChapterIndex + 1}
              </span>
              <span className="text-slate-300 dark:text-slate-600 font-bold">
                ›
              </span>
              <span className="text-[#64748B] dark:text-slate-400 font-medium truncate max-w-sm">
                {course?.name}
              </span>
            </div>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl md:text-[26px] font-black text-[#101828] dark:text-white tracking-tight leading-snug">
              {activeChapter?.name || "Chapter Content"}
            </h2>
          </div>

          {/* Render Chapter Body on Pure White Surface */}
          <div className="text-sm text-[#101828] dark:text-slate-200 leading-relaxed font-sans min-h-[160px]">
            {cleanContent ? (
              <MDXRenderer
                mdxSource={cleanContent}
                theme={isDarkMode ? "dark" : "light"}
              />
            ) : (
              <div className="py-12 text-center text-slate-400 text-sm">
                No content available for this chapter yet.
              </div>
            )}
          </div>

          {/* Chapter Bottom Navigation & Actions */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <LearnButton
              variant="outline"
              onClick={handlePrevChapter}
              disabled={activeChapterIndex <= 0}
            >
              Previous Chapter
            </LearnButton>

            <LearnButton
              isCompleted={Boolean(activeChapter?.isCompleted)}
              isLoading={isUpdatingChapter}
              onClick={handleToggleCompletion}
              disabled={!activeChapter}
              completedLabel="Completed"
              incompleteLabel="Mark Chapter Done"
            />

            <LearnButton
              variant="primary"
              onClick={handleNextChapter}
              disabled={activeChapterIndex >= chapters.length - 1}
            >
              Next Chapter
            </LearnButton>
          </div>
        </div>
      </div>
    </div>
  );
};
