import type { NextApiRequest, NextApiResponse } from "next"

import { apiStatusCodes } from "@/lib/constants"
import {
    createUserInDB,
    getUserByEmailFromDB,
    getUserByIdFromDB,
    getUserDataByUserNameFromDB
} from "@/lib/database"
import type { CreateUserRequestPayloadProps } from "@/lib/interfaces"
import { sendWelcomeEmail } from "@/lib/services"
import { cors, sendAPIResponse } from "@/lib/utils"
import { captureAPIError, captureAuthError } from "@/lib/utils"
import { connectDB } from "@/middleware/api"

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    await cors(req, res)
    await connectDB()

    const { method, query } = req
    const { email, userId, username } = query

    switch (method) {
        case "GET":
            return handleGetUser(
                req,
                res,
                email as string,
                userId as string,
                username as string
            )
        case "POST":
            return handleCreateUser(req, res)
    }
}

const handleGetUser = async (
    req: NextApiRequest,
    res: NextApiResponse,
    email: string,
    userId: string,
    username: string
) => {
    try {
        if (email) {
            const { data, error } = await getUserByEmailFromDB(email)

            if (error) {
                captureAPIError(
                    error as Error,
                    "/api/v1/user",
                    "GET",
                    apiStatusCodes.INTERNAL_SERVER_ERROR,
                    { email }
                )

                return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
                    sendAPIResponse({
                        status: false,
                        error,
                        message: "Error while fetching user"
                    })
                )
            }

            return res
                .status(apiStatusCodes.OKAY)
                .json(sendAPIResponse({ status: true, data }))
        }

        if (userId) {
            const { data, error } = await getUserByIdFromDB(userId)

            if (error) {
                captureAPIError(
                    error as Error,
                    "/api/v1/user",
                    "GET",
                    apiStatusCodes.INTERNAL_SERVER_ERROR,
                    { userId }
                )

                return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
                    sendAPIResponse({
                        status: false,
                        error,
                        message: "Error while fetching user"
                    })
                )
            }

            return res
                .status(apiStatusCodes.OKAY)
                .json(sendAPIResponse({ status: true, data }))
        }

        if (username) {
            const { data, error } = await getUserDataByUserNameFromDB(username)

            if (error) {
                captureAPIError(
                    error as Error,
                    "/api/v1/user",
                    "GET",
                    apiStatusCodes.INTERNAL_SERVER_ERROR,
                    { username }
                )

                return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
                    sendAPIResponse({
                        status: false,
                        error,
                        message: "Error while fetching user"
                    })
                )
            }

            return res
                .status(apiStatusCodes.OKAY)
                .json(sendAPIResponse({ status: true, data }))
        }

        return res.status(apiStatusCodes.BAD_REQUEST).json(
            sendAPIResponse({
                status: false,
                message: "Please provide Email or User id or Username",
                error: "Please provide Email or User id or Username"
            })
        )
    } catch (error) {
        captureAPIError(
            error as Error,
            "/api/v1/user",
            "GET",
            apiStatusCodes.INTERNAL_SERVER_ERROR,
            { email, userId, username }
        )

        return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
            sendAPIResponse({
                status: false,
                error,
                message: "error while fetching user"
            })
        )
    }
}

const handleCreateUser = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const { name, email, provider, image, providerAccountId } =
            req.body as CreateUserRequestPayloadProps

        if (!email || !name) {
            return res.status(apiStatusCodes.BAD_REQUEST).json(
                sendAPIResponse({
                    status: false,
                    error: "Please provide email and name",
                    message: "Error while creating user"
                })
            )
        }

        const { data } = await getUserByEmailFromDB(email)

        if (!data) {
            const { data, error } = await createUserInDB({
                name,
                email,
                provider,
                image,
                providerAccountId
            })

            if (error) {
                return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
                    sendAPIResponse({
                        status: false,
                        error,
                        message: "Error while creating user"
                    })
                )
            }

            // Send welcome email (non-blocking)
            if (data && data._id) {
                sendWelcomeEmail({
                    email,
                    name,
                    id: data._id.toString()
                }).catch((error) => {
                    console.error("Failed to send welcome email:", error)
                    // Don't fail the user creation if email fails
                })
            }

            return res
                .status(apiStatusCodes.OKAY)
                .json(sendAPIResponse({ status: true, data }))
        } else {
            return res.status(apiStatusCodes.OKAY).json(
                sendAPIResponse({
                    status: true,
                    data,
                    message: "User already exists"
                })
            )
        }
    } catch (error) {
        captureAuthError(error as Error, "user_creation", req.body?.email)

        return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
            sendAPIResponse({
                status: false,
                error,
                message: "Error while creating user"
            })
        )
    }
}

export default handler
