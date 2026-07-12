import { useScrollDirection } from "@tbe/hooks";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import { useEffect } from "react";

import type { UseResumeBuilderReturn } from "@/types/builder";

interface BuilderMainProps {
  builder: UseResumeBuilderReturn;
}

// ── Inline SVG icons ──────────────────────────────────────────────────────────

const LightbulbIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M9 1.5a5.25 5.25 0 00-3 9.558V13.5a.75.75 0 00.75.75h4.5A.75.75 0 0012 13.5v-2.442A5.25 5.25 0 009 1.5z"
      stroke="#d97706"
      strokeWidth="1.3"
      strokeLinejoin="round"
    />
    <path
      d="M7.5 15.75h3"
      stroke="#d97706"
      strokeWidth="1.3"
      strokeLinecap="round"
    />
  </svg>
);

const EyeIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M1.5 9s2.75-5.25 7.5-5.25S16.5 9 16.5 9s-2.75 5.25-7.5 5.25S1.5 9 1.5 9z"
      stroke="#3b82f6"
      strokeWidth="1.3"
      strokeLinejoin="round"
    />
    <circle cx="9" cy="9" r="2.25" stroke="#3b82f6" strokeWidth="1.3" />
  </svg>
);

const CheckListIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M6 8.25l2.25 2.25L12 6"
      stroke="#16a34a"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <rect
      x="1.5"
      y="1.5"
      width="15"
      height="15"
      rx="2.5"
      stroke="#16a34a"
      strokeWidth="1.3"
    />
  </svg>
);

const CheckCircleSolidIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
  >
    <circle cx="8" cy="8" r="8" fill="#16a34a" />
    <path
      d="M5 8l2 2 4-4"
      stroke="white"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const XCircleSolidIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
  >
    <circle cx="8" cy="8" r="8" fill="#ef4444" />
    <path
      d="M5.5 5.5l5 5M10.5 5.5l-5 5"
      stroke="white"
      strokeWidth="1.3"
      strokeLinecap="round"
    />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 15 15"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M10 7.5H3M6.5 4L3 7.5 6.5 11"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ArrowRightIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 15 15"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M5 7.5h7M8.5 4L12 7.5 8.5 11"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SparkIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 15 15"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M7.5 1v2M7.5 12v2M1 7.5h2M12 7.5h2M3.22 3.22l1.41 1.41M10.37 10.37l1.41 1.41M3.22 11.78l1.41-1.41M10.37 4.63l1.41-1.41M7.5 5.5a2 2 0 100 4 2 2 0 000-4z"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
    />
  </svg>
);

const CheckboxUnchecked = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    aria-hidden="true"
  >
    <rect
      x="1"
      y="1"
      width="16"
      height="16"
      rx="4"
      stroke="#d1d5db"
      strokeWidth="1.5"
      fill="white"
    />
  </svg>
);

const CheckboxChecked = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    aria-hidden="true"
  >
    <rect width="18" height="18" rx="4" fill="#ef4444" />
    <path
      d="M4.5 9l3 3 6-6"
      stroke="white"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// ── Audience badge colors (pill style) ────────────────────────────────────────
function audiencePillClass(type: string) {
  switch (type) {
    case "tech":
      return "bg-blue-50 text-blue-700 border border-blue-200";
    case "students":
      return "bg-emerald-50 text-emerald-700 border border-emerald-200";
    case "professionals":
      return "bg-violet-50 text-violet-700 border border-violet-200";
    default:
      return "bg-zinc-100 text-zinc-600 border border-zinc-200";
  }
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function BuilderMain({ builder }: BuilderMainProps) {
  const router = useRouter();
  const {
    currentStep,
    currentStepData,
    progress,
    isLastStep,
    calculateStepScore,
    calculateOverallScore,
    updateChecklistItem,
    setCurrentStep,
    setShowResult,
    stepData,
  } = builder;

  useEffect(() => {
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const overallScore = calculateOverallScore();
  const stepScore = calculateStepScore(currentStep);
  const { isVisible } = useScrollDirection(60);

  return (
    <div className="min-h-screen bg-[#f9fafb] pt-[64px]">
      {/* ── Fixed progress bar — hides/shows on scroll exactly like the Navbar ── */}
      <motion.div
        animate={{ y: isVisible ? 0 : -120 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed top-[57px] left-0 right-0 z-30 bg-white border-b border-zinc-100 shadow-sm"
      >
        <div className="max-w-[800px] mx-auto px-[16px] py-[14px]">
          <div className="flex items-center justify-between mb-[10px]">
            <span className="text-[13px] font-medium text-zinc-500">
              Step{" "}
              <span className="text-zinc-900 font-semibold">
                {currentStep + 1}
              </span>{" "}
              of{" "}
              <span className="text-zinc-900 font-semibold">
                {stepData.length}
              </span>
            </span>
            <div className="flex items-center gap-[8px]">
              <span className="text-[12px] text-zinc-400">Score</span>
              <span
                className={`text-[13px] font-bold px-[10px] py-[2px] rounded-full ${
                  overallScore >= 80
                    ? "bg-emerald-50 text-emerald-700"
                    : overallScore >= 50
                      ? "bg-amber-50 text-amber-700"
                      : "bg-rose-50 text-rose-600"
                }`}
              >
                {overallScore}%
              </span>
            </div>
          </div>
          {/* Progress bar */}
          <div className="relative h-[6px] bg-zinc-100 rounded-full overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 bg-[#ef4444] rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </div>
        </div>
      </motion.div>

      {/* Spacer to push content below the fixed progress bar (approx height) */}
      <div className="h-[56px]" aria-hidden="true" />

      {/* ── Main content ── */}
      <div className="max-w-[800px] mx-auto px-[16px] py-[32px]">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-[20px]"
        >
          {/* ── Step header ── */}
          <div className="text-center pb-[8px]">
            <h1 className="text-[1.75rem] sm:text-[2.25rem] font-bold text-zinc-900 leading-tight tracking-tight mb-[8px]">
              {currentStepData.title}
            </h1>
            <p className="text-[14px] sm:text-[15px] text-zinc-500 leading-relaxed mb-[12px]">
              {currentStepData.description}
            </p>
            <span
              className={`inline-block text-[11px] font-semibold px-[12px] py-[4px] rounded-full ${audiencePillClass(currentStepData.audienceType)}`}
            >
              {currentStepData.audience}
            </span>
          </div>

          {/* ── Why This Matters ── */}
          <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-[20px]">
            <div className="flex items-start gap-[12px]">
              <div className="shrink-0 w-[32px] h-[32px] rounded-xl bg-amber-100 flex items-center justify-center mt-[1px]">
                <LightbulbIcon />
              </div>
              <div>
                <h3 className="text-[13px] font-semibold text-amber-800 mb-[6px]">
                  Why This Matters
                </h3>
                <p className="text-[13px] text-amber-700 leading-relaxed">
                  {currentStepData.importance}
                </p>
              </div>
            </div>
          </div>

          {/* ── Recruiter's Perspective ── */}
          <div className="bg-blue-50 border border-blue-200/80 rounded-2xl p-[20px]">
            <div className="flex items-start gap-[12px]">
              <div className="shrink-0 w-[32px] h-[32px] rounded-xl bg-blue-100 flex items-center justify-center mt-[1px]">
                <EyeIcon />
              </div>
              <div>
                <h3 className="text-[13px] font-semibold text-blue-800 mb-[6px]">
                  Recruiter&apos;s Perspective
                </h3>
                <p className="text-[13px] text-blue-700 leading-relaxed">
                  {currentStepData.recruitersPoV}
                </p>
              </div>
            </div>
          </div>

          {/* ── Pro Tips ── */}
          <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-[20px]">
            <div className="flex items-start gap-[12px]">
              <div className="shrink-0 w-[32px] h-[32px] rounded-xl bg-emerald-100 flex items-center justify-center mt-[1px]">
                <CheckListIcon />
              </div>
              <div>
                <h3 className="text-[13px] font-semibold text-emerald-800 mb-[10px]">
                  Pro Tips
                </h3>
                <ul className="space-y-[8px]">
                  {currentStepData.proTips.map((tip, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-[8px] text-[13px] text-emerald-700"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                        className="mt-[2px] shrink-0"
                        aria-hidden="true"
                      >
                        <circle
                          cx="7"
                          cy="7"
                          r="6"
                          fill="rgba(22,163,74,0.15)"
                        />
                        <path
                          d="M4.5 7l2 2 3-3"
                          stroke="#16a34a"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* ── Examples grid ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
            {/* Good example */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-[20px]">
              <div className="flex items-center gap-[8px] mb-[12px]">
                <CheckCircleSolidIcon />
                <h3 className="text-[13px] font-semibold text-emerald-800">
                  Great Example
                </h3>
              </div>
              <p className="text-[12px] text-emerald-700 whitespace-pre-line leading-relaxed font-mono bg-emerald-100/60 rounded-xl p-[12px]">
                {currentStepData.examples.good}
              </p>
            </div>

            {/* Bad example */}
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-[20px]">
              <div className="flex items-center gap-[8px] mb-[12px]">
                <XCircleSolidIcon />
                <h3 className="text-[13px] font-semibold text-rose-800">
                  Weak Example
                </h3>
              </div>
              <p className="text-[12px] text-rose-700 whitespace-pre-line leading-relaxed font-mono bg-rose-100/60 rounded-xl p-[12px]">
                {currentStepData.examples.bad}
              </p>
            </div>
          </div>

          {/* ── Why the difference ── */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-[20px]">
            <h3 className="text-[13px] font-semibold text-zinc-800 mb-[8px] flex items-center gap-[8px]">
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                aria-hidden="true"
              >
                <circle
                  cx="7"
                  cy="7"
                  r="6"
                  stroke="#6366f1"
                  strokeWidth="1.2"
                />
                <path
                  d="M7 4v3.5M7 9.5v.5"
                  stroke="#6366f1"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              </svg>
              Why the difference?
            </h3>
            <p className="text-[13px] text-zinc-600 leading-relaxed">
              {currentStepData.examples.reasoning}
            </p>
          </div>

          {/* ── Checklist ── */}
          <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-[20px] py-[16px] border-b border-zinc-100">
              <h3 className="text-[14px] font-semibold text-zinc-900">
                Checklist
              </h3>
              <span
                className={`text-[12px] font-bold px-[10px] py-[3px] rounded-full ${
                  stepScore >= 80
                    ? "bg-emerald-50 text-emerald-700"
                    : stepScore >= 50
                      ? "bg-amber-50 text-amber-700"
                      : "bg-rose-50 text-rose-600"
                }`}
              >
                {stepScore}%
              </span>
            </div>
            <div className="divide-y divide-zinc-50">
              {currentStepData.checklist.map((item) => (
                <button
                  key={item.id}
                  id={`checklist-${item.id}`}
                  onClick={() =>
                    updateChecklistItem(currentStep, item.id, !item.checked)
                  }
                  className="flex items-center gap-[14px] px-[20px] py-[14px] w-full text-left hover:bg-zinc-50 transition-colors duration-150 cursor-pointer"
                >
                  <span className="shrink-0">
                    {item.checked ? <CheckboxChecked /> : <CheckboxUnchecked />}
                  </span>
                  <span
                    className={`text-[13px] leading-relaxed ${
                      item.checked
                        ? "line-through text-zinc-400"
                        : "text-zinc-700"
                    }`}
                  >
                    {item.text}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Navigation ── */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-[12px] pt-[8px]">
            <button
              id="nav-back-btn"
              onClick={() => {
                if (currentStep === 0) {
                  router.push("/");
                } else {
                  setCurrentStep(Math.max(0, currentStep - 1));
                }
              }}
              className="flex items-center justify-center gap-[8px] px-[20px] py-[12px] rounded-xl border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 text-zinc-700 text-[13px] font-medium transition-all duration-200"
            >
              <ArrowLeftIcon />
              {currentStep === 0 ? "Exit" : "Previous"}
            </button>

            {isLastStep ? (
              <button
                id="nav-show-result-btn"
                onClick={() => setShowResult(true)}
                className="flex items-center justify-center gap-[8px] px-[24px] py-[12px] rounded-xl bg-[#ef4444] hover:bg-[#dc2626] text-white text-[13px] font-semibold shadow-sm transition-all duration-200"
              >
                Show My Results
                <SparkIcon />
              </button>
            ) : (
              <button
                id="nav-next-btn"
                onClick={() =>
                  setCurrentStep(Math.min(stepData.length - 1, currentStep + 1))
                }
                className="flex items-center justify-center gap-[8px] px-[24px] py-[12px] rounded-xl bg-[#ef4444] hover:bg-[#dc2626] text-white text-[13px] font-semibold shadow-sm transition-all duration-200"
              >
                Next Step
                <ArrowRightIcon />
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
