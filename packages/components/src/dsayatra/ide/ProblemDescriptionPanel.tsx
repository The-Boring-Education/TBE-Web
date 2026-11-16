import React, { useState } from "react";
import markdownit from "markdown-it";
import { Check, Copy, Crown, Sparkles, BookOpen } from "lucide-react";
import type { DsaQuestion } from "@tbe/interface";

const md = markdownit({ html: false, breaks: true });

interface ProblemDescriptionPanelProps {
  question: DsaQuestion;
}

export const ProblemDescriptionPanel: React.FC<ProblemDescriptionPanelProps> = ({
  question,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const difficultyClass = (level: string = "") => {
    switch (level.toUpperCase()) {
      case "EASY":
        return "bg-emerald-950/40 text-emerald-400 border-emerald-800/60";
      case "MEDIUM":
        return "bg-amber-950/40 text-amber-400 border-amber-800/60";
      case "HARD":
        return "bg-rose-950/40 text-rose-400 border-rose-800/60";
      default:
        return "bg-slate-800 text-slate-300 border-slate-700";
    }
  };

  // Structured or fallback examples
  const structuredExamples = question.sections?.examples || [];
  const fallbackExamples = question.examples || [];
  const constraints =
    question.sections?.constraints?.map((c) => c.constraint) ||
    question.constraints ||
    [];

  return (
    <div className="w-full h-full overflow-y-auto px-4 py-5 space-y-6 text-slate-200 font-sans select-text scrollbar-thin scrollbar-thumb-slate-700">
      {/* Title & Metadata Header */}
      <div className="space-y-2.5 pb-4 border-b border-slate-800/80">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${difficultyClass(
              question.difficultyLevel,
            )}`}
          >
            {question.difficultyLevel || "EASY"}
          </span>

          {question.isRealWorldProblem && (
            <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300">
              <Crown className="w-3 h-3" /> Real-World Problem
            </span>
          )}

          {question.topics && question.topics.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {question.topics.map((t) => (
                <span
                  key={t}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-400 border border-slate-700/50"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>

        <h1 className="text-xl font-black text-white tracking-tight leading-snug">
          {question.name}
        </h1>
      </div>

      {/* Problem Statement */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-[#FF4D4D]" />
          Problem Description
        </h2>

        {question.answer ? (
          <div
            className="prose prose-invert prose-sm max-w-none text-slate-300 leading-relaxed text-[13px] [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_code]:bg-slate-800/80 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-red-300"
            dangerouslySetInnerHTML={{
              __html: md.render(question.answer),
            }}
          />
        ) : (
          <p className="text-xs text-slate-400 italic">
            Read the problem statement and constraints carefully before submitting.
          </p>
        )}
      </div>

      {/* Examples Section */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Examples
        </h2>

        {structuredExamples.length > 0 ? (
          <div className="space-y-3">
            {structuredExamples.map((ex, idx) => (
              <div
                key={ex.label || idx}
                className="bg-[#18181D] border border-slate-800 rounded-xl p-3.5 space-y-2.5 text-xs"
              >
                <div className="font-bold text-slate-300">
                  {ex.label || `Example ${idx + 1}`}:
                </div>

                {/* Input */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                    <span>Input:</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(ex.input, `in-${idx}`)}
                      className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-white transition-colors cursor-pointer"
                      title="Copy Input"
                    >
                      {copiedKey === `in-${idx}` ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      <span>{copiedKey === `in-${idx}` ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                  <pre className="bg-[#111114] border border-slate-800/80 rounded-lg p-2 font-mono text-[11px] text-emerald-300/90 overflow-x-auto whitespace-pre-wrap">
                    {ex.input}
                  </pre>
                </div>

                {/* Output */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                    <span>Output:</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(ex.output, `out-${idx}`)}
                      className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-white transition-colors cursor-pointer"
                      title="Copy Output"
                    >
                      {copiedKey === `out-${idx}` ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      <span>{copiedKey === `out-${idx}` ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                  <pre className="bg-[#111114] border border-slate-800/80 rounded-lg p-2 font-mono text-[11px] text-amber-300/90 overflow-x-auto whitespace-pre-wrap">
                    {ex.output}
                  </pre>
                </div>

                {ex.explanation && (
                  <div className="text-[11px] text-slate-400 leading-normal pt-1">
                    <span className="font-semibold text-slate-300">Explanation: </span>
                    {ex.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : fallbackExamples.length > 0 ? (
          <div className="space-y-3">
            {fallbackExamples.map((ex, idx) => (
              <div
                key={idx}
                className="bg-[#18181D] border border-slate-800 rounded-xl p-3.5 space-y-2 text-xs"
              >
                <div className="font-bold text-slate-300">Example {idx + 1}:</div>
                <div className="space-y-1">
                  <div className="text-[11px] text-slate-400 font-semibold">Input:</div>
                  <pre className="bg-[#111114] border border-slate-800/80 rounded-lg p-2 font-mono text-[11px] text-emerald-300/90 whitespace-pre-wrap">
                    {ex.inputText}
                  </pre>
                </div>
                <div className="space-y-1">
                  <div className="text-[11px] text-slate-400 font-semibold">Output:</div>
                  <pre className="bg-[#111114] border border-slate-800/80 rounded-lg p-2 font-mono text-[11px] text-amber-300/90 whitespace-pre-wrap">
                    {ex.outputText}
                  </pre>
                </div>
                {ex.explanation && (
                  <p className="text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-300">Explanation: </span>
                    {ex.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#18181D] border border-slate-800 rounded-xl p-4 text-xs text-slate-400">
            No sample test cases formatted for this question. You can add custom test cases in the right panel.
          </div>
        )}
      </div>

      {/* Constraints Section */}
      {constraints.length > 0 && (
        <div className="space-y-2.5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Constraints
          </h2>
          <ul className="space-y-1.5 pl-4 list-disc text-xs text-slate-300 font-mono">
            {constraints.map((c, i) => (
              <li key={i} className="leading-relaxed">
                {c}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

