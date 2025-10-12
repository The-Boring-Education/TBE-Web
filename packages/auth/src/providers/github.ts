import GitHubProvider from "next-auth/providers/github"

/**
 * GitHub OAuth provider configuration
 * Requires GITHUB_CLIENT_ID and GITHUB_SECRET environment variables
 */
export const createGitHubProvider = () => {
    const clientId = process.env.GITHUB_CLIENT_ID
    const clientSecret = process.env.GITHUB_SECRET

    if (!clientId || !clientSecret) {
        throw new Error(
            "GITHUB_CLIENT_ID and GITHUB_SECRET environment variables are required"
        )
    }

    return GitHubProvider({
        clientId,
        clientSecret,
        authorization: {
            params: {
                scope: "read:user user:email"
            }
        }
    })
}
