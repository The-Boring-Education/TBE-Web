import { LEADERBOARD_PERIOD_TYPES } from "@tbe/constants";
import {
  getPreviousPeriodKey,
  isLeaderboardType,
} from "@tbe/utils/leaderboard";
import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import { closePeriod, PeriodCloseError } from "@/lib/database";
import { sendLeaderboardTopFinishEmail } from "@/lib/services/leaderboardEmail";
import { sendAPIResponse } from "@/lib/utils";
import { ensureAdminAccessOrSecret } from "@/middleware/admin";
import { withApiHandler } from "@/middleware/requestLogger";

/**
 * POST /api/v1/leaderboard/close-period
 * Body: { type?: "DAILY"|"WEEKLY"|"MONTHLY", periodKey?: string }
 *
 * Closes a finished Period: freezes Champions and emails top finishers.
 * Omit `type` to close the previous Period of every type (the scheduled cron call).
 * Idempotent — safe to retry. Auth: admin JWT or `x-admin-secret`.
 */
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(apiStatusCodes.METHOD_NOT_ALLOWED).json(
      sendAPIResponse({
        status: false,
        message: `Method ${req.method} Not Allowed`,
      }),
    );
  }

  if (!(await ensureAdminAccessOrSecret(req, res))) return;

  const { type, periodKey } = (req.body ?? {}) as {
    type?: unknown;
    periodKey?: unknown;
  };
  if (type !== undefined && !isLeaderboardType(type)) {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({ status: false, message: "Invalid leaderboard type" }),
    );
  }
  if (periodKey !== undefined && (type === undefined || typeof periodKey !== "string")) {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: false,
        message: "periodKey requires a type",
      }),
    );
  }

  const now = new Date();
  const types = type ? [type] : LEADERBOARD_PERIOD_TYPES;

  try {
    const results = [];
    for (const t of types) {
      results.push(
        await closePeriod({
          type: t,
          periodKey:
            (periodKey as string | undefined) ?? getPreviousPeriodKey(t, now),
          notify: sendLeaderboardTopFinishEmail,
          now,
        }),
      );
    }
    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        message: "Periods closed",
        data: results,
      }),
    );
  } catch (error) {
    if (error instanceof PeriodCloseError) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({ status: false, message: error.message }),
      );
    }
    throw error;
  }
};

export default withApiHandler(handler);
