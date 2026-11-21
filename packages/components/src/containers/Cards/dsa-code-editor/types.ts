export type SupportedLanguage = "python" | "java" | "cpp" | "javascript";

export interface TestCase {
  id: string;
  label: string;
  input: string;
  expectedOutput: string;
  explanation?: string;
  isCustom?: boolean;
}

export interface TestCaseResult {
  testCaseId: string;
  passed: boolean;
  actualOutput: string;
  expectedOutput: string;
  error?: string;
  executionTimeMs?: number;
}

export interface ExecutionResult {
  success: boolean;
  totalCases: number;
  passedCases: number;
  results: TestCaseResult[];
  rawStdout?: string;
  rawStderr?: string;
  runtimeMs?: number;
  source: "piston" | "simulation";
}

export interface CodeEditorProps {
  questionName: string;
  questionId?: string | number;
  initialCode?: Partial<Record<SupportedLanguage, string>>;
  testCases?: TestCase[];
  onClose?: () => void;
  onSolveSuccess?: () => void;
  isAlreadySolved?: boolean;
}
