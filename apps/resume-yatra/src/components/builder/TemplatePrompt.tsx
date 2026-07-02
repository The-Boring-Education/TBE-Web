import { motion } from "framer-motion";

import type { UseResumeBuilderReturn } from "@/types/builder";

interface TemplatePromptProps {
  builder: UseResumeBuilderReturn;
}

const DocTemplateIcon = () => (
  <svg
    width="40"
    height="40"
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <rect width="40" height="40" rx="12" fill="rgba(239,68,68,0.08)" />
    <rect
      x="10"
      y="7"
      width="20"
      height="26"
      rx="2.5"
      fill="white"
      stroke="#ef4444"
      strokeWidth="1.5"
    />
    <path
      d="M14 14h12M14 19h12M14 24h8"
      stroke="#ef4444"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <circle cx="30" cy="30" r="7" fill="#ef4444" />
    <path
      d="M27 30l2 2 4-4"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ExternalLinkIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M6 3H3a1 1 0 00-1 1v9a1 1 0 001 1h9a1 1 0 001-1v-3M10 2h4m0 0v4m0-4L7 9"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ArrowRightIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M3 7h8M7.5 3.5L11 7l-3.5 3.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const reasons = [
  "Easy to share with recruiters and mentors",
  "Simple, clean templates that work everywhere",
  "No formatting issues when converting to PDF",
  "Collaborative editing for feedback",
];

export default function TemplatePrompt({ builder }: TemplatePromptProps) {
  return (
    <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center pt-[80px] px-[16px] pb-[40px]">
      <div className="w-full max-w-[560px] mx-auto">
        {/* Fade-in wrapper */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-[24px]"
        >
          {/* Header */}
          <div className="text-center">
            <div className="flex justify-center mb-[20px]">
              <DocTemplateIcon />
            </div>
            <h1 className="text-[2rem] sm:text-[2.25rem] font-bold text-zinc-900 leading-tight tracking-tight">
              Let&apos;s Get You a{" "}
              <span className="text-[#ef4444]">Template First</span>
            </h1>
            <p className="mt-[10px] text-[14px] text-zinc-500 leading-relaxed">
              We recommend Google Docs for the best resume experience
            </p>
          </div>

          {/* Reasons card */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-[28px] shadow-sm">
            <h3 className="text-[14px] font-semibold text-zinc-900 mb-[16px] flex items-center gap-[8px]">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <circle
                  cx="8"
                  cy="8"
                  r="7"
                  stroke="#ef4444"
                  strokeWidth="1.5"
                />
                <path
                  d="M8 5v4M8 11.5v.5"
                  stroke="#ef4444"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              Why Google Docs?
            </h3>
            <ul className="space-y-[12px]">
              {reasons.map((reason, i) => (
                <li key={i} className="flex items-start gap-[10px]">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    className="mt-[1px] shrink-0"
                    aria-hidden="true"
                  >
                    <circle cx="8" cy="8" r="7" fill="rgba(239,68,68,0.08)" />
                    <path
                      d="M5 8l2 2 4-4"
                      stroke="#ef4444"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="text-[13px] text-zinc-600 leading-relaxed">
                    {reason}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Actions */}
          <div className="space-y-[12px]">
            <button
              id="get-template-btn"
              className="w-full flex items-center justify-center gap-[10px] px-[20px] py-[14px] rounded-xl bg-[#ef4444] hover:bg-[#dc2626] text-white text-[14px] font-semibold shadow-sm transition-colors duration-200"
              onClick={() =>
                window.open(
                  "https://docs.google.com/document/d/1w4EBKKmkLg4iF_nCdceXslhZGJVdDpCJtfXsx7NmD58/edit?usp=sharing",
                  "_blank",
                )
              }
            >
              <ExternalLinkIcon />
              Get Template from Google Docs
            </button>

            <button
              id="skip-template-btn"
              className="w-full flex items-center justify-center gap-[10px] px-[20px] py-[14px] rounded-xl border border-zinc-200 hover:border-[#ef4444]/40 hover:bg-zinc-50 text-zinc-700 text-[14px] font-medium transition-all duration-200"
              onClick={() => builder.setShowTemplate(true)}
            >
              Skip Template — Start Checklist
              <ArrowRightIcon />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
