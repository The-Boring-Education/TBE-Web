import type { NextApiRequest, NextApiResponse } from "next"

import { apiStatusCodes } from "@/lib/constants"
import { getAllEnrolledProjectsFromDB } from "@/lib/database"
import { sendAPIResponse } from "@/lib/utils"
import { cors } from "@/lib/utils"
import { connectDB } from "@/middleware/api"

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    // Apply CORS headers
    await cors(req, res)

    if (req.method === "OPTIONS") {
        res.status(200).end()
        return
    }

    try {
        await connectDB()

        const { method, query } = req
        const { userId } = query

        switch (method) {
            case "GET":
                return handleGetAllUserProjects(req, res, userId as string)
            default:
                return res.status(apiStatusCodes.BAD_REQUEST).json(
                    sendAPIResponse({
                        status: false,
                        message: `Method ${req.method} Not Allowed`
                    })
                )
        }
    } catch (error) {
        return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
            sendAPIResponse({
                status: false,
                message: `Something went wrong`,
                error
            })
        )
    }
}

const handleGetAllUserProjects = async (
    req: NextApiRequest,
    res: NextApiResponse,
    userId: string
) => {
    try {
        const { data: allProjects, error: fetchEnrolledProjectError } =
            await getAllEnrolledProjectsFromDB(userId)

        if (fetchEnrolledProjectError) {
            return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
                sendAPIResponse({
                    status: false,
                    message: "Failed while fetching enrolled projects"
                })
            )
        }

        return res.status(apiStatusCodes.OKAY).json(
            sendAPIResponse({
                status: true,
                data: allProjects
            })
        )
    } catch (error) {
        return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
            sendAPIResponse({
                status: false,
                message: "Failed while fetching enrolled projects",
                error
            })
        )
    }
}

export default handler
