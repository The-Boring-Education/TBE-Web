import {
  getPhoneNumberError,
  isValidPhoneNumber,
  mergeApiAndSessionProfileForm,
  normalizeContactNoForForm,
  parsePhoneNumber,
} from "@tbe/utils";

describe("normalizeContactNoForForm", () => {
  it("returns default when empty", () => {
    expect(normalizeContactNoForForm(undefined)).toBe("+91");
    expect(normalizeContactNoForForm(null)).toBe("+91");
    expect(normalizeContactNoForForm("   ")).toBe("+91");
  });

  it("preserves spaced numbers", () => {
    expect(normalizeContactNoForForm("+91 9876543210")).toBe("+91 9876543210");
    expect(normalizeContactNoForForm("  +1 5551234567  ")).toBe(
      "+1 5551234567",
    );
  });

  it("inserts space after +91 when compact", () => {
    expect(normalizeContactNoForForm("+919876543210")).toBe("+91 9876543210");
  });

  it("returns other compact formats unchanged", () => {
    expect(normalizeContactNoForForm("+441234567890")).toBe("+441234567890");
  });
});

describe("parsePhoneNumber", () => {
  it("defaults to +91 and empty number when undefined or empty", () => {
    expect(parsePhoneNumber(undefined)).toEqual({
      countryCode: "+91",
      phoneNumber: "",
    });
    expect(parsePhoneNumber("")).toEqual({
      countryCode: "+91",
      phoneNumber: "",
    });
    expect(parsePhoneNumber("+91")).toEqual({
      countryCode: "+91",
      phoneNumber: "",
    });
  });

  it("correctly parses spaced and compact phone numbers", () => {
    expect(parsePhoneNumber("+91 9876543210")).toEqual({
      countryCode: "+91",
      phoneNumber: "9876543210",
    });
    expect(parsePhoneNumber("+919876543210")).toEqual({
      countryCode: "+91",
      phoneNumber: "9876543210",
    });
    expect(parsePhoneNumber("+1 5551234567")).toEqual({
      countryCode: "+1",
      phoneNumber: "5551234567",
    });
  });
});

describe("isValidPhoneNumber", () => {
  it("validates Indian phone numbers starting with 6, 7, 8, or 9 with 10 digits", () => {
    expect(isValidPhoneNumber("+91 9876543210")).toBe(true);
    expect(isValidPhoneNumber("+91 8765432109")).toBe(true);
    expect(isValidPhoneNumber("+91 7654321098")).toBe(true);
    expect(isValidPhoneNumber("+91 6543210987")).toBe(true);
    expect(isValidPhoneNumber("+919876543210")).toBe(true);
    expect(isValidPhoneNumber("9876543210")).toBe(true);
  });

  it("rejects invalid Indian phone numbers", () => {
    // Starting with 0, 1, 2, 3, 4, 5
    expect(isValidPhoneNumber("+91 5876543210")).toBe(false);
    expect(isValidPhoneNumber("+91 1234567890")).toBe(false);
    expect(isValidPhoneNumber("+91 0000000000")).toBe(false);
    // Less than 10 digits
    expect(isValidPhoneNumber("+91 987654321")).toBe(false);
    // More than 10 digits
    expect(isValidPhoneNumber("+91 98765432100")).toBe(false);
    // Empty
    expect(isValidPhoneNumber("+91")).toBe(false);
    expect(isValidPhoneNumber("")).toBe(false);
    expect(isValidPhoneNumber(undefined)).toBe(false);
  });

  it("validates international phone numbers (7 to 15 digits)", () => {
    expect(isValidPhoneNumber("+1 5551234567")).toBe(true);
    expect(isValidPhoneNumber("+44 7911123456")).toBe(true);
    expect(isValidPhoneNumber("+1 123")).toBe(false); // too short
  });
});

describe("getPhoneNumberError", () => {
  it("returns appropriate error messages", () => {
    expect(getPhoneNumberError(undefined)).toBe("Phone number is required");
    expect(getPhoneNumberError("+91")).toBe("Please enter your mobile number");
    expect(getPhoneNumberError("+91 1234567890")).toBe(
      "Indian mobile number must start with 6, 7, 8, or 9",
    );
    expect(getPhoneNumberError("+91 98765")).toBe(
      "Indian mobile number must be exactly 10 digits",
    );
    expect(getPhoneNumberError("+91 9876543210")).toBeNull();
    expect(getPhoneNumberError("+1 5551234567")).toBeNull();
  });
});

describe("mergeApiAndSessionProfileForm", () => {
  it("prefers API fields over session", () => {
    expect(
      mergeApiAndSessionProfileForm(
        {
          userName: "api_user",
          occupation: "student",
          purpose: ["interview_prep"],
          contactNo: "+91 9000000000",
        },
        {
          userName: "jwt_user",
          occupation: "working_professional",
          purpose: ["dsa"],
          contactNo: "+91 8000000000",
        },
      ),
    ).toEqual({
      userName: "api_user",
      occupation: "student",
      purpose: ["interview_prep"],
      contactNo: "+91 9000000000",
    });
  });

  it("falls back to session when API omits fields", () => {
    expect(
      mergeApiAndSessionProfileForm(
        { userName: "only_from_api" },
        {
          occupation: "student",
          purpose: ["quiz"],
          contactNo: "+91 7000000000",
        },
      ),
    ).toEqual({
      userName: "only_from_api",
      occupation: "student",
      purpose: ["quiz"],
      contactNo: "+91 7000000000",
    });
  });

  it("normalizes contact from merged sources", () => {
    expect(
      mergeApiAndSessionProfileForm(undefined, {
        contactNo: "+919876543210",
      }),
    ).toEqual({
      userName: "",
      occupation: "",
      purpose: [],
      contactNo: "+91 9876543210",
    });
  });
});
