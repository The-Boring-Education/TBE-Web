import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import type { AptitudeUploadPayload } from "@/lib/interfaces";
import { bulkUploadAptitudeDataToDB } from "@/lib/database";
import { cors, sendAPIResponse } from "@/lib/utils";
import { connectDB } from "@/middleware/api";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    await cors(req, res);
    await connectDB();

    if (req.method !== "POST") {
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

    const { topic, questions } = req.body as AptitudeUploadPayload;

    if (!topic) {
        return res.status(apiStatusCodes.BAD_REQUEST).json(
            sendAPIResponse({
                status: false,
                message: "Required: topic (slug string)",
            })
        );
    }

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
        return res.status(apiStatusCodes.BAD_REQUEST).json(
            sendAPIResponse({
                status: false,
                message: "Required: questions array with at least one entry",
            })
        );
    }

    const { data, error } = await bulkUploadAptitudeDataToDB({ topic, questions });

    if (error) {
        return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
            sendAPIResponse({ status: false, message: "Bulk upload failed", error })
        );
    }

    return res.status(apiStatusCodes.OKAY).json(
        sendAPIResponse({
            status: true,
            data,
            message: `Uploaded ${data.questionsInserted} questions for topic "${topic}"`,
        })
    );
};

export default handler;
