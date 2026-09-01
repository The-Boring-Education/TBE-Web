import type { CountryCode } from "libphonenumber-js";
import {
  AsYouType,
  getCountries,
  getCountryCallingCode,
  isValidPhoneNumber,
  parsePhoneNumberFromString,
} from "libphonenumber-js";

export type { CountryCode };

export interface CountryPhoneInfo {
  country: CountryCode;
  name: string;
  dialCode: string;
  flag: string;
}

/**
 * Converts a 2-letter ISO country code (e.g. 'IN', 'US') to a unicode flag emoji.
 */
export const getCountryFlagEmoji = (countryCode?: string | null): string => {
  if (!countryCode || countryCode.length !== 2) return "🌐";
  const upper = countryCode.toUpperCase();
  const codePoints = upper.split("").map((c) => 127397 + c.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

const displayNames =
  typeof Intl !== "undefined" && typeof Intl.DisplayNames !== "undefined"
    ? new Intl.DisplayNames(["en"], { type: "region" })
    : null;

const getCountryDisplayName = (countryCode: CountryCode): string => {
  try {
    return displayNames?.of(countryCode) || countryCode;
  } catch {
    return countryCode;
  }
};

/**
 * Common prioritized countries for quick selection.
 */
const PRIORITY_COUNTRIES: CountryCode[] = [
  "IN",
  "US",
  "GB",
  "CA",
  "AU",
  "DE",
  "FR",
  "AE",
  "SG",
  "JP",
];

/**
 * Full sorted list of supported countries with flag, name, and dial code.
 * India is always first by default.
 */
export const getCountryPhoneList = (): CountryPhoneInfo[] => {
  const allIsoCodes = getCountries();

  const countryInfoMap = new Map<CountryCode, CountryPhoneInfo>();

  allIsoCodes.forEach((code) => {
    try {
      const dialCode = `+${getCountryCallingCode(code)}`;
      const name = getCountryDisplayName(code);
      const flag = getCountryFlagEmoji(code);
      countryInfoMap.set(code, { country: code, name, dialCode, flag });
    } catch {
      // Ignore unsupported codes
    }
  });

  const priorityList: CountryPhoneInfo[] = [];
  PRIORITY_COUNTRIES.forEach((code) => {
    const info = countryInfoMap.get(code);
    if (info) {
      priorityList.push(info);
      countryInfoMap.delete(code);
    }
  });

  const remaining = Array.from(countryInfoMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  return [...priorityList, ...remaining];
};

export const COUNTRY_PHONE_LIST = getCountryPhoneList();

/**
 * Returns country info for a given ISO code or dial code (defaulting to IN).
 */
export const getCountryInfo = (
  countryCodeOrDialCode?: string | null,
): CountryPhoneInfo => {
  const fallback: CountryPhoneInfo = {
    country: "IN",
    name: "India",
    dialCode: "+91",
    flag: "🇮🇳",
  };

  if (!countryCodeOrDialCode) return fallback;

  const trimmed = countryCodeOrDialCode.trim().toUpperCase();

  // Try matching ISO code
  const byIso = COUNTRY_PHONE_LIST.find((c) => c.country === trimmed);
  if (byIso) return byIso;

  // Try matching dial code (+91 or 91)
  const formattedDial = trimmed.startsWith("+") ? trimmed : `+${trimmed}`;
  const byDial = COUNTRY_PHONE_LIST.find((c) => c.dialCode === formattedDial);
  if (byDial) return byDial;

  return fallback;
};

export interface PhoneParseResult {
  formatted: string;
  nationalNumber: string;
  country: CountryCode;
  dialCode: string;
  flag: string;
  isValid: boolean;
  isPossible: boolean;
  fullInternational: string;
}

/**
 * Parses and formats phone input dynamically using libphonenumber-js.
 * Automatically detects country if international prefix '+' is present or typed.
 */
export const parseAndFormatPhone = (
  raw: string,
  currentCountry: CountryCode = "IN",
): PhoneParseResult => {
  const trimmed = (raw || "").trim();
  const asYouType = new AsYouType(currentCountry);
  let parsed = parsePhoneNumberFromString(trimmed, currentCountry);
  if (!parsed && !trimmed.startsWith("+")) {
    const fallbackDialCode = getCountryInfo(currentCountry).dialCode;
    parsed = parsePhoneNumberFromString(
      `${fallbackDialCode}${trimmed}`,
      currentCountry,
    );
  }

  const detectedCountry =
    parsed?.country || asYouType.getCountry() || currentCountry;
  const countryInfo = getCountryInfo(detectedCountry);
  const callingCode = parsed
    ? `+${parsed.countryCallingCode}`
    : asYouType.getCallingCode()
      ? `+${asYouType.getCallingCode()}`
      : countryInfo.dialCode;

  const formatted = new AsYouType(detectedCountry).input(trimmed);
  const isValid = parsed
    ? parsed.isValid()
    : new AsYouType(detectedCountry).isValid();
  const isPossible = parsed ? parsed.isPossible() : isValid;
  const nationalNumber = parsed
    ? new AsYouType(detectedCountry).input(parsed.nationalNumber)
    : formatted.replace(callingCode, "").trim();
  const fullInternational = parsed
    ? parsed.formatInternational()
    : `${callingCode} ${nationalNumber}`.trim();

  return {
    formatted,
    nationalNumber,
    country: detectedCountry,
    dialCode: callingCode,
    flag: countryInfo.flag,
    isValid,
    isPossible,
    fullInternational,
  };
};

/**
 * Validates whether a given phone number is structurally valid for a given country.
 */
export const isPhoneNumberValid = (
  raw?: string | null,
  defaultCountry: CountryCode = "IN",
): boolean => {
  if (!raw || !raw.trim()) return false;
  const trimmed = raw.trim();

  try {
    if (isValidPhoneNumber(trimmed, defaultCountry)) return true;

    // Check with dial code if national number provided
    const countryInfo = getCountryInfo(defaultCountry);
    if (!trimmed.startsWith("+")) {
      const withCode = `${countryInfo.dialCode} ${trimmed}`;
      return isValidPhoneNumber(withCode, defaultCountry);
    }
  } catch {
    return false;
  }

  return false;
};
