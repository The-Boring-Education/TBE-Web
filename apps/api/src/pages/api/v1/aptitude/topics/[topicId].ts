import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import {
    getAptitudeTopicByIdFromDB,
    updateAptitudeTopicInDB,
} from "@/lib/database";
import { cors, sendAPIResponse } from "@/lib/utils";
import { connectDB } from "@/middleware/api";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    await cors(req, res);
    await connectDB();

    const { topicId } = req.query;
    if (!topicId || typeof topicId !== "string") {
        return res.status(apiStatusCodes.BAD_REQUEST).json(
            sendAPIResponse({ status: false, message: "topicId is required" })
        );
    }

    switch (req.method) {
        case "GET":
            return handleGet(topicId, res);
        case "PATCH":
            return handleUpdate(req, topicId, res);
        default:
            return res.status(apiStatusCodes.METHOD_NOT_ALLOWED).json(
                sendAPIResponse({
                    status: false,
                    message: `Method ${req.method} Not Allowed`,
                })
            );
    }
};

const handleGet = async (topicId: string, res: NextApiResponse) => {
    const { data, error } = await getAptitudeTopicByIdFromDB(topicId);
    if (error) return res.status(404).json(sendAPIResponse({ status: false, error }));
    return res.status(200).json(sendAPIResponse({ status: true, data }));
};

const handleUpdate = async (
    req: NextApiRequest,
    topicId: string,
    res: NextApiResponse
) => {
    const adminSecret = req.headers["x-admin-secret"];
    if (adminSecret !== process.env.ADMIN_SECRET) {
        return res.status(apiStatusCodes.UNAUTHORIZED).json(
            sendAPIResponse({ status: false, message: "Unauthorized" })
        );
    }

    const { name, description, order, isActive } = req.body;
    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (order !== undefined) updates.order = order;
    if (isActive !== undefined) updates.isActive = isActive;

    const { data, error } = await updateAptitudeTopicInDB(topicId, updates);
    if (error) {
        return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
            sendAPIResponse({ status: false, error })
        );
    }
    return res.status(200).json(sendAPIResponse({ status: true, data }));
};

export default handler;
