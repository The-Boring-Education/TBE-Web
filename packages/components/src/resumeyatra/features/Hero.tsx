import { motion } from "framer-motion";
import { CheckCircle2, FileCheck, ShieldCheck } from "lucide-react";
import Link from "next/link";
import React from "react";

export interface ResumeYatraHeroProps {
  ctaText?: string;
  ctaHref?: string;
}

export const ResumeYatraHero: React.FC<ResumeYatraHeroProps> = ({
  ctaText = "Start Building My Resume",
  ctaHref = "/builder",
}) => {
  return (
    <section className="relative w-full min-h-[75vh] sm:min-h-[85vh] bg-white pt-12 pb-16 sm:py-20 flex flex-col items-center justify-center text-gray-900 font-sans selection:bg-primary selection:text-white">
      {/* Ambient Light Radial Glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Soft Crimson Ambient Glow */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-gradient-to-b from-primary/10 via-red-500/5 to-transparent blur-3xl rounded-full" />

        {/* Secondary Ambient Blurs */}
        <div className="absolute top-1/4 -left-32 w-80 h-80 bg-primary/5 blur-3xl rounded-full" />
        <div className="absolute top-1/3 -right-32 w-80 h-80 bg-primary/5 blur-3xl rounded-full" />

        {/* Connecting Traces */}
        <svg
          className="absolute inset-0 w-full h-full opacity-20 stroke-primary/30"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M 200,180 Q 400,120 600,220"
            strokeDasharray="4 6"
            strokeWidth="1.5"
          />
          <path
            d="M 800,200 Q 1000,260 1200,160"
            strokeDasharray="4 6"
            strokeWidth="1.5"
          />
        </svg>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col items-center">
        {/* Main Hero Headline & Subtitle */}
        <div className="relative z-20 max-w-3xl mx-auto text-center flex flex-col items-center">
          {/* Mobile Floating Micro Components */}
          <motion.div
            animate={{ y: [0, -5, 0], rotate: [-4, -1, -4] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
            className="lg:hidden absolute -top-8 -left-2 sm:-left-6 pointer-events-none z-30 drop-shadow-sm"
          >
            <div className="bg-white/95 backdrop-blur-md rounded-xl border border-slate-200/80 px-2.5 py-1.5 shadow-md flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-emerald-500/10 flex items-center justify-center text-emerald-600 font-bold text-[10px]">
                98%
              </div>
              <span className="text-[11px] font-bold text-slate-800">
                ATS Pass
              </span>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, 5, 0], rotate: [4, 7, 4] }}
            transition={{
              duration: 4.8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.3,
            }}
            className="lg:hidden absolute -top-8 -right-3 sm:-right-8 pointer-events-none z-30 drop-shadow-sm"
          >
            <div className="bg-white/95 backdrop-blur-md rounded-xl border border-emerald-200 px-2 py-0.5 shadow-sm flex items-center gap-1 text-[9px] font-bold text-emerald-600">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              <span>ATS Approved ✓</span>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-bold text-gray-900 tracking-tight leading-[1.12] sm:leading-[1.08]"
          >
            Stop Sending Resumes <br />
            <span className="text-primary inline-block">That Get Ignored</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-4 sm:mt-5 text-gray-500 font-normal text-base sm:text-lg lg:text-xl max-w-2xl leading-relaxed"
          >
            A step-by-step interactive checklist & builder to craft an
            ATS-friendly developer resume that gets shortlisted.
          </motion.p>

          {/* Sleek CTA Action Button */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-6 sm:mt-8 w-full sm:w-auto flex justify-center"
          >
            <Link
              href={ctaHref}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold text-sm sm:text-base px-6 sm:px-7 py-2.5 sm:py-3 rounded-lg shadow-sm hover:shadow transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
            >
              <span>{ctaText}</span>
              <span className="text-base leading-none">→</span>
            </Link>
          </motion.div>

          {/* Mobile Resume Document Card Preview (Below CTA Button) */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:hidden mt-8 w-full flex justify-center px-2"
          >
            <div className="bg-white rounded-xl border border-slate-200 shadow-xl p-4 max-w-[320px] w-full text-left text-slate-800 relative overflow-hidden select-none">
              {/* Compact ATS Approved Stamp */}
              <div className="absolute top-2.5 right-2.5 bg-emerald-500 text-white px-2 py-0.5 rounded-full text-[9px] font-bold shadow-sm flex items-center gap-1 z-30">
                <CheckCircle2 className="w-2.5 h-2.5 text-white" /> ATS Approved
                ✓
              </div>

              {/* Header & Contact Details */}
              <div className="border-b border-slate-200 pb-2 mb-2">
                <div className="text-xs font-extrabold text-slate-900 leading-tight">
                  Sachin Kr. Shukla
                </div>
                <div className="text-[10px] font-bold text-primary mt-0.5">
                  Senior Full Stack Software Engineer
                </div>
                <div className="text-[9px] text-slate-500 mt-0.5 flex flex-wrap gap-x-1.5 gap-y-0.5">
                  <span>sachin@tbe.com</span>
                  <span>•</span>
                  <span>+91 9876543210</span>
                </div>
              </div>

              {/* 1. Professional Summary */}
              <div className="mb-2 space-y-0.5">
                <div className="text-[8px] font-extrabold uppercase tracking-wider text-slate-400">
                  Professional Summary
                </div>
                <p className="text-[9px] text-slate-600 leading-tight">
                  Full stack engineer with 5+ yrs experience building
                  distributed Node.js/Go backend services and high-performance
                  React frontends.
                </p>
              </div>

              {/* 2. Work Experience */}
              <div className="mb-2 space-y-1">
                <div className="text-[8px] font-extrabold uppercase tracking-wider text-slate-400">
                  Work Experience
                </div>
                <div>
                  <div className="flex justify-between text-[9px] font-bold text-slate-800">
                    <span>Lead Backend Engineer — TechCorp</span>
                    <span className="text-[8px] font-normal text-slate-500">
                      2022 - Present
                    </span>
                  </div>
                  <ul className="text-[8.5px] text-slate-600 list-disc list-inside mt-0.5 space-y-0.5 leading-tight">
                    <li>
                      Scaled API throughput 3x to handle 1M+ daily active
                      sessions
                    </li>
                    <li>Architected event-driven Kafka message pipeline</li>
                  </ul>
                </div>
              </div>

              {/* 3. Featured Projects */}
              <div className="mb-2 space-y-1">
                <div className="text-[8px] font-extrabold uppercase tracking-wider text-slate-400">
                  Featured Projects
                </div>
                <div>
                  <div className="flex justify-between text-[9px] font-bold text-slate-800">
                    <span>CloudPrep Platform</span>
                    <span className="text-[8px] font-normal text-slate-500">
                      React, Node, Redis
                    </span>
                  </div>
                </div>
              </div>

              {/* 4. Core Technical Skills */}
              <div className="pt-1.5 border-t border-slate-100 flex flex-wrap gap-1">
                <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[8px] font-semibold text-slate-700">
                  TypeScript
                </span>
                <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[8px] font-semibold text-slate-700">
                  React
                </span>
                <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[8px] font-semibold text-slate-700">
                  Node.js
                </span>
                <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[8px] font-semibold text-slate-700">
                  Go
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Premium Floating Micro Cards & Multi-Section Resume Document Preview (Desktop Layout) */}
        <div className="relative w-full max-w-6xl mx-auto mt-4 hidden lg:block pointer-events-none">
          {/* Left Side Floating Group: Full Multi-Section Developer Resume Card */}
          <div>
            <motion.div
              animate={{ y: [0, -8, 0], rotate: [2, 0, 2] }}
              transition={{
                duration: 5.6,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.4,
              }}
              className="pointer-events-auto absolute -top-[330px] left-[-30px] xl:left-[-70px] z-20 hover:scale-[1.02] transition-transform duration-300 select-none"
            >
              <div className="bg-white rounded-xl border border-slate-200 shadow-2xl p-4 sm:p-4.5 w-[310px] text-left text-slate-800 relative transform rotate-2 hover:rotate-0 transition-all duration-300">
                {/* Compact ATS Approved Stamp */}
                <div className="absolute top-2.5 right-2.5 bg-emerald-500 text-white px-2 py-0.5 rounded-full text-[9px] font-bold shadow-sm flex items-center gap-1 z-30">
                  <CheckCircle2 className="w-2.5 h-2.5 text-white" /> ATS
                  Approved ✓
                </div>

                {/* Header & Contact Details */}
                <div className="border-b border-slate-200 pb-2 mb-2">
                  <div className="text-xs sm:text-sm font-extrabold text-slate-900 leading-tight">
                    Sachin Kr. Shukla
                  </div>
                  <div className="text-[10px] font-bold text-primary mt-0.5">
                    Senior Full Stack Software Engineer
                  </div>
                  <div className="text-[9px] text-slate-500 mt-0.5 flex flex-wrap gap-x-1.5 gap-y-0.5">
                    <span>sachin@tbe.com</span>
                    <span>•</span>
                    <span>+91 9876543210</span>
                    <span>•</span>
                    <span>linkedin.com/in/sachin</span>
                  </div>
                </div>

                {/* 1. Professional Summary */}
                <div className="mb-2 space-y-0.5">
                  <div className="text-[8px] font-extrabold uppercase tracking-wider text-slate-400">
                    Professional Summary
                  </div>
                  <p className="text-[9px] text-slate-600 leading-tight">
                    Full stack engineer with 5+ yrs experience building
                    distributed Node.js/Go backend services and high-performance
                    React frontends.
                  </p>
                </div>

                {/* 2. Work Experience */}
                <div className="mb-2 space-y-1">
                  <div className="text-[8px] font-extrabold uppercase tracking-wider text-slate-400">
                    Work Experience
                  </div>
                  <div>
                    <div className="flex justify-between text-[9px] font-bold text-slate-800">
                      <span>Lead Backend Engineer — TechCorp</span>
                      <span className="text-[8px] font-normal text-slate-500">
                        2022 - Present
                      </span>
                    </div>
                    <ul className="text-[8.5px] text-slate-600 list-disc list-inside mt-0.5 space-y-0.5 leading-tight">
                      <li>
                        Scaled API throughput 3x to handle 1M+ daily active
                        sessions
                      </li>
                      <li>Architected event-driven Kafka message pipeline</li>
                    </ul>
                  </div>
                </div>

                {/* 3. Featured Projects */}
                <div className="mb-2 space-y-1">
                  <div className="text-[8px] font-extrabold uppercase tracking-wider text-slate-400">
                    Featured Projects
                  </div>
                  <div>
                    <div className="flex justify-between text-[9px] font-bold text-slate-800">
                      <span>CloudPrep Platform</span>
                      <span className="text-[8px] font-normal text-slate-500">
                        React, Node, Redis
                      </span>
                    </div>
                    <p className="text-[8.5px] text-slate-600 leading-tight">
                      Real-time interview preparation platform serving 50k+ job
                      seekers.
                    </p>
                  </div>
                </div>

                {/* 4. Education */}
                <div className="mb-2">
                  <div className="text-[8px] font-extrabold uppercase tracking-wider text-slate-400 mb-0.5">
                    Education
                  </div>
                  <div className="flex justify-between text-[8.5px]">
                    <span className="font-bold text-slate-800">
                      B.Tech in Computer Science
                    </span>
                    <span className="text-slate-500">2018 - 2022</span>
                  </div>
                </div>

                {/* 5. Core Technical Skills */}
                <div className="pt-1.5 border-t border-slate-100 flex flex-wrap gap-1">
                  <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[8px] font-semibold text-slate-700">
                    TypeScript
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[8px] font-semibold text-slate-700">
                    React
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[8px] font-semibold text-slate-700">
                    Node.js
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[8px] font-semibold text-slate-700">
                    Go
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[8px] font-semibold text-slate-700">
                    Docker
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[8px] font-semibold text-slate-700">
                    PostgreSQL
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Recruiter Approved Card */}
            <motion.div
              animate={{ y: [0, 7, 0], rotate: [-2, -4, -2] }}
              transition={{
                duration: 6.0,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1.0,
              }}
              className="pointer-events-auto absolute -top-[40px] left-[140px] xl:left-[170px] z-20 hover:scale-105 transition-transform duration-200"
            >
              <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/80 p-3 shadow-xl shadow-slate-200/50 flex items-center gap-3 min-w-[200px]">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 shrink-0">
                  <FileCheck className="w-4.5 h-4.5" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-slate-900 leading-tight">
                    Recruiter Approved
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium leading-tight mt-0.5">
                    Developer Format
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Side Floating Group */}
          <div>
            {/* ATS Score Card */}
            <motion.div
              animate={{ y: [0, -8, 0], rotate: [-3, -1, -3] }}
              transition={{
                duration: 5.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="pointer-events-auto absolute -top-[330px] right-[-20px] xl:right-[-50px] z-20 hover:scale-105 transition-transform duration-200"
            >
              <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/80 p-3.5 shadow-xl shadow-slate-200/50 flex items-center gap-3 min-w-[200px]">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 font-extrabold text-sm shrink-0">
                  98%
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-slate-900 leading-tight">
                    ATS Optimized
                  </div>
                  <div className="text-[11px] text-emerald-600 font-semibold leading-tight mt-0.5">
                    Shortlist Ready ✓
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Interactive Checklist Card */}
            <motion.div
              animate={{ y: [0, -8, 0], rotate: [3, 1, 3] }}
              transition={{
                duration: 5.4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.3,
              }}
              className="pointer-events-auto absolute -top-[180px] right-[120px] xl:right-[150px] z-20 hover:scale-105 transition-transform duration-200"
            >
              <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/80 p-3.5 shadow-xl shadow-slate-200/50 flex items-center gap-3 min-w-[210px]">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-primary shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-slate-900 leading-tight">
                    Interactive Checklist
                  </div>
                  <div className="text-[11px] text-rose-600 font-semibold leading-tight mt-0.5">
                    14 Points Verified
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ResumeYatraHero;
