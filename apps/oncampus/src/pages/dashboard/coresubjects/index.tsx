import { FlexContainer, Text } from "@tbe/components";
import { routes } from "@tbe/constants";
import { CACHE_TIMES, useQuery } from "@tbe/query";
import { cn, sendRequest } from "@tbe/utils";
import {
  ArrowLeft,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Clock,
  Folder,
  FolderOpen,
  List,
  ListFilter,
  Play,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { CoreSubjectMDXRenderer } from "@/components/CoreSubjectMDXRenderer";
import OnCampusLearningLayout from "@/components/OnCampusLearningLayout";
import type { Chapter, Subject } from "@/config/coreSubjectsData";

/* ─────────────────────────────────────────────
   Sub-components
───────────────────────────────────────────── */

/** Single subject entry in the left sidebar */
function SubjectItem({
  subject,
  isActive,
  onClick,
}: {
  subject: Subject;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full group relative py-2.5 px-4 rounded-r-lg border-l-[3px] transition-all duration-300 cursor-pointer text-left focus:outline-none",
        isActive
          ? "bg-red-500/[0.03] border-red-500 shadow-[0_1px_6px_rgba(239,68,68,0.02)] text-white"
          : "border-transparent bg-transparent hover:bg-white/[0.02] hover:border-gray-800 text-gray-400",
      )}
      aria-pressed={isActive}
    >
      <FlexContainer
        className="items-center w-full gap-3"
        itemCenter
        justifyCenter={false}
      >
        {isActive ? (
          <FolderOpen className="w-[15px] h-[15px] shrink-0 text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
        ) : (
          <Folder className="w-[15px] h-[15px] shrink-0 text-gray-600 group-hover:text-gray-400 transition-colors" />
        )}
        <Text
          level="p"
          className="text-[13px] font-semibold leading-tight transition-colors duration-300 py-0.5 text-left break-words whitespace-normal flex-1"
        >
          {subject.label}
        </Text>
      </FlexContainer>
    </button>
  );
}

/** Chapter card shown in the main content grid */
function ChapterCard({
  chapter,
  index,
  onClick,
}: {
  chapter: Chapter;
  index: number;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} className="group text-left w-full">
      <div
        className="relative bg-[#0A0A0A] rounded-xl overflow-hidden border border-gray-800 hover:border-red-500/30 transition-all duration-300 shadow-lg group-hover:-translate-y-1 h-full flex flex-col"
        style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.4)" }}
      >
        {/* Red left accent bar */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="relative p-4 flex flex-col flex-1">
          {/* Top row */}
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-800 bg-gray-900/50 group-hover:scale-110 transition-transform duration-300">
              <span className="text-[11px] font-black text-gray-500 group-hover:text-red-500 transition-colors duration-300">
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>
            <div className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-900 text-gray-500 uppercase tracking-tighter border border-gray-800 group-hover:border-red-500/20 group-hover:text-red-500/70 transition-colors">
              Chapter
            </div>
          </div>

          {/* Title */}
          <h3 className="text-base font-bold text-white group-hover:text-red-400 transition-colors duration-300 tracking-tight mb-1">
            {chapter.title}
          </h3>

          {/* Description */}
          <p className="text-gray-500 text-xs leading-relaxed mb-3 line-clamp-2 group-hover:text-gray-300 transition-colors duration-300 flex-1">
            {chapter.description}
          </p>

          {/* Progress placeholder */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">
                Progress
              </span>
              <span className="text-[10px] font-bold text-gray-600">0%</span>
            </div>
            <div className="w-full h-[3px] bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full w-0 bg-red-500 rounded-full transition-all duration-500" />
            </div>
          </div>

          {/* Footer */}
          <div className="mt-auto pt-3 border-t border-gray-800/50 flex items-center justify-between">
            <Text
              level="p"
              className="text-[10px] font-bold text-gray-600 uppercase"
            >
              Start Learning
            </Text>
            <div className="flex items-center gap-1.5 text-red-500 font-bold text-xs group-hover:translate-x-1 transition-transform duration-200">
              <span>Begin</span>
              <Play className="fill-current w-2.5 h-2.5" />
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}

/** Inline chapter content view */
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

  // Dynamic Reading Time Estimator
  const readingTime = useMemo(() => {
    const text = content.markdownContent || content.overview || "";
    const words = text.split(/\s+/).filter(Boolean).length;
    // Base estimation + items
    const elementCount =
      (content.notes?.length ?? 0) +
      (content.importantPoints?.length ?? 0) +
      (content.interviewQuestions?.length ?? 0);
    return Math.max(1, Math.ceil(words / 200) + Math.ceil(elementCount * 0.5));
  }, [content]);

  // Extract headings (H2, H3) for TOC
  const headings = useMemo(() => {
    if (!content.markdownContent) return [];
    const lines = content.markdownContent.split("\n");
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
  }, [content.markdownContent]);

  // Observe which heading is in view
  useEffect(() => {
    if (headings.length === 0) return;

    const observerOptions = {
      root: scrollContainerRef.current,
      rootMargin: "-20px 0px -65% 0px", // triggers when heading is in top-third of container
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      const visibleEntries = entries.filter((entry) => entry.isIntersecting);
      if (visibleEntries.length > 0) {
        // Find the one closest to the top margin
        const sorted = visibleEntries.sort(
          (a, b) => a.boundingClientRect.top - b.boundingClientRect.top,
        );
        setActiveId(sorted[0].target.id);
      }
    }, observerOptions);

    headings.forEach((heading) => {
      const el = document.getElementById(heading.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings, content.markdownContent]);

  // Load completion state from LocalStorage
  useEffect(() => {
    const key = `coresubjects-completed-${chapter.id}`;
    setIsCompleted(localStorage.getItem(key) === "true");
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
      className="flex-1 overflow-y-auto bg-[#050505] scrollbar-thin-grey scroll-smooth relative"
    >
      {/* Main Content Layout Container */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 sm:py-8 flex gap-8 items-start">
        {/* Left column - Content */}
        <div className="flex-1 min-w-0 xl:max-w-[72%]">
          {/* Sleek Minimal Back Button Link */}
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-400 transition-colors mb-4 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to chapters</span>
          </button>

          {/* Sleek Minimal Title */}
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
            {chapter.title}
          </h1>

          {/* Sleek aesthetic breadcrumb & reading time / completion row */}
          <div className="flex items-center gap-3 text-xs text-gray-500 pb-4 border-b border-gray-900 mb-6 flex-wrap">
            <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest bg-red-500/10 px-2 py-0.5 rounded">
              {subjectLabel}
            </span>
            <span className="text-gray-700 font-semibold">•</span>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-gray-550 shrink-0" />
              <span>{readingTime} min read</span>
            </div>
            <span className="text-gray-700 font-semibold">•</span>
            <button
              onClick={toggleCompleted}
              className={cn(
                "flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border transition-all cursor-pointer",
                isCompleted
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : "bg-red-500/5 border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500/40",
              )}
            >
              {isCompleted ? "Completed" : "Mark Read"}
            </button>
          </div>

          {content.markdownContent ? (
            /* Render Markdown Content */
            <div className="prose prose-invert max-w-none prose-red prose-headings:scroll-mt-6">
              <CoreSubjectMDXRenderer mdxSource={content.markdownContent} />
            </div>
          ) : (
            /* Fallback layout for classic non-markdown subjects */
            <div className="space-y-8">
              {/* Overview */}
              <section className="bg-[#0A0A0A]/30 border border-gray-900 rounded-2xl p-6">
                <h2 className="text-[11px] font-black text-red-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="w-4 h-[2px] bg-red-500 rounded-full" />
                  Overview
                </h2>
                <p className="text-gray-300 text-[15px] leading-relaxed">
                  {content.overview}
                </p>
              </section>

              {/* Notes */}
              {(content.notes?.length ?? 0) > 0 && (
                <section className="bg-[#0A0A0A]/30 border border-gray-900 rounded-2xl p-6">
                  <h2 className="text-[11px] font-black text-red-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span className="w-4 h-[2px] bg-red-500 rounded-full" />
                    Key Notes
                  </h2>
                  <ul className="space-y-3">
                    {(content.notes ?? []).map((note, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 text-gray-300 text-[14px] leading-relaxed"
                      >
                        <ChevronRight className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Code block */}
              {content.codeBlock && (
                <section className="bg-[#0A0A0A]/30 border border-gray-900 rounded-2xl p-6">
                  <h2 className="text-[11px] font-black text-red-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span className="w-4 h-[2px] bg-red-500 rounded-full" />
                    Code Example
                  </h2>
                  <pre className="bg-[#0A0A0A] border border-gray-800 rounded-xl p-4 overflow-x-auto text-[13px] text-green-400 font-mono leading-relaxed scrollbar-thin-grey whitespace-pre-wrap">
                    <code>{content.codeBlock}</code>
                  </pre>
                </section>
              )}

              {/* Important Points */}
              {(content.importantPoints?.length ?? 0) > 0 && (
                <section className="bg-[#0A0A0A]/30 border border-gray-900 rounded-2xl p-6">
                  <h2 className="text-[11px] font-black text-red-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span className="w-4 h-[2px] bg-red-500 rounded-full" />
                    Crucial takeaways
                  </h2>
                  <div className="space-y-3">
                    {(content.importantPoints ?? []).map((pt, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 bg-red-500/[0.03] border border-red-500/10 rounded-xl px-4 py-3.5"
                      >
                        <span className="w-5 h-5 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-[9px] font-black text-red-500">
                            {i + 1}
                          </span>
                        </span>
                        <p className="text-gray-300 text-[14px] leading-relaxed">
                          {pt}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Interview Questions */}
              {(content.interviewQuestions?.length ?? 0) > 0 && (
                <section className="bg-[#0A0A0A]/30 border border-gray-900 rounded-2xl p-6">
                  <h2 className="text-[11px] font-black text-red-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="w-4 h-[2px] bg-red-500 rounded-full" />
                    Frequently Asked Questions
                  </h2>
                  <div className="space-y-4">
                    {(content.interviewQuestions ?? []).map((qa, i) => (
                      <div
                        key={i}
                        className="bg-[#0A0A0A] border border-gray-800 rounded-xl p-4 hover:border-red-500/10 transition-colors"
                      >
                        <p className="text-white font-bold text-[14px] mb-2 flex items-start gap-2">
                          <span className="text-red-500 shrink-0">Q.</span>
                          {qa.q}
                        </p>
                        <p className="text-gray-400 text-[13px] leading-relaxed pl-5 border-l border-red-500/20">
                          {qa.a}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}

          {/* Navigation controls (Next/Prev) */}
          <div className="flex items-center justify-between border-t border-gray-800/60 mt-12 pt-8 pb-16">
            {prevChapter ? (
              <button
                type="button"
                onClick={() => onChapterSelect(prevChapter)}
                className="group flex flex-col items-start px-5 py-3.5 bg-[#0A0A0A] border border-gray-800 rounded-xl hover:border-red-500/30 text-left transition-all duration-300 max-w-[45%]"
              >
                <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
                  <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                  PREVIOUS CHAPTER
                </span>
                <span className="text-white font-bold text-[13px] line-clamp-1 group-hover:text-red-400 transition-colors">
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
                className="group flex flex-col items-end px-5 py-3.5 bg-[#0A0A0A] border border-gray-800 rounded-xl hover:border-red-500/30 text-right transition-all duration-300 max-w-[45%] ml-auto"
              >
                <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
                  NEXT CHAPTER
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
                <span className="text-white font-bold text-[13px] line-clamp-1 group-hover:text-red-400 transition-colors">
                  {nextChapter.title}
                </span>
              </button>
            ) : (
              <div />
            )}
          </div>
        </div>

        {/* Right column - Sticky Table of Contents (only for Markdown) */}
        {content.markdownContent && headings.length > 0 && (
          <aside className="w-[28%] shrink-0 hidden xl:block sticky top-24 self-start space-y-6">
            <div className="bg-[#0A0A0A]/50 border border-gray-800 rounded-2xl p-5 shadow-xl backdrop-blur-sm">
              <div className="flex items-center gap-2 border-b border-gray-800 pb-3 mb-4">
                <List className="w-4 h-4 text-red-500" />
                <span className="text-[11px] font-black text-white uppercase tracking-wider">
                  Table of Contents
                </span>
              </div>
              <nav className="space-y-0.5 max-h-[60vh] overflow-y-auto scrollbar-thin-grey pr-1">
                {headings.map((heading) => (
                  <button
                    key={heading.id}
                    onClick={() => scrollToHeading(heading.id)}
                    className={cn(
                      "w-full text-left transition-all duration-200 py-1.5 px-3 border-l text-[12px] block truncate",
                      heading.level === 3 ? "pl-6 text-[11px]" : "font-bold",
                      activeId === heading.id
                        ? "text-red-500 border-red-500 bg-red-500/[0.02] font-extrabold"
                        : "text-gray-500 border-transparent hover:text-gray-300 hover:border-gray-700",
                    )}
                  >
                    {heading.text}
                  </button>
                ))}
              </nav>
            </div>

            {/* Quick Helper Widget */}
            <div className="bg-gradient-to-br from-red-500/[0.02] to-transparent border border-gray-800/60 rounded-2xl p-5 shadow-lg">
              <h3 className="text-white font-bold text-[12px] mb-1.5 tracking-tight flex items-center gap-1.5">
                💡 Learning Guide
              </h3>
              <p className="text-gray-400 text-[11px] leading-relaxed">
                Read carefully. Take note of code patterns. Click code blocks to
                copy them directly for hands-on practice. Mark as complete once
                understood.
              </p>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main Page
───────────────────────────────────────────── */

const CoreSubjectsPage = () => {
  const { data: response, isLoading } = useQuery<any>({
    queryKey: ["coreSubjects"],
    queryFn: () =>
      sendRequest({
        url: `${routes.api.base}${routes.api.coreSubjects}`,
      }),
    ...CACHE_TIMES.STATIC,
  });

  const coreSubjects: Subject[] = useMemo(() => {
    return response?.data ?? [];
  }, [response]);

  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(
    null,
  );
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [isMobileSubjectsOpen, setIsMobileSubjectsOpen] = useState(false);

  useEffect(() => {
    // Reset chapter when subject changes
    setSelectedChapter(null);
  }, [selectedSubjectId]);

  const selectedSubject: Subject | undefined = coreSubjects.find(
    (s) => s.id === selectedSubjectId,
  );

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

  const handleSubjectClick = (id: string) => {
    setSelectedSubjectId(id);
    setIsMobileSubjectsOpen(false);
  };

  const handleBackToSubjects = () => {
    setSelectedSubjectId(null);
    setSelectedChapter(null);
    setIsMobileSubjectsOpen(true);
  };

  const handleBackToChapters = () => {
    setSelectedChapter(null);
  };

  if (isLoading) {
    return (
      <OnCampusLearningLayout backHref={routes.oncampus.dashboard} isLoading>
        <div />
      </OnCampusLearningLayout>
    );
  }

  return (
    <OnCampusLearningLayout
      backHref={routes.oncampus.dashboard}
      layoutMode="workspace"
    >
      <div className="flex flex-col h-full w-full">
        {/* ── Top header bar & Mobile drawer (Hidden during study mode) ── */}
        {!selectedChapter && (
          <>
            <div className="w-full min-h-[72px] border-b border-gray-800 bg-[#0A0A0A] flex shrink-0">
              {/* Left column — sidebar label */}
              <div className="border-r border-gray-800/60 px-3 py-3.5 flex items-center justify-between shrink-0 transition-all duration-300 w-auto lg:w-[260px]">
                {selectedSubjectId && (
                  <button
                    onClick={handleBackToSubjects}
                    className="flex items-center justify-center w-[28px] h-[28px] rounded-[6px] border border-red-500/40 bg-red-500/5 text-red-500 hover:bg-red-500/10 hover:border-red-500 transition-all duration-300 shrink-0 shadow-[0_0_10px_rgba(239,68,68,0.1)] active:scale-95"
                    title="Back to Subjects"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                )}
                <div className="hidden lg:block">
                  <Text
                    level="h2"
                    className="text-[13px] font-black text-white mb-0.5 tracking-tight"
                  >
                    Core Subjects
                  </Text>
                  <Text
                    level="p"
                    className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.1em]"
                  >
                    Choose a subject
                  </Text>
                </div>
              </div>

              {/* Right header area */}
              <div className="flex flex-1 items-center justify-between px-4">
                <FlexContainer wrap={false} className="gap-2 min-w-0">
                  <FlexContainer
                    direction="col"
                    itemCenter={false}
                    justifyCenter={false}
                    wrap={false}
                    className="min-w-0"
                  >
                    <Text
                      level="h1"
                      className="strong-text font-bold text-white mb-0.5 tracking-tight line-clamp-1"
                    >
                      {selectedSubject
                        ? selectedSubject.label
                        : "Core Subjects"}
                    </Text>
                    <Text
                      level="p"
                      className="text-[10px] font-medium text-gray-500 uppercase tracking-wider hidden sm:block"
                    >
                      {selectedSubject
                        ? `${selectedSubject.chapters.length} chapters available`
                        : "Select a subject to begin learning"}
                    </Text>
                  </FlexContainer>
                </FlexContainer>

                {/* Mobile toggle */}
                <button
                  onClick={() => setIsMobileSubjectsOpen(!isMobileSubjectsOpen)}
                  className={cn(
                    "lg:hidden flex items-center gap-1.5 shrink-0 ml-2 px-3 py-1.5 rounded-lg border text-[11px] font-semibold transition-all duration-200 active:scale-95",
                    isMobileSubjectsOpen
                      ? "bg-red-500/10 border-red-500/60 text-red-400"
                      : "bg-gray-900/50 border-gray-700 text-gray-400 hover:text-white hover:border-gray-600",
                  )}
                  title="Toggle subjects list"
                >
                  <ListFilter className="w-3.5 h-3.5" />
                  <span>{coreSubjects.length} Subjects</span>
                </button>
              </div>
            </div>

            {/* ── Mobile collapsible subject drawer ── */}
            <div
              className={cn(
                "lg:hidden w-full bg-[#0A0A0A] border-b border-gray-800 overflow-y-auto scrollbar-thin-grey transition-[max-height] duration-300 ease-in-out",
                isMobileSubjectsOpen
                  ? "max-h-[50vh]"
                  : "max-h-0 overflow-hidden",
              )}
            >
              <div className="px-3 py-2 space-y-1">
                {coreSubjects.map((subject) => (
                  <SubjectItem
                    key={subject.id}
                    subject={subject}
                    isActive={selectedSubjectId === subject.id}
                    onClick={() => handleSubjectClick(subject.id)}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── Body: sidebar + content ── */}
        <FlexContainer
          direction="col"
          className="lg:flex-row flex-1 min-h-0 w-full"
          itemCenter={false}
          justifyCenter={false}
          wrap={false}
        >
          {/* Desktop left sidebar */}
          <div className="hidden lg:flex lg:w-[260px] flex-shrink-0 border-r border-gray-800 flex-col bg-[#0A0A0A]">
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
                  {coreSubjects.map((subject) => (
                    <SubjectItem
                      key={subject.id}
                      subject={subject}
                      isActive={selectedSubjectId === subject.id}
                      onClick={() => handleSubjectClick(subject.id)}
                    />
                  ))}
                </FlexContainer>
              </div>
            </div>
          </div>

          {/* ── Main content area ── */}
          {!selectedSubjectId ? (
            /* Placeholder — no subject selected */
            <div className="flex flex-1 flex-col min-w-0 bg-[#050505] relative overflow-hidden">
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-900/10 rounded-full blur-[100px] pointer-events-none" />
              <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-900/10 rounded-full blur-[100px] pointer-events-none" />

              <FlexContainer
                className="h-full z-10"
                itemCenter
                justifyCenter
                fullWidth
                wrap={false}
              >
                <div className="text-center space-y-5 max-w-md px-6">
                  <div className="relative mx-auto w-24 h-24 mb-6">
                    <div className="absolute inset-0 bg-red-500/20 rounded-2xl blur-xl" />
                    <div className="relative w-full h-full bg-[#111] border border-gray-800 rounded-2xl flex items-center justify-center shadow-2xl">
                      <BookOpen className="w-10 h-10 text-white opacity-80 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]" />
                    </div>
                  </div>
                  <div>
                    <Text
                      level="h2"
                      className="text-white text-3xl font-extrabold tracking-tight mb-2"
                    >
                      Core Subjects Vault
                    </Text>
                    <Text
                      level="p"
                      className="text-gray-400 text-[15px] leading-relaxed"
                    >
                      Master the fundamental CS subjects required for
                      interviews, placements, and software engineering careers.
                      Select a subject from the left to begin learning.
                    </Text>
                  </div>
                </div>
              </FlexContainer>
            </div>
          ) : selectedChapter ? (
            /* Chapter content view */
            <ChapterContent
              chapter={selectedChapter}
              subjectLabel={selectedSubject?.label ?? ""}
              onBack={handleBackToChapters}
              prevChapter={prevChapter ?? null}
              nextChapter={nextChapter ?? null}
              onChapterSelect={(ch) => setSelectedChapter(ch)}
            />
          ) : (
            /* Chapter cards grid */
            <div className="flex-1 w-full overflow-y-auto bg-[#050505] p-4 lg:p-8 pb-[calc(5rem+env(safe-area-inset-bottom,0px))] lg:pb-8 scrollbar-thin-grey">
              {/* Subject header */}
              <div className="mb-6">
                <h2 className="text-2xl font-extrabold text-white tracking-tight mb-1">
                  {selectedSubject?.label}
                </h2>
                <p className="text-gray-500 text-sm">
                  {selectedSubject?.chapters.length} chapters · Click a card to
                  start reading
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedSubject?.chapters.map((chapter, i) => (
                  <ChapterCard
                    key={chapter.id}
                    chapter={chapter}
                    index={i}
                    onClick={() => setSelectedChapter(chapter)}
                  />
                ))}
              </div>
            </div>
          )}
        </FlexContainer>
      </div>
    </OnCampusLearningLayout>
  );
};

export default CoreSubjectsPage;
