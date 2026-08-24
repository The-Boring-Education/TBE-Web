import type { NextApiRequest, NextApiResponse } from "next";

import { buildGoogleAuthUrl, signOAuthState } from "@/lib/auth";
import { sendAPIResponse } from "@/lib/utils";

const ALLOWED_PROVIDERS = ["google"] as const;

const isAllowedRedirect = (url: string): boolean => {
  try {
    const { hostname } = new URL(url);
    if (hostname === "localhost" || hostname === "127.0.0.1") return true;
    if (hostname.endsWith(".theboringeducation.com")) return true;
    // TBE Vercel previews only: require both the `tbe-` prefix and the `-tbe`
    // team-slug suffix so an attacker-created `evil-tbe.vercel.app` can't be used
    // as an OAuth redirect target.
    if (hostname.startsWith("tbe-") && hostname.endsWith("-tbe.vercel.app"))
      return true;

    const allowed = (process.env.ALLOWED_AUTH_ORIGINS || "")
      .split(",")
      .filter(Boolean);

    return allowed.some((origin) => {
      try {
        return new URL(origin).hostname === hostname;
      } catch {
        return false;
      }
    });
  } catch {
    return false;
  }
};

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method !== "GET") {
      return res.status(405).json(
        sendAPIResponse({
          status: false,
          message: "Method not allowed",
        }),
      );
    }

    const { provider, redirect_uri } = req.query;

    if (!redirect_uri || typeof redirect_uri !== "string") {
      return res.status(400).json(
        sendAPIResponse({
          status: false,
          message: "redirect_uri is required",
        }),
      );
    }

    if (!isAllowedRedirect(redirect_uri)) {
      return res.status(400).json(
        sendAPIResponse({
          status: false,
          message: "Invalid redirect_uri origin",
        }),
      );
    }

    const providerStr = (provider as string) || "google";
    if (
      !ALLOWED_PROVIDERS.includes(
        providerStr as (typeof ALLOWED_PROVIDERS)[number],
      )
    ) {
      return res.status(400).json(
        sendAPIResponse({
          status: false,
          message: `Unsupported provider: ${providerStr}. Supported: ${ALLOWED_PROVIDERS.join(", ")}`,
        }),
      );
    }

    const state = signOAuthState(redirect_uri, providerStr);

    if (providerStr === "google") {
      return res.redirect(302, buildGoogleAuthUrl(state));
    }

    return res.status(400).json(
      sendAPIResponse({
        status: false,
        message: "Provider not implemented",
      }),
    );
  } catch (error: any) {
    console.error("[Login Handler Error]:", error);
    return res.status(500).json(
      sendAPIResponse({
        status: false,
        message: error.message || "Internal server error",
      }),
    );
  }
};

export default handler;
