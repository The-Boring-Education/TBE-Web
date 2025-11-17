import type { NextApiRequest, NextApiResponse } from "next"

import { apiStatusCodes } from "@/lib/constants"
import { Challenge } from "@/lib/database"
import { cors } from "@/lib/utils"
import { sendAPIResponse } from "@/lib/utils"
import { connectDB } from "@/middleware/api"

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    await cors(req, res)

    // Handle OPTIONS request for CORS preflight
    if (req.method === "OPTIONS") {
        return res.status(200).end()
    }

    await connectDB()
    const { method } = req

    switch (method) {
        case "GET":
            return handleGetChallenge(req, res)
        case "PUT":
            return handleUpdateChallenge(req, res)
        case "DELETE":
            return handleDeleteChallenge(req, res)
        default:
            return res.status(apiStatusCodes.METHOD_NOT_ALLOWED).json(
                sendAPIResponse({
                    status: false,
                    message: `Method ${req.method} Not Allowed`
                })
            )
    }
}

const handleGetChallenge = async (
    req: NextApiRequest,
    res: NextApiResponse
) => {
    try {
        const { id } = req.query

        if (!id) {
            return res.status(apiStatusCodes.BAD_REQUEST).json(
                sendAPIResponse({
                    status: false,
                    message: "Challenge ID is required"
                })
            )
        }

        const challenge = await Challenge.findById(id)
        if (!challenge) {
            return res.status(apiStatusCodes.NOT_FOUND).json(
                sendAPIResponse({
                    status: false,
                    message: "Challenge not found"
                })
            )
        }
        return res.status(apiStatusCodes.OKAY).json(
            sendAPIResponse({
                status: true,
                message: "Challenge retrieved successfully",
                data: challenge
            })
        )
    } catch (error) {
        console.error("Get Challenge Error:", error)
        return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
            sendAPIResponse({
                status: false,
                message: "Internal server error",
                error: error instanceof Error ? error.message : "Unknown error"
            })
        )
    }
}

const handleUpdateChallenge = async (
    req: NextApiRequest,
    res: NextApiResponse
) => {
    try {
        const { id } = req.query
        const { name, totalDays, category, isActive } = req.body

        if (!id) {
            return res.status(apiStatusCodes.BAD_REQUEST).json(
                sendAPIResponse({
                    status: false,
                    message: "Challenge ID is required"
                })
            )
        }

        const updatedChallenge = await Challenge.findByIdAndUpdate(
            id,
            { name, totalDays, category, isActive },
            { new: true, runValidators: true }
        )

        if (!updatedChallenge) {
            return res.status(apiStatusCodes.NOT_FOUND).json(
                sendAPIResponse({
                    status: false,
                    message: "Challenge not found"
                })
            )
        }

        return res.status(apiStatusCodes.OKAY).json(
            sendAPIResponse({
                status: true,
                message: "Challenge updated successfully",
                data: updatedChallenge
            })
        )
    } catch (error) {
        console.error("Update Challenge Error:", error)
        return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
            sendAPIResponse({
                status: false,
                message: "Internal server error",
                error: error instanceof Error ? error.message : "Unknown error"
            })
        )
    }
}

const handleDeleteChallenge = async (
    req: NextApiRequest,
    res: NextApiResponse
) => {
    try {
        const { id } = req.query

        if (!id) {
            return res.status(apiStatusCodes.BAD_REQUEST).json(
                sendAPIResponse({
                    status: false,
                    message: "Challenge ID is required"
                })
            )
        }

        const deletedChallenge = await Challenge.findByIdAndDelete(id)

        if (!deletedChallenge) {
            return res.status(apiStatusCodes.NOT_FOUND).json(
                sendAPIResponse({
                    status: false,
                    message: "Challenge not found"
                })
            )
        }

        return res.status(apiStatusCodes.OKAY).json(
            sendAPIResponse({
                status: true,
                message: "Challenge permanently deleted successfully"
            })
        )
    } catch (error) {
        console.error("Delete Challenge Error:", error)
        return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
            sendAPIResponse({
                status: false,
                message: "Internal server error",
                error: error instanceof Error ? error.message : "Unknown error"
            })
        )
    }
}

export default handler
