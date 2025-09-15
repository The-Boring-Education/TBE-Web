import React from 'react';
import { OnboardingProductConfig } from '../types/onboarding';
import logo from '../assets/logo.svg';

interface OnboardingLayoutProps {
  children: React.ReactNode;
  step: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
  onFinish: () => void;
  isFieldValid: boolean;
  submitting: boolean;
  error?: string;
  config?: OnboardingProductConfig | null;
}

const ProgressBar = ({ step, total }: { step: number; total: number }) => {
  // Calculate progress based on completed steps (step - 1) out of total steps
  const completedSteps = step - 1;
  const percent = Math.round((completedSteps / total) * 100);
  
  return (
    <div className="w-full mb-6">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-medium text-gray-700">
          Step {step} of {total}
        </span>
        <span className="text-xs font-medium text-gray-700">
          {percent}% Complete
        </span>
      </div>
      <div className="w-full h-2 bg-gray-100 border border-gray-200 rounded-full overflow-hidden shadow-inner">
        <div
          className="h-2 bg-red-400 rounded-full transition-all duration-700 ease-out shadow-lg"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

const BrandingHeader = ({
  config,
}: {
  config?: OnboardingProductConfig | null;
}) => {
  const title = config?.ui?.branding?.title || 'Welcome Onboard!';
  const subtitle =
    config?.ui?.branding?.subtitle ||
    "Let's get you set up in just a few quick steps.";
  // const logo = config?.ui?.branding?.logo || '/favicon.svg';

  return (
    <div className="flex flex-col items-center mb-8">
      <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">
        {title}
      </h1>
      <p className="text-gray-500 text-center max-w-md text-base leading-relaxed">
        {subtitle}
      </p>
      <div className="mt-4 w-16 h-1 bg-gray-200 rounded-full"></div>
    </div>
  );
};

const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({
  children,
  step,
  totalSteps,
  onBack,
  onNext,
  onFinish,
  isFieldValid,
  submitting,
  error,
  config,
}) => {
  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gray-100 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gray-100 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gray-100 rounded-full opacity-10 blur-3xl"></div>
      </div>

      {/* Centered onboarding card */}
      <div className="w-full max-w-xl px-4 mx-auto relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
        {/* Card with border and rounded corners for focus */}
        <div className="p-8 relative overflow-visible w-full border border-gray-200 rounded-2xl shadow-md bg-white">
          {/* Logo centered above branding header */}
          <div className="flex justify-center mb-4">
            <img src={logo} alt="Boring Education Logo" className="h-14 w-14" />
          </div>
          <BrandingHeader config={config} />
          <ProgressBar step={step} total={totalSteps} />
          <form
            onSubmit={e => {
              e.preventDefault();
              if (step === totalSteps) {
                onFinish();
              } else {
                onNext();
              }
            }}
            className="relative"
          >
            {/* Remove white bg, border, and shadow from form content */}
            <div className="p-0">{children}</div>
            {error && (
              <div className="mt-4 p-3 bg-pink-50 border border-pink-200 rounded-2xl text-pink-600 text-sm text-center font-medium shadow-sm flex items-center justify-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12A9 9 0 113 12a9 9 0 0118 0z"
                  />
                </svg>
                <span>{error}</span>
              </div>
            )}
            <div className="flex justify-between items-center mt-8">
              <button
                type="button"
                onClick={onBack}
                disabled={step === 1 || submitting}
                className="px-4 py-2 rounded-md bg-white text-red-500 font-medium shadow hover:bg-red-50 transition-all duration-200 disabled:opacity-50 border border-red-200 hover:shadow"
              >
                <div className="flex items-center space-x-1">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  <span>Back</span>
                </div>
              </button>
              {step < totalSteps ? (
                <button
                  type="submit"
                  disabled={!isFieldValid || submitting}
                  className="px-6 py-2 rounded-md bg-red-500 text-white font-medium shadow hover:bg-red-600 transition-all duration-200 disabled:opacity-50 hover:shadow transform hover:scale-105"
                >
                  <div className="flex items-center space-x-1">
                    <span>Next</span>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!isFieldValid || submitting}
                  className="px-6 py-2 rounded-md bg-red-500 text-white font-medium shadow hover:bg-red-600 transition-all duration-200 disabled:opacity-50 hover:shadow transform hover:scale-105"
                >
                  <div className="flex items-center space-x-1">
                    {submitting ? (
                      <>
                        <svg
                          className="animate-spin w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <span>Finish</span>
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </>
                    )}
                  </div>
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OnboardingLayout;
