import {
  mergeApiAndSessionProfileForm,
  normalizeContactNoForForm,
} from "@tbe/utils/userProfileForm";

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
