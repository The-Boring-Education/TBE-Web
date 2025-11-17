import type { NextApiRequest, NextApiResponse } from "next"

import { apiStatusCodes } from "@/lib/constants"
import {
    deleteSectionFromProjectInDB,
    updateSectionInProjectInDB
} from "@/lib/database"
import type { UpateSectionRequestPayloadProps } from "@/lib/interfaces"
import { sendAPIResponse } from "@/lib/utils"
import { connectDB } from "@/middleware/api"

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    await connectDB()

    const { method, query } = req
    const { projectId, sectionId } = query as {
        projectId: string
        sectionId: string
    }

    switch (method) {
        case "PATCH":
            return handleUpdateSection(req, res, projectId, sectionId)
        case "DELETE":
            return handleDeleteSection(req, res, projectId, sectionId)
        default:
            return res.status(apiStatusCodes.BAD_REQUEST).json(
                sendAPIResponse({
                    status: false,
                    message: `Method ${method} Not Allowed`
                })
            )
    }
}

const handleUpdateSection = async (
    req: NextApiRequest,
    res: NextApiResponse,
    projectId: string,
    sectionId: string
) => {
    try {
        const { updatedSectionName } =
            req.body as UpateSectionRequestPayloadProps

        const { data, error } = await updateSectionInProjectInDB({
            projectId,
            sectionId,
            updatedSectionName
        })

        if (error) {
            return res.status(apiStatusCodes.NOT_FOUND).json(
                sendAPIResponse({
                    status: false,
                    message: "Error updating section",
                    error
                })
            )
        }

        return res.status(apiStatusCodes.OKAY).json(
            sendAPIResponse({
                status: true,
                message: "Section updated successfully",
                data
            })
        )
    } catch (error) {
        return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
            sendAPIResponse({
                status: false,
                message: "Error updating section",
                error
            })
        )
    }
}

const handleDeleteSection = async (
    req: NextApiRequest,
    res: NextApiResponse,
    projectId: string,
    sectionId: string
) => {
    try {
        const { error } = await deleteSectionFromProjectInDB({
            projectId,
            sectionId
        })

        if (error) {
            return res.status(apiStatusCodes.NOT_FOUND).json(
                sendAPIResponse({
                    status: false,
                    message: "Error deleting section",
                    error
                })
            )
        }

        return res.status(apiStatusCodes.OKAY).json(
            sendAPIResponse({
                status: true,
                message: "Section deleted successfully"
            })
        )
    } catch (error) {
        return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
            sendAPIResponse({
                status: false,
                message: "Error deleting section",
                error
            })
        )
    }
}

export default handler
