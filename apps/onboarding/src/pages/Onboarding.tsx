import { isValidOnboardingProduct } from "@tbe/config";
import useOnboarding from "@tbe/hooks/useOnboarding";
import { isUserGloballyOnboarded } from "@tbe/utils/onboarding";
import React from "react";
import { useSearchParams } from "react-router-dom";

import OnboardingForm from "../components/OnboardingForm";
import OnboardingLayout from "../components/OnboardingLayout";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;

const OnboardingLoader: React.FC<{ title?: string; subtitle?: string }> = ({
  title = "Setting up your personalized roadmap...",
  subtitle = "Crafting your dashboard across the entire TBE ecosystem",
}) => (
  <div className="fixed inset-0 z-50 bg-white/40 backdrop-blur-[8px] flex flex-col items-center justify-center p-4 text-slate-800 text-center font-sans select-none">
    <style>{`
      @keyframes tiltSeq1 {
        0% { transform: rotate(0deg) translateY(0px); }
        25% { transform: rotate(-18deg) translateY(-3px); }
        50% { transform: rotate(18deg) translateY(2px); }
        75% { transform: rotate(-8deg) translateY(-1px); }
        100% { transform: rotate(0deg) translateY(0px); }
      }
      @keyframes tiltSeq2 {
        0% { transform: rotate(0deg) translateY(0px); }
        25% { transform: rotate(16deg) translateY(2px); }
        50% { transform: rotate(-16deg) translateY(-3px); }
        75% { transform: rotate(8deg) translateY(1px); }
        100% { transform: rotate(0deg) translateY(0px); }
      }
      @keyframes tiltSeq3 {
        0% { transform: rotate(0deg) translateY(0px); }
        25% { transform: rotate(-14deg) translateY(-2px); }
        50% { transform: rotate(14deg) translateY(3px); }
        75% { transform: rotate(-6deg) translateY(-1px); }
        100% { transform: rotate(0deg) translateY(0px); }
      }
      .anim-tilt-1 { animation: tiltSeq1 3.6s ease-in-out infinite; }
      .anim-tilt-2 { animation: tiltSeq2 3.6s ease-in-out 0.5s infinite; }
      .anim-tilt-3 { animation: tiltSeq3 3.6s ease-in-out 1s infinite; }
    `}</style>

    <div className="relative mb-3 flex items-center justify-center">
      <div className="flex items-center justify-center gap-3.5 sm:gap-4 p-2">
        <div className="w-8 h-8 anim-tilt-1 flex items-center justify-center">
          <img
            src="https://ik.imagekit.io/riufvimprm/html.png"
            alt="HTML5"
            className="w-full h-full object-contain"
            onError={(e) => {
              const target = e.currentTarget;
              target.style.display = "none";
            }}
          />
        </div>
        <div className="w-8 h-8 anim-tilt-2 flex items-center justify-center">
          <img
            src="https://ik.imagekit.io/riufvimprm/css.png"
            alt="CSS3"
            className="w-full h-full object-contain"
            onError={(e) => {
              const target = e.currentTarget;
              target.style.display = "none";
            }}
          />
        </div>
        <div className="w-8 h-8 anim-tilt-3 flex items-center justify-center">
          <img
            src="https://ik.imagekit.io/riufvimprm/js.png"
            alt="JavaScript"
            className="w-full h-full object-contain"
            onError={(e) => {
              const target = e.currentTarget;
              target.style.display = "none";
            }}
          />
        </div>
      </div>
    </div>

    <h2 className="text-xs sm:text-sm font-semibold text-slate-800 tracking-tight">
      {title}
    </h2>
    {subtitle && (
      <p className="text-[11px] text-slate-500 mt-1 max-w-xs font-medium leading-relaxed">
        {subtitle}
      </p>
    )}
  </div>
);

const Onboarding: React.FC = () => {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get("userId") || "";
  const productId = searchParams.get("productId") || "webapp";
  const from = searchParams.get("from") || "";
  const redirect = searchParams.get("redirect") || "/";
  const token = searchParams.get("token") || "";

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
  } = useOnboarding({
    userId,
    productId,
    redirect,
    token,
    from,
    apiBaseUrl,
  });

  // If user is already globally onboarded, redirect immediately to target URL
  React.useEffect(() => {
    if (isUserGloballyOnboarded(user)) {
      window.location.href = redirect;
    }
  }, [user, redirect]);

  if (loading) {
    return (
      <OnboardingLoader
        title="Loading your profile..."
        subtitle="Preparing your onboarding experience"
      />
    );
  }

  if (submitting) {
    return (
      <OnboardingLoader
        title="Setting up your personalized roadmap..."
        subtitle="Configuring all apps across the TBE ecosystem"
      />
    );
  }

  if (!userId || !isValidOnboardingProduct(productId) || !config) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
        <div className="p-6 sm:p-8 bg-white border border-slate-200 rounded-2xl shadow-sm text-center max-w-sm w-full space-y-3">
          <img
            src="https://ik.imagekit.io/tbe/webapp/logo.svg"
            alt="The Boring Education Logo"
            className="h-10 w-10 mx-auto object-contain"
          />
          <div className="text-red-500 font-bold text-base">
            Invalid Onboarding Link
          </div>
          <p className="text-xs text-slate-500">
            Please log in through the application to proceed with your
            onboarding.
          </p>
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
        apiBaseUrl={apiBaseUrl}
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
