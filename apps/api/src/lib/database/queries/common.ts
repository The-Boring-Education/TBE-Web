import mongoose, { type Model } from "mongoose";

import type { DatabaseQueryResponseType } from "@/lib/interfaces";
import { logger } from "@/lib/utils/logger";

/**
 * General utility to get total count of documents for any Mongoose model.
 */
const getTotalCountFromModel = async (
  model: Model<any>,
): Promise<DatabaseQueryResponseType> => {
  try {
    const count = await model.countDocuments();
    return { data: count };
  } catch (error) {
    logger.error("DB: getTotalCountFromModel failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Error while counting documents", details: error };
  }
};

/**
 * General utility to get paginated documents for any Mongoose model.
 * Supports optional population and sorting.
 */
const getAllDocumentsFromModel = async (
  model: Model<any>,
  page = 1,
  limit = 100,
  populateOptions: any = null,
  sortOptions: Record<string, 1 | -1> = { createdAt: -1 },
): Promise<DatabaseQueryResponseType> => {
  try {
    const skip = (page - 1) * limit;
    const query = model.find().sort(sortOptions).skip(skip).limit(limit);
    if (populateOptions) query.populate(populateOptions);
    const docs = await query.exec();

    const total = await model.countDocuments();
    return {
      data: {
        items: docs,
        total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    logger.error("DB: getAllDocumentsFromModel failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Error while fetching documents", details: error };
  }
};

/**
 * Utility to convert string or ObjectId to mongoose ObjectId
 */
const toObjectId = (id: string | mongoose.Types.ObjectId) => {
  if (id instanceof mongoose.Types.ObjectId) return id;
  return new mongoose.Types.ObjectId(id);
};

export { getAllDocumentsFromModel, getTotalCountFromModel, toObjectId };
