import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import { updateInterviewSheetInDB } from "@/lib/database";
import { cors, sendAPIResponse } from "@/lib/utils";
import { adminMiddleware, connectDB } from "@/middleware/api";

interface UpdateSheetPricingRequest {
    price: number;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    await cors(req, res);

    if (req.method === "OPTIONS") {
        res.status(200).end();
        return;
    }

    const adminCheck = await adminMiddleware(req, res);
    if (!adminCheck) return; // adminMiddleware handles the response

    await connectDB();

    const { method, query } = req;
    const { sheetId } = query;

    if (!sheetId || typeof sheetId !== "string") {
        return res.status(apiStatusCodes.BAD_REQUEST).json(
            sendAPIResponse({
                status: false,
                message: "Sheet ID is required",
            })
        );
    }

    switch (method) {
        case "PATCH":
            return handleUpdateSheetPricing(req, res, sheetId);

        default:
            return res.status(apiStatusCodes.METHOD_NOT_ALLOWED).json(
                sendAPIResponse({
                    status: false,
                    message: `Method ${method} not allowed`,
                })
            );
    }
};

const handleUpdateSheetPricing = async (
    req: NextApiRequest,
    res: NextApiResponse,
    sheetId: string
) => {
    try {
        const { price }: UpdateSheetPricingRequest = req.body;

        // Validation: Price is required
        if (price === undefined || price === null) {
            return res.status(apiStatusCodes.BAD_REQUEST).json(
                sendAPIResponse({
                    status: false,
                    message: "Price is required",
                })
            );
        }

        // Validate price
        if (price < 0) {
            return res.status(apiStatusCodes.BAD_REQUEST).json(
                sendAPIResponse({
                    status: false,
                    message: "Price cannot be negative",
                })
            );
        }

        const updatedData: { isPremium: boolean; price: number } = {
            isPremium: true,
            price: price,
        };

        const { data: updatedSheet, error } = await updateInterviewSheetInDB({
            sheetId,
            updatedData,
        });

        if (error) {
            return res.status(apiStatusCodes.BAD_REQUEST).json(
                sendAPIResponse({
                    status: false,
                    message: error,
                })
            );
        }

        return res.status(apiStatusCodes.OKAY).json(
            sendAPIResponse({
                status: true,
                message: "Sheet pricing updated successfully",
                data: updatedSheet,
            })
        );
    } catch (error) {
        console.error("Error updating sheet pricing:", error);
        return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
            sendAPIResponse({
                status: false,
                message: "Internal server error while updating sheet pricing",
            })
        );
    }
};

export default handler;

