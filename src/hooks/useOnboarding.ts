import { useState, useEffect } from 'react';
import { getProductConfig, isValidProduct } from '../config/products';
import { getUserById, submitOnboarding } from '../utils/api';
import { User, UseOnboardingReturn } from '../types/onboarding';
import { trackEvent } from '../utils/analytics';

interface UseOnboardingProps {
  userId: string;
  productId: string;
  redirect: string;
  token?: string;
  from?: string;
}

export const useOnboarding = ({
  userId,
  productId,
  redirect,
  token,
  from,
}: UseOnboardingProps): UseOnboardingReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(true);
  const [usernameChecking, setUsernameChecking] = useState(false);

  const config = getProductConfig(productId);

  // Get unique step numbers that have at least one field
  const stepNumbersWithFields = config ? Array.from(new Set(config.fields.map(f => f.step))).sort((a, b) => a - b) : [];
  const totalSteps = stepNumbersWithFields.length;

  // Map visible step index (1-based) to actual step number
  const getActualStepNumber = (visibleStep: number) => stepNumbersWithFields[visibleStep - 1];

  // Reset form when product changes
  useEffect(() => {
    setForm({});
    setStep(1);
  }, [productId]);

  // Fetch user data and prefill form
  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      const u = await getUserById(userId, token);
      setUser(u);

      if (u && config) {
        // Prefill form using product configuration
        const prefillData: any = {};
        config.fields.forEach(field => {
          if (field.prefill?.fromUser) {
            prefillData[field.name] = field.prefill.fromUser(u);
          } else {
            prefillData[field.name] =
              field.prefill?.defaultValue ||
              (field.type === 'multiselect' ? [] : '');
          }
        });
        setForm(prefillData);
      }
      setLoading(false);
    }

    if (userId && isValidProduct(productId)) {
      fetchUser();
    }
  }, [userId, productId, token, config]);

  const handleNext = () => {
    try { trackEvent('onboarding_next', { category: 'onboarding', step }); } catch {}
    setStep(s => Math.min(s + 1, totalSteps));
  };

  const handleBack = () => {
    try { trackEvent('onboarding_previous', { category: 'onboarding', step }); } catch {}
    setStep(s => Math.max(s - 1, 1));
  };

  const handleFinish = async () => {
    if (!config) return;

    setSubmitting(true);
    setError('');
    try { trackEvent('onboarding_submit', { category: 'onboarding' }); } catch {}

    const { success, error: apiError } = await submitOnboarding(
      productId,
      userId,
      form,
      token,
      from
    );
    setSubmitting(false);

    if (success) {
      try { trackEvent('onboarding_complete', { category: 'onboarding' }); } catch {}
      window.location.href = redirect;
    } else {
      try { trackEvent('onboarding_error', { category: 'onboarding', error: apiError }); } catch {}
      setError(apiError || 'Submission failed');
    }
  };

  const isFieldValid = () => {
    if (!config) return false;
    const actualStep = getActualStepNumber(step);
    const currentFields = config.fields.filter(f => f.step === actualStep);
    // All required fields for this step must be valid
    return currentFields.every(currentField => {
      if (!currentField.required) return true;
      const val = form[currentField.name];
      if (currentField.type === 'multiselect') {
        return Array.isArray(val) && val.length > 0;
      }
      const hasValue = !!val;
      if (currentField.checkAvailability && hasValue) {
        return usernameAvailable && !usernameChecking;
      }
      return hasValue;
    });
  };

  return {
    user,
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
    // Optionally export stepNumbersWithFields and getActualStepNumber if needed elsewhere
  };
};
