import type { NextApiRequest, NextApiResponse } from 'next';

import { apiStatusCodes } from '@/constant';
import { UserInterest } from '@/database';
import type {
  CreateUserInterestRequestProps,
  GetUserInterestsRequestProps,
  UserInterestResponseProps,
} from '@/interfaces';
import { connectDB } from '@/middlewares';
import { sendAPIResponse } from '@/utils';
import { cors } from '@/utils/cors';

/**
 * API Handler for User Interests
 * POST /api/v1/user/interest - Create new user interest
 * GET /api/v1/user/interest - Get user interests with filters
 * PATCH /api/v1/user/interest - Update interest status (activate/deactivate)
 */
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // Apply CORS headers
  await cors(req, res);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  await connectDB();
  const { method } = req;

  switch (method) {
    case 'POST':
      return handleCreateInterest(req, res);
    case 'GET':
      return handleGetInterests(req, res);
    case 'PATCH':
      return handleUpdateInterest(req, res);
    default:
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: `Method ${req.method} Not Allowed`,
        })
      );
  }
};

const handleCreateInterest = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    const {
      userId,
      eventType,
      eventDescription,
      metadata,
      source,
    }: CreateUserInterestRequestProps = req.body;

    if (!userId || !eventType || !source) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: 'Required fields: userId, eventType, source',
        })
      );
    }

    // Get client IP and user agent for tracking
    const ipAddress = 
      req.headers['x-forwarded-for']?.toString().split(',')[0] ||
      req.headers['x-real-ip']?.toString() ||
      req.connection.remoteAddress ||
      'unknown';
    
    const userAgent = req.headers['user-agent'] || 'unknown';

    // Check if user already has an active interest for this event type
    const existingInterest = await UserInterest.findOne({
      userId,
      eventType,
      isActive: true,
    });

    if (existingInterest) {
      // Update existing interest instead of creating new one
      existingInterest.eventDescription = eventDescription;
      existingInterest.metadata = { ...existingInterest.metadata, ...metadata };
      existingInterest.source = source;
      existingInterest.ipAddress = ipAddress;
      existingInterest.userAgent = userAgent;
      await existingInterest.save();

      return res.status(apiStatusCodes.OKAY).json(
        sendAPIResponse({
          status: true,
          data: existingInterest,
          message: 'User interest updated successfully',
        })
      );
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

    return res.status(apiStatusCodes.CREATED).json(
      sendAPIResponse({
        status: true,
        data: interest,
        message: 'User interest created successfully',
      })
    );
  } catch (error: any) {
    console.error('Error creating user interest:', error);
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: 'Failed to create user interest',
        error: error.message,
      })
    );
  }
};

const handleGetInterests = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    const {
      userId,
      eventType,
      source,
      isActive,
      page = '1',
      limit = '10',
    } = req.query as GetUserInterestsRequestProps & {
      page: string;
      limit: string;
    };

    // Build query filters
    const filters: any = {};
    if (userId) filters.userId = userId;
    if (eventType) filters.eventType = eventType;
    if (source) filters.source = source;
    if (isActive !== undefined) filters.isActive = isActive === 'true';

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Get interests with pagination
    const [interests, total] = await Promise.all([
      UserInterest.find(filters)
        .populate('userId', 'name email image')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      UserInterest.countDocuments(filters),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        data: {
          interests,
          pagination: {
            currentPage: pageNum,
            totalPages,
            totalItems: total,
            itemsPerPage: limitNum,
            hasNextPage: pageNum < totalPages,
            hasPrevPage: pageNum > 1,
          },
        },
        message: 'User interests retrieved successfully',
      })
    );
  } catch (error: any) {
    console.error('Error getting user interests:', error);
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: 'Failed to get user interests',
        error: error.message,
      })
    );
  }
};

const handleUpdateInterest = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    const { interestId, isActive } = req.body;

    if (!interestId || isActive === undefined) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: 'Required fields: interestId, isActive',
        })
      );
    }

    const interest = await UserInterest.findByIdAndUpdate(
      interestId,
      { isActive },
      { new: true }
    ).populate('userId', 'name email image');

    if (!interest) {
      return res.status(apiStatusCodes.NOT_FOUND).json(
        sendAPIResponse({
          status: false,
          message: 'Interest not found',
        })
      );
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        data: interest,
        message: 'Interest status updated successfully',
      })
    );
  } catch (error: any) {
    console.error('Error updating user interest:', error);
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: 'Failed to update user interest',
        error: error.message,
      })
    );
  }
};

export default handler;