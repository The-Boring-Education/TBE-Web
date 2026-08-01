import { routes } from "@tbe/constants";
import { motion } from "framer-motion";
import { Brain, Check, Code2, Flame, LineChart } from "lucide-react";
import Link from "next/link";
import React from "react";

// --- Devicon Official SVG Logos ---
const DEVICONS = {
  python:
    "https://raw.githubusercontent.com/devicons/devicon/master/icons/python/python-original.svg",
  cplusplus:
    "https://raw.githubusercontent.com/devicons/devicon/master/icons/cplusplus/cplusplus-original.svg",
  java: "https://raw.githubusercontent.com/devicons/devicon/master/icons/java/java-original.svg",
  javascript:
    "https://raw.githubusercontent.com/devicons/devicon/master/icons/javascript/javascript-original.svg",
};

export interface DsaYatraLandingHeroProps {
  ctaText?: string;
  ctaHref?: string;
}

export const DsaYatraLandingHero: React.FC<DsaYatraLandingHeroProps> = ({
  ctaText = "Get Started →",
  ctaHref = routes.dsayatra.dashboard,
}) => {
  return (
    <section className="relative w-full min-h-[85vh] bg-[#0A0A0C] overflow-hidden pt-8 pb-16 sm:py-20 flex flex-col items-center justify-center text-white font-sans selection:bg-rose-500 selection:text-white">
      {/* --- Dark Ambient Radial Glows --- */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Soft Red/Rose Glow Center */}
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
          {/* Mobile Floating Icons (Mobile Only - Sleeker & Smaller Floating Badges) */}
          <motion.div
            animate={{ y: [0, -5, 0], rotate: [-6, -2, -6] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
            className="lg:hidden absolute -top-3 -left-1 sm:-left-6 pointer-events-none z-30"
          >
            <img
              src={DEVICONS.python}
              alt="Python"
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
            className="lg:hidden absolute -top-2 -right-1 sm:-right-6 pointer-events-none z-30"
          >
            <img
              src={DEVICONS.cplusplus}
              alt="C++"
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
            className="lg:hidden absolute top-[105px] -left-2 sm:-left-8 pointer-events-none z-30"
          >
            <img
              src={DEVICONS.java}
              alt="Java"
              className="w-6 h-6 sm:w-7 sm:h-7 object-contain filter drop-shadow-md"
            />
          </motion.div>

          <motion.div
            animate={{ y: [0, 4, 0], rotate: [3, 6, 3] }}
            transition={{
              duration: 5.0,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.4,
            }}
            className="lg:hidden absolute top-[110px] -right-2 sm:-right-8 pointer-events-none z-30"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#141416]/90 backdrop-blur border border-white/10 flex items-center justify-center text-[#FF4D4D] shadow-lg">
              <Code2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, -5, 0], rotate: [4, 1, 4] }}
            transition={{
              duration: 5.4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.8,
            }}
            className="lg:hidden absolute -bottom-4 -left-1 sm:-left-6 pointer-events-none z-30 flex items-center gap-1 bg-[#141416]/90 backdrop-blur border border-white/10 px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-lg"
          >
            <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
            <span>12d Streak</span>
          </motion.div>

          <motion.div
            animate={{ y: [0, 6, 0], rotate: [-3, -6, -3] }}
            transition={{
              duration: 5.6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1.0,
            }}
            className="lg:hidden absolute -bottom-4 -right-1 sm:-right-6 pointer-events-none z-30"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#141416]/90 backdrop-blur border border-white/10 flex items-center justify-center text-[#FF4D4D] shadow-lg">
              <Brain className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.12] sm:leading-[1.08]"
          >
            Stop Grinding <br />
            <span className="text-[#FF4D4D] inline-block">
              Random LeetCode
            </span>{" "}
            <br />
            Questions
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-4 sm:mt-5 text-slate-300 font-medium text-base sm:text-lg lg:text-xl max-w-2xl leading-relaxed"
          >
            Stop grinding random LeetCode questions. Follow a{" "}
            <span className="font-semibold text-white">structured path</span>{" "}
            tailored to{" "}
            <span className="font-semibold text-[#FF4D4D]">your goals</span> and{" "}
            <span className="font-semibold text-[#FF4D4D]">timeline</span>.
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
              <span>{ctaText}</span>
            </Link>
          </motion.div>
        </div>

        {/* --- Floating Dark Glassmorphism Cards Section (Desktop Layout Only) --- */}
        <div className="relative w-full max-w-6xl mx-auto mt-6 hidden lg:block">
          {/* Left Side Floating Group (Desktop Only - Distinct Non-Overlapping Offsets & Dynamic Tilts) */}
          <div className="pointer-events-none">
            {/* Top Left Card: Progress Donut (Tilted -2deg) */}
            <motion.div
              animate={{ y: [0, -8, 0], rotate: [-2, -4, -2] }}
              transition={{
                duration: 5.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="pointer-events-auto absolute -top-[410px] left-0 xl:-left-6 w-[280px] bg-[#141416]/95 backdrop-blur-md rounded-2xl border border-white/10 p-4 shadow-2xl shadow-black/80 z-20 transform -rotate-2"
            >
              <div className="text-xs font-bold text-slate-300 mb-3">
                Progress
              </div>
              <div className="flex items-center gap-3.5">
                {/* Donut Chart SVG */}
                <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-full h-full transform -rotate-90"
                    viewBox="0 0 36 36"
                  >
                    <path
                      className="text-slate-800 stroke-current"
                      strokeWidth="4"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-[#FF4D4D] stroke-current"
                      strokeDasharray="68, 100"
                      strokeWidth="4"
                      strokeLinecap="round"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="absolute text-xs font-extrabold text-white">
                    68%
                  </span>
                </div>

                {/* Legend */}
                <div className="flex-1 min-w-0 flex flex-col gap-1.5 text-[11px] font-medium">
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 text-slate-300 truncate">
                      <span className="w-2 h-2 rounded-full bg-[#FF4D4D] flex-shrink-0" />
                      Solved
                    </span>
                    <span className="font-bold text-white flex-shrink-0">
                      340
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 text-slate-300 truncate">
                      <span className="w-2 h-2 rounded-full bg-rose-400 flex-shrink-0" />
                      In Progress
                    </span>
                    <span className="font-bold text-white flex-shrink-0">
                      120
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 text-slate-300 truncate">
                      <span className="w-2 h-2 rounded-full bg-slate-600 flex-shrink-0" />
                      Remaining
                    </span>
                    <span className="font-bold text-white flex-shrink-0">
                      140
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Middle Left Floating Badge: Code Icon (Tilted 4deg) */}
            <motion.div
              animate={{ y: [0, 6, 0], rotate: [4, 6, 4] }}
              transition={{
                duration: 4.8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5,
              }}
              className="pointer-events-auto absolute -top-[245px] left-10 xl:left-14 bg-[#141416]/95 backdrop-blur-md rounded-2xl border border-white/10 p-3.5 shadow-xl shadow-black/80 z-20 transform rotate-4"
            >
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#FF4D4D]">
                <Code2 className="w-5 h-5" />
              </div>
            </motion.div>

            {/* Floating Python Logo (Tilted -5deg) */}
            <motion.div
              animate={{ y: [0, -7, 0], rotate: [-5, -2, -5] }}
              transition={{
                duration: 5.4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.7,
              }}
              className="pointer-events-auto absolute -top-[235px] left-40 xl:left-48 z-20 transform -rotate-5"
            >
              <img
                src={DEVICONS.python}
                alt="Python"
                className="w-10 h-10 object-contain drop-shadow-xl filter hover:scale-110 transition-transform duration-200"
              />
            </motion.div>

            {/* Bottom Left Card: Current Streak (Tilted 3deg) */}
            <motion.div
              animate={{ y: [0, -7, 0], rotate: [3, 1, 3] }}
              transition={{
                duration: 6.2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
              className="pointer-events-auto absolute -top-[125px] left-0 xl:-left-6 w-[270px] bg-[#141416]/95 backdrop-blur-md rounded-2xl border border-white/10 p-4 shadow-2xl shadow-black/80 z-20 transform rotate-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white shadow-md shadow-rose-500/20 flex-shrink-0">
                  <Flame className="w-5 h-5 fill-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-bold text-slate-400 truncate">
                    Current Streak
                  </div>
                  <div className="text-lg font-extrabold text-white leading-none mt-0.5">
                    12{" "}
                    <span className="text-xs font-normal text-slate-400">
                      days
                    </span>
                  </div>
                </div>
              </div>

              {/* Days Checkmarks Grid (Grid 7 Columns - Clean Non-Overflowing Fit) */}
              <div className="grid grid-cols-7 gap-1 mt-3.5 pt-3 border-t border-white/10 text-[10px] font-bold text-slate-400 text-center">
                {["M", "T", "W", "T", "F", "S", "S"].map((day, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col items-center gap-1 min-w-0"
                  >
                    <span className="text-[10px] font-bold text-slate-400">
                      {day}
                    </span>
                    <div className="w-3.5 h-3.5 rounded-full bg-[#FF4D4D] text-white flex items-center justify-center flex-shrink-0">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Side Floating Group (Desktop Only - Distinct Non-Overlapping Offsets & Dynamic Tilts) */}
          <div className="pointer-events-none">
            {/* Top Right Floating Badge: Analytics Icon (Tilted -4deg) */}
            <motion.div
              animate={{ y: [0, 7, 0], rotate: [-4, -2, -4] }}
              transition={{
                duration: 5.2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.3,
              }}
              className="pointer-events-auto absolute -top-[420px] right-12 xl:right-18 bg-[#141416]/95 backdrop-blur-md rounded-2xl border border-white/10 p-3.5 shadow-xl shadow-black/80 z-20 transform -rotate-4"
            >
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#FF4D4D]">
                <LineChart className="w-5 h-5" />
              </div>
            </motion.div>

            {/* Floating C++ Logo (Tilted 5deg) */}
            <motion.div
              animate={{ y: [0, -7, 0], rotate: [5, 8, 5] }}
              transition={{
                duration: 5.6,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.9,
              }}
              className="pointer-events-auto absolute -top-[395px] right-44 xl:right-52 z-20 transform rotate-5"
            >
              <img
                src={DEVICONS.cplusplus}
                alt="C++"
                className="w-10 h-10 object-contain drop-shadow-xl filter hover:scale-110 transition-transform duration-200"
              />
            </motion.div>

            {/* Middle Right Card: Top Skills (Tilted -3deg) */}
            <motion.div
              animate={{ y: [0, -6, 0], rotate: [-3, -5, -3] }}
              transition={{
                duration: 5.8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.8,
              }}
              className="pointer-events-auto absolute -top-[260px] right-0 xl:-right-4 w-64 bg-[#141416]/95 backdrop-blur-md rounded-2xl border border-white/10 p-4 shadow-2xl shadow-black/80 z-20 transform -rotate-3"
            >
              <div className="text-xs font-bold text-slate-300 mb-3">
                Top Skills
              </div>
              <div className="flex flex-col gap-3">
                <div>
                  <div className="flex justify-between text-[11px] font-bold mb-1">
                    <span className="text-white">Arrays & Hashing</span>
                    <span className="text-slate-400">80%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#FF4D4D] h-full rounded-full w-[80%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-bold mb-1">
                    <span className="text-white">Dynamic Programming</span>
                    <span className="text-slate-400">65%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#FF4D4D] h-full rounded-full w-[65%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-bold mb-1">
                    <span className="text-white">Graphs</span>
                    <span className="text-slate-400">60%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#FF4D4D] h-full rounded-full w-[60%]" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Floating Java Logo (Placed Safely Below Top Skills Card - Tilted -4deg) */}
            <motion.div
              animate={{ y: [0, 6, 0], rotate: [-4, -2, -4] }}
              transition={{
                duration: 5.1,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1.1,
              }}
              className="pointer-events-auto absolute top-[20px] right-[190px] xl:right-[210px] z-20 transform -rotate-4"
            >
              <img
                src={DEVICONS.java}
                alt="Java"
                className="w-10 h-10 object-contain drop-shadow-xl filter hover:scale-110 transition-transform duration-200"
              />
            </motion.div>

            {/* Lower Right Floating Badge: Brain Icon (Placed Safely Below Top Skills Card - Tilted 4deg) */}
            <motion.div
              animate={{ y: [0, -8, 0], rotate: [4, 2, 4] }}
              transition={{
                duration: 6.0,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1.2,
              }}
              className="pointer-events-auto absolute top-[30px] right-2 xl:right-6 bg-[#141416]/95 backdrop-blur-md rounded-2xl border border-white/10 p-3.5 shadow-xl shadow-black/80 z-20 transform rotate-4"
            >
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#FF4D4D]">
                <Brain className="w-5 h-5" />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DsaYatraLandingHero;
