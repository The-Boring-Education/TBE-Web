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
            return handleGetChallenges(req, res)
        case "POST":
            return handleCreateChallenge(req, res)
        default:
            return res.status(apiStatusCodes.METHOD_NOT_ALLOWED).json(
                sendAPIResponse({
                    status: false,
                    message: `Method ${req.method} Not Allowed`
                })
            )
    }
}

const handleGetChallenges = async (
    req: NextApiRequest,
    res: NextApiResponse
) => {
    try {
        const { userId: queryUserId } = req.query
        if (!queryUserId) {
            return res.status(apiStatusCodes.BAD_REQUEST).json(
                sendAPIResponse({
                    status: false,
                    message: "User ID is required"
                })
            )
        }

        // Handle both ObjectId and string user IDs
        const userId = String(queryUserId)
        const query: any = {}

        // Check if userId is a valid MongoDB ObjectId (24 hex characters)
        if (/^[0-9a-fA-F]{24}$/.test(userId)) {
            query.user = userId
        } else {
            // For non-ObjectId user IDs (like Google OAuth IDs), we need to handle this differently
            // First, try to find the user in the User collection to get their MongoDB _id
            const { User } = require("@/lib/database")
            const user = await User.findOne({
                $or: [{ email: userId }, { providerAccountId: userId }]
            })

            if (user) {
                query.user = user._id
            } else {
                // If user not found, return empty array instead of error
                return res.status(apiStatusCodes.OKAY).json(
                    sendAPIResponse({
                        status: true,
                        message: "No challenges found for this user",
                        data: []
                    })
                )
            }
        }

        const challenges = await Challenge.find(query).sort({ createdAt: -1 })
        return res.status(apiStatusCodes.OKAY).json(
            sendAPIResponse({
                status: true,
                message: "Challenges retrieved successfully",
                data: challenges
            })
        )
    } catch (error) {
        console.error("Get Challenges Error:", error)
        return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
            sendAPIResponse({
                status: false,
                message: "Internal server error",
                error: error instanceof Error ? error.message : "Unknown error"
            })
        )
    }
}

const handleCreateChallenge = async (
    req: NextApiRequest,
    res: NextApiResponse
) => {
    try {
        const { name, totalDays, category, user, userId } = req.body

        // Accept both 'user' and 'userId' for flexibility
        const userField = user || userId

        if (!name || !totalDays || !userField) {
            return res.status(apiStatusCodes.BAD_REQUEST).json(
                sendAPIResponse({
                    status: false,
                    message: "Name, total days, and user/userId are required"
                })
            )
        }

        // Handle user ID conversion for non-ObjectId user IDs
        let userIdForChallenge = userField

        // Check if userId is a valid MongoDB ObjectId
        if (!/^[0-9a-fA-F]{24}$/.test(userField)) {
            // For non-ObjectId user IDs, find the user in the User collection
            const { User } = require("@/lib/database")
            const userDoc = await User.findOne({
                $or: [{ email: userField }, { providerAccountId: userField }]
            })

            if (!userDoc) {
                return res.status(apiStatusCodes.BAD_REQUEST).json(
                    sendAPIResponse({
                        status: false,
                        message: "User not found"
                    })
                )
            }

            userIdForChallenge = userDoc._id
        }

        const startDate = new Date()
        const endDate = new Date()
        endDate.setDate(startDate.getDate() + totalDays)

        const challenge = new Challenge({
            user: userIdForChallenge,
            name,
            totalDays,
            startDate,
            endDate,
            category,
            currentDay: 0,
            isActive: true
        })

        await challenge.save()
        return res.status(apiStatusCodes.RESOURCE_CREATED).json(
            sendAPIResponse({
                status: true,
                message: "Challenge created successfully",
                data: challenge
            })
        )
    } catch (error) {
        console.error("Create Challenge Error:", error)
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
