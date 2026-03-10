import { createNextAuthHandler, getAuthOptions } from "@tbe/auth";

/**
 * NextAuth configuration for Quizes app
 * 🚀 Plug-and-play setup with Quiz-specific onboarding field and redirect logic
 */
const handler = createNextAuthHandler({
  pages: {
    signIn: "/login",
    error: "/login",
  },
  enableRedirectLogic: true,
});

export default handler;
export const authOptions = getAuthOptions(handler);
