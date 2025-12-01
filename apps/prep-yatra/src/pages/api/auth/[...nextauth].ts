import { createNextAuthHandler, getAuthOptions } from "@tbe/auth"

/**
 * NextAuth configuration for Prep Yatra app
 * 🚀 Plug-and-play setup with PrepYatra-specific onboarding field
 */
const handler = createNextAuthHandler({
    pages: {
        signIn: "/login",
        error: "/login"
    },
    onboardingField: "prepYatra.pyOnboarded"
})

export default handler
export const authOptions = getAuthOptions(handler)
