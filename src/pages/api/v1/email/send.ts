import type { NextApiRequest, NextApiResponse } from 'next';

import { apiStatusCodes } from '@/constant';
import type { EmailRequest } from '@/interfaces/email';
import { connectDB } from '@/middlewares';
import { emailClient } from '@/services/email';
import { sendAPIResponse } from '@/utils';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    await connectDB();

    switch (req.method) {
      case 'POST':
        return handleSendEmail(req, res);
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

const handleSendEmail = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { from_email, to_email, subject, html_content } = req.body as EmailRequest;

    if (!to_email || !subject || !html_content) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: 'Missing required fields: to_email, subject, html_content',
        })
      );
    }

    const emailData: EmailRequest = {
      from_email: from_email || 'sachin@theboringeducation.com',
      to_email,
      subject,
      html_content,
    };

    const result = await emailClient.sendEmail(emailData);

    if (result.success) {
      return res.status(apiStatusCodes.OKAY).json(
        sendAPIResponse({
          status: true,
          message: 'Email sent successfully',
          data: result,
        })
      );
    } else {
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({
          status: false,
          message: 'Failed to send email',
          error: result.error,
        })
      );
    }
  } catch (error) {
    console.error('Email sending error:', error);
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