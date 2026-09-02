import type { OnboardingProductConfig } from "@tbe/types";
import React from "react";

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

const STEP_ILLUSTRATIONS: Record<
  number,
  { image: string; tip: string; fallbackTitle: string }
> = {
  1: {
    image: "/images/note.png",
    tip: "We have hundreds of courses and roadmaps that cover just about everything.",
    fallbackTitle: "Profile & Identity",
  },
  2: {
    image: "/images/target.png",
    tip: "People who set a goal are 40% more likely to achieve it.",
    fallbackTitle: "Focus & Objectives",
  },
  3: {
    image: "/images/laptop.png",
    tip: "Our hands-on learning environment is designed for all experience levels.",
    fallbackTitle: "Experience & Timeline",
  },
  4: {
    image: "/images/bulb.png",
    tip: "Targeting your preferred companies unlocks curated interview sheets and roadmaps.",
    fallbackTitle: "Target & Portfolios",
  },
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
  const title = config?.ui?.branding?.title || "Find what's right for you";
  const subtitle =
    config?.ui?.branding?.subtitle ||
    "Answer quick questions to get recommendations that match your interests.";

  const currentIllustration = STEP_ILLUSTRATIONS[step] || STEP_ILLUSTRATIONS[1];
  const stepsCount = totalSteps || 4;
  const stepsArray = Array.from({ length: stepsCount }, (_, i) => i + 1);

  return (
    <div className="w-full text-[#10162F] py-2 sm:py-4 px-3 sm:px-8 lg:px-12 flex flex-col relative font-sans min-h-screen justify-between">
      {/* Top Header */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between py-2 sm:py-3 border-b border-slate-100 mb-2 sm:mb-4">
        <div className="flex items-center gap-2.5">
          <img
            src="https://ik.imagekit.io/tbe/webapp/logo.svg"
            alt="The Boring Education Logo"
            className="h-8 w-8 object-contain"
          />
          <span className="font-extrabold text-sm sm:text-base text-[#10162F] tracking-tight">
            The Boring Education
          </span>
        </div>
        <div className="text-xs font-semibold text-slate-500 bg-slate-100/80 px-3 py-1 rounded-full border border-slate-200/60">
          Step {step} of {stepsCount}
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-5xl mx-auto flex-1 flex flex-col my-2 sm:my-4">
        {/* Title Header */}
        <div className="text-center mb-5 sm:mb-8 space-y-1 sm:space-y-1.5">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#10162F] tracking-tight">
            {title}
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-slate-600 font-medium max-w-lg mx-auto">
            {subtitle}
          </p>
        </div>

        {/* 3-Column Question Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-8 items-start">
          {/* Stepper */}
          <div className="md:col-span-1 flex md:flex-col items-center justify-center md:justify-start gap-3 sm:gap-4 py-1 sm:py-2">
            {stepsArray.map((num) => {
              const isCompleted = step > num;
              const isActive = step === num;
              return (
                <div
                  key={num}
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all ${
                    isCompleted
                      ? "bg-[#10162F] text-white shadow-xs"
                      : isActive
                        ? "border-2 border-[#10162F] text-[#10162F] bg-white font-extrabold"
                        : "border border-slate-300 text-slate-400 bg-transparent font-medium"
                  }`}
                >
                  {isCompleted ? (
                    <svg
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    num
                  )}
                </div>
              );
            })}
          </div>

          {/* Center Column: Questions & Options */}
          <div className="md:col-span-7 space-y-4 sm:space-y-5">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (step >= stepsCount) {
                  onFinish();
                } else {
                  onNext();
                }
              }}
              className="space-y-4"
            >
              <div>{children}</div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-semibold text-center flex items-center justify-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Navigation Actions */}
              <div className="pt-3 sm:pt-4 flex items-center justify-between border-t border-slate-100">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={onBack}
                    disabled={submitting}
                    className="text-xs sm:text-sm font-bold text-indigo-700 hover:underline cursor-pointer"
                  >
                    ← Back
                  </button>
                ) : (
                  <div />
                )}

                <button
                  type="submit"
                  disabled={!isFieldValid || submitting}
                  className={`px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl font-extrabold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
                    !isFieldValid || submitting
                      ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                      : "bg-[#10162F] hover:bg-slate-800 text-white shadow-md hover:shadow-lg active:scale-98"
                  }`}
                >
                  <span>
                    {step >= stepsCount ? "Finish Setup" : "Continue"}
                  </span>
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Illustration & Note */}
          <div className="md:col-span-4 flex flex-col items-center justify-center text-center p-2 sm:p-4">
            <div className="space-y-3 sm:space-y-4">
              <img
                src={currentIllustration.image}
                alt="Onboarding context"
                className="max-h-40 sm:max-h-56 md:max-h-64 object-contain mx-auto"
                onError={(e) => {
                  const target = e.currentTarget;
                  target.style.display = "none";
                }}
              />
              <p className="text-xs sm:text-sm font-medium text-slate-700 max-w-xs mx-auto">
                {currentIllustration.tip}
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Footer */}
      <footer className="w-full text-center text-[10px] sm:text-xs text-slate-400 pt-4 pb-2">
        The Boring Education • Personalized Learning Roadmap
      </footer>
    </div>
  );
};

export default OnboardingLayout;
