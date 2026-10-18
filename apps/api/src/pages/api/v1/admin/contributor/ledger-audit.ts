import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import { auditContributionLedger } from "@/lib/database";
import { sendAPIResponse } from "@/lib/utils";
import { logger } from "@/lib/utils/logger";
import { captureAPIError } from "@/lib/utils/sentry";
import { ensureAdminAccessOrSecret } from "@/middleware/admin";
import { withApiHandler } from "@/middleware/requestLogger";

/**
 * POST /api/v1/admin/contributor/ledger-audit
 *
 * Nightly invariant check (docs/contributors/02-contribution-ledger.md §4):
 * `SUM(ledger.delta) === DevRelLead.totalContributionPoints` for every lead.
 * Read-only and idempotent — it never "repairs" a total, because a silent
 * repair would hide the bug. Responds 409 on drift so the scheduled caller
 * fails loudly. Auth: admin JWT or `x-admin-secret`.
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

  try {
    const report = await auditContributionLedger();

    if (report.drifts.length > 0) {
      logger.error("Contribution ledger drift detected", {
        leadsChecked: report.leadsChecked,
        drifts: report.drifts,
      });
      return res.status(apiStatusCodes.CONFLICT).json(
        sendAPIResponse({
          status: false,
          message: `Contribution ledger drift on ${report.drifts.length} lead(s)`,
          data: report,
        }),
      );
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        message: "Contribution ledger invariant holds",
        data: report,
      }),
    );
  } catch (error) {
    captureAPIError(
      error as Error,
      "/api/v1/admin/contributor/ledger-audit",
      "POST",
      apiStatusCodes.INTERNAL_SERVER_ERROR,
    );
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Failed to audit the contribution ledger",
      }),
    );
  }
};

export default withApiHandler(handler);
