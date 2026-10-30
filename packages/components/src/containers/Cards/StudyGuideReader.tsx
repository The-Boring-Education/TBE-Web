import type {
  StudyGuideCheatsheetContent,
  StudyGuideConceptContent,
  StudyGuideIntroContent,
  StudyGuideModel,
  StudyGuidePatternContent,
} from "@tbe/types";
import { cn } from "@tbe/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  BookOpen,
  ChevronRight,
  Clock,
  ExternalLink,
  Info,
  Sparkles,
  Target,
} from "lucide-react";
import { useEffect, useRef } from "react";

export interface StudyGuideReaderProps {
  topic: string;
  sectionId: string;
  data: StudyGuideModel | null;
  className?: string;
}

const StudyGuideReader = ({
  data,
  sectionId,
  className,
}: StudyGuideReaderProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [sectionId]);

  if (!data || data.hasGuide === false) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 sm:p-12 text-center">
        <Sparkles className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-3 animate-pulse" />
        <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
          Study guide will be available shortly
        </p>
      </div>
    );
  }

  const activeSection =
    data.sections.find((s) => s.id === sectionId) ||
    data.sections.find((s) => !s.isDivider && Boolean(s.id));

  if (!activeSection || activeSection.isDivider) {
    return (
      <div
        className={cn(
          "flex-1 flex flex-col items-center justify-center p-8 sm:p-12 text-center",
          className,
        )}
      >
        <Sparkles className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
          Select a section above to start reading
        </p>
      </div>
    );
  }

  const renderIntro = (content: StudyGuideIntroContent) => (
    <div className="space-y-6 sm:space-y-8">
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 mb-1">
          <BookOpen className="w-3.5 h-3.5 text-[#FF4D4D]" />
          <span className="text-[10px] font-black text-[#FF4D4D] uppercase tracking-wider">
            Overview & Foundations
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          {content.pageTitle}
        </h1>
        {content.subtitle && (
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
            {content.subtitle}
          </p>
        )}
      </div>

      <div className="space-y-4">
        {content.openingParagraph && (
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {content.openingParagraph}
          </p>
        )}

        {content.prereqCards && content.prereqCards.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {content.prereqCards.map((card, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="p-3.5 sm:p-4 rounded-xl bg-slate-50 dark:bg-[#18181D] border border-slate-200/90 dark:border-[#24242A] hover:border-slate-300 dark:hover:border-[#33333C] transition-colors"
              >
                <h4 className="text-slate-900 dark:text-white font-bold text-xs sm:text-sm mb-1.5 flex items-center gap-2">
                  <span className="text-[10px] text-[#FF4D4D] bg-[#FF4D4D]/10 w-4 h-4 rounded-full flex items-center justify-center font-black">
                    {idx + 1}
                  </span>
                  {card.title}
                </h4>
                <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                  {card.body}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {content.callouts && content.callouts.length > 0 && (
        <div className="space-y-2.5">
          {content.callouts.map((callout, idx) => (
            <div
              key={idx}
              className={cn(
                "p-3.5 rounded-xl border flex gap-3 text-xs leading-relaxed",
                callout.variant === "info"
                  ? "bg-red-50/70 dark:bg-red-950/20 border-red-200 dark:border-red-900/30 text-red-900 dark:text-red-200"
                  : "bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/30 text-emerald-900 dark:text-emerald-200",
              )}
            >
              {callout.variant === "info" ? (
                <Info className="w-4 h-4 text-[#FF4D4D] shrink-0 mt-0.5" />
              ) : (
                <Sparkles className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              )}
              <p className="font-medium italic">{callout.body}</p>
            </div>
          ))}
        </div>
      )}

      {content.howToUseHeading && (
        <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-[#202026]">
          <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
            {content.howToUseHeading}
          </h3>
          <div className="space-y-2">
            {content.howToUseParagraphs?.map((p, idx) => (
              <p
                key={idx}
                className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed"
              >
                {p}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderConcept = (content: StudyGuideConceptContent) => (
    <div className="space-y-6 sm:space-y-8">
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          {content.pageTitle}
        </h1>
        {content.subtitle && (
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            {content.subtitle}
          </p>
        )}
      </div>

      {content.subsections?.map((sub, idx) => (
        <div
          key={idx}
          className="space-y-3 pt-4 first:pt-0 border-t first:border-0 border-slate-100 dark:border-[#202026]"
        >
          <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">
            {sub.subheading}
          </h2>
          {sub.bodyText &&
            sub.bodyText.split("\n\n").map((p, pIdx) => (
              <p
                key={pIdx}
                className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed"
              >
                {p}
              </p>
            ))}

          {sub.tableData && (
            <div className="rounded-xl border border-slate-200/90 dark:border-[#24242A] bg-white dark:bg-[#131316] overflow-hidden my-3 shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-[#18181D] border-b border-slate-200/90 dark:border-[#24242A]">
                  <tr>
                    {sub.tableData
                      .find((r) => r.isHeader)
                      ?.cells.map((cell, cIdx) => (
                        <th
                          key={cIdx}
                          className="px-4 py-2 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]"
                        >
                          {cell}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#202026]">
                  {sub.tableData
                    .filter((r) => !r.isHeader)
                    .map((row, rIdx) => (
                      <tr
                        key={rIdx}
                        className="hover:bg-slate-50/60 dark:hover:bg-[#1A1A22] transition-colors"
                      >
                        {row.cells.map((cell, cIdx) => (
                          <td
                            key={cIdx}
                            className={cn(
                              "px-4 py-2.5 text-slate-700 dark:text-slate-300",
                              cIdx === 1
                                ? "font-mono font-semibold text-[#FF4D4D]"
                                : "",
                            )}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderPattern = (content: StudyGuidePatternContent) => (
    <div className="space-y-6 sm:space-y-8">
      <div className="space-y-2">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          {content.pageTitle}
        </h1>
        <div className="flex gap-2.5 items-center flex-wrap">
          <span className="px-2 py-0.5 rounded-md bg-[#FF4D4D]/10 border border-[#FF4D4D]/20 text-[#FF4D4D] text-[10px] font-black uppercase tracking-wider">
            {content.subtitle?.includes("·")
              ? (content.subtitle.split("·")[1]?.trim() ?? "Pattern")
              : "Pattern"}
          </span>
          <span className="text-slate-400 dark:text-slate-500 text-xs font-medium flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {content.subtitle?.includes("·")
              ? (content.subtitle.split("·")[2] || "20 min").trim()
              : (content.subtitle ?? "")}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <span className="text-[10px] font-black text-[#FF4D4D] uppercase tracking-wider">
            The Logic
          </span>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
            {content.whatIsIt}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#18181D] border border-slate-200/90 dark:border-[#24242A] space-y-2">
            <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase flex items-center gap-1.5 tracking-wider">
              <Target className="w-3.5 h-3.5" />
              Trigger Phrases
            </span>
            <div className="flex flex-wrap gap-1.5">
              {content.triggerPhrases?.map((p, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-[11px] font-medium"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#18181D] border border-slate-200/90 dark:border-[#24242A] space-y-2">
            <span className="text-[10px] font-black text-[#FF4D4D] uppercase flex items-center gap-1.5 tracking-wider">
              <AlertTriangle className="w-3.5 h-3.5" />
              When Not to Use
            </span>
            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed italic">
              {content.whenNotToUse}
            </p>
          </div>
        </div>
      </div>

      {content.codeTemplates && content.codeTemplates.length > 0 && (
        <div className="space-y-2.5">
          <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Code Blueprint
          </span>
          <div className="space-y-3">
            {content.codeTemplates.map((tpl, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-slate-200/90 dark:border-[#24242A] bg-slate-950 dark:bg-[#0E0E12] overflow-hidden shadow-2xs"
              >
                <div className="px-3.5 py-1.5 border-b border-slate-800 dark:border-[#24242A] bg-slate-900 dark:bg-[#14141A] flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {tpl.label || "Template"}
                  </span>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-rose-500/30" />
                    <div className="w-2 h-2 rounded-full bg-amber-500/30" />
                    <div className="w-2 h-2 rounded-full bg-emerald-500/30" />
                  </div>
                </div>
                <pre className="p-3.5 overflow-x-auto font-mono text-xs text-slate-200 leading-relaxed scrollbar-thin-grey">
                  <code>{tpl.code}</code>
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}

      {content.workedExample && (
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-[#18181D] border border-slate-200/90 dark:border-[#24242A] space-y-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-[#FF4D4D]" />
              <span className="text-[10px] font-black text-[#FF4D4D] uppercase tracking-wider">
                Worked Example
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              {content.workedExample.problemTitle}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {content.workedExample.problemStatement}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Input
              </span>
              <pre className="p-2.5 rounded-lg bg-white dark:bg-[#101014] border border-slate-200 dark:border-[#24242A] font-mono text-[#FF4D4D] text-xs">
                {content.workedExample.inputExample}
              </pre>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Output
              </span>
              <pre className="p-2.5 rounded-lg bg-white dark:bg-[#101014] border border-slate-200 dark:border-[#24242A] font-mono text-emerald-500 text-xs">
                {content.workedExample.outputExample}
              </pre>
            </div>
          </div>

          {content.workedExample.keyInsight && (
            <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 text-xs text-slate-700 dark:text-slate-300">
              <span className="font-bold text-amber-600 dark:text-amber-400 block mb-0.5">
                Key Intuition:
              </span>
              {content.workedExample.keyInsight}
            </div>
          )}

          {content.workedExample.dryRunSteps && (
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Visual Walkthrough Steps
              </span>
              <div className="space-y-2">
                {content.workedExample.dryRunSteps.map((step, sIdx) => (
                  <div
                    key={sIdx}
                    className="p-3 rounded-xl bg-white dark:bg-[#121216] border border-slate-200/80 dark:border-[#24242A] flex gap-3 items-start"
                  >
                    <span className="shrink-0 w-5 h-5 rounded-full bg-slate-100 dark:bg-[#1C1C22] text-[10px] font-black text-slate-500 flex items-center justify-center border border-slate-200 dark:border-[#282830]">
                      {step.stepNumber}
                    </span>
                    <div className="space-y-1 flex-1 text-xs">
                      <p className="text-slate-700 dark:text-slate-300 leading-snug">
                        {step.description}
                      </p>
                      {step.arrayState && (
                        <div className="font-mono text-[11px] text-slate-400 flex items-center gap-2 pt-0.5">
                          <span className="text-[#FF4D4D]">
                            {step.arrayState}
                          </span>
                          {step.pointerState && (
                            <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-[#202026] text-[9px]">
                              {step.pointerState}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-slate-200/80 dark:border-[#24242A] text-xs">
            <div className="flex gap-4">
              <span>
                <strong className="text-slate-400">Time:</strong>{" "}
                <span className="font-mono text-slate-800 dark:text-slate-200 font-bold">
                  {content.workedExample.timeComplexity}
                </span>
              </span>
              <span>
                <strong className="text-slate-400">Space:</strong>{" "}
                <span className="font-mono text-slate-800 dark:text-slate-200 font-bold">
                  {content.workedExample.spaceComplexity}
                </span>
              </span>
            </div>

            {content.workedExample.leetcodeUrl && (
              <a
                href={content.workedExample.leetcodeUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[#FF4D4D] hover:underline font-bold"
              >
                <span>Try on LeetCode</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      )}

      {content.practiceQuestions && content.practiceQuestions.length > 0 && (
        <div className="space-y-2.5 pt-2">
          <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
            Practice Problems for this Pattern
          </span>
          <div className="space-y-2">
            {content.practiceQuestions.map((q, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#18181D] border border-slate-200/90 dark:border-[#24242A] hover:border-[#FF4D4D]/40 transition-colors gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                      {q.name}
                    </span>
                    <span
                      className={cn(
                        "px-1.5 py-0.2 rounded text-[9px] font-bold uppercase",
                        q.difficulty === "Easy"
                          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                          : "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400",
                      )}
                    >
                      {q.difficulty}
                    </span>
                  </div>
                  {q.hint && (
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5 italic">
                      {q.hint}
                    </p>
                  )}
                </div>

                {q.leetcodeUrl && (
                  <a
                    href={q.leetcodeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 text-slate-400 hover:text-[#FF4D4D] transition-colors shrink-0"
                    title="Solve on LeetCode"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderCheatsheet = (content: StudyGuideCheatsheetContent) => (
    <div className="space-y-6 sm:space-y-8">
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          {content.pageTitle}
        </h1>
        {content.subtitle && (
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {content.subtitle}
          </p>
        )}
      </div>

      {content.patternRows && content.patternRows.length > 0 && (
        <div className="rounded-xl border border-slate-200/90 dark:border-[#24242A] bg-white dark:bg-[#131316] overflow-hidden shadow-2xs">
          <div className="px-4 py-2 bg-slate-50 dark:bg-[#18181D] border-b border-slate-200/90 dark:border-[#24242A]">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
              Pattern Matcher Cheat Sheet
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/60 dark:bg-[#15151B] text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200/90 dark:border-[#24242A]">
                <tr>
                  <th className="px-4 py-2.5">Pattern</th>
                  <th className="px-4 py-2.5">When to Use</th>
                  <th className="px-4 py-2.5">Complexity</th>
                  <th className="px-4 py-2.5">Core Insight</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#202026]">
                {content.patternRows.map((row, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-slate-50/50 dark:hover:bg-[#1A1A22] transition-colors"
                  >
                    <td className="px-4 py-2.5 font-bold text-slate-900 dark:text-white">
                      {row.patternName}
                    </td>
                    <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400 italic text-[11px]">
                      {row.triggerWords}
                    </td>
                    <td className="px-4 py-2.5 text-[#FF4D4D] font-mono text-[11px] font-semibold">
                      {row.timeComplexity} | {row.spaceComplexity}
                    </td>
                    <td className="px-4 py-2.5 text-slate-700 dark:text-slate-300 font-medium">
                      {row.coreTrick}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {content.questionGroups && content.questionGroups.length > 0 && (
        <div className="space-y-3">
          <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
            Strategic Roadmaps
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {content.questionGroups.map((group, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#18181D] border border-slate-200/90 dark:border-[#24242A] space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    {group.groupName}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {group.questions.length} Qs
                  </span>
                </div>
                <div className="space-y-1.5">
                  {group.questions.map((q, qIdx) => (
                    <a
                      key={qIdx}
                      href={q.leetcodeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 hover:text-[#FF4D4D] transition-colors py-0.5"
                    >
                      <span className="truncate">— {q.name}</span>
                      <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    const { content, type } = activeSection;
    if (!content) return null;

    switch (type) {
      case "intro":
        return renderIntro(content as StudyGuideIntroContent);
      case "concept":
        return renderConcept(content as StudyGuideConceptContent);
      case "pattern":
        return renderPattern(content as StudyGuidePatternContent);
      case "cheatsheet":
        return renderCheatsheet(content as StudyGuideCheatsheetContent);
      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col flex-1 min-h-0 w-full bg-transparent text-slate-900 dark:text-white",
        className,
      )}
    >
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto scrollbar-thin-grey p-3 sm:p-5 scroll-smooth"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={sectionId || activeSection.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="w-full"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default StudyGuideReader;
