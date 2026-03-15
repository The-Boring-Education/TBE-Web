import { createNextAuthHandler, getAuthOptions } from "@tbe/auth";

/**
 * NextAuth configuration for OnCampus app
 * 🚀 Plug-and-play setup with redirect logic enabled
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
