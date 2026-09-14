import { describe, expect, it } from "vitest";

import User from "../../../../api/src/lib/database/models/User";

describe("User Model contactNo Schema Validator", () => {
  const validatePhone = (contactNo: string) => {
    const contactNoField: any = User.schema.path("contactNo");
    const validator = contactNoField?.validators?.[0]?.validator;
    if (typeof validator === "function") {
      return validator(contactNo);
    }
    return true;
  };

  it("validates standard format '+91 9876543210'", () => {
    expect(validatePhone("+91 9876543210")).toBe(true);
  });

  it("validates other country codes '+1 1234567890'", () => {
    expect(validatePhone("+1 1234567890")).toBe(true);
  });

  it("allows empty or default '+91'", () => {
    expect(validatePhone("")).toBe(true);
    expect(validatePhone("+91")).toBe(true);
  });

  it("rejects numbers exceeding 10 digits e.g. 13-digit number", () => {
    expect(validatePhone("+91 919876543210")).toBe(false);
    expect(validatePhone("+91 9876543210123")).toBe(false);
  });

  it("rejects numbers without '+' country code", () => {
    expect(validatePhone("91 9876543210")).toBe(false);
    expect(validatePhone("9876543210")).toBe(false);
  });
});
