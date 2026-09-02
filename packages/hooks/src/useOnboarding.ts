import { getOnboardingConfig, isValidOnboardingProduct } from "@tbe/config";
import { ANALYTICS_EVENTS } from "@tbe/constants";
import { CACHE_TIMES, queryKeys, useQuery } from "@tbe/query";
import type {
  BaseUser,
  UseOnboardingProps,
  UseOnboardingReturn,
} from "@tbe/types";
import { sendRequest, trackEvent, trackUserActivated } from "@tbe/utils";
import { useEffect, useState } from "react";

export default function useOnboarding({
  userId,
  productId,
  redirect,
  token,
  from,
  apiBaseUrl,
}: UseOnboardingProps): UseOnboardingReturn {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(true);
  const [usernameChecking, setUsernameChecking] = useState(false);

  const config = getOnboardingConfig(productId);

  const stepNumbersWithFields = config
    ? Array.from(new Set(config.fields.map((f) => f.step))).sort(
        (a, b) => a - b,
      )
    : [];
  const totalSteps = stepNumbersWithFields.length;

  const getActualStepNumber = (visibleStep: number) =>
    stepNumbersWithFields[visibleStep - 1];

  const { data: user, isLoading: loading } = useQuery<BaseUser | null>({
    queryKey: queryKeys.user.detail(userId ?? ""),
    queryFn: async () => {
      const response = await sendRequest({
        url: `/user?userId=${userId}`,
        method: "GET",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        baseURL: apiBaseUrl,
      });

      if (response.success && response.data) {
        return response.data as BaseUser;
      }
      return null;
    },
    ...CACHE_TIMES.STANDARD,
    enabled: !!userId && isValidOnboardingProduct(productId),
  });

  // Prefill form when user data arrives
  useEffect(() => {
    if (user && config) {
      const prefillData: Record<string, unknown> = {};
      config.fields.forEach((field) => {
        if (field.prefill?.fromUser) {
          prefillData[field.name] = field.prefill.fromUser(user);
        } else {
          prefillData[field.name] =
            field.prefill?.defaultValue ||
            (field.type === "multiselect" ? [] : "");
        }
      });
      setForm(prefillData);
    }
  }, [user, config]);

  useEffect(() => {
    setForm({});
    setStep(1);
  }, [productId]);

  const handleNext = () => {
    try {
      trackEvent(ANALYTICS_EVENTS.ONBOARDING_NEXT, {
        category: "onboarding",
        label: `${productId}_step_${step}`,
        value: step,
      });
    } catch {}
    setStep((s) => Math.min(s + 1, totalSteps));
  };

  const handleBack = () => {
    try {
      trackEvent(ANALYTICS_EVENTS.ONBOARDING_PREVIOUS, {
        category: "onboarding",
        label: `${productId}_step_${step}`,
        value: step,
      });
    } catch {}
    setStep((s) => Math.max(s - 1, 1));
  };

  const handleFinish = async () => {
    if (!config) {
      setError("Invalid product configuration");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      trackEvent(ANALYTICS_EVENTS.ONBOARDING_SUBMIT, {
        category: "onboarding",
        label: productId,
      });
    } catch {}

    try {
      const payload = config.api.transformPayload(form, userId, from);
      const endpoint =
        typeof config.api.endpoint === "function"
          ? config.api.endpoint(userId)
          : config.api.endpoint;

      const response = await sendRequest({
        url: endpoint,
        method: config.api.method,
        body: payload,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        baseURL: apiBaseUrl,
      });

      if (response.success) {
        try {
          trackEvent(ANALYTICS_EVENTS.ONBOARDING_COMPLETE, {
            category: "onboarding",
            label: productId,
          });
          if (userId) {
            trackUserActivated(userId, productId);
          }
        } catch {}

        // Ensure the personalization animation plays smoothly for at least 3 seconds
        await new Promise((resolve) => setTimeout(resolve, 3000));

        setSubmitting(false);

        if (redirect) {
          window.location.href = redirect;
        }
      } else {
        setSubmitting(false);
        throw new Error(response.error || "Submission failed");
      }
    } catch (err: any) {
      setSubmitting(false);
      const errorMessage = err.message || "Submission failed";
      setError(errorMessage);

      try {
        trackEvent(ANALYTICS_EVENTS.ONBOARDING_ERROR, {
          category: "onboarding",
          label: `${productId}_${errorMessage}`,
        });
      } catch {}
    }
  };

  const isFieldValid = () => {
    if (!config) return false;

    const actualStep = getActualStepNumber(step);
    const currentFields = config.fields.filter((f) => f.step === actualStep);

    return currentFields.every((currentField) => {
      if (!currentField.required) return true;

      const val = form[currentField.name];

      if (currentField.type === "multiselect") {
        return Array.isArray(val) && val.length > 0;
      }

      const hasValue = !!val && val.toString().trim() !== "";

      if (currentField.checkAvailability && hasValue) {
        return usernameAvailable && !usernameChecking;
      }

      return hasValue;
    });
  };

  return {
    user: user ?? null,
    step,
    form,
    setForm,
    loading,
    error,
    submitting,
    config,
    totalSteps,
    handleNext,
    handleBack,
    handleFinish,
    isFieldValid: isFieldValid(),
    setUsernameAvailability: setUsernameAvailable,
    setUsernameChecking,
  };
}
