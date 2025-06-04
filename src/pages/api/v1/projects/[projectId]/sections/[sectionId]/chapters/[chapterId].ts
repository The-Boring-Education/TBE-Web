// Add Chapter API
import type { NextApiRequest, NextApiResponse } from 'next';

import {
  deleteChapterFromSectionInDB,
  getChapterFromSectionInDB,
  updateChapterInSectionInDB,
} from '@/database';

import { apiStatusCodes } from '@/constant';
import type { UpdateChapterRequestPayloadProps } from '@/interfaces';
import { connectDB } from '@/middlewares';
import { sendAPIResponse } from '@/utils';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await connectDB();

  const { method, query } = req;
  const { projectId, sectionId, chapterId } = query as {
    projectId: string;
    sectionId: string;
    chapterId: string;
  };

  switch (method) {
    case 'GET':
      return handleGetChapter(req, res, projectId, sectionId, chapterId);
    case 'PATCH':
      return handleUpdateChapter(req, res, projectId, sectionId, chapterId);
    case 'DELETE':
      return handleDeleteChapter(req, res, projectId, sectionId, chapterId);
    default:
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: `Method ${method} Not Allowed`,
        })
      );
  }
};

const handleGetChapter = async (
  req: NextApiRequest,
  res: NextApiResponse,
  projectId: string,
  sectionId: string,
  chapterId: string
) => {
  try {
    const { data, error } = await getChapterFromSectionInDB(
      projectId,
      sectionId,
      chapterId
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
        message: 'Chapter Fetched Successfully',
        data,
      })
    );
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: 'Error fetching Chapter',
        error,
      })
    );
  }
};

const handleUpdateChapter = async (
  req: NextApiRequest,
  res: NextApiResponse,
  projectId: string,
  sectionId: string,
  chapterId: string
) => {
  try {
    const { updatedChapterName, updatedChapterContent, updatedIsOptional } =
      req.body as UpdateChapterRequestPayloadProps;

    const { data, error } = await updateChapterInSectionInDB({
      projectId,
      sectionId,
      chapterId,
      updatedChapterName,
      updatedChapterContent,
      updatedIsOptional,
    });

    if (error) {
      return res.status(apiStatusCodes.NOT_FOUND).json(
        sendAPIResponse({
          status: false,
          message: 'Error updating chapter',
          error,
        })
      );
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        message: 'Chapter updated successfully',
        data,
      })
    );
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: 'Error updating chapter',
        error,
      })
    );
  }
};

const handleDeleteChapter = async (
  req: NextApiRequest,
  res: NextApiResponse,
  projectId: string,
  sectionId: string,
  chapterId: string
) => {
  try {
    const { error } = await deleteChapterFromSectionInDB({
      projectId,
      sectionId,
      chapterId,
    });

    if (error) {
      return res.status(apiStatusCodes.NOT_FOUND).json(
        sendAPIResponse({
          status: false,
          message: 'Error deleting chapter',
          error,
        })
      );
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        message: 'Chapter deleted successfully',
      })
    );
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: 'Error deleting chapter',
        error,
      })
    );
  }
};

export default handler;
