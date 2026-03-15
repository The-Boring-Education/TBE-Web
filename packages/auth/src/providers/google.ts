import GoogleProvider from "next-auth/providers/google";

/**
 * Google OAuth provider configuration
 * Requires GOOGLE_AUTH_CLIENT_ID and GOOGLE_AUTH_CLIENT_SECRET environment variables
 */
export const createGoogleProvider = () => {
  const clientId = process.env.GOOGLE_AUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_AUTH_CLIENT_SECRET;

  if (!clientId) {
    throw new Error("GOOGLE_AUTH_CLIENT_ID environment variable is required");
  } else if (!clientSecret) {
    throw new Error(
      "GOOGLE_AUTH_CLIENT_SECRET environment variable is required",
    );
  }

  return GoogleProvider({
    clientId,
    clientSecret,
    authorization: {
      params: {
        scope: "openid email profile",
      },
    },
  });
};
