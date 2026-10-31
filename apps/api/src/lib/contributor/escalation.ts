/**
 * Escalation router — decides where a contributor's message goes.
 *
 * v1 policy:
 *   captain              → calendly (email when no Calendly URL is configured)
 *   lead / contributor   → in-app inbox; high priority for task blockers
 */

import type { Tier } from "./tier";

export type EscalationChannel = "calendly" | "in_app_inbox" | "email";

export type EscalationCategory =
  "mentorship" | "proposal" | "task_blocker" | "general";

export type EscalationPriority = "normal" | "high";

export type EscalationConfig = {
  calendlyUrl?: string;
  fallbackEmail?: string;
};

export type EscalationRoute = {
  channel: EscalationChannel;
  target: string;
  priority: EscalationPriority;
};

const INBOX_TARGET = "inbox";

export const route = (
  tier: Tier,
  category: EscalationCategory,
  cfg: EscalationConfig,
): EscalationRoute => {
  if (tier === "captain") {
    const calendlyUrl = cfg.calendlyUrl?.trim();
    if (calendlyUrl) {
      return { channel: "calendly", target: calendlyUrl, priority: "normal" };
    }

    const fallbackEmail = cfg.fallbackEmail?.trim();
    if (fallbackEmail) {
      return { channel: "email", target: fallbackEmail, priority: "normal" };
    }

    return {
      channel: "in_app_inbox",
      target: INBOX_TARGET,
      priority: "normal",
    };
  }

  return {
    channel: "in_app_inbox",
    target: INBOX_TARGET,
    priority: category === "task_blocker" ? "high" : "normal",
  };
};
