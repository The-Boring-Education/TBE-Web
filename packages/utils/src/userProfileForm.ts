/**
 * Maps API session + fetched user record into the platform profile form shape.
 * JWT/session often omits onboarding fields; GET /user fills them.
 */

export interface UserProfileFormFields {
  userName: string;
  occupation: string;
  purpose: string[];
  contactNo: string;
}

export interface UserProfileFormSource {
  userName?: string;
  occupation?: string;
  purpose?: string[];
  contactNo?: string;
}

/** Ensures contact uses "`<code> <number>`" when stored compactly (e.g. +9198… → +91 98…). */
export const normalizeContactNoForForm = (raw?: string | null): string => {
  if (!raw?.trim()) return "+91";
  const t = raw.trim();
  if (/\s/.test(t)) return t;
  if (t.startsWith("+91") && t.length > 3) return `+91 ${t.slice(3)}`;
  return t;
};

import { COUNTRY_CODES } from "@tbe/constants";
export { COUNTRY_CODES };

const SORTED_COUNTRY_CODES = Array.from(
  new Set(COUNTRY_CODES.map((c) => c.code)),
).sort((a, b) => b.length - a.length);

/**
 * Splits a full contact string (e.g. "+91 9876543210" or "+919876543210") into countryCode and phoneNumber.
 */
export const parsePhoneNumber = (
  raw?: string | null,
): { countryCode: string; phoneNumber: string } => {
  if (!raw?.trim()) {
    return { countryCode: "+91", phoneNumber: "" };
  }
  const t = raw.trim();
  const parts = t.split(/\s+/);
  if (parts.length > 1) {
    return {
      countryCode: parts[0] || "+91",
      phoneNumber: parts.slice(1).join(" "),
    };
  }

  if (t.startsWith("+")) {
    const knownMatch = SORTED_COUNTRY_CODES.find((code) => t.startsWith(code));
    if (knownMatch) {
      return {
        countryCode: knownMatch,
        phoneNumber: t.slice(knownMatch.length).trim(),
      };
    }
    const match = t.match(/^(\+\d{1,3})(.*)$/);
    if (match) {
      return {
        countryCode: match[1] || "+91",
        phoneNumber: (match[2] || "").trim(),
      };
    }
  }

  return { countryCode: "+91", phoneNumber: t };
};

/**
 * Validates phone numbers.
 * - For India (+91): Must be exactly 10 digits starting with 6, 7, 8, or 9.
 * - For other country codes: Must be between 7 and 15 digits (E.164 standard).
 */
export const isValidPhoneNumber = (contactNo?: string | null): boolean => {
  if (!contactNo || !contactNo.trim()) return false;
  const { countryCode, phoneNumber } = parsePhoneNumber(contactNo);
  const digits = phoneNumber.replace(/\D/g, "");

  if (countryCode === "+91") {
    return /^[6-9]\d{9}$/.test(digits);
  }
  return digits.length >= 7 && digits.length <= 15;
};

/**
 * Returns a human-friendly validation error message or null if valid.
 */
export const getPhoneNumberError = (
  contactNo?: string | null,
): string | null => {
  if (!contactNo || !contactNo.trim()) {
    return "Phone number is required";
  }
  const { countryCode, phoneNumber } = parsePhoneNumber(contactNo);
  const digits = phoneNumber.replace(/\D/g, "");

  if (!digits) {
    return "Please enter your mobile number";
  }

  if (countryCode === "+91") {
    if (digits.length !== 10) {
      return "Indian mobile number must be exactly 10 digits";
    }
    if (!/^[6-9]/.test(digits)) {
      return "Indian mobile number must start with 6, 7, 8, or 9";
    }
    return null;
  }

  if (digits.length < 7 || digits.length > 15) {
    return "Phone number must be between 7 and 15 digits";
  }

  return null;
};

export const mergeApiAndSessionProfileForm = (
  api: UserProfileFormSource | null | undefined,
  session: UserProfileFormSource | null | undefined,
): UserProfileFormFields => ({
  userName: api?.userName ?? session?.userName ?? "",
  occupation: api?.occupation ?? session?.occupation ?? "",
  purpose: [...(api?.purpose ?? session?.purpose ?? [])],
  contactNo: normalizeContactNoForForm(api?.contactNo ?? session?.contactNo),
});
