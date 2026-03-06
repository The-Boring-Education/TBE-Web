import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes, APTITUDE_SUB_CATEGORY_FORMAT_MAP } from "@/lib/constants";
import type { AptitudeSubCategoryType } from "@/lib/interfaces";
import {
    addAptitudeTopicToDB,
    getAllAptitudeTopicsFromDB,
    getAptitudeTopicsWithQuestionCountFromDB,
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
    const { category, subCategory, withCounts } = req.query;

    if (withCounts === "true") {
        const { data, error } = await getAptitudeTopicsWithQuestionCountFromDB({
            category: category as any,
            subCategory: subCategory as any,
        });
        if (error) return res.status(500).json(sendAPIResponse({ status: false, error }));
        return res.status(200).json(sendAPIResponse({ status: true, data }));
    }

    const { data, error } = await getAllAptitudeTopicsFromDB({
        category: category as any,
        subCategory: subCategory as any,
        isActive: true,
    });

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

    const { name, slug, description, category, subCategory, order } = req.body;

    if (!name || !slug || !category || !subCategory) {
        return res.status(apiStatusCodes.BAD_REQUEST).json(
            sendAPIResponse({
                status: false,
                message: "Required: name, slug, category, subCategory",
            })
        );
    }

    const answerFormatType = APTITUDE_SUB_CATEGORY_FORMAT_MAP[subCategory as AptitudeSubCategoryType];
    if (!answerFormatType) {
        return res.status(apiStatusCodes.BAD_REQUEST).json(
            sendAPIResponse({ status: false, message: "Invalid subCategory" })
        );
    }

    const { data, error } = await addAptitudeTopicToDB({
        name,
        slug,
        description,
        category,
        subCategory,
        answerFormatType,
        order: order || 0,
    });

    if (error) {
        return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
            sendAPIResponse({ status: false, message: "Failed to create topic", error })
        );
    }

    return res.status(apiStatusCodes.RESOURCE_CREATED).json(
        sendAPIResponse({ status: true, data, message: "Topic created" })
    );
};

export default handler;
