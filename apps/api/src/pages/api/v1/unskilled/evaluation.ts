import type { NextApiRequest, NextApiResponse } from 'next';

import { apiStatusCodes } from '@/constant';
import { getResumeEvaluationResultsFromDB } from '@/database';
import type { UnSkilledEvaluationRequestBody } from '@/interfaces';
import { connectDB } from '@/middlewares';
import { sendAPIResponse } from '@/utils';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await connectDB();

  if (req.method !== 'POST') {
    return res.status(apiStatusCodes.BAD_REQUEST).json({
      success: false,
      message: `Method ${req.method} not allowed`,
    });
  }

  try {
    const { skills, domains, experience } =
      req.body as UnSkilledEvaluationRequestBody;

    if (!skills || !domains || !experience) {
      return res.status(apiStatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Missing required fields in request body',
      });
    }

    const { data, error } = await getResumeEvaluationResultsFromDB({
      skills,
      domains,
      experience,
    });

    if (error) {
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({
          status: false,
          message: 'Failed to evaluate your resume',
          error,
        })
      );
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        message: 'Resume evaluation successfully',
        data,
      })
    );
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: 'Error while evaluating resume',
        error,
      })
    );
  }
};

export default handler;
