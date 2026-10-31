import {
  ContentFeedbackWidget,
  DsaUpsellModal,
  LoadingSpinner,
  VISUALIZER_MAP,
} from "@tbe/components";
import { routes } from "@tbe/constants";
import { useUser } from "@tbe/hooks";
import { CACHE_TIMES, useQuery } from "@tbe/query";
import { cn, sendRequest } from "@tbe/utils";
import {
  ArrowLeft,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Clock,
  Code2,
  List,
  Lock,
} from "lucide-react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useMemo, useRef, useState } from "react";

import { CoreSubjectMDXRenderer } from "@/components/CoreSubjectMDXRenderer";
import {
  type Chapter,
  CORE_SUBJECTS,
  type Subject,
} from "@/config/coreSubjectsData";

/* ─────────────────────────────────────────────
   Helper Functions
 ───────────────────────────────────────────── */
const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

const extractVisualizerConfig = (markdown: string) => {
  const match = markdown.match(/```visualizer\s+([\s\S]*?)```/);
  if (!match) return { cleanedMarkdown: markdown, visualizer: null };

  const configStr = match[1];
  const config: Record<string, string> = {};
  configStr.split("\n").forEach((line) => {
    const idx = line.indexOf(":");
    if (idx !== -1) {
      const key = line.substring(0, idx).trim();
      const val = line.substring(idx + 1).trim();
      config[key] = val;
    }
  });

  const cleanedMarkdown = markdown.replace(/```visualizer\s+[\s\S]*?```/, "");
  return {
    cleanedMarkdown: cleanedMarkdown.trim(),
    visualizer: {
      id: config.id || "",
      height: config.height || "480px",
      title: config.title || "Algorithm Visualizer",
    },
  };
};

function VisualizerBlock({
  id,
}: {
  id: string;
  height?: string;
  title?: string;
}) {
  const Component = VISUALIZER_MAP[id];
  if (!Component) return null;
  return (
    <div className="my-6 rounded-xl overflow-hidden border border-slate-200/90 dark:border-[#24242A]">
      <Component />
    </div>
  );
}

/* ─────────────────────────────────────────────
   Chapter Card (Matching DSA Yatra / Platform Cards)
 ───────────────────────────────────────────── */
function ChapterCard({
  chapter,
  index,
  onClick,
}: {
  chapter: Chapter;
  index: number;
  onClick: () => void;
}) {
  const isLocked = chapter.isLocked;

  return (
    <div
      onClick={onClick}
      className="group bg-white dark:bg-[#16161A] rounded-xl border border-slate-200/80 dark:border-[#24242A] hover:border-slate-300 dark:hover:border-[#383844] shadow-2xs hover:shadow-xs p-3.5 flex flex-col justify-between transition-all duration-200 cursor-pointer h-full hover:-translate-y-0.5"
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="w-6 h-6 rounded-md bg-slate-100 dark:bg-[#202026] text-slate-500 dark:text-slate-400 font-bold text-[10px] flex items-center justify-center shrink-0">
            {String(index + 1).padStart(2, "0")}
          </span>

          {isLocked ? (
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200/50 dark:border-rose-900/40">
              <Lock className="w-2.5 h-2.5" />
              Locked
            </span>
          ) : (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 dark:bg-[#202026] dark:text-slate-400 border border-slate-200/60 dark:border-[#282832]">
              Chapter
            </span>
          )}
        </div>

        <h3 className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-white group-hover:text-[#FF4D4D] transition-colors leading-tight mb-1">
          {chapter.title}
        </h3>

        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed font-normal">
          {chapter.description}
        </p>
      </div>

      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-[#202026] flex items-center justify-between">
        <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
          {isLocked ? "Premium" : "Free"}
        </span>

        {isLocked ? (
          <span className="text-[11px] font-bold text-rose-500 flex items-center gap-1">
            <span>Unlock</span>
            <Lock className="w-2.5 h-2.5" />
          </span>
        ) : (
          <span className="text-[11px] font-bold text-[#FF4D4D] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
            <span>Read</span>
            <ChevronRight className="w-3 h-3" />
          </span>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Chapter Content View
 ───────────────────────────────────────────── */
function ChapterContent({
  chapter,
  subjectLabel,
  onBack,
  prevChapter,
  nextChapter,
  onChapterSelect,
}: {
  chapter: Chapter;
  subjectLabel: string;
  onBack: () => void;
  prevChapter: Chapter | null;
  nextChapter: Chapter | null;
  onChapterSelect: (chapter: Chapter) => void;
}) {
  const { content } = chapter;
  const [activeId, setActiveId] = useState<string>("");
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToHeading = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const { cleanedMarkdown, visualizer } = useMemo(() => {
    if (!content.markdownContent)
      return { cleanedMarkdown: "", visualizer: null };
    return extractVisualizerConfig(content.markdownContent);
  }, [content.markdownContent]);

  const readingTime = useMemo(() => {
    const text = cleanedMarkdown || content.overview || "";
    const words = text.split(/\s+/).filter(Boolean).length;
    const elementCount =
      (content.notes?.length ?? 0) +
      (content.importantPoints?.length ?? 0) +
      (content.interviewQuestions?.length ?? 0);
    return Math.max(1, Math.ceil(words / 200) + Math.ceil(elementCount * 0.5));
  }, [
    cleanedMarkdown,
    content.overview,
    content.notes,
    content.importantPoints,
    content.interviewQuestions,
  ]);

  const headings = useMemo(() => {
    if (!cleanedMarkdown) return [];
    const lines = cleanedMarkdown.split("\n");
    const list: { text: string; id: string; level: number }[] = [];
    let inCodeBlock = false;

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("```")) {
        inCodeBlock = !inCodeBlock;
        return;
      }
      if (inCodeBlock) return;

      const match = line.match(/^(#{2,3})\s+(.*)/);
      if (match) {
        const level = match[1].length;
        const text = match[2].trim().replace(/\*\*|`/g, "");
        const id = text
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
        if (text) {
          list.push({ text, id, level });
        }
      }
    });
    return list;
  }, [cleanedMarkdown]);

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter((entry) => entry.isIntersecting);
        if (visibleEntries.length > 0) {
          const sorted = visibleEntries.sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top,
          );
          setActiveId(sorted[0].target.id);
        }
      },
      {
        root: scrollContainerRef.current,
        rootMargin: "-20px 0px -65% 0px",
        threshold: 0,
      },
    );

    headings.forEach((heading) => {
      const el = document.getElementById(heading.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings, cleanedMarkdown]);

  useEffect(() => {
    const key = `coresubjects-completed-${chapter.id}`;
    setIsCompleted(localStorage.getItem(key) === "true");
  }, [chapter.id]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [chapter.id]);

  const toggleCompleted = () => {
    const key = `coresubjects-completed-${chapter.id}`;
    const nextState = !isCompleted;
    setIsCompleted(nextState);
    localStorage.setItem(key, String(nextState));
  };

  return (
    <div
      ref={scrollContainerRef}
      className="flex-1 overflow-y-auto px-1 sm:px-2 py-1 space-y-4 font-sans scrollbar-thin-grey scroll-smooth"
    >
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-[#202026] pb-2.5">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold text-[#FF4D4D] hover:underline cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to chapters</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
            <Clock className="w-3 h-3" />
            <span>{readingTime} min read</span>
          </div>

          <button
            onClick={toggleCompleted}
            className={cn(
              "px-2.5 py-1 rounded-md text-[11px] font-bold border transition-all cursor-pointer",
              isCompleted
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                : "bg-slate-100 dark:bg-[#202026] border-slate-200 dark:border-[#2A2A32] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white",
            )}
          >
            {isCompleted ? "Completed" : "Mark as read"}
          </button>
        </div>
      </div>

      <div className="flex gap-6 items-start">
        {/* Left Column: Chapter Content */}
        <div className="flex-1 min-w-0">
          <div className="space-y-1 mb-4">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#FF4D4D] bg-red-500/10 px-2 py-0.5 rounded-md">
              {subjectLabel}
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {chapter.title}
            </h1>
          </div>

          {cleanedMarkdown ? (
            <div>
              <div className="prose prose-slate dark:prose-invert max-w-none prose-sm sm:prose-base leading-relaxed">
                <CoreSubjectMDXRenderer mdxSource={cleanedMarkdown} />
              </div>
              {visualizer && (
                <VisualizerBlock
                  id={visualizer.id}
                  height={visualizer.height}
                  title={visualizer.title}
                />
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {content.overview && (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#16161A] border border-slate-200/80 dark:border-[#24242A]">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-1.5">
                    Overview
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {content.overview}
                  </p>
                </div>
              )}

              {(content.notes?.length ?? 0) > 0 && (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#16161A] border border-slate-200/80 dark:border-[#24242A]">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-2">
                    Key Notes
                  </h3>
                  <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                    {(content.notes ?? []).map((note, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-[#FF4D4D] font-bold">•</span>
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {content.codeBlock && (
                <div className="rounded-xl overflow-hidden border border-slate-200/80 dark:border-[#24242A]">
                  <div className="bg-slate-100 dark:bg-[#202026] px-3 py-1.5 text-[11px] font-mono text-slate-500 flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-[#FF4D4D]" />
                    <span>Example Code</span>
                  </div>
                  <pre className="p-3 bg-slate-900 text-slate-100 text-xs font-mono overflow-x-auto">
                    <code>{content.codeBlock}</code>
                  </pre>
                </div>
              )}

              {(content.importantPoints?.length ?? 0) > 0 && (
                <div className="p-3.5 rounded-xl bg-red-500/[0.03] border border-red-500/20">
                  <h3 className="text-xs font-bold text-[#FF4D4D] mb-2">
                    Crucial Takeaways
                  </h3>
                  <div className="space-y-2">
                    {(content.importantPoints ?? []).map((pt, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300"
                      >
                        <span className="w-4 h-4 rounded-full bg-red-500/10 text-[#FF4D4D] font-bold text-[9px] flex items-center justify-center shrink-0">
                          {i + 1}
                        </span>
                        <span>{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(content.interviewQuestions?.length ?? 0) > 0 && (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#16161A] border border-slate-200/80 dark:border-[#24242A]">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-2">
                    Interview Questions
                  </h3>
                  <div className="space-y-3">
                    {(content.interviewQuestions ?? []).map((qa, i) => (
                      <div key={i} className="text-xs space-y-1">
                        <p className="font-semibold text-slate-900 dark:text-white">
                          Q: {qa.q}
                        </p>
                        <p className="text-slate-600 dark:text-slate-400 pl-3 border-l-2 border-[#FF4D4D]/40">
                          {qa.a}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between gap-3 pt-6 mt-6 border-t border-slate-100 dark:border-[#202026]">
            {prevChapter ? (
              <button
                type="button"
                onClick={() => onChapterSelect(prevChapter)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200/90 dark:border-[#24242A] bg-white dark:bg-[#16161A] text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="truncate max-w-[140px] sm:max-w-[200px]">
                  {prevChapter.title}
                </span>
              </button>
            ) : (
              <div />
            )}

            {nextChapter ? (
              <button
                type="button"
                onClick={() => onChapterSelect(nextChapter)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200/90 dark:border-[#24242A] bg-[#FF4D4D] text-white text-xs font-bold hover:bg-[#EE3126] transition-all cursor-pointer"
              >
                <span className="truncate max-w-[140px] sm:max-w-[200px]">
                  {nextChapter.title}
                </span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div />
            )}
          </div>
        </div>

        {/* Right Column: Sticky Table of Contents */}
        {cleanedMarkdown && headings.length > 0 && (
          <aside className="w-60 shrink-0 hidden xl:block sticky top-2 space-y-3">
            <div className="p-3 bg-white dark:bg-[#16161A] rounded-xl border border-slate-200/80 dark:border-[#24242A] shadow-2xs">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white mb-2">
                <List className="w-3.5 h-3.5 text-[#FF4D4D]" />
                <span>On this page</span>
              </div>
              <nav className="space-y-0.5 max-h-[50vh] overflow-y-auto scrollbar-thin-grey text-[11px]">
                {headings.map((h) => (
                  <button
                    key={h.id}
                    onClick={() => scrollToHeading(h.id)}
                    className={cn(
                      "w-full text-left py-1 px-1.5 rounded block truncate transition-colors cursor-pointer",
                      h.level === 3 && "pl-4",
                      activeId === h.id
                        ? "text-[#FF4D4D] font-bold bg-red-500/10"
                        : "text-slate-500 hover:text-slate-900 dark:hover:text-white",
                    )}
                  >
                    {h.text}
                  </button>
                ))}
              </nav>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main Core Subjects Page
 ───────────────────────────────────────────── */
const CoreSubjectsPage = () => {
  const router = useRouter();
  const { params } = router.query;
  const { user, loading: userLoading, isAuth } = useUser();

  const userId = user?.id;
  const [showPayment, setShowPayment] = useState(false);

  const { data: response, isLoading } = useQuery<any>({
    queryKey: ["coreSubjects", userId],
    queryFn: () =>
      sendRequest({
        url: `${routes.api.base}${routes.api.coreSubjects}${userId ? `?userId=${userId}` : ""}`,
      }),
    enabled: !userLoading,
    ...CACHE_TIMES.STATIC,
  });

  const coreSubjects: Subject[] = useMemo(() => {
    if (response?.data && response.data.length > 0) {
      return response.data;
    }
    return CORE_SUBJECTS;
  }, [response]);

  const paramsArr = useMemo(() => {
    if (!params) return [];
    return Array.isArray(params) ? params : [params];
  }, [params]);

  const selectedSubjectId = paramsArr[0] || null;
  const selectedChapterSlug = paramsArr[1] || null;

  const selectedSubject: Subject | undefined = coreSubjects.find(
    (s) => s.id === selectedSubjectId || slugify(s.label) === selectedSubjectId,
  );

  const selectedChapter: Chapter | null =
    (selectedSubject && selectedChapterSlug
      ? selectedSubject.chapters.find(
          (c) =>
            slugify(c.title) === selectedChapterSlug ||
            c.id === selectedChapterSlug,
        )
      : null) || null;

  const currentChapterIndex =
    selectedSubject?.chapters.findIndex((c) => c.id === selectedChapter?.id) ??
    -1;

  const prevChapter =
    currentChapterIndex > 0
      ? selectedSubject?.chapters[currentChapterIndex - 1]
      : null;

  const nextChapter =
    selectedSubject &&
    currentChapterIndex >= 0 &&
    currentChapterIndex < selectedSubject.chapters.length - 1
      ? selectedSubject.chapters[currentChapterIndex + 1]
      : null;

  const handleSubjectClick = (subject: Subject) => {
    router.push(`/coresubjects/${slugify(subject.label)}`, undefined, {
      shallow: true,
    });
  };

  const handleBackToChapters = () => {
    if (selectedSubject) {
      router.push(
        `/coresubjects/${slugify(selectedSubject.label)}`,
        undefined,
        {
          shallow: true,
        },
      );
    } else {
      router.push("/coresubjects", undefined, { shallow: true });
    }
  };

  const handleChapterSelect = (ch: Chapter) => {
    if (ch.isLocked) {
      setShowPayment(true);
      return;
    }
    if (selectedSubject) {
      router.push(
        `/coresubjects/${slugify(selectedSubject.label)}/${slugify(ch.title)}`,
        undefined,
        { shallow: true },
      );
    }
  };

  if (isLoading || userLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 max-w-full font-sans px-1 sm:px-2 py-1 space-y-2.5 pb-4">
      <Head>
        <title>
          {selectedChapter
            ? `${selectedChapter.title} | ${selectedSubject?.label} | OnCampus`
            : selectedSubject
              ? `${selectedSubject.label} | Core Subjects | OnCampus`
              : "Core Subjects | OnCampus"}
        </title>
        <meta
          name="description"
          content="OS, DBMS, Computer Networks, and OOPs revision guides for campus interviews."
        />
      </Head>

      {/* 1. Header with Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 dark:text-slate-500 flex-wrap">
        <Link
          href="/dashboard"
          className="hover:text-slate-800 dark:hover:text-white transition-colors"
        >
          OnCampus
        </Link>
        <span className="text-slate-300 dark:text-slate-600">›</span>
        <Link
          href="/coresubjects"
          className={cn(
            "transition-colors",
            selectedSubject
              ? "hover:text-slate-800 dark:hover:text-white"
              : "font-bold text-[#FF4D4D]",
          )}
        >
          Core Subjects
        </Link>

        {selectedSubject && (
          <>
            <span className="text-slate-300 dark:text-slate-600">›</span>
            <button
              type="button"
              onClick={handleBackToChapters}
              className={cn(
                "transition-colors cursor-pointer",
                selectedChapter
                  ? "hover:text-slate-800 dark:hover:text-white"
                  : "font-bold text-[#FF4D4D]",
              )}
            >
              {selectedSubject.label}
            </button>
          </>
        )}

        {selectedChapter && (
          <>
            <span className="text-slate-300 dark:text-slate-600">›</span>
            <span className="font-bold text-[#FF4D4D] truncate max-w-[200px]">
              {selectedChapter.title}
            </span>
          </>
        )}
      </nav>

      {/* 2. Main Content View */}
      {selectedChapter ? (
        <ChapterContent
          chapter={selectedChapter}
          subjectLabel={selectedSubject?.label ?? ""}
          onBack={handleBackToChapters}
          prevChapter={prevChapter ?? null}
          nextChapter={nextChapter ?? null}
          onChapterSelect={handleChapterSelect}
        />
      ) : (
        <div className="space-y-3">
          {/* Subject Selector Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none flex-nowrap bg-white dark:bg-[#16161A] p-1.5 rounded-xl border border-slate-200/80 dark:border-[#24242A]">
            {coreSubjects.map((subject) => {
              const isActive =
                selectedSubject &&
                (selectedSubject.id === subject.id ||
                  slugify(selectedSubject.label) === slugify(subject.label));

              return (
                <button
                  key={subject.id}
                  type="button"
                  onClick={() => handleSubjectClick(subject)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer flex items-center gap-1.5",
                    isActive
                      ? "bg-[#FF3B30] text-white shadow-2xs font-bold"
                      : "bg-slate-50 dark:bg-[#202026] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#282830] hover:text-slate-900 dark:hover:text-white",
                  )}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{subject.label}</span>
                  <span className="text-[10px] opacity-75">
                    ({subject.chapters?.length || 0})
                  </span>
                </button>
              );
            })}
          </div>

          {/* Chapters Grid */}
          {selectedSubject ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    {selectedSubject.label} Chapters
                  </h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {selectedSubject.chapters.length} chapters available ·
                    Select a chapter to study
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {selectedSubject.chapters.map((chapter, i) => (
                  <ChapterCard
                    key={chapter.id}
                    chapter={chapter}
                    index={i}
                    onClick={() => handleChapterSelect(chapter)}
                  />
                ))}
              </div>
            </div>
          ) : (
            /* All Subjects Overview Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
              {coreSubjects.map((subject) => (
                <div
                  key={subject.id}
                  onClick={() => handleSubjectClick(subject)}
                  className="bg-white dark:bg-[#16161A] rounded-xl border border-slate-200/80 dark:border-[#24242A] hover:border-slate-300 dark:hover:border-[#383844] shadow-2xs hover:shadow-xs p-3.5 flex flex-col justify-between transition-all duration-200 cursor-pointer group hover:-translate-y-0.5"
                >
                  <div>
                    <div className="w-8 h-8 rounded-lg bg-red-500/10 text-[#FF4D4D] flex items-center justify-center mb-2.5">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#FF4D4D] transition-colors">
                      {subject.label}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      {subject.chapters?.length || 0} core chapters, notes &amp;
                      interview questions.
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 dark:border-[#202026] flex items-center justify-between text-[#FF4D4D] text-xs font-bold">
                    <span>Explore</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Upsell Modal */}
      <DsaUpsellModal
        open={showPayment}
        onViewPlans={() => router.push(routes.oncampus.pricing || "/pricing")}
        onDismiss={() => setShowPayment(false)}
        title="Unlock Core Subjects"
        description="Subscribe to OnCampus to access all chapters, visualizers, solutions, and notes across all computer science subjects."
      />

      {/* Feedback Widget */}
      {isAuth && (
        <ContentFeedbackWidget
          contentType="CORE_SUBJECT"
          contentId={
            selectedChapter
              ? `${selectedSubjectId}:${selectedChapter.id}`
              : selectedSubjectId || "core-subjects"
          }
          title={selectedChapter ? "Rate this chapter" : "Rate this subject"}
          meta={{
            subjectId: selectedSubjectId || "all",
            subjectName: selectedSubject?.label || "Core Subjects",
            chapterId: selectedChapter?.id,
            chapterName: selectedChapter?.title,
          }}
          theme="dark"
        />
      )}
    </div>
  );
};

export default CoreSubjectsPage;
