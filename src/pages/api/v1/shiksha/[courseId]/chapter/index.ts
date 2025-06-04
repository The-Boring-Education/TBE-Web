import type { NextApiRequest, NextApiResponse } from 'next';

import { addChapterToCourseInDB } from '@/database';

import { apiStatusCodes } from '@/constant';
import type { AddChapterToCourseRequestProps } from '@/interfaces';
import { connectDB } from '@/middlewares';
import { sendAPIResponse } from '@/utils';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await connectDB();
  const { method, query } = req;
  const { courseId } = query as { courseId: string };

  switch (method) {
    case 'POST':
      return handleAddChapter(req, res, courseId);
    default:
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: `Method ${req.method} Not Allowed`,
        })
      );
  }
};

const handleAddChapter = async (
  req: NextApiRequest,
  res: NextApiResponse,
  courseId: string
) => {
  const chapterData = req.body as AddChapterToCourseRequestProps;

  try {
    const { data, error } = await addChapterToCourseInDB(courseId, chapterData);

    if (error) {
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({
          status: false,
          message: 'Failed while adding chapter to course',
        })
      );
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        data,
        message: 'Chapter added to course successfully',
      })
    );
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: 'Failed while adding chapter to course',
      })
    );
  }
};

export default handler;
