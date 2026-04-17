import { describe, expect, it } from "vitest";

import {
  resolveSubscriptionPlanUuid,
  SUBSCRIPTION_PLAN_UUID_NAMESPACE,
} from "@/lib/database/queries/subscription-plan";

describe("resolveSubscriptionPlanUuid", () => {
  it("is deterministic for the same productType + normalized planKey", () => {
    const a = resolveSubscriptionPlanUuid(
      { productType: "DSA_YATRA", planKey: "lifetime", amountInr: 1 },
      "lifetime",
    );
    const b = resolveSubscriptionPlanUuid(
      { productType: "DSA_YATRA", planKey: "LIFETIME", amountInr: 1 },
      "lifetime",
    );
    expect(a).toBe(b);
    expect(a).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });

  it("matches UUID v5 from uuid package for DSA_YATRA:lifetime", async () => {
    const { v5: uuidv5 } = await import("uuid");
    const expected = uuidv5(
      "DSA_YATRA:lifetime",
      SUBSCRIPTION_PLAN_UUID_NAMESPACE,
    );
    const got = resolveSubscriptionPlanUuid(
      { productType: "DSA_YATRA", planKey: "lifetime", amountInr: 1 },
      "lifetime",
    );
    expect(got).toBe(expected);
  });

  it("uses explicit planUuid from input when provided (lowercased)", () => {
    const id = "550E8400-E29B-41D4-A716-446655440000";
    const got = resolveSubscriptionPlanUuid(
      {
        productType: "DSA_YATRA",
        planKey: "lifetime",
        amountInr: 1,
        planUuid: id,
      },
      "lifetime",
    );
    expect(got).toBe(id.toLowerCase());
  });
});
