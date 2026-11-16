import type { NextApiRequest, NextApiResponse } from "next";

import {
  executeCodeAgainstTestCases,
  type SupportedLanguage,
  type TestCaseInput,
} from "@/lib/codeExecution/executor";
import { apiStatusCodes } from "@/lib/constants";
import { syncDSAQuestionsProgress } from "@/lib/database";
import { sendAPIResponse } from "@/lib/utils";
import { withApiHandler } from "@/middleware/requestLogger";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: false,
        message: `Method ${req.method} Not Allowed`,
      }),
    );
  }

  const {
    language,
    code,
    testCases,
    questionId,
    userId,
    isSubmit = false,
  }: {
    language: SupportedLanguage;
    code: string;
    testCases: TestCaseInput[];
    questionId?: string;
    userId?: string;
    isSubmit?: boolean;
  } = req.body;

  if (!language || !code) {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: false,
        message: "Required parameters: language, code",
      }),
    );
  }

  const validLanguages: SupportedLanguage[] = [
    "javascript",
    "python",
    "java",
    "cpp",
  ];
  if (!validLanguages.includes(language)) {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: false,
        message: `Unsupported language "${language}". Supported: ${validLanguages.join(", ")}`,
      }),
    );
  }

  const casesToRun: TestCaseInput[] =
    Array.isArray(testCases) && testCases.length > 0
      ? testCases
      : [{ id: 1, input: "", expectedOutput: "" }];

  try {
    const executionResult = await executeCodeAgainstTestCases(
      language,
      code,
      casesToRun,
    );

    // If submit is successful and user is authenticated, mark question as solved
    let progressUpdated = false;
    if (isSubmit && executionResult.status === "ACCEPTED" && userId && questionId) {
      try {
        await syncDSAQuestionsProgress(userId, [
          { questionId, isCompleted: true },
        ]);
        progressUpdated = true;
      } catch (err) {
        // Log but don't fail execution output
        console.error("Failed to auto-mark question completed:", err);
      }
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        data: {
          ...executionResult,
          progressUpdated,
        },
        message: executionResult.message,
      }),
    );
  } catch (error: any) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Code execution failed",
        error: error instanceof Error ? error.message : String(error),
      }),
    );
  }
};

export default withApiHandler(handler);

