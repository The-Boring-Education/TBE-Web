// Conditional imports to avoid issues when Next.js is not available
let NextApiRequest: any;
let getSession: any;

try {
  const next = require("next");
  const nextAuth = require("next-auth/react");
  NextApiRequest = next.NextApiRequest;
  getSession = nextAuth.getSession;
} catch (error) {
  // Next.js not available, define fallback types
  NextApiRequest = class {};
  getSession = () => Promise.resolve(null);
}

export interface AuthUser {
    id: string
    email: string
    name?: string
    image?: string
}

/**
 * Get authenticated user from Next.js API request
 */
export const getAuthenticatedUser = async (
    req: typeof NextApiRequest
): Promise<AuthUser | null> => {
    try {
        const session = await getSession({ req })

        if (!session?.user) {
            return null
        }

        return {
            id: session.user.id || "",
            email: session.user.email || "",
            name: session.user.name || undefined,
            image: session.user.image || undefined
        }
    } catch (error) {
        console.error("Error getting authenticated user:", error)
        return null
    }
}

/**
 * Validate if user is authenticated
 */
export const isAuthenticated = async (
    req: typeof NextApiRequest
): Promise<boolean> => {
    const user = await getAuthenticatedUser(req)
    return user !== null
}

/**
 * Check if user has required role (extend as needed)
 */
export const hasRole = async (
    req: typeof NextApiRequest,
    requiredRole: string
): Promise<boolean> => {
    const user = await getAuthenticatedUser(req)
    if (!user) return false

    // This would need to be extended based on your user model
    // For now, just return true if authenticated
    return true
}
