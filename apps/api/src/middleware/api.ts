import mongoose from "mongoose"
import type { NextApiRequest, NextApiResponse } from "next"

import { apiStatusCodes, envConfig } from "@/lib/constants"
import { sendAPIResponse } from "@/lib/utils"

// Connect to DB
const connectDB = async () => {
    try {
        await mongoose.connect(envConfig.MONGODB_URI)
        console.log("Connected to MongoDB")
    } catch (error) {
        console.error(
            "Error connecting to MongoDB:",
            error,
            envConfig.MONGODB_URI
        )
    }
}

// Admin authentication middleware
const adminMiddleware = async (
    req: NextApiRequest,
    res: NextApiResponse
): Promise<boolean> => {
    try {
        const adminHeader = req.headers["x-admin-secret"]
        const expectedSecret = process.env.ADMIN_SECRET || "TBEAdmin"

        if (!adminHeader || adminHeader !== expectedSecret) {
            res.status(apiStatusCodes.UNAUTHORIZED).json(
                sendAPIResponse({
                    success: false,
                    status: apiStatusCodes.UNAUTHORIZED,
                    error: true,
                    message: "Unauthorized. Admin access required."
                })
            )
            return false
        }

        return true
    } catch (error) {
        res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
            sendAPIResponse({
                success: false,
                status: apiStatusCodes.INTERNAL_SERVER_ERROR,
                error: true,
                message: "Admin authentication error",
                data: error
            })
        )
        return false
    }
}

export { adminMiddleware, connectDB }
