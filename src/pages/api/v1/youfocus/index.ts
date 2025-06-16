import type { NextApiRequest, NextApiResponse } from 'next';

import { apiStatusCodes } from '@/constant';
import {
  addPlaylistToDB,
  addUserPlaylistToDB,
  checkPlaylistExistsByID,
  getPlaylistsFromDB,
  updateReferredByInPlaylist,
  updateTagsInPlaylist,
} from '@/database';
import { connectDB } from '@/middlewares';
import { extractPlaylistId, fetchPlaylistData,sendAPIResponse } from '@/utils';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await connectDB();
  const { query } = req;
  const { userId } = query as { userId: string };

  switch (req.method) {
    case 'POST':
      return handleAddPlaylist(req, res, userId);
    case 'GET':
      return handleGetPlaylists(req, res);
    default:
      return res.status(apiStatusCodes.BAD_REQUEST).json({
        success: false,
        message: `Method ${req.method} not allowed`,
      });
  }
};

const handleAddPlaylist = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  const { playlistUrl, tags } = req.body;

  const playlistId = extractPlaylistId(playlistUrl);

  if (!playlistId) {
    return res.status(apiStatusCodes.BAD_REQUEST).json({
      success: false,
      message: 'Invalid playlist URL',
    });
  }

  const { data: existingPlaylist } = await checkPlaylistExistsByID(playlistId);

  if (existingPlaylist) {
    // 1. Add playlist to user
    if (userId) await addUserPlaylistToDB(userId, existingPlaylist._id);

    // 2. Increment referredBy in playlist
    await updateReferredByInPlaylist(existingPlaylist._id, true);

    // 3. If Tags exist, update tags in playlist
    if (tags) {
      const { data } = await updateTagsInPlaylist(existingPlaylist._id, tags);

      return res.status(apiStatusCodes.RESOURCE_CREATED).json(
        sendAPIResponse({
          status: true,
          message: 'Playlist already exists',
          data,
        })
      );
    }

    return res.status(apiStatusCodes.RESOURCE_CREATED).json(
      sendAPIResponse({
        status: true,
        message: 'Playlist already exists',
        data: existingPlaylist,
      })
    );
  }

  // Fetch playlist data from YouTube
  try {
    const playlistData = await fetchPlaylistData(playlistId);

    if (!playlistData) {
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to fetch playlist data from YouTube',
      });
    }

    // Add playlist to the database
    const { error, data: playlist } = await addPlaylistToDB({
      ...playlistData,
      tags,
    });

    if (error) {
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({
          status: false,
          message: 'Failed to add playlist',
          error,
        })
      );
    }

    if (userId) {
      const { error: userPlaylistError } = await addUserPlaylistToDB(
        userId,
        playlist._id
      );

      if (userPlaylistError) {
        return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json({
          status: false,
          message: 'Failed to link user and playlist',
          error: userPlaylistError,
        });
      }
    }

    return res.status(apiStatusCodes.RESOURCE_CREATED).json(
      sendAPIResponse({
        status: true,
        message: 'Playlist added successfully!',
        data: playlist,
      })
    );
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: `We can't fetch this playlist. Try another one.`,
      error,
    });
  }
};

const handleGetPlaylists = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const { data, error } = await getPlaylistsFromDB();

  if (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error fetching playlists',
      error,
    });
  }

  return res.status(apiStatusCodes.OKAY).json(
    sendAPIResponse({
      status: true,
      message: 'playlists fetched successfully',
      data,
    })
  );
};

export default handler;
