import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import {
  bulkUploadAptitudeDataToDB,
  syncDSAQuestionsToDB,
  syncInterviewSheetsToDB,
  syncQuizzesToDB,
} from "@/lib/database";
import { sendAPIResponse } from "@/lib/utils";
import { logger } from "@/lib/utils/logger";
import { withApiHandler } from "@/middleware/requestLogger";

/**
 * POST /api/v1/content/sync
 *
 * Admin-only endpoint to sync (upsert) content into the database.
 * Used by the migration system to push content from one environment to another.
 *
 * All operations are merge-based:
 * - Existing items are updated (matched by natural key: title, slug, categoryName, topic)
 * - New items are added
 * - Nothing is deleted
 * - _ids are preserved for existing items
 *
 * Body:
 * {
 *   type: "dsa-questions" | "interview-sheets" | "aptitude" | "quizzes",
 *   dryRun?: boolean,
 *   data: {
 *     questions?: [...],      // for dsa-questions
 *     sheets?: [...],         // for interview-sheets
 *     topics?: [...],         // for aptitude (each: { topic, questions })
 *     quizzes?: [...]         // for quizzes
 *   }
 * }
 */
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
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

  const { type, dryRun, data } = req.body;

  if (!type || !data) {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: false,
        message: "Required: type and data",
      }),
    );
  }

  if (dryRun) {
    return handleDryRun(res, type, data);
  }

  try {
    let result;

    switch (type) {
      case "dsa-questions": {
        if (!data.questions?.length) {
          return res.status(apiStatusCodes.BAD_REQUEST).json(
            sendAPIResponse({
              status: false,
              message: "data.questions array is required",
            }),
          );
        }
        const { data: syncResult, error } = await syncDSAQuestionsToDB(
          data.questions,
        );
        if (error)
          return res
            .status(apiStatusCodes.INTERNAL_SERVER_ERROR)
            .json(sendAPIResponse({ status: false, error }));
        result = syncResult;
        break;
      }

      case "interview-sheets": {
        if (!data.sheets?.length) {
          return res.status(apiStatusCodes.BAD_REQUEST).json(
            sendAPIResponse({
              status: false,
              message: "data.sheets array is required",
            }),
          );
        }
        const { data: syncResult, error } = await syncInterviewSheetsToDB(
          data.sheets,
        );
        if (error)
          return res
            .status(apiStatusCodes.INTERNAL_SERVER_ERROR)
            .json(sendAPIResponse({ status: false, error }));
        result = syncResult;
        break;
      }

      case "aptitude": {
        if (!data.topics?.length) {
          return res.status(apiStatusCodes.BAD_REQUEST).json(
            sendAPIResponse({
              status: false,
              message:
                "data.topics array is required (each: { topic, questions })",
            }),
          );
        }

        const topicResults = [];
        for (const topicPayload of data.topics) {
          const { data: topicResult, error } =
            await bulkUploadAptitudeDataToDB(topicPayload);
          if (error) {
            topicResults.push({ topic: topicPayload.topic, error });
          } else {
            topicResults.push({ topic: topicPayload.topic, ...topicResult });
          }
        }
        result = { topics: topicResults };
        break;
      }

      case "quizzes": {
        if (!data.quizzes?.length) {
          return res.status(apiStatusCodes.BAD_REQUEST).json(
            sendAPIResponse({
              status: false,
              message: "data.quizzes array is required",
            }),
          );
        }
        const { data: syncResult, error } = await syncQuizzesToDB(data.quizzes);
        if (error)
          return res
            .status(apiStatusCodes.INTERNAL_SERVER_ERROR)
            .json(sendAPIResponse({ status: false, error }));
        result = syncResult;
        break;
      }

      default:
        return res.status(apiStatusCodes.BAD_REQUEST).json(
          sendAPIResponse({
            status: false,
            message:
              "Invalid type. Must be: dsa-questions | interview-sheets | aptitude | quizzes",
          }),
        );
    }

    logger.info("Content sync completed", { type, result });

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        data: result,
        message: `Content sync for "${type}" completed`,
      }),
    );
  } catch (error: any) {
    logger.error("Content sync failed", { type, error: error.message });
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Sync failed",
        error: error.message,
      }),
    );
  }
};

function handleDryRun(res: NextApiResponse, type: string, data: any) {
  const summary: any = { type, dryRun: true };

  switch (type) {
    case "dsa-questions":
      summary.questionsToSync = data.questions?.length || 0;
      summary.sampleTitles = (data.questions || [])
        .slice(0, 5)
        .map((q: any) => q.title);
      break;
    case "interview-sheets":
      summary.sheetsToSync = data.sheets?.length || 0;
      summary.sampleSlugs = (data.sheets || [])
        .slice(0, 5)
        .map((s: any) => s.slug);
      break;
    case "aptitude":
      summary.topicsToSync = data.topics?.length || 0;
      summary.topicDetails = (data.topics || []).map((t: any) => ({
        topic: t.topic,
        questionCount: t.questions?.length || 0,
      }));
      break;
    case "quizzes":
      summary.quizzesToSync = data.quizzes?.length || 0;
      summary.sampleCategories = (data.quizzes || [])
        .slice(0, 5)
        .map((q: any) => q.categoryName);
      break;
    default:
      return res
        .status(apiStatusCodes.BAD_REQUEST)
        .json(sendAPIResponse({ status: false, message: "Invalid type" }));
  }

  return res.status(apiStatusCodes.OKAY).json(
    sendAPIResponse({
      status: true,
      data: summary,
      message: "Dry run — no changes made",
    }),
  );
}

export default withApiHandler(handler);
