import { COUNTRY_CODES } from "@tbe/constants";

export const isValidPhoneNumber = (
  countryCode: string,
  phoneNumber: string,
): boolean => {
  const country = COUNTRY_CODES.find(({ code }) => code === countryCode);
  if (!country || !/^[\d\s().-]+$/.test(phoneNumber)) return false;

  const digits = phoneNumber.replace(/\D/g, "");
  const nationalNumber =
    country.trunkPrefix && digits.startsWith(country.trunkPrefix)
      ? digits.slice(country.trunkPrefix.length)
      : digits;

  return country.mobileNumberLengths.includes(nationalNumber.length);
};

export const splitContactNumber = (contactNo: string): [string, string] => {
  const raw = contactNo.trim();
  if (!raw.startsWith("+")) return ["+91", raw];

  const country = COUNTRY_CODES.find(({ code }) => raw.startsWith(code));
  if (!country) return ["", raw];

  return [country.code, raw.slice(country.code.length).trim()];
};
