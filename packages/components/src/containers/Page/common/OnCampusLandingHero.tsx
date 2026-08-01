import { motion } from "framer-motion";
import { BookOpen, HelpCircle, LineChart, Users } from "lucide-react";
import Link from "next/link";
import React from "react";

// --- Devicon Official SVG Logos ---
const DEVICONS = {
  react:
    "https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original.svg",
  javascript:
    "https://raw.githubusercontent.com/devicons/devicon/master/icons/javascript/javascript-original.svg",
  postgresql:
    "https://raw.githubusercontent.com/devicons/devicon/master/icons/postgresql/postgresql-original.svg",
};

export interface OnCampusLandingHeroProps {
  ctaText?: string;
  ctaHref?: string;
}

export const OnCampusLandingHero: React.FC<OnCampusLandingHeroProps> = ({
  ctaText = "Get Started for Free →",
  ctaHref = "/login",
}) => {
  return (
    <section className="relative w-full min-h-[85vh] bg-[#0A0A0C] overflow-hidden pt-8 pb-16 sm:py-20 flex flex-col items-center justify-center text-white font-sans selection:bg-rose-500 selection:text-white">
      {/* --- Dark Ambient Radial Glows --- */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Soft Crimson/Red Glow Center */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-b from-rose-600/20 via-red-900/10 to-transparent blur-3xl rounded-full" />

        {/* Secondary Ambient Blurs */}
        <div className="absolute top-1/4 -left-32 w-80 h-80 bg-rose-500/10 blur-3xl rounded-full" />
        <div className="absolute top-1/3 -right-32 w-80 h-80 bg-red-600/10 blur-3xl rounded-full" />

        {/* Faint Dotted Connecting Traces */}
        <svg
          className="absolute inset-0 w-full h-full opacity-20 stroke-rose-500/40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M 200,200 Q 400,140 600,240"
            strokeDasharray="4 6"
            strokeWidth="1.5"
          />
          <path
            d="M 800,220 Q 1000,280 1200,180"
            strokeDasharray="4 6"
            strokeWidth="1.5"
          />
        </svg>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col items-center">
        {/* --- Main Hero Headline & Subtitle --- */}
        <div className="relative z-20 max-w-3xl mx-auto text-center flex flex-col items-center">
          {/* Mobile Floating Tech Logos (Mobile Only - Positioned Floatingly Around Headline) */}
          <motion.div
            animate={{ y: [0, -5, 0], rotate: [-6, -2, -6] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
            className="lg:hidden absolute -top-3 -left-1 sm:-left-6 pointer-events-none z-30"
          >
            <img
              src={DEVICONS.react}
              alt="React"
              className="w-6 h-6 sm:w-7 sm:h-7 object-contain filter drop-shadow-md"
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
            className="lg:hidden absolute -top-4 -right-4 sm:-right-8 pointer-events-none z-30"
          >
            <img
              src={DEVICONS.javascript}
              alt="JavaScript"
              className="w-6 h-6 sm:w-7 sm:h-7 object-contain filter drop-shadow-md"
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
            className="lg:hidden absolute top-[210px] -left-4 sm:-left-8 pointer-events-none z-30"
          >
            <img
              src={DEVICONS.postgresql}
              alt="Database"
              className="w-6 h-6 sm:w-7 sm:h-7 object-contain filter drop-shadow-md"
            />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.12] sm:leading-[1.08]"
          >
            Advance Your Career <br />
            with <span className="text-[#FF4D4D] inline-block">OnCampus</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-4 sm:mt-5 text-slate-300 font-medium text-base sm:text-lg lg:text-xl max-w-2xl leading-relaxed"
          >
            Prepare smarter for placements with guided aptitude, quizzes,
            interview prep, and{" "}
            <span className="font-semibold text-[#FF4D4D]">core subjects</span>{" "}
            resources in one focused dashboard.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-6 sm:mt-8 w-full sm:w-auto flex justify-center transform-none rotate-0"
          >
            <Link
              href={ctaHref}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#FF4D4D] hover:bg-[#EE3B3B] text-white font-bold text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl shadow-lg shadow-red-500/25 hover:shadow-red-500/35 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] transform-none rotate-0"
            >
              <span>Get Started for Free</span>
              <span className="text-base leading-none">→</span>
            </Link>
          </motion.div>
        </div>

        {/* --- Floating Dark Glassmorphism Cards Section (Desktop Layout Only) --- */}
        <div className="relative w-full max-w-6xl mx-auto mt-6 hidden lg:block">
          {/* Left Side Floating Group (Desktop Only - Shifted Outwards to Avoid Text Overlap) */}
          <div className="pointer-events-none">
            {/* Card 1: Aptitude Preparation (Shifted further left - Tilted -2deg) */}
            <motion.div
              animate={{ y: [0, -8, 0], rotate: [-2, -4, -2] }}
              transition={{
                duration: 5.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="pointer-events-auto absolute -top-[410px] left-[-60px] xl:left-[-100px] w-[290px] bg-[#141416]/95 backdrop-blur-md rounded-2xl border border-white/10 p-4 shadow-2xl shadow-black/80 z-20 transform -rotate-2"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 flex-shrink-0">
                  <LineChart className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-white leading-tight">
                    Aptitude Preparation
                  </div>
                  <div className="text-[11px] text-slate-400 leading-tight mt-0.5">
                    Quant, Reasoning, Verbal & more
                  </div>
                </div>
              </div>

              {/* Line Graph SVG Preview */}
              <div className="relative w-full h-12 mt-2">
                <svg className="w-full h-full" viewBox="0 0 100 40">
                  <path
                    d="M 0 30 Q 25 35 40 20 T 70 15 T 100 8"
                    fill="none"
                    stroke="#9333EA"
                    strokeWidth="2.5"
                  />
                </svg>
                <span className="absolute bottom-0 right-0 text-[10px] font-extrabold text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20">
                  87%
                </span>
              </div>
            </motion.div>

            {/* Floating React Logo (Transparent - Tilted -5deg) */}
            <motion.div
              animate={{ y: [0, -7, 0], rotate: [-5, -2, -5] }}
              transition={{
                duration: 5.4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.7,
              }}
              className="pointer-events-auto absolute -top-[235px] left-[150px] xl:left-[170px] z-20 transform -rotate-5"
            >
              <img
                src={DEVICONS.react}
                alt="React"
                className="w-10 h-10 object-contain drop-shadow-xl filter hover:scale-110 transition-transform duration-200"
              />
            </motion.div>

            {/* Card 2: Practice Quizzes (Shifted further left - Donut Chart - Tilted 3deg) */}
            <motion.div
              animate={{ y: [0, -7, 0], rotate: [3, 1, 3] }}
              transition={{
                duration: 6.2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
              className="pointer-events-auto absolute -top-[125px] left-[-50px] xl:left-[-90px] w-[270px] bg-[#141416]/95 backdrop-blur-md rounded-2xl border border-white/10 p-4 shadow-2xl shadow-black/80 z-20 transform rotate-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 flex-shrink-0">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-white leading-tight">
                    Practice Quizzes
                  </div>
                  <div className="text-[11px] text-slate-400 leading-tight mt-0.5">
                    Topic-wise quizzes to test & improve
                  </div>
                </div>
                <div className="relative w-12 h-12 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-full h-full transform -rotate-90"
                    viewBox="0 0 36 36"
                  >
                    <path
                      className="text-slate-800 stroke-current"
                      strokeWidth="3.5"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-emerald-400 stroke-current"
                      strokeDasharray="72, 100"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="absolute text-[10px] font-extrabold text-white">
                    72%
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Side Floating Group (Desktop Only - Shifted Outwards to Avoid Text Overlap) */}
          <div className="pointer-events-none">
            {/* Card 3: Interview Preparation (Shifted further right - Tilted -4deg) */}
            <motion.div
              animate={{ y: [0, 7, 0], rotate: [-4, -2, -4] }}
              transition={{
                duration: 5.2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.3,
              }}
              className="pointer-events-auto absolute -top-[420px] right-[-60px] xl:right-[-100px] w-[290px] bg-[#141416]/95 backdrop-blur-md rounded-2xl border border-white/10 p-4 shadow-2xl shadow-black/80 z-20 transform -rotate-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 flex-shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-white leading-tight">
                    Interview Preparation
                  </div>
                  <div className="text-[11px] text-slate-400 leading-tight mt-0.5">
                    Curated questions to crack interviews
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-300">
                  <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                  <span>Curated Qs to Crack Interviews</span>
                </div>
                <span className="text-[10px] font-extrabold text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
                  Interview Sheets
                </span>
              </div>
            </motion.div>

            {/* Floating JavaScript Logo (Tilted 5deg) */}
            <motion.div
              animate={{ y: [0, -7, 0], rotate: [5, 8, 5] }}
              transition={{
                duration: 5.6,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.9,
              }}
              className="pointer-events-auto absolute -top-[435px] right-[210px] xl:right-[230px] z-20 transform rotate-5"
            >
              <img
                src={DEVICONS.javascript}
                alt="JavaScript"
                className="w-10 h-10 object-contain drop-shadow-xl filter hover:scale-110 transition-transform duration-200"
              />
            </motion.div>

            {/* Card 4: Core Subjects (Shifted 50px lower & tilted rotate-6 - Tilted 6deg) */}
            <motion.div
              animate={{ y: [0, -6, 0], rotate: [6, 4, 6] }}
              transition={{
                duration: 5.8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.8,
              }}
              className="pointer-events-auto absolute -top-[200px] right-[-30px] xl:right-[-60px] w-[270px] bg-[#141416]/95 backdrop-blur-md rounded-2xl border border-white/10 p-4 shadow-2xl shadow-black/80 z-20 transform rotate-6"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 flex-shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-white leading-tight">
                    Core Subjects
                  </div>
                  <div className="text-[11px] text-slate-400 leading-tight mt-0.5">
                    Notes, important topics, PYQs & concepts
                  </div>
                </div>
              </div>
              <div className="text-[11px] text-slate-400 space-y-1 mt-2 pt-2 border-t border-white/10">
                <div className="flex justify-between font-medium">
                  <span>OS & Networks</span>
                  <span className="text-amber-400 font-bold">Complete</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>DBMS & SQL</span>
                  <span className="text-amber-400 font-bold">Complete</span>
                </div>
              </div>
            </motion.div>

            {/* Floating Database Logo (Transparent - Tilted -4deg) */}
            <motion.div
              animate={{ y: [0, 6, 0], rotate: [-4, -2, -4] }}
              transition={{
                duration: 5.1,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1.1,
              }}
              className="pointer-events-auto absolute top-[40px] right-[170px] xl:right-[190px] z-20 transform -rotate-4"
            >
              <img
                src={DEVICONS.postgresql}
                alt="Database"
                className="w-10 h-10 object-contain drop-shadow-xl filter hover:scale-110 transition-transform duration-200"
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OnCampusLandingHero;
