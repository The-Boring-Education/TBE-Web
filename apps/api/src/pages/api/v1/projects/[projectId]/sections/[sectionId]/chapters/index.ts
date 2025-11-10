// Add Chapter API
import type { NextApiRequest, NextApiResponse } from 'next';
import { v4 } from 'uuid';

import { apiStatusCodes } from '@/lib/constants';
import {
  addChapterToSectionInDB,
  getChaptersFromSectionInDB,
} from '@/lib/database';
import type { AddChapterRequestPayloadProps } from '@/lib/interfaces';
import { getMDXContent,sendAPIResponse } from '@/lib/utils';
import { connectDB } from '@/middleware';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await connectDB();

  const { method, query } = req;
  const { projectId, sectionId } = query as {
    projectId: string;
    sectionId: string;
  };

  switch (method) {
    case 'POST':
      return handleAddChapter(req, res, projectId, sectionId);
    case 'GET':
      return handleGetChapters(req, res, projectId, sectionId);
    default:
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: `Method ${method} Not Allowed`,
        })
      );
  }
};

const handleAddChapter = async (
  req: NextApiRequest,
  res: NextApiResponse,
  projectId: string,
  sectionId: string
) => {
  let chapterData: AddChapterRequestPayloadProps = req.body;

  chapterData = {
    ...chapterData,
    chapterId: v4().replace(/-/g, ''),
    content: getMDXContent(),
  };

  try {
    const { data, error } = await addChapterToSectionInDB(
      projectId,
      sectionId,
      chapterData
    );

    if (error) {
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({
          status: false,
          message: 'Error adding chapter',
          error,
        })
      );
    }

    return res.status(apiStatusCodes.RESOURCE_CREATED).json(
      sendAPIResponse({
        status: true,
        message: 'Chapter Added Successfully',
        data,
      })
    );
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: 'Error adding chapter',
        error,
      })
    );
  }
};

const handleGetChapters = async (
  req: NextApiRequest,
  res: NextApiResponse,
  projectId: string,
  sectionId: string
) => {
  try {
    const { data, error } = await getChaptersFromSectionInDB(
      projectId,
      sectionId
    );

    if (error) {
      return res.status(apiStatusCodes.NOT_FOUND).json(
        sendAPIResponse({
          status: false,
          message: 'Error fetching chapters',
          error,
        })
      );
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        message: 'Chapters Fetched Successfully',
        data,
      })
    );
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: 'Error fetching chapters',
        error,
      })
    );
  }
};

export default handler;
