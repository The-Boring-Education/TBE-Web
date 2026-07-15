import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import {
  deletePlaylistByTagFromDB,
  getPlaylistByTagFromDB,
} from "@/lib/database";
import { sendAPIResponse } from "@/lib/utils";
import { adminMiddleware } from "@/middleware/api";
import { withApiHandler } from "@/middleware/requestLogger";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case "GET":
      return handleGetPlaylistsBySkill(req, res);
    case "DELETE":
      return handleDeletePlaylistBySkill(req, res);
    default:
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: `Method ${req.method} not allowed`,
        }),
      );
  }
};

const handleGetPlaylistsBySkill = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  const { q } = req.query;

  if (!q || typeof q !== "string") {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: false,
        message: "Query parameter 'q' is required",
      }),
    );
  }

  try {
    const { data, error } = await getPlaylistByTagFromDB(q);

    if (error) {
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({
          status: false,
          message: "Error fetching YouFocus playlists",
          error,
        }),
      );
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        message: "Playlists fetched successfully",
        data,
      }),
    );
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "An unexpected error occurred while fetching playlists",
        error,
      }),
    );
  }
};

const handleDeletePlaylistBySkill = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  const isAdmin = await adminMiddleware(req, res);
  if (!isAdmin) return;

  const { q } = req.query;

  if (!q || typeof q !== "string") {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: false,
        message: "Query parameter 'q' is required",
      }),
    );
  }

  try {
    const { data, error } = await deletePlaylistByTagFromDB(q);

    if (error) {
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({
          status: false,
          message: "Error deleting YouFocus playlists",
          error,
        }),
      );
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        message: "Playlists deleted successfully",
        data,
      }),
    );
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "An unexpected error occurred while deleting playlists",
        error,
      }),
    );
  }
};

export default withApiHandler(handler);
