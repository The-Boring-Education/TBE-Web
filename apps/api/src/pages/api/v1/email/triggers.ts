import type { NextApiRequest, NextApiResponse } from 'next';

import { apiStatusCodes } from '@/constant';
import type { EmailTriggerRequest } from '@/interfaces';
import { connectDB } from '@/middlewares';
import { emailTriggerService } from '@/services/email';
import { sendAPIResponse } from '@/utils';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    await connectDB();

    switch (req.method) {
      case 'POST':
        return handleEmailTrigger(req, res);
      default:
        return res.status(apiStatusCodes.BAD_REQUEST).json(
          sendAPIResponse({
            status: false,
            message: `Method ${req.method} Not Allowed`,
          })
        );
    }
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: 'Something went wrong',
        error,
      })
    );
  }
};

const handleEmailTrigger = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    const { trigger, data } = req.body as EmailTriggerRequest;

    if (!trigger || !data) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: 'Missing required fields: trigger, data',
        })
      );
    }

    if (!data.userEmail || !data.userName || !data.userId) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: 'Missing required user data: userEmail, userName, userId',
        })
      );
    }

    const result = await emailTriggerService.sendTriggerEmail(trigger, data);

    if (result.success) {
      return res.status(apiStatusCodes.OKAY).json(
        sendAPIResponse({
          status: true,
          message: `${trigger} email sent successfully`,
          data: result,
        })
      );
    } else {
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({
          status: false,
          message: `Failed to send ${trigger} email`,
          error: result.error,
        })
      );
    }
  } catch (error) {
    console.error('Email trigger error:', error);
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: 'Failed to send email trigger',
        error,
      })
    );
  }
};

export default handler;
