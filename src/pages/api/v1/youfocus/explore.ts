import { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/middlewares';
import { apiStatusCodes } from '@/constant';
import { sendAPIResponse } from '@/utils';
import { getPlaylistByTagFromDB, deletePlaylistByTagFromDB } from '@/database';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await connectDB();

  switch (req.method) {
    case 'GET':
      return handleGetPlaylistsBySkill(req, res);
    case 'DELETE':
      return handleDeletePlaylistBySkill(req, res);
    default:
      return res.status(apiStatusCodes.BAD_REQUEST).json({
        success: false,
        message: `Method ${req.method} not allowed`,
      });
  }
};

const handleGetPlaylistsBySkill = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const { q } = req.query;

  if (!q || typeof q !== 'string') {
    return res.status(apiStatusCodes.BAD_REQUEST).json({
      success: false,
      message: "Query parameter 'q' is required",
    });
  }

  try {
    const { data, error } = await getPlaylistByTagFromDB(q);

    if (error) {
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error fetching YouFocus playlists',
        error,
      });
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        message: 'Playlists fetched successfully',
        data,
      })
    );
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'An unexpected error occurred while fetching playlists',
      error,
    });
  }
};

const handleDeletePlaylistBySkill = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const { q } = req.query;

  if (!q || typeof q !== 'string') {
    return res.status(apiStatusCodes.BAD_REQUEST).json({
      success: false,
      message: "Query parameter 'q' is required",
    });
  }

  try {
    const { data, error } = await deletePlaylistByTagFromDB(q);

    if (error) {
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error deleting YouFocus playlists',
        error,
      });
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        message: 'Playlists deleted successfully',
        data,
      })
    );
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'An unexpected error occurred while deleting playlists',
      error,
    });
  }
};

export default handler;
