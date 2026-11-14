import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import axios from "axios";

export type SupportedLanguage = "javascript" | "python" | "java" | "cpp";

export interface TestCaseInput {
  id?: string | number;
  input: string;
  expectedOutput?: string;
  isSample?: boolean;
}

export interface SingleTestResult {
  id: string | number;
  input: string;
  expectedOutput?: string;
  actualOutput: string;
  passed: boolean;
  executionTimeMs: number;
  error?: string;
  stdout?: string;
  stderr?: string;
}

export interface ExecutionResponse {
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
  results: SingleTestResult[];
  compileError?: string;
  runtimeError?: string;
}

const EXECUTION_TIMEOUT_MS = 5000;

function normalizeOutput(output: string): string {
  return (output || "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .trim();
}

/**
 * Execute using remote runner (Piston or Judge0 compatible) if configured
 */
async function executeViaRemoteRunner(
  runnerUrl: string,
  language: SupportedLanguage,
  code: string,
  stdin: string,
): Promise<{ stdout: string; stderr: string; timeMs: number; error?: string }> {
  const start = Date.now();
  const apiKey = process.env.CODE_RUNNER_KEY || process.env.PISTON_API_KEY;

  // Language mapping for Piston
  const pistonLangMap: Record<SupportedLanguage, { language: string; version: string; file: string }> = {
    javascript: { language: "javascript", version: "*", file: "index.js" },
    python: { language: "python", version: "*", file: "main.py" },
    java: { language: "java", version: "*", file: "Main.java" },
    cpp: { language: "c++", version: "*", file: "main.cpp" },
  };

  const langConfig = pistonLangMap[language] || { language, version: "*", file: "main" };

  try {
    const response = await axios.post(
      runnerUrl,
      {
        language: langConfig.language,
        version: langConfig.version,
        files: [{ name: langConfig.file, content: code }],
        stdin,
        run_timeout: EXECUTION_TIMEOUT_MS,
        compile_timeout: 10000,
      },
      {
        headers: {
          "Content-Type": "application/json",
          ...(apiKey ? { Authorization: apiKey, "X-Api-Key": apiKey } : {}),
        },
        timeout: EXECUTION_TIMEOUT_MS + 7000,
      },
    );

    const timeMs = Date.now() - start;
    const data = response.data;

    // Handle Piston response format
    if (data.run) {
      const compileErr = data.compile?.stderr || data.compile?.output || "";
      if (data.compile && data.compile.code !== 0 && compileErr) {
        return { stdout: "", stderr: compileErr, timeMs, error: compileErr };
      }
      return {
        stdout: data.run.stdout || data.run.output || "",
        stderr: data.run.stderr || "",
        timeMs,
        error: data.run.code !== 0 ? data.run.stderr || "Runtime error" : undefined,
      };
    }

    // Handle Judge0 format
    if (data.stdout !== undefined || data.stderr !== undefined || data.compile_output !== undefined) {
      const compileErr = data.compile_output || "";
      if (compileErr) {
        return { stdout: "", stderr: compileErr, timeMs, error: compileErr };
      }
      return {
        stdout: data.stdout || "",
        stderr: data.stderr || "",
        timeMs,
        error: data.status?.description && data.status?.id > 3 ? data.status.description : undefined,
      };
    }

    return {
      stdout: String(data.stdout || data.output || ""),
      stderr: String(data.stderr || ""),
      timeMs,
    };
  } catch (err: any) {
    const timeMs = Date.now() - start;
    const msg = err.response?.data?.message || err.message || "Failed to reach code execution service";
    return {
      stdout: "",
      stderr: msg,
      timeMs,
      error: msg,
    };
  }
}

/**
 * Execute locally via child_process with timeout and memory constraints
 */
async function executeLocally(
  language: SupportedLanguage,
  code: string,
  stdin: string,
): Promise<{ stdout: string; stderr: string; timeMs: number; error?: string }> {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "tbe-exec-"));
  const start = Date.now();

  try {
    if (language === "javascript") {
      const scriptPath = path.join(tmpDir, "solution.js");
      await fs.writeFile(scriptPath, code, "utf-8");

      return await runProcess("node", ["--max-old-space-size=128", scriptPath], stdin, tmpDir);
    }

    if (language === "python") {
      const scriptPath = path.join(tmpDir, "solution.py");
      await fs.writeFile(scriptPath, code, "utf-8");

      // Check python executable
      const pythonCmd = process.platform === "win32" ? "python" : "python3";
      return await runProcess(pythonCmd, ["-u", scriptPath], stdin, tmpDir);
    }

    if (language === "java") {
      const javaFile = path.join(tmpDir, "Main.java");
      await fs.writeFile(javaFile, code, "utf-8");

      // Compile
      const compileRes = await runProcess("javac", [javaFile], "", tmpDir, 10000);
      if (compileRes.error || compileRes.stderr) {
        return {
          stdout: "",
          stderr: compileRes.stderr,
          timeMs: Date.now() - start,
          error: compileRes.stderr || "Compilation failed",
        };
      }

      // Run
      return await runProcess("java", ["-Xmx128m", "-cp", tmpDir, "Main"], stdin, tmpDir);
    }

    if (language === "cpp") {
      const cppFile = path.join(tmpDir, "solution.cpp");
      const exeFile = path.join(tmpDir, process.platform === "win32" ? "solution.exe" : "solution.out");
      await fs.writeFile(cppFile, code, "utf-8");

      // Compile
      const compileRes = await runProcess("g++", ["-O2", cppFile, "-o", exeFile], "", tmpDir, 10000);
      if (compileRes.error || compileRes.stderr) {
        return {
          stdout: "",
          stderr: compileRes.stderr,
          timeMs: Date.now() - start,
          error: compileRes.stderr || "Compilation failed",
        };
      }

      // Run
      return await runProcess(exeFile, [], stdin, tmpDir);
    }

    return {
      stdout: "",
      stderr: `Language "${language}" is not supported locally. Please configure CODE_RUNNER_URL.`,
      timeMs: 0,
      error: `Unsupported language: ${language}`,
    };
  } finally {
    // Clean up temporary directory
    try {
      await fs.rm(tmpDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup error
    }
  }
}

function runProcess(
  cmd: string,
  args: string[],
  stdin: string,
  cwd: string,
  timeoutMs: number = EXECUTION_TIMEOUT_MS,
): Promise<{ stdout: string; stderr: string; timeMs: number; error?: string }> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    let stdout = "";
    let stderr = "";
    let killed = false;

    let child: any;
    try {
      child = spawn(cmd, args, {
        cwd,
        windowsHide: true,
        env: {
          ...process.env,
          NODE_ENV: "production",
          PYTHONDONTWRITEBYTECODE: "1",
        },
      });
    } catch (err: any) {
      return resolve({
        stdout: "",
        stderr: err.message,
        timeMs: Date.now() - startTime,
        error: `Failed to spawn ${cmd}: ${err.message}`,
      });
    }

    const timer = setTimeout(() => {
      killed = true;
      try {
        child.kill("SIGKILL");
      } catch {}
      resolve({
        stdout,
        stderr: stderr || "Time Limit Exceeded (execution exceeded limit)",
        timeMs: timeoutMs,
        error: "Time Limit Exceeded",
      });
    }, timeoutMs);

    child.stdout.on("data", (data: Buffer) => {
      stdout += data.toString();
      if (stdout.length > 500000) {
        // 500KB output limit
        try {
          child.kill();
        } catch {}
      }
    });

    child.stderr.on("data", (data: Buffer) => {
      stderr += data.toString();
    });

    child.on("error", (err: Error) => {
      clearTimeout(timer);
      if (!killed) {
        resolve({
          stdout,
          stderr: err.message,
          timeMs: Date.now() - startTime,
          error: err.message,
        });
      }
    });

    child.on("close", (code: number | null) => {
      clearTimeout(timer);
      if (!killed) {
        const timeMs = Date.now() - startTime;
        if (code !== 0 && code !== null && !stderr) {
          stderr = `Process exited with code ${code}`;
        }
        resolve({
          stdout,
          stderr,
          timeMs,
          error: code !== 0 && code !== null ? stderr || `Process failed with code ${code}` : undefined,
        });
      }
    });

    if (stdin) {
      try {
        child.stdin.write(stdin);
        child.stdin.end();
      } catch {
        // In case stdin write fails
      }
    } else {
      try {
        child.stdin.end();
      } catch {}
    }
  });
}

/**
 * Main execution handler: runs code against provided test cases
 */
export async function executeCodeAgainstTestCases(
  language: SupportedLanguage,
  code: string,
  testCases: TestCaseInput[],
): Promise<ExecutionResponse> {
  const runnerUrl = process.env.CODE_RUNNER_URL || process.env.PISTON_API_URL;
  const results: SingleTestResult[] = [];
  let compileError: string | undefined;
  let runtimeError: string | undefined;
  let hasTimeout = false;

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i]!;
    const testId = tc.id ?? i + 1;
    const input = tc.input || "";
    const expected = tc.expectedOutput !== undefined ? normalizeOutput(tc.expectedOutput) : undefined;

    let execResult: { stdout: string; stderr: string; timeMs: number; error?: string };

    if (runnerUrl) {
      execResult = await executeViaRemoteRunner(runnerUrl, language, code, input);
    } else {
      execResult = await executeLocally(language, code, input);
    }

    const actual = normalizeOutput(execResult.stdout);
    const hasError = Boolean(execResult.error || execResult.stderr);

    if (execResult.error?.includes("Time Limit Exceeded")) {
      hasTimeout = true;
    } else if (execResult.error?.toLowerCase().includes("compilation") || execResult.stderr?.toLowerCase().includes("error:")) {
      compileError = execResult.stderr || execResult.error;
    } else if (hasError && !runtimeError) {
      runtimeError = execResult.stderr || execResult.error;
    }

    const passed = !hasError && (expected === undefined || actual === expected);

    results.push({
      id: testId,
      input,
      expectedOutput: tc.expectedOutput,
      actualOutput: actual,
      passed,
      executionTimeMs: execResult.timeMs,
      error: execResult.error,
      stdout: execResult.stdout,
      stderr: execResult.stderr,
    });
  }

  const totalPassed = results.filter((r) => r.passed).length;
  const totalCount = results.length;

  let status: ExecutionResponse["status"] = "ACCEPTED";
  let message = "All test cases passed!";

  if (compileError) {
    status = "COMPILATION_ERROR";
    message = "Compilation failed. Check the error log.";
  } else if (hasTimeout) {
    status = "TIME_LIMIT_EXCEEDED";
    message = "Time limit exceeded.";
  } else if (runtimeError && totalPassed === 0) {
    status = "RUNTIME_ERROR";
    message = "Runtime error encountered during execution.";
  } else if (totalPassed < totalCount) {
    status = "WRONG_ANSWER";
    message = `${totalPassed}/${totalCount} test cases passed.`;
  }

  return {
    status,
    message,
    totalPassed,
    totalCount,
    results,
    compileError,
    runtimeError,
  };
}

