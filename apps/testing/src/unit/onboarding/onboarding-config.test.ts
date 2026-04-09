import {
  getAvailableOnboardingProducts,
  getOnboardingConfig,
  isValidOnboardingProduct,
  ONBOARDING_PRODUCT_ALIASES,
  resolveOnboardingProductId,
} from "@tbe/config";
import { describe, expect, it } from "vitest";

describe("onboarding config helpers (@tbe/config)", () => {
  it("resolveOnboardingProductId maps legacy webapp and prepyatra aliases", () => {
    expect(resolveOnboardingProductId("webapp")).toBe("platform");
    expect(resolveOnboardingProductId("prepyatra")).toBe("prep-yatra");
    expect(resolveOnboardingProductId("dsayatra")).toBe("dsayatra");
  });

  it("getOnboardingConfig returns the same config for webapp and platform aliases", () => {
    const webapp = getOnboardingConfig("webapp");
    const platform = getOnboardingConfig("platform");
    expect(webapp).not.toBeNull();
    expect(platform).not.toBeNull();
    expect(webapp?.id).toBe("platform");
    expect(platform?.id).toBe("platform");
    expect(webapp?.ui?.branding?.title).toBe(platform?.ui?.branding?.title);
  });

  it("isValidOnboardingProduct accepts aliases and canonical ids", () => {
    expect(isValidOnboardingProduct("webapp")).toBe(true);
    expect(isValidOnboardingProduct("prepyatra")).toBe(true);
    expect(isValidOnboardingProduct("tech-yatra")).toBe(true);
    expect(isValidOnboardingProduct("not-a-real-product")).toBe(false);
  });

  it("getAvailableOnboardingProducts lists canonical keys including product-specific flows", () => {
    const ids = getAvailableOnboardingProducts();
    expect(ids).toContain("platform");
    expect(ids).toContain("dsayatra");
    expect(ids).toContain("oncampus");
    expect(ids).toContain("tech-yatra");
    expect(ids).toContain("resume-yatra");
  });

  it("ONBOARDING_PRODUCT_ALIASES only defines legacy ids that differ from canonical keys", () => {
    expect(ONBOARDING_PRODUCT_ALIASES.webapp).toBe("platform");
    expect(ONBOARDING_PRODUCT_ALIASES.prepyatra).toBe("prep-yatra");
    expect(Object.keys(ONBOARDING_PRODUCT_ALIASES)).toHaveLength(2);
  });
});
