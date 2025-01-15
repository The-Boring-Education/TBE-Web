import { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/middlewares';
import { apiStatusCodes } from '@/constant';
import { Playlist, getAllPlaylistdata, checkPlaylistExistsByPlaylistId } from '@/database';
import { fetchPlaylistMetadata, fetchPlaylistVideos, extractPlaylistId } from '@/utils/functions';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await connectDB();
  const { method } = req;

  switch (method) {
    case 'POST':
      return handleAddPlaylist(req, res);
    case 'GET':
      return handleGetAllPlaylists(req, res);
    default:
      return res.status(apiStatusCodes.BAD_REQUEST).json({
        success: false,
        message: `Method ${method} not allowed`,
      });
  }
};

 //Function to handle adding a playlist
const handleAddPlaylist = async (req: NextApiRequest, res: NextApiResponse) => {
 
  try {
    const { playlistUrl } = req.body;

    if (!playlistUrl) {
      return res.status(apiStatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Playlist URL is required',
      });
    }

    const playlistId = extractPlaylistId(playlistUrl);
    
    if (!playlistId) {
      return res.status(apiStatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Invalid playlist URL',
      });
    }

  const existingPlaylist = await checkPlaylistExistsByPlaylistId(playlistId);
    
    if (existingPlaylist?.exists) {
      return res.status(apiStatusCodes.OKAY).json({
        success: false,
        message: existingPlaylist.message, 
      });
    }

  const metadata = await fetchPlaylistMetadata(playlistId);
    
    if (!metadata || metadata.success === false) {
      return res.status(apiStatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Failed to fetch playlist metadata from YouTube',
      });
    }

   const allVideos = await fetchPlaylistVideos(playlistId);

    await Playlist.create({
      playlistId,
      playlistName: metadata.playlistName,
      description: metadata.description,
      videos: allVideos,
    });

    return res.status(apiStatusCodes.RESOURCE_CREATED).json({
      success: true,
      message: 'Playlist added successfully',
    });
 
  } catch (error) {
    
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to add playlist',
    });
  }
};

const handleGetAllPlaylists = async (req: NextApiRequest, res: NextApiResponse) => {
 
  try {
    const { data, error } = await getAllPlaylistdata();

    if (error) {
      // Handle error if playlists are not found
      return res.status(apiStatusCodes.BAD_REQUEST).json({
        success: false,
        message: error,
      });
    }

    return res.status(apiStatusCodes.OKAY).json({
      success: true,
      data,
    });
  } catch (error) {

    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to fetch playlists",
    });
  }
};

export default handler;
