import type { BaseUser, OnboardingFieldConfig } from "@tbe/types";
import {
  COUNTRY_CODES,
  getPhoneNumberError,
  isValidPhoneNumber,
  parsePhoneNumber,
} from "@tbe/utils";
import { checkUsernameAvailable } from "@tbe/utils/onboarding";
import React, { useEffect, useState } from "react";

type FieldOption = string | { value: string; label: string };

const optionValue = (opt: FieldOption): string =>
  typeof opt === "string" ? opt : opt.value;
const optionLabel = (opt: FieldOption): string =>
  typeof opt === "string" ? opt : opt.label;

interface OnboardingFormProps {
  config: { fields: OnboardingFieldConfig[] };
  form: Record<string, unknown>;
  setForm: (_form: any) => void;
  step: number;
  productId: string;
  token?: string;
  apiBaseUrl?: string;
  user?: BaseUser;
  onUsernameAvailabilityChange?: (
    _available: boolean,
    _checking: boolean,
  ) => void;
}

const OnboardingForm: React.FC<OnboardingFormProps> = ({
  config,
  form,
  setForm,
  step,
  token,
  apiBaseUrl,
  user,
  onUsernameAvailabilityChange,
}) => {
  const [usernameAvailable, setUsernameAvailable] = useState(true);
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");

  const currentFields: OnboardingFieldConfig[] = config.fields.filter(
    (f: OnboardingFieldConfig) => f.step === step,
  );

  // Username availability check
  useEffect(() => {
    const field = config.fields.find(
      (f: OnboardingFieldConfig) => f.checkAvailability,
    );
    if (field && form[field.name] && form[field.name] !== user?.userName) {
      setUsernameChecking(true);
      const timeout = setTimeout(async () => {
        const available = await checkUsernameAvailable(
          form[field.name] as string,
          token,
          apiBaseUrl,
        );
        setUsernameAvailable(available);
        setUsernameChecking(false);
      }, 800);
      return () => clearTimeout(timeout);
    } else {
      setUsernameChecking(false);
    }
  }, [form, config.fields, token, user, apiBaseUrl]);

  // Notify parent component of username availability changes
  useEffect(() => {
    if (onUsernameAvailabilityChange) {
      onUsernameAvailabilityChange(usernameAvailable, usernameChecking);
    }
  }, [usernameAvailable, usernameChecking, onUsernameAvailabilityChange]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setForm((prev: Record<string, unknown>) => {
        const arr = Array.isArray(prev[name]) ? prev[name] : [];
        if (checked) {
          return { ...prev, [name]: [...(arr as string[]), value] };
        } else {
          return {
            ...prev,
            [name]: (arr as string[]).filter((v: string) => v !== value),
          };
        }
      });
    } else {
      setForm((prev: Record<string, unknown>) => ({ ...prev, [name]: value }));
    }
  };

  const handleButtonClick = (fieldName: string, value: string) => {
    setForm((prev: Record<string, unknown>) => {
      const currentValues = Array.isArray(prev[fieldName])
        ? (prev[fieldName] as string[])
        : [];
      const isSelected = currentValues.includes(value);
      if (isSelected) {
        return {
          ...prev,
          [fieldName]: currentValues.filter((v: string) => v !== value),
        };
      } else {
        return { ...prev, [fieldName]: [...currentValues, value] };
      }
    });
  };

  const renderField = (field: OnboardingFieldConfig) => {
    const val = form[field.name] || (field.type === "multiselect" ? [] : "");

    switch (field.type) {
      case "tel": {
        const rawContact = (val as string) || "";
        const { countryCode, phoneNumber } = parsePhoneNumber(rawContact);
        const isPhoneValid = isValidPhoneNumber(rawContact);
        const phoneError = getPhoneNumberError(rawContact);

        const currentCountry =
          (COUNTRY_CODES as any[]).find((c) => c.code === countryCode) ||
          COUNTRY_CODES[0];

        const filteredCountries = (COUNTRY_CODES as any[]).filter(
          (c) =>
            c.country.toLowerCase().includes(countrySearch.toLowerCase()) ||
            c.code.includes(countrySearch),
        );

        return (
          <div className="space-y-2" key={field.name}>
            <label className="block text-xs sm:text-sm font-bold text-[#10162F]">
              {field.label}{" "}
              {field.required ? (
                <span className="text-[#FF4D4D]">*</span>
              ) : (
                <span className="text-slate-400 text-xs font-normal">
                  (optional)
                </span>
              )}
            </label>

            <div className="flex items-center gap-2">
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setIsCountryDropdownOpen((v) => !v)}
                  className="h-11 sm:h-12 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 focus:border-[#10162F] focus:ring-1 focus:ring-[#10162F] flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-800 transition cursor-pointer shadow-xs"
                >
                  <span className="w-5 h-3.5 flex items-center justify-center overflow-hidden rounded-[2px] shrink-0">
                    <img
                      src={`https://flagcdn.com/w40/${currentCountry?.iso || "in"}.png`}
                      alt={currentCountry?.country || "flag"}
                      className="h-full w-auto max-w-none object-contain"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = "none";
                      }}
                    />
                  </span>
                  <span>{countryCode}</span>
                  <svg
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                      isCountryDropdownOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {isCountryDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => {
                        setIsCountryDropdownOpen(false);
                        setCountrySearch("");
                      }}
                    />
                    <div className="absolute left-0 top-13 z-50 w-64 max-h-64 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 flex flex-col gap-1 overflow-hidden animate-in fade-in-0 zoom-in-95">
                      <div className="relative px-2 py-1.5 border-b border-slate-100 flex items-center gap-1.5 text-xs text-slate-400">
                        <svg
                          className="w-3.5 h-3.5 shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                        <input
                          type="text"
                          value={countrySearch}
                          onChange={(e) => setCountrySearch(e.target.value)}
                          placeholder="Search country or code..."
                          className="w-full bg-transparent outline-none text-xs text-slate-800 placeholder:text-slate-400"
                          autoFocus
                        />
                      </div>
                      <div className="overflow-y-auto max-h-48 py-0.5 space-y-0.5">
                        {filteredCountries.map((c, i) => {
                          const isSelected = c.code === countryCode;
                          return (
                            <button
                              key={`${c.code}-${c.country}-${i}`}
                              type="button"
                              onClick={() => {
                                setForm((prev: Record<string, unknown>) => ({
                                  ...prev,
                                  [field.name]:
                                    `${c.code} ${phoneNumber}`.trim(),
                                }));
                                setIsCountryDropdownOpen(false);
                                setCountrySearch("");
                              }}
                              className={`w-full px-2 py-1.5 rounded-lg flex items-center justify-between text-xs font-medium transition cursor-pointer ${
                                isSelected
                                  ? "bg-[#FF4D4D]/10 text-[#FF4D4D] font-bold"
                                  : "text-slate-700 hover:bg-slate-100"
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <span className="w-5 h-3.5 flex items-center justify-center overflow-hidden rounded-[2px] shrink-0">
                                  <img
                                    src={`https://flagcdn.com/w40/${c.iso}.png`}
                                    alt={c.country}
                                    className="h-full w-auto max-w-none object-contain"
                                    onError={(e) => {
                                      (
                                        e.currentTarget as HTMLElement
                                      ).style.display = "none";
                                    }}
                                  />
                                </span>
                                <span className="truncate">{c.country}</span>
                              </div>
                              <span className="text-[11px] text-slate-400 font-semibold shrink-0 ml-1">
                                {c.code}
                              </span>
                            </button>
                          );
                        })}
                        {filteredCountries.length === 0 && (
                          <p className="text-xs text-slate-400 text-center py-3">
                            No countries found
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <input
                type="tel"
                name={field.name}
                value={phoneNumber}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/\D/g, "");
                  const maxLen = countryCode === "+91" ? 10 : 15;
                  const limited = cleaned.slice(0, maxLen);
                  setForm((prev: Record<string, unknown>) => ({
                    ...prev,
                    [field.name]: `${countryCode} ${limited}`.trim(),
                  }));
                }}
                placeholder={
                  countryCode === "+91"
                    ? "9876543210 (10 digits)"
                    : field.placeholder || "Enter phone number"
                }
                className={`flex-1 h-11 sm:h-12 px-4 rounded-xl border bg-white text-xs sm:text-sm font-medium text-[#10162F] placeholder:text-slate-400 outline-none transition shadow-xs ${
                  phoneNumber && phoneError
                    ? "border-[#FF4D4D] focus:border-[#FF4D4D] focus:ring-1 focus:ring-[#FF4D4D]"
                    : "border-slate-200 hover:border-slate-800 focus:border-[#10162F] focus:ring-1 focus:ring-[#10162F]"
                }`}
                autoComplete="off"
              />
            </div>

            {/* Validation Feedback */}
            {phoneNumber && phoneError ? (
              <div className="flex items-center gap-1.5 text-xs text-[#FF4D4D] font-semibold pt-0.5">
                <svg
                  className="w-3.5 h-3.5 shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{phoneError}</span>
              </div>
            ) : phoneNumber && isPhoneValid ? (
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold pt-0.5">
                <svg
                  className="w-3.5 h-3.5 shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Valid mobile number</span>
              </div>
            ) : null}
          </div>
        );
      }

      case "text":
      case "email":
      case "url":
        return (
          <div className="space-y-2" key={field.name}>
            <label className="block text-xs sm:text-sm font-bold text-[#10162F]">
              {field.label}{" "}
              {field.required ? (
                <span className="text-[#FF4D4D]">*</span>
              ) : (
                <span className="text-slate-400 text-xs font-normal">
                  (optional)
                </span>
              )}
            </label>
            <div className="relative">
              <input
                type={field.type}
                name={field.name}
                value={val as string}
                onChange={handleChange}
                placeholder={field.placeholder}
                className="w-full px-4 py-3 sm:py-3.5 bg-white border border-slate-200 hover:border-slate-800 focus:border-[#10162F] focus:ring-1 focus:ring-[#10162F] focus:outline-none rounded-xl text-xs sm:text-sm font-medium transition-all shadow-xs text-[#10162F] placeholder:text-slate-400"
                autoComplete="off"
              />
            </div>

            {/* Live Username Availability Feedback */}
            {field.checkAvailability && Boolean(form[field.name]) && (
              <div className="pt-1">
                {usernameChecking && (
                  <div className="flex items-center gap-1.5 text-xs text-blue-600 font-medium">
                    <svg
                      className="animate-spin w-3.5 h-3.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Checking availability...</span>
                  </div>
                )}
                {!usernameChecking && !usernameAvailable && (
                  <div className="flex items-center gap-1.5 text-xs text-[#FF4D4D] font-semibold">
                    <svg
                      className="w-3.5 h-3.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Username is already taken</span>
                  </div>
                )}
                {!usernameChecking && usernameAvailable && (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
                    <svg
                      className="w-3.5 h-3.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Username is available!</span>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case "select":
        return (
          <div className="space-y-3" key={field.name}>
            <h2 className="text-base sm:text-lg font-bold text-[#10162F]">
              {field.label}{" "}
              {field.required ? (
                <span className="text-[#FF4D4D]">*</span>
              ) : (
                <span className="text-slate-400 text-xs font-normal">
                  (optional)
                </span>
              )}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              {(field.options as FieldOption[] | undefined)?.map((opt) => {
                const v = optionValue(opt);
                const isSelected = val === v;
                return (
                  <button
                    key={v}
                    type="button"
                    onClick={() =>
                      setForm((prev: Record<string, unknown>) => ({
                        ...prev,
                        [field.name]: v,
                      }))
                    }
                    className={`px-3.5 sm:px-4 py-3 sm:py-3.5 border text-left text-xs sm:text-sm font-semibold transition-all rounded-xl shadow-xs cursor-pointer flex items-center justify-between gap-2 ${
                      isSelected
                        ? "bg-[#FFF0F0] border-[#FF4D4D] text-[#10162F] font-bold"
                        : "bg-white border-slate-200 hover:border-slate-800 text-slate-800"
                    }`}
                  >
                    <span>{optionLabel(opt)}</span>
                    {isSelected && (
                      <svg
                        className="w-4 h-4 text-[#FF4D4D] shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );

      case "multiselect":
        return (
          <div className="space-y-3" key={field.name}>
            <h2 className="text-base sm:text-lg font-bold text-[#10162F]">
              {field.label}{" "}
              {field.required ? (
                <span className="text-[#FF4D4D]">*</span>
              ) : (
                <span className="text-slate-400 text-xs font-normal">
                  (optional)
                </span>
              )}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              {(field.options as FieldOption[] | undefined)?.map((opt) => {
                const v = optionValue(opt);
                const isSelected = (val as string[]).includes(v);
                return (
                  <button
                    key={v}
                    type="button"
                    onClick={() => handleButtonClick(field.name, v)}
                    className={`px-3.5 sm:px-4 py-3 sm:py-3.5 border text-left text-xs sm:text-sm font-semibold transition-all rounded-xl shadow-xs cursor-pointer flex items-center justify-between gap-2 ${
                      isSelected
                        ? "bg-[#FFF0F0] border-[#FF4D4D] text-[#10162F] font-bold"
                        : "bg-white border-slate-200 hover:border-slate-800 text-slate-800"
                    }`}
                  >
                    <span>{optionLabel(opt)}</span>
                    {isSelected && (
                      <svg
                        className="w-4 h-4 text-[#FF4D4D] shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-5">
      {currentFields.map((field) => renderField(field))}
    </div>
  );
};

export default OnboardingForm;
