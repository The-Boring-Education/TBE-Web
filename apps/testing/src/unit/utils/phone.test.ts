import {
  COUNTRY_PHONE_LIST,
  getCountryFlagEmoji,
  getCountryInfo,
  isPhoneNumberValid,
  parseAndFormatPhone,
} from "@tbe/utils";

describe("phone utilities", () => {
  describe("getCountryFlagEmoji", () => {
    it("returns correct flag emoji for ISO country codes", () => {
      expect(getCountryFlagEmoji("IN")).toBe("🇮🇳");
      expect(getCountryFlagEmoji("US")).toBe("🇺🇸");
      expect(getCountryFlagEmoji("GB")).toBe("🇬🇧");
      expect(getCountryFlagEmoji("CA")).toBe("🇨🇦");
    });

    it("returns fallback for invalid codes", () => {
      expect(getCountryFlagEmoji("")).toBe("🌐");
      expect(getCountryFlagEmoji(null)).toBe("🌐");
      expect(getCountryFlagEmoji("IND")).toBe("🌐");
    });
  });

  describe("getCountryPhoneList", () => {
    it("has India as the first country by default", () => {
      expect(COUNTRY_PHONE_LIST.length).toBeGreaterThan(10);
      expect(COUNTRY_PHONE_LIST[0]).toMatchObject({
        country: "IN",
        dialCode: "+91",
        flag: "🇮🇳",
      });
    });
  });

  describe("getCountryInfo", () => {
    it("returns India by default when empty", () => {
      expect(getCountryInfo()).toMatchObject({
        country: "IN",
        dialCode: "+91",
      });
      expect(getCountryInfo("")).toMatchObject({
        country: "IN",
        dialCode: "+91",
      });
    });

    it("resolves by ISO code or dial code", () => {
      expect(getCountryInfo("US")).toMatchObject({
        country: "US",
        dialCode: "+1",
      });
      expect(getCountryInfo("+44")).toMatchObject({
        country: "GB",
        dialCode: "+44",
      });
      expect(getCountryInfo("+91")).toMatchObject({
        country: "IN",
        dialCode: "+91",
      });
    });
  });

  describe("parseAndFormatPhone", () => {
    it("formats Indian national number by default", () => {
      const result = parseAndFormatPhone("9876543210", "IN");
      expect(result.country).toBe("IN");
      expect(result.dialCode).toBe("+91");
      expect(result.flag).toBe("🇮🇳");
      expect(result.isValid).toBe(true);
      expect(result.fullInternational).toBe("+91 98765 43210");
    });

    it("automatically detects country when international prefix + is entered", () => {
      const usResult = parseAndFormatPhone("+14155552671", "IN");
      expect(usResult.country).toBe("US");
      expect(usResult.dialCode).toBe("+1");
      expect(usResult.flag).toBe("🇺🇸");
      expect(usResult.isValid).toBe(true);

      const ukResult = parseAndFormatPhone("+442071838750", "IN");
      expect(ukResult.country).toBe("GB");
      expect(ukResult.dialCode).toBe("+44");
      expect(ukResult.flag).toBe("🇬🇧");
      expect(ukResult.isValid).toBe(true);
    });

    it("detects invalid / incomplete phone number structures", () => {
      const incomplete = parseAndFormatPhone("123", "IN");
      expect(incomplete.isValid).toBe(false);
    });
  });

  describe("isPhoneNumberValid", () => {
    it("validates Indian phone numbers", () => {
      expect(isPhoneNumberValid("9876543210", "IN")).toBe(true);
      expect(isPhoneNumberValid("+91 9876543210", "IN")).toBe(true);
      expect(isPhoneNumberValid("+919876543210", "IN")).toBe(true);
    });

    it("validates international phone numbers", () => {
      expect(isPhoneNumberValid("+1 415 555 2671")).toBe(true);
      expect(isPhoneNumberValid("+44 7911 123456")).toBe(true);
    });

    it("rejects invalid phone numbers", () => {
      expect(isPhoneNumberValid("")).toBe(false);
      expect(isPhoneNumberValid(null)).toBe(false);
      expect(isPhoneNumberValid("12345", "IN")).toBe(false);
      expect(isPhoneNumberValid("0000000000", "IN")).toBe(false);
    });
  });
});
