import type { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth"
import type { NextAuthOptions } from "next-auth"

/**
 * Server-side authentication middleware for API routes
 *
 * @param authOptions - NextAuth configuration
 * @returns Middleware function
 */
export const withAuth = (authOptions: NextAuthOptions) => {
    return (
        handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
    ) => {
        return async (req: NextApiRequest, res: NextApiResponse) => {
            try {
                const session = await getServerSession(req, res, authOptions)

                if (!session || !session.user) {
                    return res.status(401).json({
                        success: false,
                        error: true,
                        message: "Authentication required"
                    })
                }

                // Attach session to request for handler to use
                ;(req as any).session = session
                ;(req as any).user = session.user

                return handler(req, res)
            } catch (error) {
                console.error("Auth middleware error:", error)
                return res.status(500).json({
                    success: false,
                    error: true,
                    message: "Authentication error"
                })
            }
        }
    }
}

/**
 * Server-side admin authentication middleware
 * Checks if user has admin privileges
 *
 * @param authOptions - NextAuth configuration
 * @param adminEmails - List of admin email addresses
 * @returns Middleware function
 */
export const withAdminAuth = (
    authOptions: NextAuthOptions,
    adminEmails: string[]
) => {
    return (
        handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
    ) => {
        return async (req: NextApiRequest, res: NextApiResponse) => {
            try {
                const session = await getServerSession(req, res, authOptions)

                if (!session || !session.user) {
                    return res.status(401).json({
                        success: false,
                        error: true,
                        message: "Authentication required"
                    })
                }

                if (!adminEmails.includes(session.user.email || "")) {
                    return res.status(403).json({
                        success: false,
                        error: true,
                        message: "Admin access required"
                    })
                }

                // Attach session to request for handler to use
                ;(req as any).session = session
                ;(req as any).user = session.user

                return handler(req, res)
            } catch (error) {
                console.error("Admin auth middleware error:", error)
                return res.status(500).json({
                    success: false,
                    error: true,
                    message: "Authentication error"
                })
            }
        }
    }
}
