import { Types } from "mongoose";
import type { NextApiRequest, NextApiResponse } from "next";

import {
  addAInterviewSheetToDB,
  appendQuestionsToInterviewSheetInDB,
} from "@/lib/database";
import type {
  AddInterviewSheetRequestPayloadProps,
  InterviewSheetQuestionModel,
} from "@/lib/interfaces";
import { sendAPIResponse } from "@/lib/utils/functions";
import { logger } from "@/lib/utils/logger";
import { withApiHandler } from "@/middleware/requestLogger";

/**
 * API endpoint to upload/publish completed interview sheets from The-Boring-Agents to database
 */
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(405).json(
      sendAPIResponse({
        status: false,
        message: "Method not allowed",
        success: false,
      }),
    );
  }

  try {
    const {
      sessionId,
      sheetId: targetSheetId,
      metadata: frontendMetadata,
      sheetData,
    } = req.body;

    if (!sessionId || !sheetData) {
      return res.status(400).json(
        sendAPIResponse({
          status: false,
          message: "Missing required fields: sessionId and sheetData",
          success: false,
        }),
      );
    }

    const appendToSheetId =
      typeof targetSheetId === "string" && targetSheetId.trim().length > 0
        ? targetSheetId.trim()
        : undefined;

    // Append questions to an existing interview sheet (admin flow; questions only)
    if (appendToSheetId) {
      if (!Array.isArray(sheetData.questions)) {
        return res.status(400).json(
          sendAPIResponse({
            status: false,
            message: "Invalid sheetData: questions must be an array.",
            success: false,
          }),
        );
      }

      if (sheetData.questions.length === 0) {
        return res.status(400).json(
          sendAPIResponse({
            status: false,
            message:
              "Missing required fields for append: non-empty questions array",
            success: false,
          }),
        );
      }

      const { data: updatedSheet, error: appendError } =
        await appendQuestionsToInterviewSheetInDB(
          appendToSheetId,
          sheetData.questions,
        );

      if (appendError) {
        const errMsg =
          typeof appendError === "string" ? appendError : String(appendError);
        const clientError =
          errMsg === "Interview sheet not found" ||
          errMsg === "Invalid interview sheet id" ||
          errMsg === "Questions must be a non-empty array";
        logger.error("Interview sheet append failed", {
          appendToSheetId,
          error: errMsg,
        });
        return res.status(clientError ? 400 : 500).json(
          sendAPIResponse({
            status: false,
            message: clientError
              ? errMsg
              : "Failed to append questions to interview sheet",
            success: false,
            ...(clientError ? {} : { error: appendError }),
          }),
        );
      }

      return res.status(200).json(
        sendAPIResponse({
          status: true,
          message: `Successfully appended ${sheetData.questions.length} questions to interview sheet`,
          data: updatedSheet,
          success: true,
        }),
      );
    }

    // Create new sheet: require name + questions array
    if (!sheetData.name || !Array.isArray(sheetData.questions)) {
      return res.status(400).json(
        sendAPIResponse({
          status: false,
          message:
            "Invalid session data structure. Missing core properties or questions array.",
          success: false,
        }),
      );
    }

    const {
      questions: rawQuestions,
      name,
      slug,
      description,
      meta,
      coverImageURL,
      roadmap,
      isPremium,
      price,
      discountPercentage,
      appliedCoupon,
      features,
    } = sheetData;

    const metadataOverrides = frontendMetadata || {};

    // Map questions with fresh ObjectIds
    const questions: InterviewSheetQuestionModel[] = rawQuestions.map(
      (questionItem: any) => ({
        _id: new Types.ObjectId(),
        title: questionItem.title,
        question: questionItem.question,
        answer: questionItem.answer,
        frequency: questionItem.frequency,
        priority: questionItem.priority,
        companyTypes: questionItem.companyTypes,
        resources: questionItem.resources,
      }),
    ) as InterviewSheetQuestionModel[];

    // Construct final payload with metadata overrides
    const interviewSheetPayload: AddInterviewSheetRequestPayloadProps = {
      name: metadataOverrides.name || name,
      slug: metadataOverrides.slug || slug,
      description: metadataOverrides.description || description,
      meta: metadataOverrides.meta || meta,
      coverImageURL: metadataOverrides.coverImageURL || coverImageURL,
      liveOn: metadataOverrides.liveOn
        ? new Date(metadataOverrides.liveOn).toISOString()
        : new Date().toISOString(),
      roadmap: metadataOverrides.roadmap || roadmap,
      isPremium:
        metadataOverrides.isPremium !== undefined
          ? metadataOverrides.isPremium
          : isPremium,
      price:
        metadataOverrides.price !== undefined ? metadataOverrides.price : price,
      discountPercentage:
        metadataOverrides.discountPercentage !== undefined
          ? metadataOverrides.discountPercentage
          : discountPercentage,
      appliedCoupon:
        metadataOverrides.appliedCoupon !== undefined
          ? metadataOverrides.appliedCoupon
          : appliedCoupon,
      features: metadataOverrides.features || features,
      questions,
    };

    // 3. Save to DB
    const { data: savedSheet, error } = await addAInterviewSheetToDB(
      interviewSheetPayload,
    );

    if (error) {
      logger.error("DB Save Error", {
        error: error instanceof Error ? error.message : String(error),
      });
      return res.status(500).json(
        sendAPIResponse({
          status: false,
          message: "Failed to save to database",
          error,
          success: false,
        }),
      );
    }

    return res.status(200).json(
      sendAPIResponse({
        status: true,
        message: "Imported successfully",
        data: savedSheet,
        success: true,
      }),
    );
  } catch (error: any) {
    logger.error("Upload handler error", {
      error: error instanceof Error ? error.message : String(error),
    });
    return res.status(500).json(
      sendAPIResponse({
        status: false,
        message: "Internal server error",
        error: error.message,
        success: false,
      }),
    );
  }
};

export default withApiHandler(handler);
