import { describe, expect, it } from "vitest";

import {
  mergeSubscriptionPlanFieldsForUpsert,
  type SubscriptionPlanInput,
} from "@/lib/database/queries/subscription-plan";

describe("mergeSubscriptionPlanFieldsForUpsert", () => {
  it("fills defaults when there is no existing row (new plan)", () => {
    const p: SubscriptionPlanInput = {
      productType: "ONCAMPUS",
      planKey: "1months",
      amountInr: 100,
    };
    const m = mergeSubscriptionPlanFieldsForUpsert(null, p, "1months");
    expect(m.amountInr).toBe(100);
    expect(m.displayName).toBe("");
    expect(m.features).toEqual([]);
    expect(m.isActive).toBe(true);
  });

  it("preserves displayName and features when the request only changes amount", () => {
    const existing = {
      displayName: "Important title",
      description: "Sub",
      originalAmountInr: 500,
      accessType: "SUBSCRIPTION" as const,
      durationMonths: 3,
      features: ["A", "B"],
      isPopular: true,
      isActive: true,
      sortOrder: 2,
    };
    const p: SubscriptionPlanInput = {
      productType: "ONCAMPUS",
      planKey: "3months",
      amountInr: 999,
    };
    const m = mergeSubscriptionPlanFieldsForUpsert(existing, p, "3months");
    expect(m.amountInr).toBe(999);
    expect(m.displayName).toBe("Important title");
    expect(m.features).toEqual(["A", "B"]);
    expect(m.isPopular).toBe(true);
    expect(m.sortOrder).toBe(2);
  });

  it("applies an explicit displayName: '' to clear", () => {
    const existing = { displayName: "Old" };
    const p: SubscriptionPlanInput = {
      productType: "ONCAMPUS",
      planKey: "x",
      amountInr: 1,
      displayName: "",
    };
    const m = mergeSubscriptionPlanFieldsForUpsert(existing, p, "x");
    expect(m.displayName).toBe("");
  });

  it("preserves isActive when the request only updates amount", () => {
    const existing = { isActive: false };
    const p: SubscriptionPlanInput = {
      productType: "ONCAMPUS",
      planKey: "1months",
      amountInr: 50,
    };
    const m = mergeSubscriptionPlanFieldsForUpsert(existing, p, "1months");
    expect(m.isActive).toBe(false);
  });

  it("preserves sortOrder when omitted on partial request", () => {
    const existing = { sortOrder: 10 };
    const p: SubscriptionPlanInput = {
      productType: "DSA_YATRA",
      planKey: "lifetime",
      amountInr: 1,
    };
    const m = mergeSubscriptionPlanFieldsForUpsert(existing, p, "lifetime");
    expect(m.sortOrder).toBe(10);
  });
});
