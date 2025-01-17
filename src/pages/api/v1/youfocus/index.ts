import { apiStatusCodes } from '@/constant';
import { addAplaylisttoDB, getPlaylistfromIDfromDB } from '@/database';
import { connectDB } from '@/middlewares';
import { sendAPIResponse } from '@/utils';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await connectDB();
  const { method } = req;
  switch (method) {
    case 'POST':
      return handleAddPlaylist(req, res);
    default:
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: `Method ${req.method} Not Allowed`,
        })
      );
  }
};
const handleAddPlaylist = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { query } = req;
    const { playlistLink } = query as { playlistLink: string };
    if (!playlistLink)
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: `Playlist Link is required`,
        })
      );

    const urlParams = new URL(playlistLink).searchParams;
    const playlistId = urlParams.get('list');

    if (!playlistId)
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: `Invalid playlist Link`,
        })
      );

    const { error: courseAlreadyExist } = await getPlaylistfromIDfromDB(
      playlistId
    );

    if (!courseAlreadyExist) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: 'Playlist already exists',
        })
      );
    }

    const { error: errorInAddToDatabase, data: AddedToDatabse } =
      await addAplaylisttoDB(playlistId);

    if (errorInAddToDatabase)
      return res.status(apiStatusCodes.NOT_FOUND).json(
        sendAPIResponse({
          status: false,
          message: 'Failed to add playlist',
          error: errorInAddToDatabase,
        })
      );
    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        message: 'Playlist successfully Added',
        data: AddedToDatabse,
      })
    );
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: 'Failed while adding playlist',
        error: error,
      })
    );
  }
};

export default handler