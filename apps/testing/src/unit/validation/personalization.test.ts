import { describe, expect, it } from "vitest";

import {
  isCanonicalCompanyTypeInput,
  isCanonicalDsaDurationInput,
  normalizeCompanyType,
  normalizeCompanyTypeArray,
  normalizeDsaDuration,
  normalizeDsaProductContext,
  ONCAMPUS_EXPERIENCE_LEVEL,
  ONCAMPUS_EXPERIENCE_YEARS,
} from "../../../../api/src/lib/validation/personalization";

describe("personalization normalization helpers", () => {
  it("normalizes legacy and canonical duration aliases", () => {
    expect(normalizeDsaDuration("4-6 months")).toBe("6Months");
    expect(normalizeDsaDuration("2_3 months")).toBe("3Months");
    expect(normalizeDsaDuration("1Year")).toBe("1Year");
  });

  it("returns null for unknown duration aliases", () => {
    expect(normalizeDsaDuration("9Months")).toBeNull();
    expect(normalizeDsaDuration(undefined)).toBeNull();
  });

  it("normalizes company type aliases", () => {
    expect(normalizeCompanyType("startup")).toBe("Startup");
    expect(normalizeCompanyType("mid-size")).toBe("MidSize");
    expect(normalizeCompanyType("MNC")).toBe("MNC");
    expect(normalizeCompanyType("faang")).toBe("FAANG");
  });

  it("normalizes company arrays with dedupe + invalid capture", () => {
    const result = normalizeCompanyTypeArray([
      "startup",
      "MNC",
      "mnc",
      "unknown",
    ]);

    expect(result.values).toEqual(["Startup", "MNC"]);
    expect(result.invalid).toEqual(["unknown"]);
  });

  it("normalizes product context aliases", () => {
    expect(normalizeDsaProductContext("dsa_yatra")).toBe("DSA_YATRA");
    expect(normalizeDsaProductContext("ON-CAMPUS")).toBe("ONCAMPUS");
    expect(normalizeDsaProductContext("prep-yatra")).toBeNull();
  });

  it("detects canonical duration and company inputs", () => {
    expect(isCanonicalDsaDurationInput("6Months")).toBe(true);
    expect(isCanonicalDsaDurationInput("4-6 months")).toBe(false);
    expect(isCanonicalCompanyTypeInput("MNC")).toBe(true);
    expect(isCanonicalCompanyTypeInput("mnc")).toBe(false);
  });

  it("exposes fixed oncampus baseline constants", () => {
    expect(ONCAMPUS_EXPERIENCE_LEVEL).toBe("Fresher (0-1 yr)");
    expect(ONCAMPUS_EXPERIENCE_YEARS).toBe(0);
  });
});
