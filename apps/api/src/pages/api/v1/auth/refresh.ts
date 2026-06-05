import type { NextApiRequest, NextApiResponse } from "next";

import {
  type RefreshTokenPayload,
  signAccessToken,
  verifyToken,
} from "@/lib/auth";
import { getUserByIdFromDB } from "@/lib/database";
import { sendAPIResponse } from "@/lib/utils";
import { connectDB } from "@/middleware/api";

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

  const { refreshToken } = req.body;
  if (!refreshToken || typeof refreshToken !== "string") {
    return res.status(400).json(
      sendAPIResponse({
        status: false,
        message: "Refresh token is required",
      }),
    );
  }

  try {
    const payload = verifyToken<RefreshTokenPayload>(refreshToken);
    if (payload.type !== "refresh") {
      return res.status(400).json(
        sendAPIResponse({
          status: false,
          message: "Invalid refresh token",
        }),
      );
    }

    await connectDB();
    const { data: user } = await getUserByIdFromDB(payload.sub);

    if (!user) {
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

    return res.status(200).json(
      sendAPIResponse({
        status: true,
        data: {
          accessToken,
          user: {
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
          },
        },
      }),
    );
  } catch {
    return res.status(401).json(
      sendAPIResponse({
        status: false,
        message: "Invalid or expired refresh token",
      }),
    );
  }
};

export default handler;
