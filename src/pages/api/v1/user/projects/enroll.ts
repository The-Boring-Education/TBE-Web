import type { NextApiRequest, NextApiResponse } from 'next';

import { apiStatusCodes } from '@/constant';
import { enrollInAProject, getEnrolledProjectFromDB } from '@/database';
import type { ProjectEnrollmentRequestProps } from '@/interfaces';
import { connectDB } from '@/middlewares';
import { sendAPIResponse } from '@/utils';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    await connectDB();

    switch (req.method) {
      case 'POST':
        return handleProjectEnrollment(req, res);
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
        message: `Something went wrong`,
        error,
      })
    );
  }
};

const handleProjectEnrollment = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const { userId, projectId } = req.body as ProjectEnrollmentRequestProps;

  try {
    const { data: alreadyExists, error: fetchEnrolledProjectError } =
      await getEnrolledProjectFromDB({ projectId, userId });

    if (fetchEnrolledProjectError)
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({
          status: false,
          message: 'Failed while checking project enrollment',
        })
      );

    if (alreadyExists)
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: 'Already enrolled in project',
        })
      );

    const { data, error } = await enrollInAProject({ userId, projectId });

    if (error)
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({
          status: false,
          message: 'Failed while enrolling in project',
        })
      );

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        data,
        message: 'Successfully enrolled in project',
      })
    );
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: 'Failed while enrolling in project',
        error,
      })
    );
  }
};

export default handler;
