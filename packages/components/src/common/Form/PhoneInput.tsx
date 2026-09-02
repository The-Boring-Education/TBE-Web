import type { CountryCode, CountryPhoneInfo } from "@tbe/utils";
import {
  COUNTRY_PHONE_LIST,
  getCountryInfo,
  isPhoneNumberValid,
  parseAndFormatPhone,
} from "@tbe/utils";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { LuCheck, LuChevronDown, LuSearch } from "react-icons/lu";

export interface PhoneInputMeta {
  isValid: boolean;
  isPossible: boolean;
  country: CountryCode;
  dialCode: string;
  nationalNumber: string;
  formatted: string;
  fullInternational: string;
}

export interface PhoneInputProps {
  value?: string;
  onChange?: (_value: string, _meta: PhoneInputMeta) => void;
  defaultCountry?: CountryCode;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  disabled?: boolean;
  id?: string;
  name?: string;
  autoFocus?: boolean;
  showValidationState?: boolean;
}

/**
 * Flag component that uses standard crisp flag graphics with fallback.
 * Fixes missing emoji flags on Windows.
 */
export const CountryFlag: React.FC<{
  countryCode: string;
  name: string;
  className?: string;
}> = ({ countryCode, name, className = "w-4 h-3 sm:w-4.5 sm:h-3.5" }) => {
  const [hasError, setHasError] = useState(false);
  const code = (countryCode || "").toLowerCase();

  if (hasError || !code || code.length !== 2) {
    return (
      <span
        role="img"
        aria-label={name}
        className="text-xs leading-none select-none font-mono"
      >
        {countryCode}
      </span>
    );
  }

  return (
    <img
      src={`https://flagcdn.com/w40/${code}.png`}
      srcSet={`https://flagcdn.com/w80/${code}.png 2x`}
      alt={name}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={`${className} object-cover rounded-[2px] shadow-2xs border border-slate-200/50 shrink-0 inline-block`}
    />
  );
};

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value = "",
  onChange,
  defaultCountry = "IN",
  placeholder,
  className = "",
  inputClassName = "",
  disabled = false,
  id,
  name,
  autoFocus = false,
  showValidationState = true,
}) => {
  const [selectedCountry, setSelectedCountry] =
    useState<CountryCode>(defaultCountry);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);

  // Sync selected country and parsed state based on external value
  const parsed = useMemo(() => {
    return parseAndFormatPhone(value, selectedCountry);
  }, [value, selectedCountry]);

  // Keep country in sync if detected from input value
  useEffect(() => {
    if (parsed.country && parsed.country !== selectedCountry) {
      setSelectedCountry(parsed.country);
    }
  }, [parsed.country, selectedCountry]);

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
        phoneInputRef.current?.focus();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const activeCountryInfo = getCountryInfo(selectedCountry);

  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) return COUNTRY_PHONE_LIST;
    const query = searchQuery.trim().toLowerCase();
    return COUNTRY_PHONE_LIST.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.dialCode.toLowerCase().includes(query) ||
        c.country.toLowerCase().includes(query),
    );
  }, [searchQuery]);

  const handleCountrySelect = (countryInfo: CountryPhoneInfo) => {
    setSelectedCountry(countryInfo.country);
    setIsOpen(false);
    setSearchQuery("");

    // Reformat existing number with new dial code
    const newNumber = parsed.nationalNumber
      ? `${countryInfo.dialCode} ${parsed.nationalNumber}`
      : countryInfo.dialCode;

    const newParsed = parseAndFormatPhone(newNumber, countryInfo.country);
    if (onChange) {
      onChange(newParsed.fullInternational || newNumber, newParsed);
    }
    phoneInputRef.current?.focus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const newParsed = parseAndFormatPhone(rawVal, selectedCountry);

    if (newParsed.country && newParsed.country !== selectedCountry) {
      setSelectedCountry(newParsed.country);
    }

    if (onChange) {
      const fullVal = rawVal.startsWith("+")
        ? newParsed.formatted
        : `${activeCountryInfo.dialCode} ${rawVal}`.trim();
      onChange(fullVal, newParsed);
    }
  };

  const currentDigits = (value || "").replace(/\D/g, "");
  const hasInput = currentDigits.length > 0;
  const isValid = isPhoneNumberValid(value, selectedCountry);

  return (
    <div className={`relative flex flex-col w-full ${className}`}>
      <div
        className={`group relative flex items-center w-full h-[42px] rounded-xl border border-slate-200 hover:border-slate-300 focus-within:border-slate-400 focus-within:ring-1 focus-within:ring-slate-200 bg-white transition-all shadow-2xs ${
          disabled ? "opacity-60 pointer-events-none bg-slate-50" : ""
        }`}
      >
        {/* Country Selector Button */}
        <div className="relative h-full shrink-0" ref={dropdownRef}>
          <button
            type="button"
            disabled={disabled}
            onClick={() => setIsOpen((prev) => !prev)}
            aria-label="Select Country"
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            className="flex items-center gap-1.5 h-full px-2.5 sm:px-3 rounded-l-xl hover:bg-slate-50/80 active:bg-slate-100 transition-colors text-xs sm:text-sm font-semibold text-slate-800 cursor-pointer select-none border-none outline-none focus:outline-none"
          >
            <CountryFlag
              countryCode={activeCountryInfo.country}
              name={activeCountryInfo.name}
            />
            <span className="text-slate-700 font-mono text-[11px] sm:text-xs font-semibold">
              {activeCountryInfo.dialCode}
            </span>
            <LuChevronDown
              className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${
                isOpen ? "rotate-180 text-slate-600" : ""
              }`}
            />
          </button>

          {/* Country Selector Dropdown Popover */}
          {isOpen && (
            <div className="absolute top-[calc(100%+6px)] left-0 w-72 sm:w-80 bg-white rounded-xl shadow-xl border border-slate-200/90 z-50 overflow-hidden flex flex-col max-h-72 animate-in fade-in slide-in-from-top-1 duration-150">
              {/* Search Bar */}
              <div className="p-2 border-b border-slate-100 bg-slate-50/70">
                <div className="flex items-center gap-2 px-2.5 py-1.5 bg-white border border-slate-200/80 rounded-lg focus-within:border-slate-400 focus-within:ring-0 transition-all">
                  <LuSearch className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search country or dial code..."
                    className="w-full bg-transparent text-xs font-medium text-slate-800 placeholder:text-slate-400 outline-none border-none focus:outline-none focus:ring-0 ring-0"
                  />
                </div>
              </div>

              {/* Country List */}
              <div className="overflow-y-auto p-1 divide-y divide-slate-50/50 flex-1 overscroll-contain">
                {filteredCountries.length === 0 ? (
                  <div className="py-5 text-center text-xs text-slate-400 font-medium">
                    No matching countries found
                  </div>
                ) : (
                  filteredCountries.map((c) => {
                    const isSelected = c.country === selectedCountry;
                    return (
                      <button
                        key={`${c.country}-${c.dialCode}`}
                        type="button"
                        onClick={() => handleCountrySelect(c)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 text-left text-xs rounded-lg transition-colors cursor-pointer border-none outline-none ${
                          isSelected
                            ? "bg-slate-100 text-slate-900 font-bold"
                            : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <CountryFlag
                            countryCode={c.country}
                            name={c.name}
                            className="w-4 h-3"
                          />
                          <span className="truncate font-medium">{c.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                          <span className="text-[11px] font-mono font-medium text-slate-500">
                            {c.dialCode}
                          </span>
                          {isSelected && (
                            <LuCheck className="w-3.5 h-3.5 text-slate-900 stroke-[2.5]" />
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Phone Number Input Field */}
        <div className="relative flex-1 h-full flex items-center">
          <input
            ref={phoneInputRef}
            type="tel"
            id={id}
            name={name}
            value={
              value.startsWith("+")
                ? parsed.nationalNumber || value.replace(/^\+\d+\s*/, "")
                : value
            }
            onChange={handleInputChange}
            placeholder={
              placeholder ||
              (selectedCountry === "IN" ? "98765 43210" : "Phone number")
            }
            disabled={disabled}
            autoFocus={autoFocus}
            autoComplete="tel"
            className={`w-full h-full px-2.5 bg-transparent text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 border-none outline-none focus:outline-none focus:ring-0 ring-0 shadow-none ${inputClassName}`}
          />

          {/* Sleek Minimal Validation Indicator */}
          {showValidationState && hasInput && (
            <div className="pr-3 flex items-center shrink-0 select-none">
              {isValid ? (
                <span
                  title="Valid phone number"
                  className="flex items-center justify-center text-emerald-500 transition-all"
                >
                  <LuCheck className="w-4 h-4 stroke-[2.5]" />
                </span>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhoneInput;
