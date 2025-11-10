import type { NextApiRequest, NextApiResponse } from 'next';

import { apiStatusCodes } from '@/lib/constants';
import {
  addPrepLogToDB,
  deletePrepLogInDB,
  getPrepLogsByUserFromDB,
  handleGamificationPoints,
  updatePrepLogInDB,
} from '@/lib/database';
import { cors, sendAPIResponse } from '@/lib/utils';
import { connectDB } from '@/middleware';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await cors(req, res);
  await connectDB();  

  switch (req.method) {
    case 'POST':
      return handleAddLog(req, res);
    case 'GET':
      return handleGetLogs(req, res);
    case 'PUT':
      return handleUpdateLog(req, res);
    case 'PATCH':
      return handleAddMentorFeedback(req, res);
    case 'DELETE':
      return handleDeleteLog(req, res);
    default:
      return res.status(apiStatusCodes.METHOD_NOT_ALLOWED).json(
        sendAPIResponse({
          status: false,
          message: `Method ${req.method} not allowed`,
        })
      );
  }
};

const handleAddLog = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { userId, title, description, timeSpent } = req.body;

    if (!userId || !title || !timeSpent) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: 'userId, title, and durationDays are required',
        })
      );
    }

    const { data, error } = await addPrepLogToDB({
      userId,
      title,
      description,
      timeSpent,
    });

    if (error) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: error,
        })
      );
    }

    try {
      await handleGamificationPoints(true, userId, 'PREPLOG_CREATED');
    } catch (gamificationError) {
      console.error('Gamification trigger failed:', gamificationError);
    }

    return res.status(apiStatusCodes.RESOURCE_CREATED).json(
      sendAPIResponse({
        status: true,
        message: 'Prep log created',
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

const handleGetLogs = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { userId } = req.query;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json(
        sendAPIResponse({
          status: false,
          message: 'Missing or invalid userId',
        })
      );
    }

    const { data, error } = await getPrepLogsByUserFromDB(userId);

    if (error) {
      return res.status(500).json(
        sendAPIResponse({
          status: false,
          message: error,
        })
      );
    }

    return res.status(200).json(
      sendAPIResponse({
        status: true,
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

const handleUpdateLog = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { prepLogId, ...updatePayload } = req.body;

    if (!prepLogId) {
      return res.status(400).json(
        sendAPIResponse({
          status: false,
          message: 'prepLogId is required',
        })
      );
    }

    const { data, error } = await updatePrepLogInDB(prepLogId, updatePayload);

    if (error) {
      return res.status(400).json(
        sendAPIResponse({
          status: false,
          message: error,
        })
      );
    }

    return res.status(200).json(
      sendAPIResponse({
        status: true,
        message: 'Prep log updated',
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

// Admin-only: add mentor feedback to a prep log and email the user
const handleAddMentorFeedback = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    const adminHeader = req.headers['x-admin-secret'];
    const { prepLogId, mentorFeedback, notifyEmail, userId, userName, userEmail } = req.body;

    const expectedSecret = process.env.ADMIN_SECRET || 'TBEAdmin';
    if (!adminHeader || adminHeader !== expectedSecret) {
      return res.status(apiStatusCodes.UNAUTHORIZED).json(
        sendAPIResponse({ status: false, message: 'Unauthorized' })
      );
    }

    if (!prepLogId || !mentorFeedback) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: 'prepLogId and mentorFeedback are required',
        })
      );
    }

    const { data, error } = await updatePrepLogInDB(prepLogId, {
      mentorFeedback,
    });

    if (error) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({ status: false, message: error })
      );
    }

    // Optionally notify learner via email
    if (notifyEmail && userEmail && userName && userId) {
      try {
        const { emailClient } = await import('@/lib/services');

        await emailClient.sendEmail({
          from_email: process.env.FROM_EMAIL || 'theboringeducation@gmail.com',
          from_name: 'Sachin from The Boring Education',
          to_email: userEmail,
          to_name: userName,
          subject: 'I have some feedback for your Prep Yatra 🚀',
          html_content:
            `<p>Hi ${userName.split(' ')[0]},</p>` +
            `<p>I reviewed your recent Prep Yatra logs. Here's my feedback to help you level up this week:</p>` +
            `<blockquote style="margin:12px 0;padding:12px;border-left:4px solid #6b46c1;background:#faf7ff;">${
              mentorFeedback
            }</blockquote>` +
            `<p>Keep going — consistency compounds. Proud of your progress.</p>` +
            `<p>— Sachin</p>`,
        });
      } catch (e) {
        // Do not fail the API if email fails; just proceed
         
        console.error('Feedback email send failed:', e);
      }
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        message: 'Mentor feedback added',
        data,
      })
    );
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: 'Something went wrong while adding mentor feedback',
        error,
      })
    );
  }
};

const handleDeleteLog = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { prepLogId } = req.query;

    if (!prepLogId || typeof prepLogId !== 'string') {
      return res.status(400).json(
        sendAPIResponse({
          status: false,
          message: 'Invalid prepLogId',
        })
      );
    }

    const { data, error } = await deletePrepLogInDB(prepLogId);

    if (error) {
      return res.status(404).json(
        sendAPIResponse({
          status: false,
          message: 'Log not found',
        })
      );
    }

    return res.status(200).json(
      sendAPIResponse({
        status: true,
        message: 'Prep log deleted',
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

export default handler;
