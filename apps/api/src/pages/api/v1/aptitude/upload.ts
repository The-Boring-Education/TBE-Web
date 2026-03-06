import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes, APTITUDE_SUB_CATEGORY_FORMAT_MAP } from "@/lib/constants";
import type { AptitudeSubCategoryType, AptitudeUploadPayload } from "@/lib/interfaces";
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

    const { topics } = req.body as AptitudeUploadPayload;

    if (!topics || !Array.isArray(topics) || topics.length === 0) {
        return res.status(apiStatusCodes.BAD_REQUEST).json(
            sendAPIResponse({
                status: false,
                message: "Required: topics array with at least one entry",
            })
        );
    }

    for (const topic of topics) {
        if (!topic.name || !topic.slug || !topic.category || !topic.subCategory) {
            return res.status(apiStatusCodes.BAD_REQUEST).json(
                sendAPIResponse({
                    status: false,
                    message: `Each topic needs: name, slug, category, subCategory. Missing in "${topic.name || "unknown"}"`,
                })
            );
        }

        const formatType = APTITUDE_SUB_CATEGORY_FORMAT_MAP[topic.subCategory as AptitudeSubCategoryType];
        if (!formatType) {
            return res.status(apiStatusCodes.BAD_REQUEST).json(
                sendAPIResponse({
                    status: false,
                    message: `Invalid subCategory: ${topic.subCategory}`,
                })
            );
        }
        topic.answerFormatType = formatType;
    }

    const { data, error } = await bulkUploadAptitudeDataToDB({ topics });

    if (error) {
        return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
            sendAPIResponse({ status: false, message: "Bulk upload failed", error })
        );
    }

    return res.status(apiStatusCodes.OKAY).json(
        sendAPIResponse({
            status: true,
            data,
            message: `Uploaded ${data.topics} topics and ${data.questions} questions`,
        })
    );
};

export default handler;
