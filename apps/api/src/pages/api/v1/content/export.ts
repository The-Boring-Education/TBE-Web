import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import {
  exportAptitudeTopicsFromDB,
  exportDSAQuestionsFromDB,
  exportInterviewSheetsFromDB,
  exportQuizzesFromDB,
} from "@/lib/database";
import { sendAPIResponse } from "@/lib/utils";
import { withApiHandler } from "@/middleware/requestLogger";

/**
 * GET /api/v1/content/export
 *
 * Admin-only endpoint to export content from the database.
 * Used by the migration system to pull content from one environment.
 *
 * Query params:
 *   type: "dsa-questions" | "interview-sheets" | "aptitude" | "quizzes" | "all"
 *   topics: comma-separated topic slugs (for DSA/aptitude filtering)
 *   slugs: comma-separated sheet slugs (for interview sheet filtering)
 *   roadmap: roadmap filter (for interview sheets)
 *   domain: comma-separated domains (for DSA filtering)
 *   difficulty: comma-separated difficulties (for DSA filtering)
 *   categoryNames: comma-separated quiz category names
 */
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    return res.status(apiStatusCodes.METHOD_NOT_ALLOWED).json(
      sendAPIResponse({
        status: false,
        message: `Method ${req.method} Not Allowed`,
      }),
    );
  }

  const adminSecret = req.headers["x-admin-secret"];
  if (adminSecret !== process.env.ADMIN_SECRET) {
    return res
      .status(apiStatusCodes.UNAUTHORIZED)
      .json(sendAPIResponse({ status: false, message: "Unauthorized" }));
  }

  const { type, topics, slugs, roadmap, domain, difficulty, categoryNames } =
    req.query;

  const toArray = (val: any): string[] | undefined =>
    val
      ? typeof val === "string"
        ? val.split(",").map((s: string) => s.trim())
        : val
      : undefined;

  const contentType = type as string;
  const result: any = {};

  try {
    if (contentType === "dsa-questions" || contentType === "all") {
      const { data, error } = await exportDSAQuestionsFromDB({
        topics: toArray(topics),
        domain: toArray(domain),
        difficulty: toArray(difficulty),
      });
      if (error)
        return res.status(500).json(sendAPIResponse({ status: false, error }));
      result.dsaQuestions = data;
    }

    if (contentType === "interview-sheets" || contentType === "all") {
      const { data, error } = await exportInterviewSheetsFromDB({
        slugs: toArray(slugs),
        roadmap: roadmap as string,
      });
      if (error)
        return res.status(500).json(sendAPIResponse({ status: false, error }));
      result.interviewSheets = data;
    }

    if (contentType === "aptitude" || contentType === "all") {
      const { data, error } = await exportAptitudeTopicsFromDB({
        topics: toArray(topics),
      });
      if (error)
        return res.status(500).json(sendAPIResponse({ status: false, error }));
      result.aptitude = data;
    }

    if (contentType === "quizzes" || contentType === "all") {
      const { data, error } = await exportQuizzesFromDB({
        categoryNames: toArray(categoryNames),
      });
      if (error)
        return res.status(500).json(sendAPIResponse({ status: false, error }));
      result.quizzes = data;
    }

    if (!contentType) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message:
            "Required: type (dsa-questions | interview-sheets | aptitude | quizzes | all)",
        }),
      );
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        data: result,
        message: "Content exported successfully",
      }),
    );
  } catch (error: any) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Export failed",
        error: error.message,
      }),
    );
  }
};

export default withApiHandler(handler);
