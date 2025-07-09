import type { NextApiRequest, NextApiResponse } from 'next';

import { apiStatusCodes } from '@/constant';
import {
  getUserByUserNameFromDB,
  onboardPrepYatraUserTODB,
  onboardUserToDB,
} from '@/database';
import type {
  AddOnboardingPayloadProps,
  AddPrepYatraOnboardingPayloadProps,
} from '@/interfaces';
import { connectDB } from '@/middlewares';
import { cors, sendAPIResponse } from '@/utils';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await cors(req, res);
  await connectDB();

  const { method } = req;
  const { userId, userName } = req.query as {
    userId: string;
    userName: string;
  };

  switch (method) {
    case 'GET':
      return getUserByUsername(req, res, userName);
    case 'POST':
      return handleUserOnboarding(req, res, userId);
    case 'PUT':
      return handlePrepYatraOnboarding(req, res, userId);
    default:
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: `Method ${method} Not Allowed`,
        })
      );
  }
};

const getUserByUsername = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userName: string
) => {
  if (!userName) {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: false,
        message: 'Username is required',
      })
    );
  }

  try {
    const { data, error } = await getUserByUserNameFromDB(userName);

    if (error) {
      // Username already exists
      return res.status(apiStatusCodes.OKAY).json(
        sendAPIResponse({
          status: false,
          message: 'Username already taken. Please choose another.',
        })
      );
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        data,
        message: 'Username is available.',
      })
    );
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: 'Error while checking userName',
        error,
      })
    );
  }
};

const handleUserOnboarding = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  try {
    const { userName, occupation, purpose, contactNo } =
      req.body as AddOnboardingPayloadProps;

    if (!userId || !userName || !occupation || !purpose || !contactNo) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          error: 'Missing required fields',
          message: 'Please provide all required fields',
        })
      );
    }

    const { data, error: updateUserError } = await onboardUserToDB(
      userId,
      userName,
      occupation,
      purpose,
      contactNo
    );

    if (updateUserError) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          error: updateUserError,
          message: 'Error while onboarding user',
        })
      );
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        data,
        message: 'User onboarded successfully',
      })
    );
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        error,
        message: 'Error while onboarding user',
      })
    );
  }
};

const handlePrepYatraOnboarding = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  try {
    const { workExperience, workDomain, linkedInUrl } =
      req.body as AddPrepYatraOnboardingPayloadProps;

    if (
      !userId ||
      workExperience === undefined ||
      workExperience === null ||
      !workDomain
    ) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          error: 'Missing required fields',
          message: 'Please provide all required fields',
        })
      );
    }

    const { data, error: onboardUserError } = await onboardPrepYatraUserTODB(
      userId,
      workExperience,
      workDomain,
      linkedInUrl
    );

    if (onboardUserError) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          error: onboardUserError,
          message: 'Error while onboarding user',
        })
      );
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        data,
        message: 'User onboarded successfully',
      })
    );
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        error,
        message: 'Error while onboarding user',
      })
    );
  }
};

export default handler;
