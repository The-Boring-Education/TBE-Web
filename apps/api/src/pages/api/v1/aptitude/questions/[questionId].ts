import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import { updateAptitudeQuestionInDB } from "@/lib/database";
import { cors, sendAPIResponse } from "@/lib/utils";
import { connectDB } from "@/middleware/api";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    await cors(req, res);
    await connectDB();

    const { questionId } = req.query;
    if (!questionId || typeof questionId !== "string") {
        return res.status(apiStatusCodes.BAD_REQUEST).json(
            sendAPIResponse({ status: false, message: "questionId is required" })
        );
    }

    if (req.method !== "PATCH") {
        return res.status(apiStatusCodes.METHOD_NOT_ALLOWED).json(
            sendAPIResponse({
                status: false,
                message: `Method ${req.method} Not Allowed`,
            })
        );
    }

    const adminSecret = req.headers["x-admin-secret"];
    if (adminSecret !== process.env.ADMIN_SECRET) {
        return res.status(apiStatusCodes.UNAUTHORIZED).json(
            sendAPIResponse({ status: false, message: "Unauthorized" })
        );
    }

    const { question, options, answer, difficulty, order, isActive } = req.body;
    const updates: any = {};
    if (question !== undefined) updates.question = question;
    if (options !== undefined) updates.options = options;
    if (answer !== undefined) updates.answer = answer;
    if (difficulty !== undefined) updates.difficulty = difficulty;
    if (order !== undefined) updates.order = order;
    if (isActive !== undefined) updates.isActive = isActive;

    const { data, error } = await updateAptitudeQuestionInDB(questionId, updates);
    if (error) {
        return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
            sendAPIResponse({ status: false, error })
        );
    }

    return res.status(200).json(
        sendAPIResponse({ status: true, data, message: "Question updated" })
    );
};

export default handler;
