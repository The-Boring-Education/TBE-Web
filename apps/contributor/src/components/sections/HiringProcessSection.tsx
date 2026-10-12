import React from "react";

import { LANDING } from "@/config/landing";

export default function HiringProcessSection() {
  const { process } = LANDING;

  return (
    <section id="process" className="py-16 md:py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-[#EA4544] font-bold text-xs tracking-widest uppercase">
            {process.badge}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mt-2">
            {process.heading}
          </h2>
          <p className="text-sm sm:text-base text-gray-500 mt-2.5">
            {process.subheading}
          </p>
        </div>

        {/* 4 Process Steps with Connectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 relative">
          {process.steps.map((step, idx) => (
            <React.Fragment key={step.num}>
              <div className="relative bg-[#FAFAFA] border border-gray-100 rounded-2xl p-6 flex flex-col items-center text-center shadow-2xs hover:shadow-xs transition-shadow">
                {/* Step Number Circle */}
                <div className="w-9 h-9 rounded-full bg-[#EA4544] text-white font-bold text-sm flex items-center justify-center mb-4 shadow-sm">
                  {step.num}
                </div>

                {/* Step Title */}
                <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-2">
                  {step.title}
                </h3>

                {/* Step Description */}
                <p className="text-xs text-gray-500 leading-relaxed">
                  {step.desc}
                </p>

                {/* Right Arrow for desktop (between items) */}
                {idx < process.steps.length - 1 && (
                  <div className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-white border border-gray-200 items-center justify-center text-gray-400">
                    <svg
                      className="w-3.5 h-3.5 text-[#EA4544]"
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
                  </div>
                )}
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
