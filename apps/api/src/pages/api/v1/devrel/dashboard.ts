import type { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth"

import { apiStatusCodes } from "@/lib/constants"
import { DevRelLead, DevRelTask, User } from "@/lib/database"
import { sendAPIResponse } from "@/lib/utils"
import { connectDB } from "@/middleware/api"
import { authOptions } from "@/pages/api/auth/[...nextauth]"

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== "GET") {
        return res.status(apiStatusCodes.METHOD_NOT_ALLOWED).json(
            sendAPIResponse({
                status: false,
                message: "Method not allowed"
            })
        )
    }

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

        if (user.occupation === "DEVREL_ADVOCATE") {
            return handleAdvocateDashboard(req, res)
        } else if (user.occupation === "DEVREL_LEAD") {
            return handleLeadDashboard(req, res, user.email)
        } else {
            return res.status(apiStatusCodes.FORBIDDEN).json(
                sendAPIResponse({
                    status: false,
                    message:
                        "Access denied. Only DevRel members can access dashboard."
                })
            )
        }
    } catch (error) {
        console.error("Error fetching dashboard data:", error)
        return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
            sendAPIResponse({
                status: false,
                error,
                message: "Internal server error while fetching dashboard data"
            })
        )
    }
}

const handleAdvocateDashboard = async (
    req: NextApiRequest,
    res: NextApiResponse
) => {
    try {
        // Get application statistics
        const applicationStats = await DevRelLead.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: null,
                    statusCounts: {
                        $push: {
                            status: "$_id",
                            count: "$count"
                        }
                    },
                    total: { $sum: "$count" }
                }
            }
        ])

        // Get recent applications
        const recentApplications = await DevRelLead.find({})
            .populate("reviewedBy", "name email")
            .sort({ createdAt: -1 })
            .limit(10)

        // Get accessible leads for performance data
        const accessibleLeads = await DevRelLead.find({
            status: {
                $in: ["approved", "offer_sent", "offer_accepted", "onboarded"]
            }
        }).sort({ createdAt: -1 })

        // Get task statistics
        const taskStats = await DevRelTask.aggregate([
            { $match: { isActive: true } },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: null,
                    statusCounts: {
                        $push: {
                            status: "$_id",
                            count: "$count"
                        }
                    },
                    total: { $sum: "$count" }
                }
            }
        ])

        // Get overdue tasks
        const overdueTasks = await DevRelTask.find({
            dueDate: { $lt: new Date() },
            status: { $ne: "completed" },
            isActive: true
        })

        // Process data for dashboard
        const stats = applicationStats[0] || { statusCounts: [], total: 0 }
        const applicationCounts = {
            total: stats.total,
            pending:
                stats.statusCounts.find((s: any) => s.status === "applied")
                    ?.count || 0,
            approved:
                stats.statusCounts.find((s: any) => s.status === "approved")
                    ?.count || 0,
            rejected:
                stats.statusCounts.find((s: any) => s.status === "rejected")
                    ?.count || 0
        }

        const taskStatsData = taskStats[0] || { statusCounts: [], total: 0 }
        const taskCounts = {
            total: taskStatsData.total,
            active: taskStatsData.statusCounts
                .filter((s: any) =>
                    ["pending", "in_progress"].includes(s.status)
                )
                .reduce((sum: number, s: any) => sum + s.count, 0),
            completed:
                taskStatsData.statusCounts.find(
                    (s: any) => s.status === "completed"
                )?.count || 0,
            overdue: overdueTasks.length
        }

        const performanceData = accessibleLeads.map((lead) => ({
            leadId: lead._id.toString(),
            name: lead.name,
            email: lead.email,
            tasksCompleted: lead.performanceMetrics.tasksCompleted,
            completionRate:
                lead.performanceMetrics.tasksAssigned > 0
                    ? (lead.performanceMetrics.tasksCompleted /
                          lead.performanceMetrics.tasksAssigned) *
                      100
                    : 0,
            lastActivity:
                lead.performanceMetrics.lastActivityAt || lead.updatedAt
        }))

        const dashboardData = {
            applications: {
                ...applicationCounts,
                recent: recentApplications
            },
            leads: {
                total: accessibleLeads.length,
                active: accessibleLeads.filter(
                    (lead) => lead.status === "onboarded"
                ).length,
                onboarding: accessibleLeads.filter((lead) =>
                    ["approved", "offer_sent", "offer_accepted"].includes(
                        lead.status
                    )
                ).length,
                performanceData
            },
            tasks: taskCounts
        }

        return res.status(apiStatusCodes.OKAY).json(
            sendAPIResponse({
                status: true,
                data: dashboardData,
                message: "Advocate dashboard data fetched successfully"
            })
        )
    } catch (error) {
        console.error("Error fetching advocate dashboard:", error)
        return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
            sendAPIResponse({
                status: false,
                error,
                message: "Failed to fetch advocate dashboard data"
            })
        )
    }
}

const handleLeadDashboard = async (
    req: NextApiRequest,
    res: NextApiResponse,
    userEmail: string
) => {
    try {
        // Get lead information
        const lead = await DevRelLead.findOne({ email: userEmail })

        if (!lead) {
            return res.status(apiStatusCodes.NOT_FOUND).json(
                sendAPIResponse({
                    status: false,
                    message: "DevRel Lead profile not found"
                })
            )
        }

        // Check if lead has dashboard access
        if (!lead.canAccessDashboard) {
            return res.status(apiStatusCodes.FORBIDDEN).json(
                sendAPIResponse({
                    status: false,
                    message:
                        "Dashboard access not granted. Please wait for approval."
                })
            )
        }

        // Get all tasks for this lead
        const allTasks = await DevRelTask.findForLead(
            lead._id.toString()
        ).populate("createdBy", "name email")

        // Get onboarding tasks to calculate progress
        const onboardingTasks = await DevRelTask.find({
            type: "onboarding",
            isActive: true
        }).sort({ createdAt: 1 })

        // Categorize tasks by status for this lead
        const tasks = allTasks.reduce(
            (
                acc: {
                    pending: any[]
                    inProgress: any[]
                    completed: any[]
                    overdue: any[]
                },
                task: any
            ) => {
                const leadStatus = task.getLeadStatus(lead._id.toString())
                const status = leadStatus.status || "pending"

                if (task.isOverdue && status !== "completed") {
                    acc.overdue.push(task)
                } else {
                    switch (status) {
                        case "pending":
                            acc.pending.push(task)
                            break
                        case "in_progress":
                            acc.inProgress.push(task)
                            break
                        case "completed":
                            acc.completed.push(task)
                            break
                        default:
                            acc.pending.push(task)
                    }
                }

                return acc
            },
            {
                pending: [] as any[],
                inProgress: [] as any[],
                completed: [] as any[],
                overdue: [] as any[]
            }
        )

        // Calculate onboarding progress
        const totalOnboardingTasks = onboardingTasks.length
        const completedOnboardingTasks =
            lead.onboardingProgress.completedTasks.length
        const onboardingProgress = {
            totalTasks: totalOnboardingTasks,
            completedTasks: completedOnboardingTasks,
            percentage:
                totalOnboardingTasks > 0
                    ? Math.round(
                          (completedOnboardingTasks / totalOnboardingTasks) *
                              100
                      )
                    : 0,
            nextTask:
                tasks.pending.find((task: any) => task.type === "onboarding") ||
                null
        }

        const dashboardData = {
            lead,
            tasks,
            onboardingProgress,
            performanceMetrics: lead.performanceMetrics
        }

        return res.status(apiStatusCodes.OKAY).json(
            sendAPIResponse({
                status: true,
                data: dashboardData,
                message: "Lead dashboard data fetched successfully"
            })
        )
    } catch (error) {
        console.error("Error fetching lead dashboard:", error)
        return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
            sendAPIResponse({
                status: false,
                error,
                message: "Failed to fetch lead dashboard data"
            })
        )
    }
}

export default handler
