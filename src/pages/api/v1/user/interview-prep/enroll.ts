import type { NextApiRequest, NextApiResponse } from 'next';

import { apiStatusCodes } from '@/constant';
import {
  enrollInASheet,
  getEnrolledSheetFromDB,
  getUserByIdFromDB,
  getInterviewSheetByIDFromDB,
} from '@/database';
import type { SheetEnrollmentRequestProps } from '@/interfaces';
import { connectDB } from '@/middlewares';
import { sendAPIResponse } from '@/utils';
import { sendInterviewPrepEnrollmentEmail } from '@/utils/email';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    await connectDB();

    switch (req.method) {
      case 'POST':
        return handleSheetEnrollment(req, res);
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

const handleSheetEnrollment = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const { userId, sheetId } = req.body as SheetEnrollmentRequestProps;

  try {
    const { data: alreadyExists, error: fetchEnrolledSheetError } =
      await getEnrolledSheetFromDB({ sheetId, userId });

    if (fetchEnrolledSheetError)
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({
          status: false,
          message: 'Failed while enrolling in sheet',
        })
      );

    if (alreadyExists)
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: 'Already enrolled in sheet',
        })
      );

    const { data, error } = await enrollInASheet({ userId, sheetId });

    if (error)
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({
          status: false,
          message: 'Failed while enrolling in sheet',
        })
      );

    // Send interview prep enrollment email (non-blocking)
    try {
      const [userResult, sheetResult] = await Promise.all([
        getUserByIdFromDB(userId),
        getInterviewSheetByIDFromDB(sheetId),
      ]);

      if (userResult.data && sheetResult.data) {
        sendInterviewPrepEnrollmentEmail({
          userEmail: userResult.data.email,
          userName: userResult.data.name,
          userId: userId,
          sheetName: sheetResult.data.title,
          sheetDescription: sheetResult.data.description,
          sheetId: sheetId,
        }).catch((error) => {
          console.error(
            'Failed to send interview prep enrollment email:',
            error
          );
          // Don't fail the enrollment if email fails
        });
      }
    } catch (error) {
      console.error('Error fetching user/sheet data for email:', error);
      // Don't fail the enrollment if email data fetch fails
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        data,
        message: 'Successfully enrolled in sheet',
      })
    );
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: 'Failed while enrolling in sheet',
        error,
      })
    );
  }
};

export default handler;
