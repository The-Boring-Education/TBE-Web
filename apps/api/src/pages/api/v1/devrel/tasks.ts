import type { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth"

import { apiStatusCodes } from "@/lib/constants"
import { DevRelLead, DevRelTask, User } from "@/lib/database"
import { sendAPIResponse } from "@/lib/utils"
import { connectDB } from "@/middleware/api"
import { authOptions } from "@/pages/api/auth/[...nextauth]"

interface CreateTaskRequest {
    title: string
    description: string
    type: "onboarding" | "weekly" | "special" | "training"
    priority: "low" | "medium" | "high"
    assignedTo?: string[]
    assignedToAll?: boolean
    dueDate?: Date
    estimatedHours?: number
    requirements?: string[]
    resources?: {
        title: string
        url: string
        type: "link" | "document" | "video"
    }[]
    submissionRequired: boolean
    submissionType?: "url" | "text" | "file"
    submissionInstructions?: string
    tags?: string[]
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        await connectDB()

        // Check authentication
        const session = await getServerSession(req, res, authOptions)
        if (!session || !session.user) {
            return res.status(apiStatusCodes.UNAUTHORIZED).json(
                sendAPIResponse({
                    status: false,
                    message: "Authentication required"
                })
            )
        }

        // Get user info
        const user = await User.findOne({ email: session.user.email })
        if (!user) {
            return res.status(apiStatusCodes.NOT_FOUND).json(
                sendAPIResponse({
                    status: false,
                    message: "User not found"
                })
            )
        }

        if (req.method === "GET") {
            return handleGetTasks(req, res, user)
        } else if (req.method === "POST") {
            return handleCreateTask(req, res, user)
        } else if (req.method === "PUT") {
            return handleUpdateTaskProgress(req, res, user)
        } else {
            return res.status(apiStatusCodes.METHOD_NOT_ALLOWED).json(
                sendAPIResponse({
                    status: false,
                    message: "Method not allowed"
                })
            )
        }
    } catch (error) {
        console.error("Error in DevRel tasks API:", error)
        return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
            sendAPIResponse({
                status: false,
                error,
                message: "Internal server error"
            })
        )
    }
}

const handleGetTasks = async (
    req: NextApiRequest,
    res: NextApiResponse,
    user: any
) => {
    const { type, leadId } = req.query

    try {
        let tasks

        if (user.occupation === "DEVREL_LEAD") {
            // DevRel Lead can only see their own tasks
            const lead = await DevRelLead.findOne({ email: user.email })
            if (!lead) {
                return res.status(apiStatusCodes.NOT_FOUND).json(
                    sendAPIResponse({
                        status: false,
                        message: "DevRel Lead profile not found"
                    })
                )
            }

            tasks = await DevRelTask.findForLead(lead._id.toString()).populate(
                "createdBy",
                "name email"
            )
        } else if (user.occupation === "DEVREL_ADVOCATE") {
            // DevRel Advocate can see all tasks or filter by type/lead
            if (leadId && typeof leadId === "string") {
                tasks = await DevRelTask.findForLead(leadId)
                    .populate("createdBy", "name email")
                    .populate("assignedTo", "name email")
            } else if (type && typeof type === "string") {
                tasks = await DevRelTask.findByType(type)
                    .populate("createdBy", "name email")
                    .populate("assignedTo", "name email")
            } else {
                tasks = await DevRelTask.find({ isActive: true })
                    .populate("createdBy", "name email")
                    .populate("assignedTo", "name email")
                    .sort({ createdAt: -1 })
            }
        } else {
            return res.status(apiStatusCodes.FORBIDDEN).json(
                sendAPIResponse({
                    status: false,
                    message:
                        "Access denied. Only DevRel members can access tasks."
                })
            )
        }

        return res.status(apiStatusCodes.OKAY).json(
            sendAPIResponse({
                status: true,
                data: tasks,
                message: "Tasks fetched successfully"
            })
        )
    } catch (error) {
        console.error("Error fetching tasks:", error)
        return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
            sendAPIResponse({
                status: false,
                error,
                message: "Failed to fetch tasks"
            })
        )
    }
}

const handleCreateTask = async (
    req: NextApiRequest,
    res: NextApiResponse,
    user: any
) => {
    // Only DevRel Advocates can create tasks
    if (user.occupation !== "DEVREL_ADVOCATE") {
        return res.status(apiStatusCodes.FORBIDDEN).json(
            sendAPIResponse({
                status: false,
                message: "Only DevRel Advocates can create tasks"
            })
        )
    }

    const taskData: CreateTaskRequest = req.body

    // Validate required fields
    const requiredFields = ["title", "description", "type"]
    const missingFields = requiredFields.filter(
        (field) => !taskData[field as keyof CreateTaskRequest]
    )

    if (missingFields.length > 0) {
        return res.status(apiStatusCodes.BAD_REQUEST).json(
            sendAPIResponse({
                status: false,
                message: `Missing required fields: ${missingFields.join(", ")}`
            })
        )
    }

    try {
        const task = await DevRelTask.create({
            ...taskData,
            createdBy: user._id
        })

        return res.status(apiStatusCodes.RESOURCE_CREATED).json(
            sendAPIResponse({
                status: true,
                data: task,
                message: "Task created successfully"
            })
        )
    } catch (error) {
        console.error("Error creating task:", error)
        return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
            sendAPIResponse({
                status: false,
                error,
                message: "Failed to create task"
            })
        )
    }
}

const handleUpdateTaskProgress = async (
    req: NextApiRequest,
    res: NextApiResponse,
    user: any
) => {
    const { taskId, status, notes, submissionUrl } = req.body

    if (!taskId || !status) {
        return res.status(apiStatusCodes.BAD_REQUEST).json(
            sendAPIResponse({
                status: false,
                message: "Task ID and status are required"
            })
        )
    }

    try {
        const task = await DevRelTask.findById(taskId)

        if (!task) {
            return res.status(apiStatusCodes.NOT_FOUND).json(
                sendAPIResponse({
                    status: false,
                    message: "Task not found"
                })
            )
        }

        let leadId: string

        if (user.occupation === "DEVREL_LEAD") {
            // DevRel Lead updating their own progress
            const lead = await DevRelLead.findOne({ email: user.email })
            if (!lead) {
                return res.status(apiStatusCodes.NOT_FOUND).json(
                    sendAPIResponse({
                        status: false,
                        message: "DevRel Lead profile not found"
                    })
                )
            }
            leadId = lead._id.toString()
        } else if (user.occupation === "DEVREL_ADVOCATE") {
            // DevRel Advocate updating lead's progress (for review/approval)
            leadId = req.body.leadId
            if (!leadId) {
                return res.status(apiStatusCodes.BAD_REQUEST).json(
                    sendAPIResponse({
                        status: false,
                        message: "Lead ID is required for advocates"
                    })
                )
            }
        } else {
            return res.status(apiStatusCodes.FORBIDDEN).json(
                sendAPIResponse({
                    status: false,
                    message: "Access denied"
                })
            )
        }

        // Update task progress
        await task.updateLeadProgress(leadId, status, {
            notes,
            submissionUrl
        })

        // Update lead performance metrics if task is completed
        if (status === "completed") {
            const lead = await DevRelLead.findById(leadId)
            if (lead) {
                lead.performanceMetrics.tasksCompleted += 1
                lead.performanceMetrics.lastActivityAt = new Date()
                await lead.save()
            }
        }

        return res.status(apiStatusCodes.OKAY).json(
            sendAPIResponse({
                status: true,
                data: task,
                message: "Task progress updated successfully"
            })
        )
    } catch (error) {
        console.error("Error updating task progress:", error)
        return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
            sendAPIResponse({
                status: false,
                error,
                message: "Failed to update task progress"
            })
        )
    }
}

export default handler
