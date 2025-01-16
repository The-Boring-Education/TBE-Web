import { apiStatusCodes } from "@/constant";
import { NextApiRequest, NextApiResponse } from "next";
import { sendAPIResponse } from "@/utils";
import { connectDB } from "@/middlewares";
import { addPlaylist } from "@/utils";
import { getAllPlaylistdata } from "@/database";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await connectDB();

  switch (req.method) {
    case 'POST':
      return handleAddPlaylist(req, res);
    case 'GET':
      return handleGetAllPlaylists(req, res);
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
    const { playlistUrl } = req.body;

    if (!playlistUrl) {
      return res.status(apiStatusCodes.BAD_REQUEST).json({
        status: false,
        message: "Playlist URL is required",
      });
    }
    
    const message = await addPlaylist( playlistUrl);

    return res.status(apiStatusCodes.RESOURCE_CREATED).json({
      success: true,
      message,
    });
  } catch (error: any) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

const handleGetAllPlaylists = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { data, error } = await getAllPlaylistdata();

    if (error) {
      return res.status(apiStatusCodes.BAD_REQUEST).json({
        success: false,
        message: error,
      });
    }

    return res.status(apiStatusCodes.OKAY).json({
      success: true,
      data,
    });
  } catch (error: any) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || 'Failed to fetch playlists',
    });
  }
};

export default handler;