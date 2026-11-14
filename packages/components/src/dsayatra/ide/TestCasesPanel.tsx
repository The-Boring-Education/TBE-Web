import React, { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Terminal,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export interface EditableTestCase {
  id: string | number;
  input: string;
  expectedOutput?: string;
  isCustom?: boolean;
}

export interface ExecutionResultData {
  status:
    | "ACCEPTED"
    | "WRONG_ANSWER"
    | "COMPILATION_ERROR"
    | "RUNTIME_ERROR"
    | "TIME_LIMIT_EXCEEDED"
    | "EXECUTION_ERROR";
  message: string;
  totalPassed: number;
  totalCount: number;
  results: Array<{
    id: string | number;
    input: string;
    expectedOutput?: string;
    actualOutput: string;
    passed: boolean;
    executionTimeMs: number;
    error?: string;
    stdout?: string;
    stderr?: string;
  }>;
  compileError?: string;
  runtimeError?: string;
}

interface TestCasesPanelProps {
  testCases: EditableTestCase[];
  onUpdateTestCase: (id: string | number, input: string, expectedOutput?: string) => void;
  onAddTestCase: () => void;
  onRemoveTestCase: (id: string | number) => void;
  executionResult: ExecutionResultData | null;
  isRunning: boolean;
  activeTab: "testcases" | "results" | "console";
  onTabChange: (tab: "testcases" | "results" | "console") => void;
}

export const TestCasesPanel: React.FC<TestCasesPanelProps> = ({
  testCases,
  onUpdateTestCase,
  onAddTestCase,
  onRemoveTestCase,
  executionResult,
  isRunning,
  activeTab,
  onTabChange,
}) => {
  const [selectedCaseIdx, setSelectedCaseIdx] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const currentCase = testCases[selectedCaseIdx] || testCases[0];
  const currentResult = executionResult?.results?.[selectedCaseIdx];

  const getStatusBadge = (status?: ExecutionResultData["status"]) => {
    switch (status) {
      case "ACCEPTED":
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-800/80">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Accepted
          </span>
        );
      case "WRONG_ANSWER":
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-950/60 text-rose-400 border border-rose-800/80">
            <XCircle className="w-3.5 h-3.5 text-rose-400" />
            Wrong Answer
          </span>
        );
      case "TIME_LIMIT_EXCEEDED":
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-950/60 text-amber-400 border border-amber-800/80">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            Time Limit Exceeded
          </span>
        );
      case "COMPILATION_ERROR":
      case "RUNTIME_ERROR":
      case "EXECUTION_ERROR":
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-950/60 text-red-400 border border-red-800/80">
            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            {status === "COMPILATION_ERROR" ? "Compilation Error" : "Runtime Error"}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full flex flex-col bg-[#111114] border-t border-slate-800 select-text">
      {/* Tab Header Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#141418] border-b border-slate-800/80 text-xs">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              onTabChange("testcases");
              setIsCollapsed(false);
            }}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeTab === "testcases"
                ? "bg-[#1E1E24] text-white shadow-2xs"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Test Cases
          </button>

          <button
            type="button"
            onClick={() => {
              onTabChange("results");
              setIsCollapsed(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeTab === "results"
                ? "bg-[#1E1E24] text-white shadow-2xs"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <span>Test Results</span>
            {executionResult && (
              <span
                className={`w-2 h-2 rounded-full ${
                  executionResult.status === "ACCEPTED" ? "bg-emerald-400" : "bg-rose-400"
                }`}
              />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              onTabChange("console");
              setIsCollapsed(false);
            }}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeTab === "console"
                ? "bg-[#1E1E24] text-white shadow-2xs"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Terminal className="w-3 h-3 text-slate-400" />
            <span>Console</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {executionResult && !isCollapsed && getStatusBadge(executionResult.status)}

          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title={isCollapsed ? "Expand panel" : "Collapse panel"}
          >
            {isCollapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {!isCollapsed && (
        <div className="h-60 sm:h-64 overflow-y-auto p-3 text-xs text-slate-200 font-sans">
          {isRunning ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-400">
              <div className="w-6 h-6 border-2 border-[#FF4D4D] border-t-transparent rounded-full animate-spin" />
              <span className="font-mono text-xs">Running code against test cases...</span>
            </div>
          ) : activeTab === "testcases" ? (
            /* Testcases Tab */
            <div className="space-y-3">
              {/* Testcase selector tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {testCases.map((tc, idx) => (
                  <button
                    key={tc.id}
                    type="button"
                    onClick={() => setSelectedCaseIdx(idx)}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer shrink-0 ${
                      selectedCaseIdx === idx
                        ? "bg-[#25252D] text-white border border-slate-700"
                        : "bg-[#18181D] text-slate-400 hover:text-slate-200 border border-transparent"
                    }`}
                  >
                    Case {idx + 1}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={onAddTestCase}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold text-slate-400 hover:text-white bg-[#18181D] hover:bg-[#202026] border border-dashed border-slate-700 transition-colors cursor-pointer shrink-0"
                  title="Add Custom Test Case"
                >
                  <Plus className="w-3 h-3" />
                  <span>Custom</span>
                </button>
              </div>

              {currentCase && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                      <span>Input:</span>
                      {currentCase.isCustom && (
                        <button
                          type="button"
                          onClick={() => onRemoveTestCase(currentCase.id)}
                          className="flex items-center gap-1 text-[10px] text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      )}
                    </div>
                    <textarea
                      value={currentCase.input}
                      onChange={(e) =>
                        onUpdateTestCase(currentCase.id, e.target.value, currentCase.expectedOutput)
                      }
                      rows={3}
                      className="w-full bg-[#16161A] border border-slate-800 rounded-lg p-2 font-mono text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-[#FF4D4D] transition-colors resize-none"
                      placeholder="Enter testcase input..."
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="text-[11px] font-bold text-slate-400">Expected Output:</div>
                    <textarea
                      value={currentCase.expectedOutput || ""}
                      onChange={(e) =>
                        onUpdateTestCase(currentCase.id, currentCase.input, e.target.value)
                      }
                      rows={2}
                      className="w-full bg-[#16161A] border border-slate-800 rounded-lg p-2 font-mono text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-[#FF4D4D] transition-colors resize-none"
                      placeholder="Expected output (optional)..."
                    />
                  </div>
                </div>
              )}
            </div>
          ) : activeTab === "results" ? (
            /* Results Tab */
            !executionResult ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-1">
                <p>No execution results yet.</p>
                <p className="text-[11px]">Click "Run Code" or "Submit" to test your solution.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Result Summary Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg bg-[#18181D] border border-slate-800">
                  <div className="flex items-center gap-2">
                    {getStatusBadge(executionResult.status)}
                    <span className="text-xs text-slate-300 font-medium">
                      {executionResult.message}
                    </span>
                  </div>

                  <div className="text-[11px] font-mono text-slate-400">
                    Passed:{" "}
                    <span
                      className={
                        executionResult.totalPassed === executionResult.totalCount
                          ? "text-emerald-400 font-bold"
                          : "text-rose-400 font-bold"
                      }
                    >
                      {executionResult.totalPassed} / {executionResult.totalCount}
                    </span>
                  </div>
                </div>

                {/* Compilation / Runtime error block if any */}
                {(executionResult.compileError || executionResult.runtimeError) && (
                  <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-900/60 text-xs font-mono text-rose-300 whitespace-pre-wrap">
                    <div className="font-bold mb-1 text-rose-400">Error Output:</div>
                    {executionResult.compileError || executionResult.runtimeError}
                  </div>
                )}

                {/* Per-testcase tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {executionResult.results.map((res, idx) => (
                    <button
                      key={res.id}
                      type="button"
                      onClick={() => setSelectedCaseIdx(idx)}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer shrink-0 ${
                        selectedCaseIdx === idx
                          ? "bg-[#25252D] text-white border border-slate-700"
                          : "bg-[#18181D] text-slate-400 hover:text-slate-200 border border-transparent"
                      }`}
                    >
                      {res.passed ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-rose-400" />
                      )}
                      <span>Case {idx + 1}</span>
                    </button>
                  ))}
                </div>

                {/* Detailed view of selected result */}
                {currentResult && (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>
                        Status:{" "}
                        <strong
                          className={currentResult.passed ? "text-emerald-400" : "text-rose-400"}
                        >
                          {currentResult.passed ? "Passed" : "Failed"}
                        </strong>
                      </span>
                      <span>Execution Time: {currentResult.executionTimeMs} ms</span>
                    </div>

                    <div className="space-y-1">
                      <div className="text-[11px] font-bold text-slate-400">Input:</div>
                      <pre className="bg-[#16161A] border border-slate-800 rounded-lg p-2 font-mono text-xs text-slate-200 whitespace-pre-wrap">
                        {currentResult.input || "(empty)"}
                      </pre>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <div className="text-[11px] font-bold text-slate-400">Your Output:</div>
                        <pre
                          className={`bg-[#16161A] border rounded-lg p-2 font-mono text-xs whitespace-pre-wrap ${
                            currentResult.passed
                              ? "border-slate-800 text-emerald-300"
                              : "border-rose-900/60 text-rose-300"
                          }`}
                        >
                          {currentResult.actualOutput || "(no output)"}
                        </pre>
                      </div>

                      {currentResult.expectedOutput !== undefined && (
                        <div className="space-y-1">
                          <div className="text-[11px] font-bold text-slate-400">Expected Output:</div>
                          <pre className="bg-[#16161A] border border-slate-800 rounded-lg p-2 font-mono text-xs text-amber-300 whitespace-pre-wrap">
                            {currentResult.expectedOutput || "(empty)"}
                          </pre>
                        </div>
                      )}
                    </div>

                    {currentResult.stderr && (
                      <div className="space-y-1">
                        <div className="text-[11px] font-bold text-rose-400">Standard Error:</div>
                        <pre className="bg-rose-950/20 border border-rose-900/40 rounded-lg p-2 font-mono text-xs text-rose-300 whitespace-pre-wrap">
                          {currentResult.stderr}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          ) : (
            /* Console Tab */
            <div className="h-full space-y-2 font-mono text-xs">
              <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
                Standard Output & Execution Logs:
              </div>
              <pre className="w-full h-44 bg-[#16161A] border border-slate-800 rounded-lg p-3 text-slate-300 overflow-y-auto whitespace-pre-wrap">
                {executionResult?.results
                  ?.map((r, i) => `[Case ${i + 1}] Output:\n${r.stdout || "(none)"}\n${r.stderr ? `Error:\n${r.stderr}\n` : ""}`)
                  .join("\n---\n") || "No console output yet. Run your code to view logs."}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

