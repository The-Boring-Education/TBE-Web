import type { NextApiRequest, NextApiResponse } from 'next';

import { apiStatusCodes } from '@/constant';
import { addRecruiterToDB } from '@/database';
import { connectDB } from '@/middlewares';
import { sendAPIResponse } from '@/utils';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await connectDB();

  switch(req.method){
    case 'POST':
        return handleAddRecruiter(req,res);
    default:
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: `Method ${req.method} Not Allowed`,
        })
      );
  }
};

const handleAddRecruiter = async (req: NextApiRequest,res: NextApiResponse) => {
     try {
    const {
      userId,
      recruiterName,
      contact,
      company,
      appliedPosition,
      applicationStatus,
      lastContacted,
    } = req.body;

    if (
      !userId ||
      !recruiterName ||
      !contact ||
      !company ||
      !appliedPosition ||
      !applicationStatus ||
      !lastContacted
    ) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: 'All fields are required',
        })
      );
    }
    
    const {data, error} = await addRecruiterToDB({
        userId,
        recruiterName,
        contact,
        company,
        appliedPosition,
        applicationStatus,
        lastContacted
    })

    if (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({
        status: false,
        message: 'Failed to submit star rating',
        error,
        })
    );
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        message: 'Recruiter created successfully',
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
}

export default handler;
