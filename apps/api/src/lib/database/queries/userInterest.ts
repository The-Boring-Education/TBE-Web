import type {
  CreateUserInterestRequestProps,
  DatabaseQueryResponseType,
} from "@/lib/interfaces";
import { logger } from "@/lib/utils/logger";

import { UserInterest } from "../models";

/**
 * Create a new user interest or update existing one
 */
const createUserInterestInDB = async (
  payload: CreateUserInterestRequestProps & {
    ipAddress: string;
    userAgent: string;
  },
): Promise<DatabaseQueryResponseType> => {
  try {
    const {
      userId,
      eventType,
      eventDescription,
      metadata,
      source,
      ipAddress,
      userAgent,
    } = payload;

    // Check if user already has an active interest for this event type
    const existingInterest = await UserInterest.findOne({
      userId,
      eventType,
      isActive: true,
    });

    if (existingInterest) {
      // Update existing interest instead of creating new one
      existingInterest.eventDescription = eventDescription;
      existingInterest.metadata = {
        ...existingInterest.metadata,
        ...metadata,
      };
      existingInterest.source = source;
      existingInterest.ipAddress = ipAddress;
      existingInterest.userAgent = userAgent;
      await existingInterest.save();

      return { data: existingInterest };
    }

    // Create new interest
    const interest = await UserInterest.create({
      userId,
      eventType,
      eventDescription,
      metadata: metadata || {},
      source,
      ipAddress,
      userAgent,
      isActive: true,
    });

    return { data: interest };
  } catch (error) {
    logger.error("DB: createUserInterestInDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Failed to create user interest", details: error };
  }
};

/**
 * Get user interests with filters and pagination
 */
const getUserInterestsFromDB = async (filters: {
  userId?: string;
  eventType?: string;
  source?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}): Promise<DatabaseQueryResponseType> => {
  try {
    const { page = 1, limit = 10, ...queryFilters } = filters;

    // Build query filters
    const query: any = {};
    if (queryFilters.userId) query.userId = queryFilters.userId;
    if (queryFilters.eventType) query.eventType = queryFilters.eventType;
    if (queryFilters.source) query.source = queryFilters.source;
    if (queryFilters.isActive !== undefined)
      query.isActive = queryFilters.isActive;

    const skip = (page - 1) * limit;

    // Get interests with pagination
    const [interests, total] = await Promise.all([
      UserInterest.find(query)
        .populate("userId", "name email image")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      UserInterest.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: {
        interests,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    };
  } catch (error) {
    logger.error("DB: getUserInterestsFromDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Failed to get user interests", details: error };
  }
};

/**
 * Update user interest status (activate/deactivate)
 */
const updateUserInterestInDB = async (
  interestId: string,
  isActive: boolean,
): Promise<DatabaseQueryResponseType> => {
  try {
    const interest = await UserInterest.findByIdAndUpdate(
      interestId,
      { isActive },
      { new: true },
    ).populate("userId", "name email image");

    if (!interest) {
      return { error: "Interest not found" };
    }

    return { data: interest };
  } catch (error) {
    logger.error("DB: updateUserInterestInDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Failed to update user interest", details: error };
  }
};

export {
  createUserInterestInDB,
  getUserInterestsFromDB,
  updateUserInterestInDB,
};
