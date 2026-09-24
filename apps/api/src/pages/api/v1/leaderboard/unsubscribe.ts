import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import { User } from "@/lib/database";
import { verifyLeaderboardUnsubscribeToken } from "@/lib/services/leaderboardEmail";
import { withApiHandler } from "@/middleware/requestLogger";

const page = (title: string, body: string) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>
<style>body{font-family:system-ui,sans-serif;max-width:480px;margin:15vh auto;padding:0 16px;color:#111827;text-align:center}
p{color:#4b5563;line-height:1.5}</style></head>
<body><h1>${title}</h1><p>${body}</p></body></html>`;

/**
 * GET|POST /api/v1/leaderboard/unsubscribe?token=
 *
 * One-click unsubscribe from leaderboard emails. No login; the signed token can
 * only turn the learner's leaderboard email preference off.
 */
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET" && req.method !== "POST") {
    res.status(apiStatusCodes.METHOD_NOT_ALLOWED).end();
    return;
  }

  const userId = verifyLeaderboardUnsubscribeToken(req.query.token);
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");

  if (!userId) {
    res
      .status(apiStatusCodes.BAD_REQUEST)
      .send(
        page(
          "Link not valid",
          "This unsubscribe link is invalid. You can turn leaderboard emails off from your TBE settings.",
        ),
      );
    return;
  }

  await User.updateOne(
    { _id: userId },
    { $set: { "leaderboard.emails": false } },
  );

  res
    .status(apiStatusCodes.OKAY)
    .send(
      page(
        "You're unsubscribed",
        "You won't get leaderboard emails any more. You'll still show up on the leaderboard — change that anytime in your TBE settings.",
      ),
    );
};

export default withApiHandler(handler);
