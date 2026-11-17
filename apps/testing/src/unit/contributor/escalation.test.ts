import { describe, expect, it } from "vitest";

import type {
  EscalationCategory,
  EscalationChannel,
  EscalationPriority,
} from "@/lib/contributor/escalation";
import { route } from "@/lib/contributor/escalation";
import type { Tier } from "@/lib/contributor/tier";

const cfg = {
  calendlyUrl: "https://calendly.com/tbe/founder",
  fallbackEmail: "founder@theboringeducation.com",
};

describe("escalation router", () => {
  const cases: Array<{
    tier: Tier;
    category: EscalationCategory;
    channel: EscalationChannel;
    target: string;
    priority: EscalationPriority;
  }> = (
    [
      "mentorship",
      "proposal",
      "task_blocker",
      "general",
    ] as EscalationCategory[]
  ).flatMap((category) => [
    {
      tier: "captain" as Tier,
      category,
      channel: "calendly" as EscalationChannel,
      target: cfg.calendlyUrl,
      priority: "normal" as EscalationPriority,
    },
    {
      tier: "lead" as Tier,
      category,
      channel: "in_app_inbox" as EscalationChannel,
      target: "inbox",
      priority: (category === "task_blocker"
        ? "high"
        : "normal") as EscalationPriority,
    },
    {
      tier: "contributor" as Tier,
      category,
      channel: "in_app_inbox" as EscalationChannel,
      target: "inbox",
      priority: (category === "task_blocker"
        ? "high"
        : "normal") as EscalationPriority,
    },
  ]);

  it.each(cases)(
    "routes $tier/$category to $channel with $priority priority",
    ({ tier, category, channel, target, priority }) => {
      expect(route(tier, category, cfg)).toEqual({
        channel,
        target,
        priority,
      });
    },
  );

  it("falls back to email for captains when the Calendly URL is missing", () => {
    expect(
      route("captain", "mentorship", { fallbackEmail: cfg.fallbackEmail }),
    ).toEqual({
      channel: "email",
      target: cfg.fallbackEmail,
      priority: "normal",
    });
  });

  it("ignores a blank Calendly URL", () => {
    expect(
      route("captain", "general", {
        calendlyUrl: "   ",
        fallbackEmail: cfg.fallbackEmail,
      }).channel,
    ).toBe("email");
  });

  it("falls back to the in-app inbox when no escalation config is set", () => {
    expect(route("captain", "general", {})).toEqual({
      channel: "in_app_inbox",
      target: "inbox",
      priority: "normal",
    });
  });
});
