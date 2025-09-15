import React from 'react';
import { useSearchParams } from 'react-router-dom';
import OnboardingLayout from '../components/OnboardingLayout';
import OnboardingForm from '../components/OnboardingForm';
import { useOnboarding } from '../hooks/useOnboarding';
import { isValidProduct } from '../config/products';

const Onboarding: React.FC = () => {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userId') || '';
  const productId = searchParams.get('productId') || 'webapp';
  const from = searchParams.get('from') || '';
  const redirect = searchParams.get('redirect') || '/';
  const token = searchParams.get('token') || '';

  const {
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
    isFieldValid,
    setUsernameAvailability,
    setUsernameChecking,
  } = useOnboarding({ userId, productId, redirect, token, from });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-green-50">
        <div className="text-lg font-semibold animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!userId || !isValidProduct(productId) || !config) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-green-50">
        <div className="text-red-600 font-semibold text-xl">
          Invalid onboarding link.
        </div>
      </div>
    );
  }

  return (
    <OnboardingLayout
      step={step}
      totalSteps={totalSteps}
      onBack={handleBack}
      onNext={handleNext}
      onFinish={handleFinish}
      isFieldValid={isFieldValid}
      submitting={submitting}
      error={error}
      config={config}
    >
      <OnboardingForm
        config={config}
        form={form as Record<string, unknown>}
        setForm={setForm}
        step={step}
        productId={productId}
        token={token}
        user={user || undefined}
        onUsernameAvailabilityChange={(available, checking) => {
          setUsernameAvailability(available);
          setUsernameChecking(checking);
        }}
      />
    </OnboardingLayout>
  );
};

export default Onboarding;
