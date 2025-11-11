import type { NextApiRequest, NextApiResponse } from "next"

import { apiStatusCodes } from "@/lib/constants"
import { isUserMenteeInDB } from "@/lib/database"
import { sendAPIResponse } from "@/lib/utils"
import { cors } from "@/lib/utils"
import { connectDB } from "@/middleware/api"

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    await cors(req, res)

    if (req.method === "OPTIONS") {
        res.status(200).end()
        return
    }

    await connectDB()

    const { userId } = req.query

    if (!userId || typeof userId !== "string") {
        return res
            .status(apiStatusCodes.BAD_REQUEST)
            .json(sendAPIResponse({ status: false, message: "Invalid userId" }))
    }

    if (req.method !== "GET") {
        return res
            .status(apiStatusCodes.METHOD_NOT_ALLOWED)
            .json(
                sendAPIResponse({
                    status: false,
                    message: `Method ${req.method} not allowed`
                })
            )
    }

    try {
        const { data, error } = await isUserMenteeInDB(userId)
        if (error) {
            return res
                .status(apiStatusCodes.INTERNAL_SERVER_ERROR)
                .json(
                    sendAPIResponse({
                        status: false,
                        message: "Failed to check mentee status",
                        error
                    })
                )
        }
        return res
            .status(apiStatusCodes.OKAY)
            .json(sendAPIResponse({ status: true, data }))
    } catch (error) {
        return res
            .status(apiStatusCodes.INTERNAL_SERVER_ERROR)
            .json(
                sendAPIResponse({
                    status: false,
                    message: "Unexpected error",
                    error
                })
            )
    }
}

export default handler
