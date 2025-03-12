import { apiStatusCodes } from '@/constant';
import { NextApiRequest, NextApiResponse } from 'next';
import { sendAPIResponse } from '@/utils';
import { connectDB } from '@/middlewares';
import {
  updateUserPlaylistData,
  getPlaylistByIdFromDB,
  DeletePlaylistFromDB,
} from '@/database';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await connectDB();

  const { method, query } = req;
  const { playlistId, userId } = query as {
    playlistId: string;
    userId: string;
  };

  switch (method) {
    case 'GET':
      return getPlaylistById(req, res, playlistId, userId);
    case 'DELETE':
      return handleDeletePlaylistById(req, res, playlistId);
    case 'PATCH': {
      const { isRecommended, learningTime } = req.body;
      return handleUpdateUserPlaylist(
        req,
        res,
        playlistId,
        userId,
        isRecommended,
        learningTime
      );
    }
    default:
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: `Method ${req.method} Not Allowed`,
        })
      );
  }
};

const getPlaylistById = async (
  req: NextApiRequest,
  res: NextApiResponse,
  playlistId: string,
  userId?: string
) => {
  const { data, error } = await getPlaylistByIdFromDB(playlistId, userId);

  if (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: 'Error fetching YouFocus',
      })
    );
  }

  if (!data) {
    return res.status(apiStatusCodes.NOT_FOUND).json(
      sendAPIResponse({
        status: false,
        message: 'YouFocus not found',
      })
    );
  }

  return res.status(apiStatusCodes.OKAY).json(
    sendAPIResponse({
      status: true,
      message: 'YouFocus fetched successfully',
      data,
    })
  );
};

const handleUpdateUserPlaylist = async (
  req: NextApiRequest,
  res: NextApiResponse,
  youfocusId: string,
  userId: string,
  isRecommended: boolean,
  learningTime: number
) => {
  const { data, error } = await updateUserPlaylistData(
    userId,
    youfocusId,
    isRecommended,
    learningTime
  );

  if (error) {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: false,
        message: error,
      })
    );
  }

  return res.status(apiStatusCodes.OKAY).json(
    sendAPIResponse({
      status: true,
      message: 'Playlist updated successfully',
      data,
    })
  );
};

const handleDeletePlaylistById = async (
  req: NextApiRequest,
  res: NextApiResponse,
  playlistId: string
) => {
  const { data, error } = await DeletePlaylistFromDB(playlistId);
  if (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: 'Error deleting playlist',
        error: error,
      })
    );
  }
  if (!data) {
    return res.status(apiStatusCodes.NOT_FOUND).json(
      sendAPIResponse({
        status: false,
        message: 'Playlist not found',
      })
    );
  }
  return res.status(apiStatusCodes.OKAY).json(
    sendAPIResponse({
      status: true,
      message: 'Playlist deleted successfully',
    })
  );
};

export default handler;
