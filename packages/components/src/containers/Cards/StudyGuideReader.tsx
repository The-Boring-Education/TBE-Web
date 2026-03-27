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

import Text from "../../common/Typography/Text";

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
      <div className="flex-1 flex flex-col items-center justify-center bg-[#050505] p-8">
        <Sparkles className="w-12 h-12 text-gray-800/20 mb-4 animate-pulse" />
        <Text
          level="p"
          className="text-gray-500 font-black text-center max-w-xs uppercase tracking-[0.2em] text-[11px]"
        >
          Study guide will be available shortly
        </Text>
      </div>
    );
  }

  const activeSection = data.sections.find((s) => s.id === sectionId);

  if (!activeSection || activeSection.isDivider) {
    return (
      <div
        className={cn(
          "flex-1 flex flex-col items-center justify-center bg-[#050505]",
          className,
        )}
      >
        <Sparkles className="w-12 h-12 text-gray-800 mb-4" />
        <Text level="p" className="text-gray-600 font-medium">
          Select a section to start reading
        </Text>
      </div>
    );
  }

  const renderIntro = (content: StudyGuideIntroContent) => (
    <div className="space-y-12">
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="w-4 h-4 text-red-500/80" />
          <Text
            level="p"
            className="text-[10px] font-black text-red-500/60 uppercase tracking-[0.2em]"
          >
            Basics
          </Text>
        </div>
        <Text
          level="h1"
          className="text-4xl font-black text-white tracking-tight"
        >
          {content.pageTitle}
        </Text>
        <Text level="p" className="text-gray-400 text-lg leading-relaxed">
          {content.subtitle}
        </Text>
      </div>

      <div className="space-y-6">
        <Text level="p" className="text-gray-300 leading-relaxed text-[15px]">
          {content.openingParagraph}
        </Text>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
<<<<<<< HEAD
          {content.prereqCards.map((card, idx) => (
=======
          {content.prereqCards?.map((card, idx) => (
>>>>>>> c4aadea2 (feat(dsa): seed graph and queue content, stabilization, and topic cleanup)
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors"
            >
              <Text
                level="h4"
                className="text-white font-bold mb-2 flex items-center gap-2"
              >
                <span className="text-[10px] text-red-500/60 bg-red-500/10 w-4 h-4 rounded-full flex items-center justify-center font-black">
                  {idx + 1}
                </span>
                {card.title}
              </Text>
              <Text
                level="p"
                className="text-gray-500 text-[13px] leading-relaxed"
              >
                {card.body}
              </Text>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
<<<<<<< HEAD
        {content.callouts.map((callout, idx) => (
=======
        {content.callouts?.map((callout, idx) => (
>>>>>>> c4aadea2 (feat(dsa): seed graph and queue content, stabilization, and topic cleanup)
          <div
            key={idx}
            className={cn(
              "p-5 rounded-2xl border flex gap-4",
              callout.variant === "info"
                ? "bg-red-500/[0.02] border-red-500/10"
                : "bg-green-500/[0.02] border-green-500/10",
            )}
          >
            {callout.variant === "info" ? (
              <Info className="w-5 h-5 text-red-500/60 shrink-0" />
            ) : (
              <Sparkles className="w-5 h-5 text-green-500/60 shrink-0" />
            )}
            <Text
              level="p"
              className="text-gray-300 text-[14px] leading-relaxed italic"
            >
              {callout.body}
            </Text>
          </div>
        ))}
      </div>

      <div className="space-y-4 pt-4 border-t border-white/5">
        <Text
          level="h3"
          className="text-lg font-black text-white uppercase tracking-widest"
        >
          {content.howToUseHeading}
        </Text>
        <div className="space-y-4">
<<<<<<< HEAD
          {content.howToUseParagraphs.map((p, idx) => (
=======
          {content.howToUseParagraphs?.map((p, idx) => (
>>>>>>> c4aadea2 (feat(dsa): seed graph and queue content, stabilization, and topic cleanup)
            <Text key={idx} level="p" className="text-gray-400 leading-relaxed">
              {p}
            </Text>
          ))}
        </div>
      </div>
    </div>
  );

  const renderConcept = (content: StudyGuideConceptContent) => (
    <div className="space-y-12">
      <div className="space-y-2">
        <Text
          level="h1"
          className="text-4xl font-black text-white tracking-tight"
        >
          {content.pageTitle}
        </Text>
        <Text level="p" className="text-gray-400 text-lg">
          {content.subtitle}
        </Text>
      </div>

<<<<<<< HEAD
      {content.subsections.map((sub, idx) => (
=======
      {content.subsections?.map((sub, idx) => (
>>>>>>> c4aadea2 (feat(dsa): seed graph and queue content, stabilization, and topic cleanup)
        <div key={idx} className="space-y-6">
          <Text
            level="h2"
            className="text-2xl font-black text-white tracking-tight pt-8 border-t border-white/5 first:border-0 first:pt-0"
          >
            {sub.subheading}
          </Text>
          {sub.bodyText &&
            sub.bodyText.split("\n\n").map((p, pIdx) => (
              <Text
                key={pIdx}
                level="p"
                className="text-gray-300 leading-relaxed text-[15px]"
              >
                {p}
              </Text>
            ))}

          {sub.tableData && (
            <div className="rounded-2xl border border-white/5 bg-black/40 overflow-hidden">
              <table className="w-full text-left text-[13px]">
                <thead className="bg-white/[0.03] border-b border-white/5">
                  <tr>
                    {sub.tableData
                      .find((r) => r.isHeader)
                      ?.cells.map((cell, cIdx) => (
                        <th
                          key={cIdx}
                          className="px-6 py-4 font-black text-gray-400 uppercase tracking-widest text-[10px]"
                        >
                          {cell}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {sub.tableData
                    .filter((r) => !r.isHeader)
                    .map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-white/[0.01]">
                        {row.cells.map((cell, cIdx) => (
                          <td
                            key={cIdx}
                            className={cn(
                              "px-6 py-4 text-gray-300",
                              cIdx === 1 ? "font-mono text-red-400/80" : "",
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
    <div className="space-y-12">
      <div className="space-y-4">
        <Text
          level="h1"
          className="text-4xl font-black text-white tracking-tight"
        >
          {content.pageTitle}
        </Text>
        <div className="flex gap-4 items-center">
          <Text
            level="span"
            className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-widest"
          >
            {content.subtitle?.includes("·")
              ? (content.subtitle.split("·")[1]?.trim() ?? "Medium")
              : "Medium"}
          </Text>
          <Text
            level="span"
            className="text-gray-500 text-[11px] font-medium flex items-center gap-1.5"
          >
            <Clock className="w-3.5 h-3.5" />
            {content.subtitle?.includes("·")
              ? (content.subtitle.split("·")[2] || "25 min").trim()
              : (content.subtitle ?? "")}
          </Text>
        </div>
      </div>

      <div className="space-y-8">
        <div className="space-y-4">
          <Text
            level="h3"
            className="text-[11px] font-black text-red-500/60 uppercase tracking-[0.2em] mb-4"
          >
            The Logic
          </Text>
          <Text level="p" className="text-gray-300 leading-relaxed text-[15px]">
            {content.whatIsIt}
          </Text>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <Text
              level="p"
              className="text-[10px] font-black text-green-500/60 uppercase flex items-center gap-2 tracking-widest"
            >
              <Target className="w-3.5 h-3.5" />
              Trigger Phrases
            </Text>
            <div className="flex flex-wrap gap-2">
<<<<<<< HEAD
              {content.triggerPhrases.map((p, idx) => (
=======
              {content.triggerPhrases?.map((p, idx) => (
>>>>>>> c4aadea2 (feat(dsa): seed graph and queue content, stabilization, and topic cleanup)
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-green-500/[0.03] border border-green-500/10 text-green-400/80 text-[12px] font-medium"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <Text
              level="p"
              className="text-[10px] font-black text-red-500/60 uppercase flex items-center gap-2 tracking-widest"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              When not to use
            </Text>
            <Text
              level="p"
              className="text-gray-400 text-[13px] leading-relaxed italic"
            >
              {content.whenNotToUse}
            </Text>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <Text
          level="h3"
          className="text-[11px] font-black text-blue-500/60 uppercase tracking-[0.2em]"
        >
          Code Blueprint
        </Text>
        <div className="space-y-4">
<<<<<<< HEAD
          {content.codeTemplates.map((tpl, idx) => (
=======
          {content.codeTemplates?.map((tpl, idx) => (
>>>>>>> c4aadea2 (feat(dsa): seed graph and queue content, stabilization, and topic cleanup)
            <div
              key={idx}
              className="rounded-2xl border border-white/5 bg-[#050505] overflow-hidden group"
            >
              <div className="px-4 py-2 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
                <Text
                  level="p"
                  className="text-[10px] font-black text-gray-500 uppercase tracking-widest"
                >
                  {tpl.label || "Template"}
                </Text>
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-500/20" />
                  <div className="w-2 h-2 rounded-full bg-yellow-500/20" />
                  <div className="w-2 h-2 rounded-full bg-green-500/20" />
                </div>
              </div>
              <pre className="p-5 overflow-x-auto font-mono text-[13px] text-gray-400 leading-relaxed">
                <code className={cn("language-" + tpl.language)}>
                  {tpl.code}
                </code>
              </pre>
            </div>
          ))}
        </div>
      </div>

      {content.visualAscii && (
        <div className="space-y-4">
          <Text
            level="h3"
            className="text-[11px] font-black text-purple-500/60 uppercase tracking-[0.2em]"
          >
            Visual Insight
          </Text>
          <pre className="p-8 rounded-2xl bg-white/[0.01] border border-dashed border-white/10 font-mono text-[14px] text-gray-500 leading-relaxed flex flex-col items-center">
            <code>{content.visualAscii}</code>
          </pre>
        </div>
      )}

      <div className="p-8 rounded-3xl bg-red-500/[0.01] border border-red-500/10 space-y-10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/[0.02] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

        <div className="space-y-3 relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-red-500/60" />
            <Text
              level="p"
              className="text-[10px] font-black text-red-500/60 uppercase tracking-widest"
            >
              Worked Example
            </Text>
          </div>
          <Text level="h3" className="text-2xl font-black text-white">
            {content.workedExample.problemTitle}
          </Text>
          <Text level="p" className="text-gray-400 leading-relaxed">
            {content.workedExample.problemStatement}
          </Text>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
          <div className="space-y-2">
            <Text
              level="p"
              className="text-[11px] font-black text-gray-500 uppercase tracking-widest"
            >
              Input
            </Text>
            <pre className="p-4 rounded-xl bg-black border border-white/5 font-mono text-red-400/80 text-[13px]">
              {content.workedExample.inputExample}
            </pre>
          </div>
          <div className="space-y-2">
            <Text
              level="p"
              className="text-[11px] font-black text-gray-500 uppercase tracking-widest"
            >
              Output
            </Text>
            <pre className="p-4 rounded-xl bg-black border border-white/5 font-mono text-green-400/80 text-[13px]">
              {content.workedExample.outputExample}
            </pre>
          </div>
        </div>

        <div className="space-y-6 pt-6 border-t border-white/5 relative z-10">
          <div className="space-y-2">
            <Text
              level="h4"
              className="text-[13px] font-black text-white uppercase tracking-widest"
            >
              Why it works (The intuition)
            </Text>
            <Text
              level="p"
              className="text-gray-300 leading-relaxed font-bold italic"
            >
              {content.workedExample.keyInsight}
            </Text>
          </div>

          <div className="space-y-4">
            <Text
              level="h4"
              className="text-[13px] font-black text-white uppercase tracking-widest"
            >
              Visual Walkthrough
            </Text>
            <div className="space-y-3">
              {content.workedExample.dryRunSteps.map((step, sIdx) => (
                <div
                  key={sIdx}
                  className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex gap-4 items-start"
                >
                  <span className="shrink-0 w-6 h-6 rounded-full bg-white/5 text-[10px] font-black text-gray-500 flex items-center justify-center border border-white/5">
                    {step.stepNumber}
                  </span>
                  <div className="space-y-3 flex-1">
                    <Text
                      level="p"
                      className="text-gray-300 text-[14px] leading-snug"
                    >
                      {step.description}
                    </Text>
                    {step.arrayState && (
                      <div className="font-mono text-[12px] text-gray-500 flex items-center gap-3">
                        <span className="text-[10px] uppercase font-black opacity-30">
                          State:
                        </span>
                        <span className="text-red-400/60">
                          {step.arrayState}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-white/5 text-[9px] uppercase font-black">
                          {step.pointerState}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-white/5 relative z-10">
          <div className="space-y-1">
            <Text
              level="p"
              className="text-[10px] font-black text-gray-500 uppercase tracking-widest"
            >
              Time
            </Text>
            <Text level="p" className="text-white font-black">
              {content.workedExample.timeComplexity}
            </Text>
          </div>
          <div className="space-y-1">
            <Text
              level="p"
              className="text-[10px] font-black text-gray-500 uppercase tracking-widest"
            >
              Space
            </Text>
            <Text level="p" className="text-white font-black">
              {content.workedExample.spaceComplexity}
            </Text>
          </div>
          <div className="col-span-2">
            <a
              href={content.workedExample.leetcodeUrl}
              target="_blank"
              className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/[0.08] transition-all group/link"
              rel="noreferrer"
            >
              <Text level="p" className="text-[13px] font-bold text-gray-300">
                Try on LeetCode
              </Text>
              <ExternalLink className="w-4 h-4 text-gray-500 group-hover/link:text-red-500 transition-colors" />
            </a>
          </div>
        </div>
      </div>

      <div className="space-y-6 pt-12 border-t border-white/5">
        <Text
          level="h3"
          className="text-[11px] font-black text-gray-500 uppercase tracking-[0.2em]"
        >
          Next Practice Challenge
        </Text>
        <div className="space-y-3">
<<<<<<< HEAD
          {content.practiceQuestions.map((q, idx) => (
=======
          {content.practiceQuestions?.map((q, idx) => (
>>>>>>> c4aadea2 (feat(dsa): seed graph and queue content, stabilization, and topic cleanup)
            <motion.div
              key={idx}
              whileHover={{ x: 6 }}
              className="group flex flex-col md:flex-row md:items-center justify-between p-5 rounded-2xl bg-white/[0.01] border border-white/5 hover:bg-white/[0.03] transition-all gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-3">
                  <Text level="h4" className="text-white font-bold text-[15px]">
                    {q.name}
                  </Text>
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border",
                      q.difficulty === "Easy"
                        ? "bg-green-500/10 text-green-500/80 border-green-500/20"
                        : "bg-yellow-500/10 text-yellow-500/80 border-yellow-500/20",
                    )}
                  >
                    {q.difficulty}
                  </span>
                </div>
                <Text
                  level="p"
                  className="text-gray-500 text-[13px] leading-relaxed italic"
                >
                  {q.hint}
                </Text>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={q.leetcodeUrl}
                  target="_blank"
                  className="p-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-red-500/40 transition-all text-gray-400 hover:text-red-400"
                  rel="noreferrer"
                >
                  <ChevronRight className="w-5 h-5" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCheatsheet = (content: StudyGuideCheatsheetContent) => (
    <div className="space-y-12">
      <div className="space-y-2">
        <Text
          level="h1"
          className="text-4xl font-black text-white tracking-tight"
        >
          {content.pageTitle}
        </Text>
        <Text level="p" className="text-gray-400 text-lg leading-relaxed">
          {content.subtitle}
        </Text>
      </div>

      <div className="rounded-3xl border border-white/5 bg-black/40 overflow-hidden">
        <div className="px-6 py-4 bg-white/[0.02] border-b border-white/5">
          <Text
            level="p"
            className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]"
          >
            Pattern Matcher
          </Text>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-[#0A0A0A] text-gray-500 font-black uppercase tracking-widest text-[10px]">
              <tr>
                <th className="px-6 py-4">Pattern</th>
                <th className="px-6 py-4">When to use</th>
                <th className="px-6 py-4">Complexity</th>
                <th className="px-6 py-4">Key Insight</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
<<<<<<< HEAD
              {content.patternRows.map((row, idx) => (
=======
              {content.patternRows?.map((row, idx) => (
>>>>>>> c4aadea2 (feat(dsa): seed graph and queue content, stabilization, and topic cleanup)
                <tr key={idx} className="hover:bg-white/[0.01]">
                  <td className="px-6 py-5 font-black text-white">
                    {row.patternName}
                  </td>
                  <td className="px-6 py-5 text-gray-400 italic text-[12px]">
                    {row.triggerWords}
                  </td>
                  <td className="px-6 py-5 text-red-400/80 font-mono text-[11px] font-bold">
                    {row.timeComplexity} | {row.spaceComplexity}
                  </td>
                  <td className="px-6 py-5 text-gray-300 text-[13px] font-medium">
                    {row.coreTrick}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-12 border-t border-white/5">
        <div className="lg:col-span-2 space-y-6">
          <Text
            level="h3"
            className="text-[11px] font-black text-gray-500 uppercase tracking-[0.2em]"
          >
            Strategic Roadmaps
          </Text>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
<<<<<<< HEAD
            {content.questionGroups.map((group, idx) => (
=======
            {content.questionGroups?.map((group, idx) => (
>>>>>>> c4aadea2 (feat(dsa): seed graph and queue content, stabilization, and topic cleanup)
              <div
                key={idx}
                className="p-6 rounded-3xl bg-white/[0.01] border border-white/5 space-y-4"
              >
                <Text
                  level="h4"
                  className="text-sm font-black text-white uppercase tracking-widest flex items-center justify-between"
                >
                  {group.groupName}
                  <span className="text-[10px] font-medium text-gray-600 font-mono">
                    {group.questions.length} Qs
                  </span>
                </Text>
                <div className="space-y-2.5">
<<<<<<< HEAD
                  {group.questions.map((q, qIdx) => (
=======
                  {group.questions?.map((q, qIdx) => (
>>>>>>> c4aadea2 (feat(dsa): seed graph and queue content, stabilization, and topic cleanup)
                    <a
                      key={qIdx}
                      href={q.leetcodeUrl}
                      target="_blank"
                      className="flex items-center justify-between group/q"
                      rel="noreferrer"
                    >
                      <Text
                        level="p"
                        className="text-[13px] text-gray-400 group-hover/q:text-gray-200 transition-colors"
                      >
                        — {q.name}
                      </Text>
                      <ChevronRight className="w-3.5 h-3.5 text-gray-700 group-hover/q:text-red-500 transition-colors" />
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <Text
            level="h3"
            className="text-[11px] font-black text-gray-500 uppercase tracking-[0.2em]"
          >
            The Golden Rules
          </Text>
          <div className="p-8 rounded-3xl bg-red-500/[0.02] border border-red-500/10 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/[0.05] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="space-y-6 relative z-10">
<<<<<<< HEAD
              {content.oneThingToRemember.map((rule, idx) => {
=======
              {content.oneThingToRemember?.map((rule, idx) => {
>>>>>>> c4aadea2 (feat(dsa): seed graph and queue content, stabilization, and topic cleanup)
                const parts = rule.split(": ");
                const pattern = parts[0];
                const text = parts.slice(1).join(": ");
                return (
                  <div key={idx} className="space-y-1">
                    <Text
                      level="p"
                      className="text-[10px] font-black text-red-500/60 uppercase tracking-widest"
                    >
                      {pattern}
                    </Text>
                    <Text
                      level="p"
                      className="text-gray-300 text-[13px] leading-relaxed font-bold italic"
                    >
                      {text}
                    </Text>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
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
        "flex flex-col flex-1 min-h-0 w-full bg-[#050505]",
        className,
      )}
    >
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto scrollbar-thin-grey px-8 py-12 scroll-smooth"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={sectionId}
            initial={{ opacity: 0, scale: 0.99, filter: "blur(4px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.99, filter: "blur(4px)" }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-4xl mx-auto w-full"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default StudyGuideReader;
