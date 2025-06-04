import type { NextApiRequest, NextApiResponse } from 'next';

import {
  addPlaylistToDB,
  addUserPlaylistToDB,
  checkPlaylistExistsByID,
  updateReferredByInPlaylist,
  updateTagsInPlaylist,
} from '@/database';

import { apiStatusCodes } from '@/constant';
import { connectDB } from '@/middlewares';
import { sendAPIResponse } from '@/utils';
import { extractPlaylistId, fetchPlaylistData } from '@/utils';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await connectDB();
  const { query } = req;
  const { userId } = query as { userId: string };

  switch (req.method) {
    case 'POST':
      return handleAddBulkPlaylist(req, res, userId);
    default:
      return res.status(apiStatusCodes.BAD_REQUEST).json({
        success: false,
        message: `Method ${req.method} not allowed`,
      });
  }
};

const handleAddBulkPlaylist = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  const { playlists } = req.body; // Array of playlist URLs with optional tags

  if (!Array.isArray(playlists) || playlists.length === 0) {
    return res.status(apiStatusCodes.BAD_REQUEST).json({
      success: false,
      message: 'No playlists provided',
    });
  }

  const addedPlaylists = [];
  const failedPlaylists = [];

  for (const playlistData of playlists) {
    const { playlistUrl, tags } = playlistData;
    const playlistId = extractPlaylistId(playlistUrl);

    if (!playlistId) {
      failedPlaylists.push({ playlistUrl, error: 'Invalid playlist URL' });
      continue; // Skip invalid playlist
    }

    const { data: existingPlaylist } = await checkPlaylistExistsByID(
      playlistId
    );

    if (existingPlaylist) {
      // 1. Add playlist to user
      if (userId) await addUserPlaylistToDB(userId, existingPlaylist._id);

      // 2. Increment referredBy in playlist
      await updateReferredByInPlaylist(existingPlaylist._id, true);

      // 3. Update tags if provided
      if (tags) await updateTagsInPlaylist(existingPlaylist._id, tags);

      addedPlaylists.push(existingPlaylist);
      continue;
    }

    try {
      const playlistFetchedData = await fetchPlaylistData(playlistId);

      if (!playlistFetchedData) {
        failedPlaylists.push({
          playlistUrl,
          error: 'Failed to fetch playlist from YouTube',
        });
        continue;
      }

      const { error, data: newPlaylist } = await addPlaylistToDB({
        ...playlistFetchedData,
        tags,
      });

      if (error) {
        failedPlaylists.push({
          playlistUrl,
          error: 'Failed to add playlist to DB',
        });
        continue;
      }

      if (userId) {
        const { error: userPlaylistError } = await addUserPlaylistToDB(
          userId,
          newPlaylist._id
        );
        if (userPlaylistError) {
          failedPlaylists.push({
            playlistUrl,
            error: 'Failed to link user and playlist',
          });
          continue;
        }
      }

      addedPlaylists.push(newPlaylist);
    } catch (error) {
      failedPlaylists.push({
        playlistUrl,
        error: `Unexpected error: ${error}`,
      });
    }
  }

  return res.status(apiStatusCodes.OKAY).json(
    sendAPIResponse({
      status: true,
      message: `Bulk playlist processing completed: ${addedPlaylists.length} added, ${failedPlaylists.length} failed`,
      data: {
        addedPlaylists,
        failedPlaylists,
      },
    })
  );
};

export default handler;
