import { cn } from "@tbe/utils";
import {
  Check,
  CheckCircle2,
  Copy,
  Maximize2,
  Minimize2,
  Play,
  RotateCcw,
  Terminal,
  X,
  XCircle,
} from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { runCodeAgainstTestCases } from "./codeRunner";
import {
  generateStarterCode,
  LANGUAGE_DISPLAY_NAMES,
} from "./defaultTemplates";
import type {
  CodeEditorProps,
  ExecutionResult,
  SupportedLanguage,
  TestCase,
} from "./types";

export const DsaQuestionCodeEditor: React.FC<CodeEditorProps> = ({
  questionName,
  questionId,
  initialCode,
  testCases: propTestCases = [],
  onClose,
  onSolveSuccess,
  isAlreadySolved = false,
}) => {
  const [selectedLanguage, setSelectedLanguage] =
    useState<SupportedLanguage>("python");
  const [codes, setCodes] = useState<Record<SupportedLanguage, string>>(() => ({
    python: initialCode?.python || generateStarterCode("python", questionName),
    java: initialCode?.java || generateStarterCode("java", questionName),
    cpp: initialCode?.cpp || generateStarterCode("cpp", questionName),
    javascript:
      initialCode?.javascript ||
      generateStarterCode("javascript", questionName),
  }));

  // Update starter code when question changes
  useEffect(() => {
    setCodes({
      python:
        initialCode?.python || generateStarterCode("python", questionName),
      java: initialCode?.java || generateStarterCode("java", questionName),
      cpp: initialCode?.cpp || generateStarterCode("cpp", questionName),
      javascript:
        initialCode?.javascript ||
        generateStarterCode("javascript", questionName),
    });
  }, [questionName, questionId]);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"testcases" | "results">(
    "testcases",
  );
  const [selectedCaseIndex, setSelectedCaseIndex] = useState(0);
  const [executionResult, setExecutionResult] =
    useState<ExecutionResult | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle ESC key to exit fullscreen and prevent background body scrolling
  useEffect(() => {
    if (!isFullscreen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsFullscreen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isFullscreen]);

  // Initialize test cases from props or defaults
  const [testCases, setTestCases] = useState<TestCase[]>(() => {
    if (propTestCases.length > 0) return propTestCases;
    return [
      {
        id: "case-1",
        label: "Case 1",
        input: "nums = [2, 7, 11, 15], target = 9",
        expectedOutput: "[0, 1]",
      },
      {
        id: "case-2",
        label: "Case 2",
        input: "nums = [3, 2, 4], target = 6",
        expectedOutput: "[1, 2]",
      },
      {
        id: "case-3",
        label: "Case 3",
        input: "nums = [3, 3], target = 6",
        expectedOutput: "[0, 1]",
      },
    ];
  });

  useEffect(() => {
    if (propTestCases.length > 0) {
      setTestCases(propTestCases);
      setSelectedCaseIndex(0);
    }
  }, [propTestCases]);

  const currentCode = codes[selectedLanguage] || "";
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  // Synchronize scroll between line numbers and code textarea
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  // Handle Tab key insertion (4 spaces)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const val = textarea.value;

      const newVal = val.substring(0, start) + "    " + val.substring(end);
      setCodes((prev) => ({ ...prev, [selectedLanguage]: newVal }));

      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 4;
      }, 0);
    }
  };

  const lineCount = useMemo(() => {
    const lines = currentCode.split("\n").length;
    return Math.max(lines, 16);
  }, [currentCode]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(currentCode);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const handleResetCode = () => {
    const starter =
      initialCode?.[selectedLanguage] ||
      generateStarterCode(selectedLanguage, questionName);
    setCodes((prev) => ({ ...prev, [selectedLanguage]: starter }));
  };

  const handleAddCustomTestCase = () => {
    const newCaseNum = testCases.length + 1;
    const newCase: TestCase = {
      id: `custom-${Date.now()}`,
      label: `Custom ${newCaseNum}`,
      input: "",
      expectedOutput: "",
      isCustom: true,
    };
    setTestCases((prev) => [...prev, newCase]);
    setSelectedCaseIndex(testCases.length);
    setActiveTab("testcases");
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setActiveTab("results");
    try {
      const result = await runCodeAgainstTestCases({
        language: selectedLanguage,
        code: currentCode,
        testCases,
      });
      setExecutionResult(result);
    } catch (err: any) {
      console.error("Execution error", err);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmitCode = async () => {
    setIsSubmitting(true);
    setActiveTab("results");
    try {
      const result = await runCodeAgainstTestCases({
        language: selectedLanguage,
        code: currentCode,
        testCases,
      });
      setExecutionResult(result);

      if (result.success) {
        onSolveSuccess?.();
      }
    } catch (err: any) {
      console.error("Submission error", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeCase = testCases[selectedCaseIndex] || testCases[0];
  const activeCaseResult = executionResult?.results?.[selectedCaseIndex];

  const editorContent = (
    <div
      className={cn(
        "flex flex-col rounded-xl border border-slate-200/90 dark:border-[#24242A] bg-[#0E0E11] text-slate-100 shadow-md overflow-hidden transition-all duration-300 font-sans",
        isFullscreen
          ? "fixed inset-0 z-[100] rounded-none w-screen h-screen bg-[#0E0E11]"
          : "w-full h-full min-h-[580px] lg:min-h-[640px]",
      )}
    >
      {/* 1. Header Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#141418] border-b border-slate-800/80 shrink-0 gap-2">
        {/* Left: Language Selection Dropdown / Tabs */}
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="flex items-center gap-1.5 bg-[#1B1B22] p-0.5 rounded-lg border border-slate-800/60">
            {(["python", "java", "cpp", "javascript"] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setSelectedLanguage(lang)}
                className={cn(
                  "px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer",
                  selectedLanguage === lang
                    ? "bg-[#FF4D4D] text-white shadow-xs"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5",
                )}
              >
                {LANGUAGE_DISPLAY_NAMES[lang]}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Reset, Copy, Fullscreen, Close */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={handleResetCode}
            title="Reset code to initial boilerplate"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleCopyCode}
            title="Copy code"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors cursor-pointer"
          >
            {isCopied ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors cursor-pointer"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>

          {onClose && (
            <button
              type="button"
              onClick={() => {
                setIsFullscreen(false);
                onClose();
              }}
              title="Close Code Editor (Return to Full Question)"
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors ml-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Main Editor Body (Line Numbers + Code Textarea) */}
      <div className="flex-1 relative flex min-h-[260px] bg-[#0E0E12] overflow-hidden">
        {/* Line Numbers Gutter */}
        <div
          ref={lineNumbersRef}
          className="select-none py-3 px-2 text-right bg-[#111115] border-r border-slate-800/60 font-mono text-xs text-slate-600 overflow-hidden shrink-0 w-10 leading-relaxed pointer-events-none"
        >
          {Array.from({ length: lineCount }).map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>

        {/* Code Input Textarea */}
        <textarea
          ref={textareaRef}
          value={currentCode}
          onChange={(e) =>
            setCodes((prev) => ({
              ...prev,
              [selectedLanguage]: e.target.value,
            }))
          }
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          className="flex-1 w-full h-full p-3 bg-transparent text-slate-200 font-mono text-xs sm:text-[13px] leading-relaxed resize-none focus:outline-none overflow-auto scrollbar-thin-grey whitespace-pre"
          placeholder="Write your solution here..."
        />
      </div>

      {/* 3. Bottom Test Cases & Execution Dock */}
      <div className="border-t border-slate-800/80 bg-[#121216] flex flex-col shrink-0 min-h-[220px] max-h-[320px]">
        {/* Dock Sub-Tabs: Test Cases vs Results */}
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-800/60 bg-[#141418]">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveTab("testcases")}
              className={cn(
                "px-2.5 py-1 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors cursor-pointer",
                activeTab === "testcases"
                  ? "bg-slate-800 text-white font-bold"
                  : "text-slate-400 hover:text-slate-200",
              )}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Test Cases ({testCases.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("results")}
              className={cn(
                "px-2.5 py-1 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors cursor-pointer",
                activeTab === "results"
                  ? "bg-slate-800 text-white font-bold"
                  : "text-slate-400 hover:text-slate-200",
              )}
            >
              <Play className="w-3 h-3 text-[#FF4D4D]" />
              <span>Result</span>
              {executionResult && (
                <span
                  className={cn(
                    "w-2 h-2 rounded-full",
                    executionResult.success ? "bg-emerald-400" : "bg-rose-500",
                  )}
                />
              )}
            </button>
          </div>

          {activeTab === "testcases" && (
            <button
              type="button"
              onClick={handleAddCustomTestCase}
              className="text-[11px] font-semibold text-slate-400 hover:text-[#FF4D4D] transition-colors cursor-pointer"
            >
              + Add Case
            </button>
          )}
        </div>

        {/* Content Pane of the Dock */}
        <div className="flex-1 p-3 overflow-y-auto scrollbar-thin-grey space-y-2.5">
          {activeTab === "testcases" ? (
            <div className="space-y-2.5">
              {/* Test Case Tabs Row */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {testCases.map((tc, idx) => (
                  <button
                    key={tc.id}
                    type="button"
                    onClick={() => setSelectedCaseIndex(idx)}
                    className={cn(
                      "px-2.5 py-1 text-xs font-semibold rounded-md whitespace-nowrap transition-colors cursor-pointer",
                      selectedCaseIndex === idx
                        ? "bg-[#1E1E26] text-white border border-slate-700 font-bold"
                        : "text-slate-400 hover:bg-white/5",
                    )}
                  >
                    {tc.label}
                  </button>
                ))}
              </div>

              {/* Case Input & Expected Output Fields */}
              {activeCase && (
                <div className="space-y-2">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                      Input
                    </label>
                    <input
                      type="text"
                      value={activeCase.input}
                      onChange={(e) => {
                        const val = e.target.value;
                        setTestCases((prev) =>
                          prev.map((c, i) =>
                            i === selectedCaseIndex ? { ...c, input: val } : c,
                          ),
                        );
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#0E0E12] border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-[#FF4D4D]"
                      placeholder="e.g. nums = [2,7,11,15], target = 9"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                      Expected Output
                    </label>
                    <input
                      type="text"
                      value={activeCase.expectedOutput}
                      onChange={(e) => {
                        const val = e.target.value;
                        setTestCases((prev) =>
                          prev.map((c, i) =>
                            i === selectedCaseIndex
                              ? { ...c, expectedOutput: val }
                              : c,
                          ),
                        );
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#0E0E12] border border-slate-800 text-xs font-mono text-emerald-400 focus:outline-none focus:border-[#FF4D4D]"
                      placeholder="e.g. [0, 1]"
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Results Tab Content */
            <div className="space-y-2.5">
              {isRunning || isSubmitting ? (
                <div className="flex flex-col items-center justify-center py-6 text-center space-y-2">
                  <div className="w-6 h-6 border-2 border-[#FF4D4D] border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs text-slate-400 font-medium">
                    {isSubmitting
                      ? "Submitting and running test cases..."
                      : "Running code against test cases..."}
                  </p>
                </div>
              ) : !executionResult ? (
                <div className="flex flex-col items-center justify-center py-6 text-center text-slate-500 text-xs">
                  <Terminal className="w-6 h-6 mb-1 text-slate-600" />
                  <p>Run your code to see test case results here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Results Banner */}
                  <div
                    className={cn(
                      "p-2.5 rounded-lg border flex items-center justify-between gap-2",
                      executionResult.success
                        ? "bg-emerald-950/20 border-emerald-900/40 text-emerald-400"
                        : "bg-rose-950/20 border-rose-900/40 text-rose-400",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {executionResult.success ? (
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                      ) : (
                        <XCircle className="w-4 h-4 shrink-0 text-rose-400" />
                      )}
                      <span className="font-bold text-xs sm:text-sm">
                        {executionResult.success
                          ? `Accepted! All ${executionResult.totalCases} Test Cases Passed`
                          : `Wrong Answer (${executionResult.passedCases}/${executionResult.totalCases} passed)`}
                      </span>
                    </div>

                    {executionResult.runtimeMs && (
                      <span className="text-[11px] font-mono text-slate-400">
                        {executionResult.runtimeMs}ms
                      </span>
                    )}
                  </div>

                  {/* Per-case switcher */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                    {testCases.map((tc, idx) => {
                      const res = executionResult.results[idx];
                      const passed = res?.passed;
                      return (
                        <button
                          key={tc.id}
                          type="button"
                          onClick={() => setSelectedCaseIndex(idx)}
                          className={cn(
                            "px-2.5 py-1 text-xs font-semibold rounded-md flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer border",
                            selectedCaseIndex === idx
                              ? "bg-[#1E1E26] text-white border-slate-600 font-bold"
                              : "text-slate-400 border-transparent hover:bg-white/5",
                          )}
                        >
                          <span
                            className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              passed ? "bg-emerald-400" : "bg-rose-500",
                            )}
                          />
                          <span>{tc.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Active Case Details */}
                  {activeCase && (
                    <div className="space-y-2 bg-[#0E0E12] p-2.5 rounded-lg border border-slate-800 text-xs font-mono">
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                          Input
                        </span>
                        <div className="text-slate-300 mt-0.5">
                          {activeCase.input || "(empty)"}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/60">
                        <div>
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                            Expected
                          </span>
                          <div className="text-emerald-400 mt-0.5">
                            {activeCase.expectedOutput || "(none)"}
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                            Your Output
                          </span>
                          <div
                            className={cn(
                              "mt-0.5",
                              activeCaseResult?.passed
                                ? "text-emerald-400"
                                : "text-rose-400",
                            )}
                          >
                            {activeCaseResult?.actualOutput ||
                              "(No output produced)"}
                          </div>
                        </div>
                      </div>

                      {activeCaseResult?.error && (
                        <div className="pt-1.5 border-t border-slate-800/60 text-rose-400">
                          <span className="text-[10px] text-rose-500 font-bold uppercase tracking-wider block">
                            Error / Stderr
                          </span>
                          <pre className="mt-0.5 whitespace-pre-wrap">
                            {activeCaseResult.error}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 4. Action Buttons Footer */}
        <div className="flex items-center justify-between px-3 py-2 bg-[#141418] border-t border-slate-800/80 shrink-0">
          <div className="text-[11px] text-slate-400 font-medium">
            {isAlreadySolved ? (
              <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                <Check className="w-3.5 h-3.5" /> Already Solved
              </span>
            ) : (
              <span>Practice & test your algorithm</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isRunning || isSubmitting}
              onClick={handleRunCode}
              className="px-3 py-1.5 rounded-lg border border-slate-700 bg-[#1E1E24] hover:bg-[#25252D] text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 text-[#FF4D4D] fill-current" />
              <span>{isRunning ? "Running..." : "Run Code"}</span>
            </button>

            <button
              type="button"
              disabled={isRunning || isSubmitting}
              onClick={handleSubmitCode}
              className="px-3.5 py-1.5 rounded-lg bg-[#FF4D4D] hover:bg-[#FF3333] text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm shadow-red-500/20 disabled:opacity-50 active:scale-95"
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>{isSubmitting ? "Submitting..." : "Submit"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (isFullscreen && mounted && typeof document !== "undefined") {
    return createPortal(editorContent, document.body);
  }

  return editorContent;
};

export default DsaQuestionCodeEditor;
