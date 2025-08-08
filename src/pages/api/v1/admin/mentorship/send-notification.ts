import type { NextApiRequest, NextApiResponse } from 'next';

import { apiStatusCodes } from '@/constant';
import { connectDB } from '@/middlewares';
import { sendAPIResponse } from '@/utils';
import { cors } from '@/utils/cors';
import { emailClient } from '@/services/email/client';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await cors(req, res);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  await connectDB();

  if (req.method !== 'POST') {
    return res.status(apiStatusCodes.METHOD_NOT_ALLOWED).json(
      sendAPIResponse({ status: false, message: `Method ${req.method} not allowed` })
    );
  }

  try {
    const { userId, userEmail, userName } = req.body as { userId: string; userEmail: string; userName: string };

    if (!userId || !userEmail || !userName) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({ status: false, message: 'Missing required fields: userId, userEmail, userName' })
      );
    }

    const html = `
      <div style="font-family: Inter, Arial, sans-serif; color: #111827;">
        <h2>Congratulations, ${userName}! 🎉</h2>
        <p>
          You’ve been selected for the Prep Yatra Async Mentorship program based on your consistent effort and progress.
        </p>
        <p>
          You’ll receive guidance, nudges and resources tailored to your goals to help you stay on track and level up faster.
        </p>
        <p style="margin-top:16px;">Keep going — we’re rooting for you!</p>
        <p style="margin-top:24px;">— Team TBE</p>
      </div>
    `;

    const result = await emailClient.sendEmail({
      from_email: 'theboringeducation@gmail.com',
      from_name: 'TBE',
      to_email: userEmail,
      to_name: userName,
      subject: 'You are selected for Prep Yatra Async Mentorship 🎉',
      html_content: html,
    });

    if (!result.success) {
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({ status: false, message: 'Failed to send email', error: result.error })
      );
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({ status: true, message: 'Notification email sent', data: result })
    );
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({ status: false, message: 'Unexpected error', error })
    );
  }
};

export default handler;

