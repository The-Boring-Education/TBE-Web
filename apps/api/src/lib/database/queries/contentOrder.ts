import type { ContentOrderRequest } from "@tbe/types";
import { Types } from "mongoose";

import { apiStatusCodes } from "@/lib/constants";
import { logger } from "@/lib/utils/logger";
import { captureDatabaseError } from "@/lib/utils/sentry";
import {
  contentOrderSchema,
  contentOrderValidationMessage,
} from "@/lib/validation/contentOrder";

import { Course, InterviewSheet, Project } from "../models";

type ContentOrderResult =
  | { data: { orderedIds: string[] }; error?: never; statusCode?: never }
  | { data?: never; error: string; statusCode: number };

export const reorderContentInDB = async (
  payload: ContentOrderRequest,
): Promise<ContentOrderResult> => {
  const validation = contentOrderSchema.safeParse(payload);
  if (!validation.success) {
    return {
      error: contentOrderValidationMessage(validation.error),
      statusCode: apiStatusCodes.BAD_REQUEST,
    };
  }

  const { contentType, parentId, previousIds, orderedIds } = validation.data;
  const { collection, field, idField } = {
    "course-chapters": {
      collection: Course.collection,
      field: "chapters",
      idField: "_id",
    },
    "interview-questions": {
      collection: InterviewSheet.collection,
      field: "questions",
      idField: "_id",
    },
    "project-sections": {
      collection: Project.collection,
      field: "sections",
      idField: "sectionId",
    },
  }[contentType];

  try {
    const _id = new Types.ObjectId(parentId);
    const currentIds = {
      $map: {
        input: { $ifNull: [`$${field}`, []] },
        as: "item",
        in: { $toString: `$$item.${idField}` },
      },
    };

    // Compare the ID sequence atomically, and move the current objects rather
    // than client copies so simultaneous content edits are never overwritten.
    const result = await collection.updateOne(
      { _id, $expr: { $eq: [currentIds, { $literal: previousIds }] } },
      [
        {
          $set: {
            [field]: {
              $map: {
                input: { $literal: orderedIds },
                as: "id",
                in: {
                  $arrayElemAt: [
                    `$${field}`,
                    { $indexOfArray: [currentIds, "$$id"] },
                  ],
                },
              },
            },
            updatedAt: "$$NOW",
          },
        },
      ],
    );

    if (!result.matchedCount) {
      const exists = await collection.findOne(
        { _id },
        { projection: { _id: 1 } },
      );
      return {
        error: exists
          ? "Content changed since it was loaded. Refresh and try again."
          : "Content not found",
        statusCode: exists ? apiStatusCodes.CONFLICT : apiStatusCodes.NOT_FOUND,
      };
    }

    return { data: { orderedIds } };
  } catch (error) {
    logger.error("DB: reorderContentInDB failed", {
      contentType,
      parentId,
      error: error instanceof Error ? error.message : String(error),
    });
    captureDatabaseError(
      error instanceof Error ? error : new Error(String(error)),
      "reorderContentInDB",
      collection.name,
      { parentId },
    );
    return {
      error: "Failed to reorder content",
      statusCode: apiStatusCodes.INTERNAL_SERVER_ERROR,
    };
  }
};
