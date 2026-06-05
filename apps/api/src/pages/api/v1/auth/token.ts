import type { NextApiRequest, NextApiResponse } from "next";

import {
  type AuthCodePayload,
  signAccessToken,
  signRefreshToken,
  verifyToken,
} from "@/lib/auth";
import { getUserByIdFromDB } from "@/lib/database";
import { sendAPIResponse } from "@/lib/utils";
import { logger } from "@/lib/utils/logger";
import { connectDB } from "@/middleware/api";

function buildUserResponse(user: any) {
  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    image: user.image,
    isOnboarded: user.isOnboarded ?? false,
    userName: user.userName,
    occupation: user.occupation,
    purpose: user.purpose,
    contactNo: user.contactNo,
    prepYatra: user.prepYatra,
    dsaYatra: user.dsaYatra,
  };
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "OPTIONS") return res.status(204).end();

  if (req.method !== "POST") {
    return res.status(405).json(
      sendAPIResponse({
        status: false,
        message: "Method not allowed",
      }),
    );
  }

  const { code } = req.body;
  if (!code || typeof code !== "string") {
    return res.status(400).json(
      sendAPIResponse({
        status: false,
        message: "Authorization code is required",
      }),
    );
  }

  try {
    const payload = verifyToken<AuthCodePayload>(code);
    if (payload.type !== "auth_code") {
      return res.status(400).json(
        sendAPIResponse({
          status: false,
          message: "Invalid authorization code",
        }),
      );
    }

    await connectDB();
    const { data: user, error } = await getUserByIdFromDB(payload.sub);

    if (error || !user) {
      return res.status(404).json(
        sendAPIResponse({
          status: false,
          message: "User not found",
        }),
      );
    }

    const accessToken = signAccessToken({
      sub: user._id.toString(),
      email: user.email,
      name: user.name,
      image: user.image,
      isOnboarded: user.isOnboarded,
      userName: user.userName,
    });

    const refreshToken = signRefreshToken(user._id.toString());

    logger.info("Tokens issued", {
      userId: user._id.toString(),
      email: user.email,
    });

    return res.status(200).json(
      sendAPIResponse({
        status: true,
        data: {
          accessToken,
          refreshToken,
          user: buildUserResponse(user),
        },
      }),
    );
  } catch (err) {
    logger.error("Token exchange failed", {
      error: err instanceof Error ? err.message : String(err),
    });
    return res.status(401).json(
      sendAPIResponse({
        status: false,
        message: "Invalid or expired authorization code",
      }),
    );
  }
};

export default handler;
