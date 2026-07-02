import { motion } from "framer-motion";

import type { UseResumeBuilderReturn } from "@/types/builder";

interface InitialChoiceProps {
  builder: UseResumeBuilderReturn;
}

const CreateIcon = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 28 28"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <rect
      x="4"
      y="2"
      width="16"
      height="20"
      rx="2"
      fill="#fef2f2"
      stroke="#ef4444"
      strokeWidth="1.5"
    />
    <path
      d="M8 8h8M8 12h8M8 16h5"
      stroke="#ef4444"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <circle cx="22" cy="22" r="5" fill="#ef4444" />
    <path
      d="M22 19.5v5M19.5 22h5"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const ImprovIcon = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 28 28"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <rect
      x="4"
      y="2"
      width="16"
      height="20"
      rx="2"
      fill="#fef2f2"
      stroke="#ef4444"
      strokeWidth="1.5"
    />
    <path
      d="M8 8h8M8 12h8M8 16h5"
      stroke="#ef4444"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <circle cx="22" cy="22" r="5" fill="#ef4444" />
    <path
      d="M19.5 22l2 2 3-3"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function InitialChoice({ builder }: InitialChoiceProps) {
  return (
    <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center pt-[80px] px-[16px] pb-[40px]">
      <div className="w-full max-w-[640px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-[40px]"
        >
          {/* Pre-title badge */}
          <div className="inline-flex items-center gap-[6px] px-[12px] py-[5px] rounded-full bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.2)] mb-[20px]">
            <span className="w-[5px] h-[5px] rounded-full bg-[#ef4444] inline-block" />
            <span className="text-[11px] font-semibold text-[#ef4444] tracking-wide uppercase">
              Resume Builder
            </span>
          </div>
          <h1 className="text-[2rem] sm:text-[2.5rem] font-bold text-zinc-900 leading-tight tracking-tight">
            Let&apos;s Build Your{" "}
            <span className="text-[#ef4444]">Perfect Resume</span>
          </h1>
          <p className="mt-[12px] text-[15px] text-zinc-500 leading-relaxed">
            Choose your starting point to begin the resume improvement process
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-[16px]">
          {/* Create Resume Card */}
          <motion.button
            id="choice-create-resume"
            custom={0}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            onClick={() => builder.setHasResume(false)}
            className="group text-left relative bg-white border border-zinc-200 rounded-2xl p-[28px] shadow-sm hover:shadow-lg hover:border-[#ef4444]/40 overflow-hidden transition-all duration-300 cursor-pointer w-full"
          >
            {/* Top accent line on hover — clipped cleanly by parent overflow-hidden */}
            <div className="absolute inset-x-0 top-0 h-[3px] bg-[#ef4444] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="mb-[20px]">
              <CreateIcon />
            </div>
            <h2 className="text-[17px] font-semibold text-zinc-900 mb-[8px]">
              Create Resume
            </h2>
            <p className="text-[13px] text-zinc-500 leading-relaxed mb-[24px]">
              Start from scratch with our step-by-step guided checklist
            </p>
            <span className="inline-flex items-center gap-[8px] px-[18px] py-[9px] rounded-xl bg-[#ef4444] text-white text-[13px] font-semibold shadow-sm group-hover:bg-[#dc2626] transition-colors duration-200">
              Start Fresh
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
            </span>
          </motion.button>

          {/* Improve Resume Card */}
          <motion.button
            id="choice-improve-resume"
            custom={1}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            onClick={() => builder.setHasResume(true)}
            className="group text-left relative bg-white border border-zinc-200 rounded-2xl p-[28px] shadow-sm hover:shadow-lg hover:border-[#ef4444]/40 overflow-hidden transition-all duration-300 cursor-pointer w-full"
          >
            <div className="absolute inset-x-0 top-0 h-[3px] bg-[#ef4444] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="mb-[20px]">
              <ImprovIcon />
            </div>
            <h2 className="text-[17px] font-semibold text-zinc-900 mb-[8px]">
              Improve Resume
            </h2>
            <p className="text-[13px] text-zinc-500 leading-relaxed mb-[24px]">
              Already have a resume? Improve it step by step
            </p>
            <span className="inline-flex items-center gap-[8px] px-[18px] py-[9px] rounded-xl border border-[#ef4444] text-[#ef4444] text-[13px] font-semibold group-hover:bg-[#ef4444] group-hover:text-white transition-colors duration-200">
              Improve Existing
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
            </span>
          </motion.button>
        </div>

        {/* Social proof */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-center text-[12px] text-zinc-400 mt-[32px]"
        >
          <span className="text-zinc-600 font-medium">10,000+</span> developers
          built better resumes with Resume Yatra
        </motion.p>
      </div>
    </div>
  );
}
