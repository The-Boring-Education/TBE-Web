import { motion } from "framer-motion";
import { BookOpen, Clock, Target } from "lucide-react";
import Link from "next/link";
import React from "react";

const DEVICONS = {
  react: {
    name: "React",
    url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
  },
  javascript: {
    name: "JavaScript",
    url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg",
  },
  typescript: {
    name: "TypeScript",
    url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg",
  },
  python: {
    name: "Python",
    url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
  },
  cpp: {
    name: "C++",
    url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg",
  },
  java: {
    name: "Java",
    url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg",
  },
  postgresql: {
    name: "PostgreSQL",
    url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg",
  },
  go: {
    name: "Go",
    url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/go/go-original-wordmark.svg",
  },
};

export interface PrepYatraHeroProps {
  ctaText?: string;
  ctaHref?: string;
}

export const PrepYatraHero: React.FC<PrepYatraHeroProps> = ({
  ctaText = "Start Your Prep Journey",
  ctaHref = "/login",
}) => {
  return (
    <section className="relative w-full min-h-[75vh] sm:min-h-[85vh] bg-white overflow-hidden pt-12 pb-16 sm:py-20 flex flex-col items-center justify-center text-gray-900 font-sans selection:bg-primary selection:text-white">
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
          {/* Mobile Floating Tech & Prep Icons */}
          <motion.div
            animate={{ y: [0, -5, 0], rotate: [-6, -2, -6] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
            className="lg:hidden absolute -top-6 -left-2 sm:-left-6 pointer-events-none z-30 drop-shadow-md"
          >
            <img
              src={DEVICONS.react.url}
              alt="React"
              className="w-7 h-7 sm:w-8 sm:h-8 object-contain"
            />
          </motion.div>

          <motion.div
            animate={{ y: [0, 5, 0], rotate: [5, 8, 5] }}
            transition={{
              duration: 4.8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.3,
            }}
            className="lg:hidden absolute -top-6 -right-3 sm:-right-8 pointer-events-none z-30 drop-shadow-md"
          >
            <img
              src={DEVICONS.python.url}
              alt="Python"
              className="w-7 h-7 sm:w-8 sm:h-8 object-contain"
            />
          </motion.div>

          <motion.div
            animate={{ y: [0, -6, 0], rotate: [-4, -1, -4] }}
            transition={{
              duration: 5.2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.6,
            }}
            className="lg:hidden absolute top-[210px] -left-3 sm:-left-8 pointer-events-none z-30 drop-shadow-md"
          >
            <div className="bg-white/95 backdrop-blur-md rounded-xl border border-slate-200/80 px-2.5 py-1.5 shadow-md flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-amber-500/10 flex items-center justify-center text-amber-600">
                <Clock className="w-3.5 h-3.5" />
              </div>
              <span className="text-[11px] font-bold text-slate-800">
                Prep Log
              </span>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-bold text-gray-900 tracking-tight leading-[1.12] sm:leading-[1.08]"
          >
            Turn Hustle Into{" "}
            <span className="text-primary inline-block">Hires</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-4 sm:mt-5 text-gray-500 font-normal text-base sm:text-lg lg:text-xl max-w-2xl leading-relaxed"
          >
            The ultimate community platform for job hunters to store recruiter
            contacts, share prep logs, and crowdsource resources together.
          </motion.p>

          {/* Sleeker CTA Action Button */}
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
        </div>

        {/* Clean Floating Language Icons & Micro Prep Cards */}
        <div className="relative w-full max-w-6xl mx-auto mt-4 hidden lg:block pointer-events-none">
          {/* Left Side Floating Group */}
          <div>
            {/* Python */}
            <motion.div
              animate={{ y: [0, -8, 0], rotate: [-4, -2, -4] }}
              transition={{
                duration: 5.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="pointer-events-auto absolute -top-[330px] left-[-20px] xl:left-[-50px] z-20 hover:scale-110 transition-transform duration-200 drop-shadow-md"
            >
              <img
                src={DEVICONS.python.url}
                alt="Python"
                className="w-10 h-10 object-contain"
              />
            </motion.div>

            {/* Daily Prep Log Card */}
            <motion.div
              animate={{ y: [0, -7, 0], rotate: [-2, 2, -2] }}
              transition={{
                duration: 5.4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.2,
              }}
              className="pointer-events-auto absolute -top-[270px] left-[-40px] xl:left-[0px] z-20 hover:scale-105 transition-transform duration-200"
            >
              <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/80 p-3 shadow-xl shadow-slate-200/50 flex items-center gap-3 min-w-[190px]">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0">
                  <Clock className="w-4.5 h-4.5" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-slate-900 leading-tight">
                    Daily Prep Log
                  </div>
                  <div className="text-[11px] text-amber-600 font-semibold leading-tight mt-0.5">
                    Streak Active 🔥
                  </div>
                </div>
              </div>
            </motion.div>

            {/* React */}
            <motion.div
              animate={{ y: [0, -7, 0], rotate: [3, 1, 3] }}
              transition={{
                duration: 5.2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.6,
              }}
              className="pointer-events-auto absolute -top-[180px] left-[130px] xl:left-[160px] z-20 hover:scale-110 transition-transform duration-200 drop-shadow-md"
            >
              <img
                src={DEVICONS.react.url}
                alt="React"
                className="w-10 h-10 object-contain"
              />
            </motion.div>

            {/* C++ */}
            <motion.div
              animate={{ y: [0, 7, 0], rotate: [-3, -5, -3] }}
              transition={{
                duration: 6.0,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1.0,
              }}
              className="pointer-events-auto absolute -top-[90px] left-[-10px] xl:left-[-40px] z-20 hover:scale-110 transition-transform duration-200 drop-shadow-md"
            >
              <img
                src={DEVICONS.cpp.url}
                alt="C++"
                className="w-10 h-10 object-contain"
              />
            </motion.div>

            {/* TypeScript */}
            <motion.div
              animate={{ y: [0, -6, 0], rotate: [5, 2, 5] }}
              transition={{
                duration: 5.8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1.4,
              }}
              className="pointer-events-auto absolute top-[30px] left-[120px] xl:left-[140px] z-20 hover:scale-110 transition-transform duration-200 drop-shadow-md"
            >
              <img
                src={DEVICONS.typescript.url}
                alt="TypeScript"
                className="w-10 h-10 object-contain shrink-0"
              />
            </motion.div>
          </div>

          {/* Right Side Floating Group */}
          <div>
            {/* Java */}
            <motion.div
              animate={{ y: [0, -8, 0], rotate: [4, 2, 4] }}
              transition={{
                duration: 5.4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.3,
              }}
              className="pointer-events-auto absolute -top-[340px] right-[-20px] xl:right-[-50px] z-20 hover:scale-110 transition-transform duration-200 drop-shadow-md"
            >
              <img
                src={DEVICONS.java.url}
                alt="Java"
                className="w-10 h-10 object-contain"
              />
            </motion.div>

            {/* JavaScript */}
            <motion.div
              animate={{ y: [0, 6, 0], rotate: [-4, -1, -4] }}
              transition={{
                duration: 5.7,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.8,
              }}
              className="pointer-events-auto absolute -top-[230px] right-[140px] xl:right-[170px] z-20 hover:scale-110 transition-transform duration-200 drop-shadow-md"
            >
              <img
                src={DEVICONS.javascript.url}
                alt="JavaScript"
                className="w-10 h-10 object-contain"
              />
            </motion.div>

            {/* Interview Sheets Card */}
            <motion.div
              animate={{ y: [0, 7, 0], rotate: [3, 0, 3] }}
              transition={{
                duration: 5.8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.9,
              }}
              className="pointer-events-auto absolute -top-[160px] right-[-30px] xl:right-[10px] z-20 hover:scale-105 transition-transform duration-200"
            >
              <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/80 p-3 shadow-xl shadow-slate-200/50 flex items-center gap-3 min-w-[190px]">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 shrink-0">
                  <BookOpen className="w-4.5 h-4.5" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-slate-900 leading-tight">
                    Interview Sheets
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium leading-tight mt-0.5">
                    Curated Top Qs
                  </div>
                </div>
              </div>
            </motion.div>

            {/* PostgreSQL */}
            <motion.div
              animate={{ y: [0, -7, 0], rotate: [5, 3, 5] }}
              transition={{
                duration: 6.1,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1.1,
              }}
              className="pointer-events-auto absolute -top-[80px] right-[-10px] xl:right-[-40px] z-20 hover:scale-110 transition-transform duration-200 drop-shadow-md"
            >
              <img
                src={DEVICONS.postgresql.url}
                alt="PostgreSQL"
                className="w-10 h-10 object-contain"
              />
            </motion.div>

            {/* Goal Milestones Card */}
            <motion.div
              animate={{ y: [0, -6, 0], rotate: [-3, 1, -3] }}
              transition={{
                duration: 5.1,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1.2,
              }}
              className="pointer-events-auto absolute top-[30px] right-[120px] xl:right-[150px] z-20 hover:scale-105 transition-transform duration-200"
            >
              <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/80 p-3 shadow-xl shadow-slate-200/50 flex items-center gap-3 min-w-[180px]">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
                  <Target className="w-4.5 h-4.5" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-slate-900 leading-tight">
                    Goal Milestones
                  </div>
                  <div className="text-[11px] text-emerald-600 font-semibold leading-tight mt-0.5">
                    On Track 🎯
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Go */}
            <motion.div
              animate={{ y: [0, 7, 0], rotate: [-5, -2, -5] }}
              transition={{
                duration: 5.3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1.5,
              }}
              className="pointer-events-auto absolute top-[80px] right-[-20px] xl:right-[-40px] z-20 hover:scale-110 transition-transform duration-200 drop-shadow-md"
            >
              <img
                src={DEVICONS.go.url}
                alt="Go"
                className="w-12 h-10 object-contain shrink-0"
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PrepYatraHero;
