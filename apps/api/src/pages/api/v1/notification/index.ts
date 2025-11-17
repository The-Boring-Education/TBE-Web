import type { NextApiRequest, NextApiResponse } from 'next';

import { apiStatusCodes } from '@/lib/constants';
import {
  addANotificationToDB,
  deleteANotificationsFromDB,
  getAllNotificationsFromDB,
  updateANotificationInDB,
} from '@/lib/database';
import type {
  AddNotificationRequestPayloadProps,
  UpdateNotificationRequestPayloadProps,
} from '@/lib/interfaces';
import { cors, sendAPIResponse } from '@/lib/utils';
import { connectDB } from '@/middleware/api';

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
      return handleAddANotification(req, res);
    case 'GET':
      return handleGetAllNotification(req, res);
    case 'PATCH':
      return handleUpdateANotification(req, res);
    case 'DELETE':
      return handleDeleteANotification(req, res);
    default:
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: `Method ${method} Not Allowed`,
        })
      );
  }
};

const handleAddANotification = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    const notificationPayload = req.body as AddNotificationRequestPayloadProps;

    const { data, error } = await addANotificationToDB(notificationPayload);

    if (error)
      return res.status(apiStatusCodes.NOT_FOUND).json(
        sendAPIResponse({
          status: false,
          message: 'Notification not added',
          error,
        })
      );

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        message: 'Notification added successfully',
        data,
      })
    );
  } catch (error) {
    return res.status(apiStatusCodes.NOT_FOUND).json(
      sendAPIResponse({
        status: false,
        message: 'Failed while adding Notification',
        error,
      })
    );
  }
};

const handleGetAllNotification = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    const { data: allNotifications, error: allNotificationsError } =
      await getAllNotificationsFromDB();

    if (allNotificationsError) {
      return res.status(apiStatusCodes.NOT_FOUND).json(
        sendAPIResponse({
          status: false,
          message: 'Failed while fetching Notifications',
          error: allNotificationsError,
        })
      );
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        data: allNotifications,
      })
    );
  } catch (error) {
    return res.status(apiStatusCodes.NOT_FOUND).json(
      sendAPIResponse({
        status: false,
        message: 'Failed while fetching Notifications',
        error,
      })
    );
  }
};

const handleUpdateANotification = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    const updatedNotificationPayload =
      req.body as UpdateNotificationRequestPayloadProps;

    const { data, error } = await updateANotificationInDB(
      updatedNotificationPayload
    );
    if (error)
      return res.status(apiStatusCodes.NOT_FOUND).json(
        sendAPIResponse({
          status: false,
          message: 'Notification not updated',
          error,
        })
      );
    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        message: 'Notification updated successfully',
        data,
      })
    );
  } catch (error) {
    return res.status(apiStatusCodes.NOT_FOUND).json(
      sendAPIResponse({
        status: false,
        message: 'Failed while updating notification',
        error,
      })
    );
  }
};

const handleDeleteANotification = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    const { notificationId } = req.body;

    const { data, error } = await deleteANotificationsFromDB(
      notificationId as string
    );

    if (error)
      return res.status(apiStatusCodes.NOT_FOUND).json(
        sendAPIResponse({
          status: false,
          message: 'Notification not deleted',
          error,
        })
      );

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        message: 'Notification deleted successfully',
        data,
      })
    );
  } catch (error) {
    return res.status(apiStatusCodes.NOT_FOUND).json(
      sendAPIResponse({
        status: false,
        message: 'Failed while deleting notification',
        error,
      })
    );
  }
};

export default handler;
