import { Button } from "@tbe/components";
import { useRouter } from "next/router";
import { useState } from "react";

import {
  ONCAMPUS_DURATION_OPTIONS,
  saveOncampusPreferences,
} from "./oncampusPreferences";

interface OncampusOnboardingProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (preferences: { duration: string; offCampus: boolean }) => void;
}

const OncampusOnboarding: React.FC<OncampusOnboardingProps> = ({
  userId,
  isOpen,
  onClose,
  onComplete,
}) => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [duration, setDuration] = useState("6Months");
  const [offCampus, setOffCampus] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleFinish = async () => {
    setSaving(true);
    await saveOncampusPreferences(userId, { duration, offCampus });
    onComplete({ duration, offCampus });
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-[#0A0A0A] border border-gray-800 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Campus Prep Setup</h2>
            <p className="text-xs text-gray-500">
              Step {step} of 2 — Personalize your preparation
            </p>
          </div>
          {/* Progress bar */}
          <div className="w-24 h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-red-500 rounded-full transition-all duration-300"
              style={{ width: step === 1 ? "50%" : "100%" }}
            />
          </div>
        </div>

        {/* Step 1: Duration */}
        {step === 1 && (
          <div className="px-6 py-5 space-y-4">
            <div className="text-center">
              <div className="text-3xl mb-2">🎯</div>
              <h3 className="text-base font-semibold text-white">
                How much time until your campus placement?
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                We'll show you the most relevant questions based on your
                timeline
              </p>
            </div>

            <div className="space-y-2">
              {ONCAMPUS_DURATION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setDuration(opt.value)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-left transition-all ${
                    duration === opt.value
                      ? "border-red-500/60 bg-red-500/10 text-white"
                      : "border-gray-700/50 bg-[#111] text-gray-300 hover:border-gray-600"
                  }`}
                >
                  <span className="text-xl">{opt.icon}</span>
                  <div className="flex-1">
                    <div className="text-sm font-semibold">{opt.label}</div>
                    <div className="text-xs text-gray-500">
                      {opt.description}
                    </div>
                  </div>
                  {opt.popular && (
                    <span className="text-[10px] font-bold text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded-full">
                      Popular
                    </span>
                  )}
                </button>
              ))}
            </div>

            <Button
              variant="PRIMARY"
              size="MEDIUM"
              text="Next"
              className="w-full mt-2"
              onClick={() => setStep(2)}
            />
          </div>
        )}

        {/* Step 2: Off Campus */}
        {step === 2 && (
          <div className="px-6 py-5 space-y-4">
            <div className="text-center">
              <div className="text-3xl mb-2">💼</div>
              <h3 className="text-base font-semibold text-white">
                Are you also going to try for Off Campus Jobs?
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Off Campus preparation requires extra skills — we'll add more
                challenging questions if you say yes
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setOffCampus(true)}
                className={`flex flex-col items-center gap-2 px-4 py-5 rounded-lg border transition-all ${
                  offCampus === true
                    ? "border-green-500/60 bg-green-500/10 text-white"
                    : "border-gray-700/50 bg-[#111] text-gray-300 hover:border-gray-600"
                }`}
              >
                <span className="text-2xl">✅</span>
                <span className="text-sm font-semibold">Yes</span>
              </button>
              <button
                onClick={() => setOffCampus(false)}
                className={`flex flex-col items-center gap-2 px-4 py-5 rounded-lg border transition-all ${
                  offCampus === false
                    ? "border-red-500/60 bg-red-500/10 text-white"
                    : "border-gray-700/50 bg-[#111] text-gray-300 hover:border-gray-600"
                }`}
              >
                <span className="text-2xl">❌</span>
                <span className="text-sm font-semibold">No</span>
              </button>
            </div>

            {/* Hint */}
            <div className="rounded-lg bg-yellow-500/5 border border-yellow-500/20 px-4 py-2">
              <p className="text-[11px] text-yellow-400/80 leading-relaxed">
                💡 For Off Campus jobs, you'll need to prepare extra skills like
                React, Node.js, System Design, and more. Enable this to get a
                harder set of questions.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="OUTLINE"
                size="MEDIUM"
                text="Back"
                className="flex-1 border-gray-700 text-gray-300"
                onClick={() => setStep(1)}
              />
              <Button
                variant="PRIMARY"
                size="MEDIUM"
                text={saving ? "Saving..." : "Start Preparing"}
                className="flex-1"
                onClick={handleFinish}
                disabled={saving}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OncampusOnboarding;
