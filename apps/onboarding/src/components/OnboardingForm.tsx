import type { BaseUser, OnboardingFieldConfig } from "@tbe/types";
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
      case "text":
      case "email":
      case "url":
      case "tel":
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
