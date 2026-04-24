"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

// Utility to hide scrollbar but allow scrolling
const noScrollbar =
  "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]";

// Wrapper: centers on mobile, aligns right on desktop
const wrapperAlign = "w-full max-w-[420px] mx-auto lg:ml-auto lg:mr-0";

/* ─────────────────────────────────────────────
   1. CHECKLIST VISUAL — Animated step-by-step checklist
   ───────────────────────────────────────────── */
const CHECKLIST_STEPS = [
  {
    id: "1",
    label: "Contact Information",
    hint: "Name, email, LinkedIn, GitHub",
  },
  { id: "2", label: "Professional Summary", hint: "2–3 lines, role-specific" },
  { id: "3", label: "Work Experience", hint: "STAR format bullet points" },
  {
    id: "4",
    label: "Skills & Tech Stack",
    hint: "Relevant to job description",
  },
  { id: "5", label: "Projects", hint: "Impact + tech used + links" },
];

export function ChecklistVisual() {
  const [checkedCount, setCheckedCount] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    const startTimer = setTimeout(() => runSequence(), 800);
    return () => clearTimeout(startTimer);
  }, []);

  const runSequence = () => {
    if (isRunning) return;
    setIsRunning(true);
    setCheckedCount(0);
    CHECKLIST_STEPS.forEach((_, i) => {
      setTimeout(() => {
        setCheckedCount(i + 1);
        if (i === CHECKLIST_STEPS.length - 1) {
          setTimeout(() => {
            setCheckedCount(0);
            setIsRunning(false);
          }, 2500);
        }
      }, i * 700);
    });
  };

  const pct = Math.round((checkedCount / CHECKLIST_STEPS.length) * 100);

  return (
    <div
      className={`${wrapperAlign} rounded-[2rem] border border-gray-200 bg-white p-6 shadow-xl flex flex-col gap-4 cursor-pointer select-none`}
      onClick={() => {
        if (!isRunning) runSequence();
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">
            Resume Checklist
          </p>
          <p className="text-xl font-black text-gray-900">
            {checkedCount}/{CHECKLIST_STEPS.length} Complete
          </p>
        </div>
        {/* Progress ring */}
        <div className="relative w-14 h-14 flex-shrink-0">
          <svg
            width="56"
            height="56"
            viewBox="0 0 56 56"
            className="-rotate-90"
          >
            <circle
              cx="28"
              cy="28"
              r="22"
              fill="none"
              stroke="#f3f4f6"
              strokeWidth="5"
            />
            <circle
              cx="28"
              cy="28"
              r="22"
              fill="none"
              stroke="#ef4444"
              strokeWidth="5"
              strokeDasharray={`${2 * Math.PI * 22}`}
              strokeDashoffset={`${2 * Math.PI * 22 * (1 - pct / 100)}`}
              strokeLinecap="round"
              className="transition-all duration-500 ease-out"
              style={{ filter: "drop-shadow(0 0 4px rgba(239,68,68,0.5))" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-black text-gray-900">{pct}%</span>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className={`flex flex-col gap-1 overflow-y-auto ${noScrollbar}`}>
        {CHECKLIST_STEPS.map((step, i) => {
          const done = i < checkedCount;
          const active = i === checkedCount;
          return (
            <motion.div
              key={step.id}
              animate={active ? { x: [0, 4, 0] } : {}}
              transition={{
                duration: 0.4,
                repeat: active ? Infinity : 0,
                repeatDelay: 0.6,
              }}
              className={`flex items-center gap-2 rounded-xl px-3 py-1.5 border transition-all duration-500 ${
                done
                  ? "bg-green-50 border-green-200"
                  : active
                    ? "bg-primary/5 border-primary/30 shadow-sm"
                    : "bg-gray-50 border-transparent"
              }`}
            >
              {/* Checkbox */}
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                  done
                    ? "bg-green-500 border-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"
                    : active
                      ? "border-primary"
                      : "border-gray-300"
                }`}
              >
                {done && (
                  <svg
                    className="w-2.5 h-2.5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
                {active && (
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                )}
              </div>
              {/* Text */}
              <div className="flex flex-col min-w-0">
                <span
                  className={`text-[11px] font-black transition-colors ${done ? "text-gray-400 line-through" : active ? "text-gray-900" : "text-gray-500"}`}
                >
                  {step.label}
                </span>
                {(done || active) && (
                  <span className="text-[8px] font-semibold text-gray-400">
                    {step.hint}
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
      <p className="text-center text-[9px] text-gray-400 font-semibold uppercase tracking-wider">
        Click to restart demo
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────────
   2. ATS SCORE VISUAL — Animated score meter
   ───────────────────────────────────────────── */
const ATS_KEYWORDS = [
  { word: "React.js", matched: true },
  { word: "Node.js", matched: true },
  { word: "REST APIs", matched: true },
  { word: "TypeScript", matched: true },
  { word: "Leadership", matched: false },
  { word: "Agile", matched: false },
];

export function AtsScoreVisual() {
  const [mounted, setMounted] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 400);
    return () => clearTimeout(t);
  }, []);

  const score = hovered ? 94 : 42;
  const circ = 2 * Math.PI * 40;

  const scoreColor =
    score >= 80 ? "#22c55e" : score >= 60 ? "#eab308" : "#ef4444";
  const scoreShadow =
    score >= 80
      ? "rgba(34,197,94,0.5)"
      : score >= 60
        ? "rgba(234,179,8,0.5)"
        : "rgba(239,68,68,0.5)";

  return (
    <div
      className={`${wrapperAlign} rounded-[2rem] border border-gray-200 bg-white p-6 shadow-xl flex flex-col gap-5 cursor-pointer select-none`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">
            ATS Compatibility
          </p>
          <p className="text-sm font-semibold text-gray-500">
            {hovered ? "Optimized resume" : "Before optimization"}
          </p>
        </div>
        <div
          className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-full border transition-all duration-700 ${
            score >= 80
              ? "bg-green-50 text-green-600 border-green-200"
              : "bg-red-50 text-red-500 border-red-200"
          }`}
        >
          {score >= 80 ? "✓ ATS Ready" : "⚠ Needs Work"}
        </div>
      </div>

      {/* Score Ring */}
      <div className="flex items-center justify-center">
        <div className="relative">
          <svg
            width="120"
            height="120"
            viewBox="0 0 100 100"
            className="-rotate-90"
          >
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#f3f4f6"
              strokeWidth="8"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke={scoreColor}
              strokeWidth="8"
              strokeDasharray={circ}
              strokeDashoffset={mounted ? circ - (circ * score) / 100 : circ}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
              style={{ filter: `drop-shadow(0 0 6px ${scoreShadow})` }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className="text-3xl font-black transition-all duration-1000"
              style={{ color: scoreColor }}
            >
              {mounted ? score : 0}
            </span>
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
              Score
            </span>
          </div>
        </div>
      </div>

      {/* Keywords */}
      <div className="border-t border-gray-100 pt-4">
        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-3">
          Keyword Match
        </p>
        <div className="flex flex-wrap gap-2">
          {ATS_KEYWORDS.map((kw) => {
            const show = hovered ? true : !kw.matched;
            return (
              <span
                key={kw.word}
                className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full border transition-all duration-700 ${
                  kw.matched
                    ? "bg-green-50 text-green-600 border-green-200"
                    : show
                      ? "bg-red-50 text-red-400 border-red-200 line-through opacity-60"
                      : "bg-red-50 text-red-400 border-red-200"
                } ${hovered && kw.matched ? "scale-105" : ""}`}
              >
                {kw.matched ? "✓ " : ""}
                {kw.word}
              </span>
            );
          })}
        </div>
      </div>
      <p className="text-center text-[9px] text-gray-400 font-semibold uppercase tracking-wider">
        Hover to see optimized score
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────────
   3. TEMPLATE VISUAL — 3D Flip Card (resume preview)
   ───────────────────────────────────────────── */
export function TemplateVisual() {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className={`${wrapperAlign} group relative h-[420px] perspective-[1800px] cursor-pointer`}
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
    >
      <div
        className={`relative flex h-full w-full transition-transform duration-700 ${flipped ? "[transform:rotateY(180deg)]" : ""}`}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* FRONT */}
        <div
          className="absolute inset-0 backface-hidden rounded-[2rem] border border-gray-200 bg-gradient-to-b from-white to-gray-50 p-7 flex flex-col justify-between shadow-xl"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div>
            <div className="mb-4 inline-flex items-center rounded-lg bg-primary/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-primary border border-primary/20">
              <svg
                className="w-3.5 h-3.5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              FAANG-Approved Template
            </div>
            <h3 className="text-3xl font-black text-gray-900 mb-3">
              Battle-Tested Format
            </h3>
            <p className="text-sm text-gray-500 font-semibold leading-relaxed">
              Hover to preview the exact resume template that's helped
              developers land at Google, Amazon & top startups.
            </p>
          </div>
          <div className="flex border-t border-gray-100 pt-4 gap-4">
            <div className="flex-1">
              <span className="block text-[10px] text-gray-400 uppercase tracking-widest font-black mb-1">
                Companies
              </span>
              <span className="text-2xl font-bold text-gray-900">200+</span>
            </div>
            <div className="w-px bg-gray-100" />
            <div className="flex-1">
              <span className="block text-[10px] text-gray-400 uppercase tracking-widest font-black mb-1">
                Developers
              </span>
              <span className="text-2xl font-bold text-gray-900">10K+</span>
            </div>
          </div>
        </div>

        {/* BACK — Resume preview */}
        <div
          className="absolute inset-0 backface-hidden rounded-[2rem] border border-gray-200 bg-white p-6 [transform:rotateY(180deg)] flex flex-col shadow-xl overflow-hidden"
          style={{ backfaceVisibility: "hidden" }}
        >
          {/* ATS Badge at top right */}
          <div className="absolute top-5 right-5">
            <span className="text-[8px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-1 rounded-lg">
              ATS Ready ✓
            </span>
          </div>

          {/* Resume mock */}
          <div className="border-b border-gray-200 pb-2 mb-2 pr-16">
            <h3 className="text-base font-black text-gray-900">Sachin Kumar</h3>
            <p className="text-[11px] text-gray-500 font-semibold mt-0.5">
              Full Stack Developer
            </p>
            <p className="text-[9px] text-gray-400 mt-0.5">
              sachin@dev.com • github.com/sachin
            </p>
          </div>
          <div className="mb-2">
            <p className="text-[9px] font-black uppercase tracking-widest text-primary mb-1">
              Summary
            </p>
            <p className="text-[11px] text-gray-600 leading-tight">
              Software Engineer with 3+ years building scalable web apps with
              React & Node.js.
            </p>
          </div>
          <div className="mb-2">
            <p className="text-[9px] font-black uppercase tracking-widest text-primary mb-1">
              Experience
            </p>
            <div className="space-y-1.5">
              <div>
                <p className="text-[11px] font-black text-gray-900 leading-tight">
                  Senior Engineer · TechCorp{" "}
                  <span className="text-gray-400 font-normal">2022–Now</span>
                </p>
                <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">
                  • Reduced API latency by 60% via caching
                </p>
              </div>
            </div>
          </div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-primary mb-1">
              Skills
            </p>
            <div className="flex flex-wrap gap-1">
              {["React", "Node.js", "TypeScript", "AWS", "Docker"].map((s) => (
                <span
                  key={s}
                  className="text-[9px] font-bold bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   4. RESUME PROGRESS VISUAL — Bar chart + completion ring
   ───────────────────────────────────────────── */
const RESUME_SECTIONS = [
  { label: "Contact Info", pct: 100 },
  { label: "Summary", pct: 100 },
  { label: "Experience", pct: 80 },
  { label: "Projects", pct: 60 },
  { label: "Skills", pct: 40 },
  { label: "Education", pct: 0 },
];

export function ResumeProgressVisual() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 300);
    return () => clearTimeout(t);
  }, []);

  const overallPct = Math.round(
    RESUME_SECTIONS.reduce((acc, s) => acc + s.pct, 0) / RESUME_SECTIONS.length,
  );
  const circ = 2 * Math.PI * 40;

  return (
    <div
      className={`${wrapperAlign} rounded-[2.5rem] border border-gray-200 bg-white p-6 flex flex-col gap-5 shadow-xl`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
            <svg
              className="w-3 h-3 text-primary"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
                clipRule="evenodd"
              />
            </svg>
            Resume Strength
          </span>
          <span className="text-3xl font-black text-gray-900">
            {mounted ? overallPct : 0}%
          </span>
        </div>
        <div className="bg-primary/10 border border-primary/20 text-primary text-xs font-bold px-4 py-2 rounded-xl">
          Good Start
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Completion ring */}
        <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:-translate-y-1 transition-transform duration-500">
          <div className="relative mb-3">
            <svg
              width="90"
              height="90"
              viewBox="0 0 100 100"
              className="-rotate-90"
            >
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#f3f4f6"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#ef4444"
                strokeWidth="8"
                strokeDasharray={circ}
                strokeDashoffset={
                  mounted ? circ - (circ * overallPct) / 100 : circ
                }
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
                style={{ filter: "drop-shadow(0 0 6px rgba(239,68,68,0.5))" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-black text-gray-900">
                {mounted ? overallPct : 0}%
              </span>
            </div>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Complete
          </span>
        </div>

        {/* Section bars */}
        <div className={`flex flex-col gap-2 overflow-y-auto ${noScrollbar}`}>
          {RESUME_SECTIONS.map((sec, i) => (
            <div key={sec.label} className="flex flex-col gap-0.5">
              <div className="flex justify-between items-center">
                <span className="text-[8px] font-bold text-gray-500 uppercase tracking-wider">
                  {sec.label}
                </span>
                <span
                  className={`text-[8px] font-black ${sec.pct === 100 ? "text-green-500" : sec.pct === 0 ? "text-gray-300" : "text-primary"}`}
                >
                  {sec.pct}%
                </span>
              </div>
              <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${
                    sec.pct === 100
                      ? "bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.5)]"
                      : sec.pct === 0
                        ? "bg-gray-200"
                        : "bg-primary shadow-[0_0_6px_rgba(239,68,68,0.4)]"
                  }`}
                  style={{
                    width: mounted ? `${sec.pct}%` : "0%",
                    transitionDelay: `${i * 100}ms`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
