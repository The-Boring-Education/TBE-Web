import type { NextApiRequest, NextApiResponse } from "next";

import {
  exchangeCodeForTokens,
  fetchGoogleUserInfo,
  type OAuthStatePayload,
  signAuthCode,
  verifyToken,
} from "@/lib/auth";
import { createUserInDB, getUserByEmailFromDB } from "@/lib/database";
import { sendAPIResponse } from "@/lib/utils";
import { logger } from "@/lib/utils/logger";
import { connectDB } from "@/middleware/api";

const DEFAULT_ERROR_URL =
  process.env.AUTH_ERROR_REDIRECT_URL || "https://theboringeducation.com";

function redirectWithError(
  res: NextApiResponse,
  state: string | undefined,
  errorCode: string,
) {
  // Only trust redirect_uri from a verified state token — never raw-decode
  if (state) {
    try {
      const payload = verifyToken<OAuthStatePayload>(state);
      if (payload.redirect_uri) {
        const redirectUrl = new URL(payload.redirect_uri);
        redirectUrl.searchParams.set("error", errorCode);
        return res.redirect(302, redirectUrl.toString());
      }
    } catch {
      // State signature invalid — fall through to safe default
    }
  }
  // Redirect to fixed safe URL when state cannot be trusted
  const safeUrl = new URL(DEFAULT_ERROR_URL);
  safeUrl.searchParams.set("error", errorCode);
  return res.redirect(302, safeUrl.toString());
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    return res.status(405).json(
      sendAPIResponse({
        status: false,
        message: "Method not allowed",
      }),
    );
  }

  const { code, state, error: oauthError } = req.query;

  if (oauthError) {
    logger.error("Google OAuth error", { error: oauthError });
    return redirectWithError(res, state as string, "google_oauth_error");
  }

  if (
    !code ||
    !state ||
    typeof code !== "string" ||
    typeof state !== "string"
  ) {
    return res.status(400).json(
      sendAPIResponse({
        status: false,
        message: "Missing code or state parameter",
      }),
    );
  }

  try {
    const statePayload = verifyToken<OAuthStatePayload>(state);
    if (statePayload.type !== "oauth_state") {
      return redirectWithError(res, state, "invalid_state");
    }

    const googleTokens = await exchangeCodeForTokens(code);
    const userInfo = await fetchGoogleUserInfo(googleTokens.access_token);

    if (!userInfo.email || !userInfo.name) {
      return redirectWithError(res, state, "missing_user_info");
    }

    await connectDB();

    let userId: string;
    let isNewUser = false;
    const { data: existingUser } = await getUserByEmailFromDB(userInfo.email);

    if (existingUser) {
      userId = existingUser._id.toString();
      logger.info("User signed in via centralized auth", {
        email: userInfo.email,
      });
    } else {
      isNewUser = true;
      const { data: newUser, error: createError } = await createUserInDB({
        name: userInfo.name,
        email: userInfo.email,
        image: userInfo.picture,
        provider: "google",
        providerAccountId: userInfo.id,
      });

      if (createError || !newUser) {
        logger.error("Failed to create user", {
          error: createError,
        });
        return redirectWithError(res, state, "user_creation_failed");
      }

      userId = newUser._id.toString();
      logger.info("New user created via centralized auth", {
        email: userInfo.email,
      });
    }

    const authCode = signAuthCode(userId, statePayload.redirect_uri, isNewUser);

    const redirectUrl = new URL(statePayload.redirect_uri);
    redirectUrl.searchParams.set("code", authCode);

    return res.redirect(302, redirectUrl.toString());
  } catch (err) {
    logger.error("OAuth callback processing error", {
      error: err instanceof Error ? err.message : String(err),
    });
    return redirectWithError(res, state as string, "auth_failed");
  }
};

export default handler;
