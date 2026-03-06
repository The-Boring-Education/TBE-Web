import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import {
    addAptitudeQuestionToDB,
    getAptitudeQuestionsByTopicFromDB,
} from "@/lib/database";
import { cors, sendAPIResponse } from "@/lib/utils";
import { connectDB } from "@/middleware/api";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    await cors(req, res);
    await connectDB();

    switch (req.method) {
        case "GET":
            return handleGet(req, res);
        case "POST":
            return handleCreate(req, res);
        default:
            return res.status(apiStatusCodes.METHOD_NOT_ALLOWED).json(
                sendAPIResponse({
                    status: false,
                    message: `Method ${req.method} Not Allowed`,
                })
            );
    }
};

const handleGet = async (req: NextApiRequest, res: NextApiResponse) => {
    const { topicId, difficulty, page, limit } = req.query;

    if (!topicId) {
        return res.status(apiStatusCodes.BAD_REQUEST).json(
            sendAPIResponse({ status: false, message: "topicId is required" })
        );
    }

    const { data, error } = await getAptitudeQuestionsByTopicFromDB(
        topicId as string,
        {
            difficulty: difficulty as any,
            page: page ? parseInt(page as string) : 1,
            limit: limit ? Math.min(parseInt(limit as string), 100) : 50,
        }
    );

    if (error) return res.status(500).json(sendAPIResponse({ status: false, error }));
    return res.status(200).json(sendAPIResponse({ status: true, data }));
};

const handleCreate = async (req: NextApiRequest, res: NextApiResponse) => {
    const adminSecret = req.headers["x-admin-secret"];
    if (adminSecret !== process.env.ADMIN_SECRET) {
        return res.status(apiStatusCodes.UNAUTHORIZED).json(
            sendAPIResponse({ status: false, message: "Unauthorized" })
        );
    }

    const { topicId, question, options, answer, difficulty, order } = req.body;

    if (!topicId || !question) {
        return res.status(apiStatusCodes.BAD_REQUEST).json(
            sendAPIResponse({
                status: false,
                message: "Required: topicId, question",
            })
        );
    }

    const { data, error } = await addAptitudeQuestionToDB({
        topicId,
        question,
        options,
        answer,
        difficulty: difficulty || "MEDIUM",
        order: order || 0,
    });

    if (error) {
        return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
            sendAPIResponse({ status: false, message: "Failed to create question", error })
        );
    }

    return res.status(apiStatusCodes.RESOURCE_CREATED).json(
        sendAPIResponse({ status: true, data, message: "Question created" })
    );
};

export default handler;
