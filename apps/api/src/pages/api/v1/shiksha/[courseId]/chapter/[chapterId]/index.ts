import type { NextApiRequest, NextApiResponse } from 'next';

import { apiStatusCodes } from '@/lib/constants';
import {
  deleteCourseChapterByIdFromDB,
  getACourseFromDBById,
  updateCourseChapterInDB,
} from '@/lib/database';
import type { UpdateChapterInCourseRequestProps } from '@/lib/interfaces';
import { sendAPIResponse } from '@/lib/utils';
import { connectDB } from '@/middleware';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await connectDB();
  const { method, query } = req;
  const { courseId, chapterId } = query as {
    chapterId: string;
    courseId: string;
  };

  switch (method) {
    case 'PATCH':
      return handleUpdateChapter(req, res, courseId, chapterId);
    case 'DELETE':
      return handleDeleteChapter(req, res, courseId, chapterId);

    default:
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: `Method ${req.method} Not Allowed`,
        })
      );
  }
};

const handleUpdateChapter = async (
  req: NextApiRequest,
  res: NextApiResponse,
  courseId: string,
  chapterId: string
) => {
  const updatedData = req.body as UpdateChapterInCourseRequestProps;

  try {
    const { error: courseNotFoundError } = await getACourseFromDBById(courseId);

    if (courseNotFoundError) {
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({
          status: false,
          message: 'Course not found',
          error: courseNotFoundError,
        })
      );
    }

    const { data, error } = await updateCourseChapterInDB(
      courseId,
      chapterId,
      updatedData
    );

    if (error) {
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({
          status: false,
          message: 'Failed while updating chapter to section',
        })
      );
    }

    return res
      .status(apiStatusCodes.OKAY)
      .json(sendAPIResponse({ status: true, data }));
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: 'Failed while updating chapter to section',
      })
    );
  }
};

const handleDeleteChapter = async (
  req: NextApiRequest,
  res: NextApiResponse,
  courseId: string,
  chapterId: string
) => {
  try {
    const { error: courseNotFoundError } = await getACourseFromDBById(courseId);

    if (courseNotFoundError) {
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({
          status: false,
          message: 'Course not found',
          error: courseNotFoundError,
        })
      );
    }

    const { data, error } = await deleteCourseChapterByIdFromDB(
      courseId,
      chapterId
    );

    if (error) {
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({
          status: false,
          message: 'Failed while deleting chapter to section',
        })
      );
    }

    return res
      .status(apiStatusCodes.OKAY)
      .json(sendAPIResponse({ status: true, data }));
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: 'Failed while deleting chapter to section',
      })
    );
  }
};

export default handler;
