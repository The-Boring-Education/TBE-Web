import type { NextApiRequest, NextApiResponse } from 'next';

import { apiStatusCodes } from '@/constant';
import {
  addRecruiterToDB,
  deleteRecruiterInDB,
  getRecruitersByUserFromDB,
  updateRecruiterInDB,
  updateUserPointsInDB,
  addGamificationDocInDB,
} from '@/database';
import { connectDB } from '@/middlewares';
import { sendAPIResponse } from '@/utils';
import { cors } from '@/utils/cors';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await cors(req, res);
  await connectDB();

  switch (req.method) {
    case 'GET':
      return handleGetRecruiters(req, res);
    case 'POST':
      return handleAddRecruiter(req, res);
    case 'PUT':
      return handleUpdateRecruiter(req, res);
    case 'DELETE':
      return handleDeleteRecruiter(req, res);
    default:
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: `Method ${req.method} Not Allowed`,
        })
      );
  }
};

const handleGetRecruiters = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    const { userId } = req.query;

    if (!userId || typeof userId !== 'string') {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: 'Missing or invalid userId',
        })
      );
    }

    const { data, error } = await getRecruitersByUserFromDB(userId);

    if (error) {
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({
          status: false,
          message: error,
        })
      );
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        message: 'Recruiters fetched successfully',
        data,
      })
    );
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: 'Internal Server Error',
      })
    );
  }
};

const handleAddRecruiter = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    const { userId, recruiterName } = req.body;

    if (!userId || !recruiterName) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: 'All fields are required',
        })
      );
    }

    const { data, error } = await addRecruiterToDB({
      userId,
      recruiterName,
    });

    console.log("thsi is user id ",userId)

    if (error) {
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({
          status: false,
          message: 'Failed to submit recruiter',
          error,
        })
      );
    }

    // Trigger gamification for recruiter addition
    try {
      let { data: gamificationData, error: gamificationError } = await updateUserPointsInDB(userId, 'RECRUITER_ADDED');
      
      // If user not found, create gamification record first
      if (gamificationError && gamificationError === 'User not found') {
        console.log('Creating gamification record for user:', userId);
        const { data: newGamificationData, error: createError } = await addGamificationDocInDB(userId);
        
        if (createError) {
          console.error('Failed to create gamification record:', createError);
        } else {
          // Now try updating points again
          const { data: updatedData, error: updateError } = await updateUserPointsInDB(userId, 'RECRUITER_ADDED');
          if (updateError) {
            console.error('Gamification update failed after creating record:', updateError);
          } else {
            console.log('Gamification event added successfully for recruiter addition:', updatedData);
          }
        }
      } else if (gamificationError) {
        console.error('Gamification update failed:', gamificationError);
      } else {
        console.log('Gamification event added successfully for recruiter addition:', gamificationData);
      }
    } catch (gamificationError) {
      console.error('Gamification trigger failed:', gamificationError);
      // Don't fail the main request if gamification fails
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        message: 'Recruiter created successfully',
        data,
      })
    );
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: 'Something went wrong while creating recruiter',
        error,
      })
    );
  }
};

const handleUpdateRecruiter = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    const { recruiterId, ...updatePayload } = req.body;

    if (!recruiterId) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: 'Recruiter ID is required',
        })
      );
    }

    const { data, error } = await updateRecruiterInDB(
      recruiterId,
      updatePayload
    );

    if (error) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: error,
        })
      );
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        message: 'Recruiter updated successfully',
        data,
      })
    );
  } catch (error: any) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: 'Internal Server Error',
        error: error.message,
      })
    );
  }
};

const handleDeleteRecruiter = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    const { recruiterId } = req.query;

    if (!recruiterId || typeof recruiterId !== 'string') {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: 'Missing or invalid recruiterId',
        })
      );
    }

    const { data, error } = await deleteRecruiterInDB(recruiterId);

    if (error) {
      return res.status(apiStatusCodes.NOT_FOUND).json(
        sendAPIResponse({
          status: false,
          message: 'Recruiter not found',
        })
      );
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        message: 'Recruiter deleted successfully',
        data,
      })
    );
  } catch (error: any) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: 'Failed to delete recruiter',
        error: error.message,
      })
    );
  }
};

export default handler;
