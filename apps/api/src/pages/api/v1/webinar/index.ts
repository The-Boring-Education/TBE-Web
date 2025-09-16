import type { NextApiRequest, NextApiResponse } from 'next';

import { apiStatusCodes } from '@tbe/constants';
import {
  addAWebinarToDB,
  getAllWebinarsFromDB,
  getWebinarBySlugFromDB,
} from '@tbe/database';
import type { AddWebinarRequestPayloadProps } from '@tbe/interface';
import { connectDB } from '@/middleware';
import { sendAPIResponse } from '@tbe/utils';
import { cors } from '@tbe/utils';

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
      return handleAddAWebinar(req, res);
    case 'GET':
      return handleGetAllWebinars(req, res);
    default:
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: `Method ${method} Not Allowed`,
        })
      );
  }
};

const handleAddAWebinar = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const webinarPayload = req.body as AddWebinarRequestPayloadProps;

    const { error: webinarAlreadyExist } = await getWebinarBySlugFromDB(
      webinarPayload.slug
    );

    if (!webinarAlreadyExist) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: 'Webinar already exists',
        })
      );
    }

    const { data, error } = await addAWebinarToDB(webinarPayload);

    if (error)
      return res.status(apiStatusCodes.NOT_FOUND).json(
        sendAPIResponse({
          status: false,
          message: 'Course not added',
          error,
        })
      );

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        message: 'Webinar added successfully',
        data,
      })
    );
  } catch (error) {
    return res.status(apiStatusCodes.NOT_FOUND).json(
      sendAPIResponse({
        status: false,
        message: 'Failed while adding webinar',
        error,
      })
    );
  }
};

const handleGetAllWebinars = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    const { data: allWebinars, error: allWebinarsError } =
      await getAllWebinarsFromDB();

    if (allWebinarsError || !allWebinars) {
      return res.status(apiStatusCodes.NOT_FOUND).json(
        sendAPIResponse({
          status: false,
          message: 'Failed while fetching webinars',
          error: allWebinarsError,
        })
      );
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        data: allWebinars,
      })
    );
  } catch (error) {
    return res.status(apiStatusCodes.NOT_FOUND).json(
      sendAPIResponse({
        status: false,
        message: 'Failed while fetching webinars',
        error,
      })
    );
  }
};

export default handler;
