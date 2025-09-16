import type { NextApiRequest, NextApiResponse } from 'next';

import { apiStatusCodes } from '@tbe/constants';
import type { ExternalEmailRequest, ExternalEmailResponse } from '@tbe/interface';
import { emailTriggerService } from '@tbe/services';
import { connectDB } from '@/middleware';
import { sendAPIResponse } from '@tbe/utils';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    await connectDB();

    switch (req.method) {
      case 'POST':
        return handleExternalEmail(req, res);
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

const handleExternalEmail = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    const { emailType, userData, additionalData } =
      req.body as ExternalEmailRequest;

    // Validate required fields
    if (!emailType || !userData) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: 'Missing required fields: emailType, userData',
        })
      );
    }

    if (!userData.email || !userData.name || !userData.id) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: 'Missing required user data: email, name, id',
        })
      );
    }

    // Send email using the external email service
    const result: ExternalEmailResponse =
      await emailTriggerService.sendExternalEmail({
        emailType,
        userData,
        additionalData,
      });

    if (result.success) {
      return res.status(apiStatusCodes.OKAY).json(
        sendAPIResponse({
          status: true,
          message: result.message,
          data: {
            requestId: result.requestId,
            emailType,
            userEmail: userData.email,
          },
        })
      );
    } else {
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({
          status: false,
          message: result.message,
          error: result.error,
          data: {
            requestId: result.requestId,
            emailType,
            userEmail: userData.email,
          },
        })
      );
    }
  } catch (error) {
    console.error('External email sending error:', error);
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: 'Failed to send email',
        error,
      })
    );
  }
};

export default handler;
