import { describe, expect, it, vi } from "vitest";

import {
  isValidPhoneNumber,
  splitContactNumber,
} from "../../../../../packages/utils/src/phoneNumber";

vi.mock("@tbe/constants", async () => {
  const { COUNTRY_CODES } = await import(
    "../../../../../packages/constants/src/global"
  );
  return { COUNTRY_CODES };
});

describe("country-aware mobile number validation", () => {
  it.each([
    ["+91", "9876543210"],
    ["+1", "2025550123"],
    ["+44", "7700900123"],
    ["+44", "07700900123"],
    ["+81", "9012345678"],
    ["+49", "15123456789"],
    ["+49", "015123456789"],
    ["+33", "612345678"],
    ["+61", "412345678"],
    ["+86", "13800138000"],
    ["+39", "3123456789"],
    ["+7", "9123456789"],
    ["+34", "612345678"],
    ["+82", "1012345678"],
    ["+31", "612345678"],
    ["+47", "41234567"],
    ["+46", "701234567"],
  ])("accepts %s %s without a universal ten-digit rule", (code, number) => {
    expect(isValidPhoneNumber(code, number)).toBe(true);
  });

  it.each([
    ["+91", ""],
    ["+91", "987654321"],
    ["+91", "98765432101"],
    ["+86", "1380013800"],
    ["+86", "138001380001"],
    ["+49", "151234567890"],
    ["+44", "077009001234"],
    ["+47", "4123456789"],
    ["+999", "1234567890"],
    ["", "9876543210"],
    ["+91", "abc9876543210"],
  ])("rejects %s %s", (code, number) => {
    expect(isValidPhoneNumber(code, number)).toBe(false);
  });

  it("accepts presentation formatting without modifying the input", () => {
    const number = "(07700) 900-123";
    expect(isValidPhoneNumber("+44", number)).toBe(true);
    expect(number).toBe("(07700) 900-123");
  });
});

describe("international contact parsing", () => {
  it.each([
    ["+8613800138000", "+86", "13800138000"],
    ["+4915123456789", "+49", "15123456789"],
    ["+447700900123", "+44", "7700900123"],
    ["+12025550123", "+1", "2025550123"],
    ["+919876543210", "+91", "9876543210"],
    [" +44  07700 900123 ", "+44", "07700 900123"],
    ["9876543210", "+91", "9876543210"],
    ["+86", "+86", ""],
    ["", "+91", ""],
    ["+999 1234567890", "", "+999 1234567890"],
  ])("splits %s without consuming subscriber digits", (raw, code, number) => {
    expect(splitContactNumber(raw)).toEqual([code, number]);
  });
});
