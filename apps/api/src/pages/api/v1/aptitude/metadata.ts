import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import { getAptitudeMetadataFromDB } from "@/lib/database";
import { cors, sendAPIResponse } from "@/lib/utils";
import { connectDB } from "@/middleware/api";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    await cors(req, res);
    await connectDB();

    if (req.method !== "GET") {
        return res.status(apiStatusCodes.METHOD_NOT_ALLOWED).json(
            sendAPIResponse({
                status: false,
                message: `Method ${req.method} Not Allowed`,
            })
        );
    }

    const { data, error } = await getAptitudeMetadataFromDB();

    if (error) {
        return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
            sendAPIResponse({ status: false, error })
        );
    }

    return res.status(apiStatusCodes.OKAY).json(
        sendAPIResponse({ status: true, data })
    );
};

export default handler;
