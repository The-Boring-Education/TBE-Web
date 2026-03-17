import type { NextApiRequest, NextApiResponse } from "next";

import { type AccessTokenPayload, verifyToken } from "@/lib/auth";
import { getUserByIdFromDB } from "@/lib/database";
import { sendAPIResponse } from "@/lib/utils";
import { connectDB } from "@/middleware/api";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "OPTIONS") return res.status(204).end();

  if (req.method !== "GET") {
    return res.status(405).json(
      sendAPIResponse({
        status: false,
        message: "Method not allowed",
      }),
    );
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json(
      sendAPIResponse({
        status: false,
        message: "No token provided",
      }),
    );
  }

  const token = authHeader.slice(7);

  try {
    const payload = verifyToken<AccessTokenPayload>(token);

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

    return res.status(200).json(
      sendAPIResponse({
        status: true,
        data: {
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
      }),
    );
  } catch {
    return res.status(401).json(
      sendAPIResponse({
        status: false,
        message: "Invalid or expired token",
      }),
    );
  }
};

export default handler;
