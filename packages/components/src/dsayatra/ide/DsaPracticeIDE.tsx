import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Check,
  Cloud,
  Code2,
  Maximize2,
  Minimize2,
  Play,
  RotateCcw,
  Send,
  X,
} from "lucide-react";
import { useUser } from "@tbe/hooks";
import type { DsaQuestion } from "@tbe/interface";
import { routes } from "@tbe/constants";
import { sendRequest } from "@tbe/utils";

import { CodeEditor } from "./CodeEditor";
import { ProblemDescriptionPanel } from "./ProblemDescriptionPanel";
import {
  type EditableTestCase,
  type ExecutionResultData,
  TestCasesPanel,
} from "./TestCasesPanel";
import {
  getStarterCode,
  SUPPORTED_LANGUAGES,
  type SupportedIdeLanguage,
} from "./templates";

interface DsaPracticeIDEProps {
  question: DsaQuestion;
  isOpen: boolean;
  onClose: () => void;
  onSolved?: () => void;
}

export const DsaPracticeIDE: React.FC<DsaPracticeIDEProps> = ({
  question,
  isOpen,
  onClose,
  onSolved,
}) => {
  const { user } = useUser();
  const userId = user?.id;
  const questionId = String(question.id ?? question._id ?? question.name);

  const [selectedLanguage, setSelectedLanguage] =
    useState<SupportedIdeLanguage>("python");
  const [code, setCode] = useState<string>("");
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">(
    "saved",
  );
  const [testCases, setTestCases] = useState<EditableTestCase[]>([]);
  const [executionResult, setExecutionResult] =
    useState<ExecutionResultData | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeBottomTab, setActiveBottomTab] = useState<
    "testcases" | "results" | "console"
  >("testcases");
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Track codes across languages in memory
  const codesCache = useRef<Record<string, string>>({});
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Initialize test cases from question examples
  useEffect(() => {
    if (!isOpen) return;

    const initialCases: EditableTestCase[] = [];
    if (question.sections?.examples && question.sections.examples.length > 0) {
      question.sections.examples.forEach((ex, i) => {
        initialCases.push({
          id: `ex-${i + 1}`,
          input: ex.input || "",
          expectedOutput: ex.output || "",
          isCustom: false,
        });
      });
    } else if (question.examples && question.examples.length > 0) {
      question.examples.forEach((ex, i) => {
        initialCases.push({
          id: `ex-${i + 1}`,
          input: ex.inputText || "",
          expectedOutput: ex.outputText || "",
          isCustom: false,
        });
      });
    } else {
      initialCases.push({
        id: "ex-1",
        input: "",
        expectedOutput: "",
        isCustom: false,
      });
    }

    setTestCases(initialCases);
    setExecutionResult(null);
  }, [isOpen, question]);

  // 2. Load and restore code when language or question changes
  const loadCodeForLanguage = useCallback(
    async (lang: SupportedIdeLanguage) => {
      const cacheKey = `${questionId}_${lang}`;

      // A. Check memory cache first
      if (codesCache.current[cacheKey]) {
        setCode(codesCache.current[cacheKey]);
        setSaveStatus("saved");
        return;
      }

      // B. Check localStorage
      const localKey = `dsayatra_code_${cacheKey}`;
      let restoredCode = "";
      try {
        if (typeof window !== "undefined") {
          restoredCode = localStorage.getItem(localKey) || "";
        }
      } catch {
        // Ignore localStorage error
      }

      // C. If user is logged in, try fetching from backend
      if (userId) {
        try {
          const res = await sendRequest({
            url: `${routes.api.base}${routes.api.dsaCode}?userId=${encodeURIComponent(
              String(userId),
            )}&questionId=${encodeURIComponent(questionId)}&language=${lang}`,
            method: "GET",
          });

          if (res?.status && res?.data?.code) {
            restoredCode = res.data.code;
          }
        } catch {
          // Fall back to localStorage or starter code
        }
      }

      // D. If still empty, generate starter boilerplate
      if (!restoredCode) {
        restoredCode = getStarterCode(
          lang,
          question.name,
          question.sections?.working_code,
        );
      }

      codesCache.current[cacheKey] = restoredCode;
      setCode(restoredCode);
      setSaveStatus("saved");
    },
    [questionId, userId, question.name, question.sections?.working_code],
  );

  useEffect(() => {
    if (isOpen) {
      loadCodeForLanguage(selectedLanguage);
    }
  }, [isOpen, selectedLanguage, loadCodeForLanguage]);

  // 3. Debounced Auto-save to LocalStorage and Backend API
  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    const cacheKey = `${questionId}_${selectedLanguage}`;
    codesCache.current[cacheKey] = newCode;
    setSaveStatus("unsaved");

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      setSaveStatus("saving");

      // Save to localStorage
      try {
        if (typeof window !== "undefined") {
          localStorage.setItem(`dsayatra_code_${cacheKey}`, newCode);
        }
      } catch {}

      // Save to API if user is authenticated
      if (userId) {
        try {
          await sendRequest({
            url: `${routes.api.base}${routes.api.dsaCode}`,
            method: "POST",
            body: {
              userId,
              questionId,
              language: selectedLanguage,
              code: newCode,
            },
          });
        } catch (err) {
          console.error("Failed to auto-save code to server:", err);
        }
      }

      setSaveStatus("saved");
    }, 1200);
  };

  // 4. Reset Code to starter template
  const handleResetCode = () => {
    if (
      window.confirm(
        "Are you sure you want to reset your code to the starter template?",
      )
    ) {
      const starter = getStarterCode(
        selectedLanguage,
        question.name,
        question.sections?.working_code,
      );
      handleCodeChange(starter);
    }
  };

  // 5. Test cases management
  const handleUpdateTestCase = (
    id: string | number,
    input: string,
    expectedOutput?: string,
  ) => {
    setTestCases((prev) =>
      prev.map((tc) => (tc.id === id ? { ...tc, input, expectedOutput } : tc)),
    );
  };

  const handleAddTestCase = () => {
    const newId = `custom-${Date.now()}`;
    setTestCases((prev) => [
      ...prev,
      {
        id: newId,
        input: "",
        expectedOutput: "",
        isCustom: true,
      },
    ]);
  };

  const handleRemoveTestCase = (id: string | number) => {
    setTestCases((prev) => prev.filter((tc) => tc.id !== id));
  };

  // 6. Run Code (against current test cases)
  const handleRunCode = async () => {
    if (isRunning || isSubmitting) return;
    setIsRunning(true);
    setActiveBottomTab("results");

    try {
      const response = await sendRequest({
        url: `${routes.api.base}${routes.api.dsaExecute}`,
        method: "POST",
        body: {
          language: selectedLanguage,
          code,
          testCases: testCases.map((tc) => ({
            id: tc.id,
            input: tc.input,
            expectedOutput: tc.expectedOutput,
          })),
          questionId,
          userId,
          isSubmit: false,
        },
      });

      if (response?.status && response?.data) {
        setExecutionResult(response.data);
      } else {
        setExecutionResult({
          status: "EXECUTION_ERROR",
          message: response?.message || "Execution failed",
          totalPassed: 0,
          totalCount: testCases.length,
          results: [],
          runtimeError: response?.message || "Unknown error",
        });
      }
    } catch (err: any) {
      setExecutionResult({
        status: "EXECUTION_ERROR",
        message: err.message || "Failed to execute code",
        totalPassed: 0,
        totalCount: testCases.length,
        results: [],
        runtimeError: err.message || "Network / server error",
      });
    } finally {
      setIsRunning(false);
    }
  };

  // 7. Submit Code (evaluates all test cases, saves code, marks completed if accepted)
  const handleSubmitCode = async () => {
    if (isRunning || isSubmitting) return;
    setIsSubmitting(true);
    setActiveBottomTab("results");

    try {
      const response = await sendRequest({
        url: `${routes.api.base}${routes.api.dsaExecute}`,
        method: "POST",
        body: {
          language: selectedLanguage,
          code,
          testCases: testCases.map((tc) => ({
            id: tc.id,
            input: tc.input,
            expectedOutput: tc.expectedOutput,
          })),
          questionId,
          userId,
          isSubmit: true,
        },
      });

      if (response?.status && response?.data) {
        setExecutionResult(response.data);

        if (response.data.status === "ACCEPTED") {
          onSolved?.();
        }
      } else {
        setExecutionResult({
          status: "EXECUTION_ERROR",
          message: response?.message || "Submission failed",
          totalPassed: 0,
          totalCount: testCases.length,
          results: [],
          runtimeError: response?.message || "Unknown error",
        });
      }
    } catch (err: any) {
      setExecutionResult({
        status: "EXECUTION_ERROR",
        message: err.message || "Failed to submit code",
        totalPassed: 0,
        totalCount: testCases.length,
        results: [],
        runtimeError: err.message || "Submission error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 bg-[#0E0E11] text-white flex flex-col font-sans overflow-hidden ${
        isFullscreen ? "p-0" : "p-1 sm:p-2"
      }`}
    >
      {/* IDE Container */}
      <div className="w-full h-full flex flex-col rounded-xl border border-slate-800/90 bg-[#121216] overflow-hidden shadow-2xl">
        {/* Top Header Bar */}
        <header className="h-12 px-3 sm:px-4 bg-[#16161B] border-b border-slate-800 flex items-center justify-between gap-2 shrink-0 select-none">
          {/* Left: Back/Close + Title */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/70 transition-colors cursor-pointer shrink-0"
              title="Close IDE"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs font-bold text-[#FF4D4D] flex items-center gap-1 shrink-0">
                <Code2 className="w-3.5 h-3.5" />
                Practice IDE
              </span>
              <span className="text-slate-600 hidden sm:inline">|</span>
              <span className="text-xs font-semibold text-slate-200 truncate hidden sm:inline">
                {question.name}
              </span>
            </div>
          </div>

          {/* Center/Right: Language Selector + Save Status + Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Save Status Indicator */}
            <div className="hidden md:flex items-center gap-1 text-[11px] text-slate-400">
              <Cloud className="w-3.5 h-3.5 text-slate-500" />
              <span>
                {saveStatus === "saving"
                  ? "Saving..."
                  : saveStatus === "saved"
                    ? "Saved"
                    : "Unsaved"}
              </span>
              {saveStatus === "saved" && (
                <Check className="w-3 h-3 text-emerald-400" />
              )}
            </div>

            {/* Language Selector Dropdown */}
            <select
              value={selectedLanguage}
              onChange={(e) =>
                setSelectedLanguage(e.target.value as SupportedIdeLanguage)
              }
              className="bg-[#1F1F26] border border-slate-700/80 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-200 focus:outline-none focus:border-[#FF4D4D] transition-colors cursor-pointer"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.name}
                </option>
              ))}
            </select>

            {/* Reset Code Button */}
            <button
              type="button"
              onClick={handleResetCode}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/70 transition-colors cursor-pointer shrink-0"
              title="Reset to starter template"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Run Code Button */}
            <button
              type="button"
              onClick={handleRunCode}
              disabled={isRunning || isSubmitting}
              className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 bg-[#262630] hover:bg-[#32323E] text-slate-200 hover:text-white border border-slate-700/80 transition-all cursor-pointer disabled:opacity-50 shadow-2xs"
            >
              <Play className="w-3 h-3 text-[#FF4D4D] fill-[#FF4D4D]" />
              <span>{isRunning ? "Running..." : "Run"}</span>
            </button>

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleSubmitCode}
              disabled={isRunning || isSubmitting}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 bg-[#FF4D4D] hover:bg-[#EE3126] text-white transition-all cursor-pointer disabled:opacity-50 shadow-2xs"
            >
              <Send className="w-3 h-3" />
              <span>{isSubmitting ? "Submitting..." : "Submit"}</span>
            </button>

            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/70 transition-colors cursor-pointer hidden sm:block shrink-0"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? (
                <Minimize2 className="w-3.5 h-3.5" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5" />
              )}
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/70 transition-colors cursor-pointer shrink-0"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Split Screen Body */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
          {/* Left Panel: Problem Context (40% width on desktop) */}
          <section className="w-full lg:w-[42%] h-1/2 lg:h-full min-h-0 bg-[#0F0F13] flex flex-col overflow-hidden">
            <ProblemDescriptionPanel question={question} />
          </section>

          {/* Right Panel: Code Editor + Test Cases Console (58% width on desktop) */}
          <section className="w-full lg:w-[58%] h-1/2 lg:h-full min-h-0 flex flex-col bg-[#131316] overflow-hidden">
            {/* Editor Area */}
            <div className="flex-1 min-h-[160px] relative">
              <CodeEditor
                language={selectedLanguage}
                value={code}
                onChange={handleCodeChange}
              />
            </div>

            {/* Bottom Drawer: Testcases, Results, Console */}
            <TestCasesPanel
              testCases={testCases}
              onUpdateTestCase={handleUpdateTestCase}
              onAddTestCase={handleAddTestCase}
              onRemoveTestCase={handleRemoveTestCase}
              executionResult={executionResult}
              isRunning={isRunning || isSubmitting}
              activeTab={activeBottomTab}
              onTabChange={setActiveBottomTab}
            />
          </section>
        </div>
      </div>
    </div>
  );
};

