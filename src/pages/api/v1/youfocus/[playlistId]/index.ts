import { apiStatusCodes } from '@/constant';
import { NextApiRequest, NextApiResponse } from 'next';
import { sendAPIResponse } from '@/utils';
import { connectDB } from '@/middlewares';
import { getUserPlaylistByIDFromDB, updateUserPlaylistData } from '@/database';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await connectDB();

  const { method ,query } = req;
  const { playlistId, userId } = query as {
    playlistId: string;
    userId: string;
  };

  switch (method) {
    case 'GET':
      return getUserPlaylistById(req, res, playlistId, userId);
    case 'PATCH':
      return handleUpdateUserPlaylist(req, res, playlistId, userId, req.body );
    default:
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: `Method ${req.method} Not Allowed`,
        })
      );
  }
};

const getUserPlaylistById = async (
  req: NextApiRequest,
  res: NextApiResponse,
  playlistId: string,
  userId: string
) => {
  
  const { data, error } = await getUserPlaylistByIDFromDB(playlistId, userId);
  
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
  playlistId: string,
  userId: string,
  updateData: any,
) => {
  const { data, error } = await updateUserPlaylistData(userId, playlistId, updateData);

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
      message: 'Playlist recommended successfully',
      data,
    })
  );
};

export default handler;
