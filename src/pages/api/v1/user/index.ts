import type { NextApiRequest, NextApiResponse } from 'next';

import { apiStatusCodes } from '@/constant';
import {
  createUserInDB,
  getUserByEmailFromDB,
  getUserByIdFromDB,
} from '@/database/query/user';
import type { CreateUserRequestPayloadProps } from '@/interfaces';
import { connectDB } from '@/middlewares';
import { sendAPIResponse } from '@/utils';
import { captureAPIError, captureAuthError } from '@/utils/sentry';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await connectDB();

  const { method, query } = req;
  const { email, userId } = query;

  switch (method) {
    case 'GET':
      return handleGetUser(req, res, email as string, userId as string);
    case 'POST':
      return handleCreateUser(req, res);
  }
};

const handleGetUser = async (
  req: NextApiRequest,
  res: NextApiResponse,
  email: string,
  userId: string
) => {
  try {
    if (email) {
      const { data, error } = await getUserByEmailFromDB(email);

      if (error) {
        captureAPIError(
          error as Error,
          '/api/v1/user',
          'GET',
          apiStatusCodes.INTERNAL_SERVER_ERROR,
          { email }
        );

        return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
          sendAPIResponse({
            status: false,
            error,
            message: 'Error while fetching user',
          })
        );
      }

      return res
        .status(apiStatusCodes.OKAY)
        .json(sendAPIResponse({ status: true, data }));
    }

    if (userId) {
      const { data, error } = await getUserByIdFromDB(userId);

      if (error) {
        captureAPIError(
          error as Error,
          '/api/v1/user',
          'GET',
          apiStatusCodes.INTERNAL_SERVER_ERROR,
          { userId }
        );

        return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
          sendAPIResponse({
            status: false,
            error,
            message: 'Error while fetching user',
          })
        );
      }

      return res
        .status(apiStatusCodes.OKAY)
        .json(sendAPIResponse({ status: true, data }));
    }

    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: false,
        message: 'Please provide Email or User id',
        error: 'Please provide Email or User id',
      })
    );
  } catch (error) {
    captureAPIError(
      error as Error,
      '/api/v1/user',
      'GET',
      apiStatusCodes.INTERNAL_SERVER_ERROR,
      { email, userId }
    );

    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        error,
        message: 'error while fetching user',
      })
    );
  }
};

const handleCreateUser = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { name, email, provider, image, providerAccountId } =
      req.body as CreateUserRequestPayloadProps;

    if (!email || !name) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          error: 'Please provide email and name',
          message: 'Error while creating user',
        })
      );
    }

    const { data } = await getUserByEmailFromDB(email);

    if (!data) {
      const { data, error } = await createUserInDB({
        name,
        email,
        provider,
        image,
        providerAccountId,
      });

      if (error) {
        return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
          sendAPIResponse({
            status: false,
            error,
            message: 'Error while creating user',
          })
        );
      }

      return res
        .status(apiStatusCodes.OKAY)
        .json(sendAPIResponse({ status: true, data }));
    } else {
      return res.status(apiStatusCodes.OKAY).json(
        sendAPIResponse({
          status: true,
          data,
          message: 'User already exists',
        })
      );
    }
  } catch (error) {
    captureAuthError(
      error as Error,
      'user_creation',
      req.body?.email
    );

    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        error,
        message: 'Error while creating user',
      })
    );
  }
};

export default handler;
