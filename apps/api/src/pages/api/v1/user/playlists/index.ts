import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import {
  deleteUserPlaylistFromDB,
  getUserPlaylistsFromDB,
} from "@/lib/database";
import { sendAPIResponse } from "@/lib/utils";
import { withApiHandler } from "@/middleware/requestLogger";
import { getAuthenticatedUserId, verifyOwnership } from "@/middleware/userAuth";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method, query } = req;
  const { userId, playlistId } = query as {
    userId: string;
    playlistId: string;
  };

  const authenticatedUserId = getAuthenticatedUserId(req, res);
  if (!authenticatedUserId) return;
  if (!verifyOwnership(authenticatedUserId, userId, res)) return;

  switch (method) {
    case "GET":
      return handleGetUserPlaylists(req, res, authenticatedUserId);
    case "DELETE":
      return handleDeleteUserPlaylist(
        req,
        res,
        authenticatedUserId,
        playlistId,
      );
    default:
      return res.status(apiStatusCodes.BAD_REQUEST).json({
        success: false,
        message: `Method ${method} not allowed`,
      });
  }
};

const handleGetUserPlaylists = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string,
) => {
  try {
    const userPlaylists = await getUserPlaylistsFromDB(userId);

    if (userPlaylists.error) {
      return res.status(apiStatusCodes.NOT_FOUND).json(
        sendAPIResponse({
          status: false,
          message: "User does not have any playlists",
        }),
      );
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        message: "User playlists retrieved successfully",
        data: userPlaylists.data,
      }),
    );
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Error fetching user playlists",
        error,
      }),
    );
  }
};

const handleDeleteUserPlaylist = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string,
  playlistId: string,
) => {
  try {
    const deleteResponse = await deleteUserPlaylistFromDB(userId, playlistId);

    if (deleteResponse.error) {
      return res.status(apiStatusCodes.NOT_FOUND).json(
        sendAPIResponse({
          status: false,
          message: "UserPlaylist not found",
        }),
      );
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        message: "User playlist deleted successfully",
      }),
    );
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Error deleting user playlist",
        error,
      }),
    );
  }
};

export default withApiHandler(handler);
