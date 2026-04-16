"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
// Utility to hide scrollbar but allow scrolling
const noScrollbar =
  "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]";

// Wrapper alignment classes: Centers on mobile, pushes flush right on Desktop (lg)
const wrapperAlign = "w-full max-w-[420px] mx-auto lg:ml-auto lg:mr-0";

/* ─────────────────────────────────────────────
   1. TOPIC ROADMAP — Alternating Zigzag Timeline
   ───────────────────────────────────────────── */
const TIMELINE_NODES = [
  { id: "1", title: "Arrays & Hash", desc: "Core Basics" },
  { id: "2", title: "Two Pointers", desc: "Optimization" },
  { id: "3", title: "Sliding Window", desc: "Subarrays" },
  { id: "4", title: "Trees & DFS", desc: "Layered Grids" },
  { id: "5", title: "Dynamic Prog", desc: "Memoization" },
];

export function RoadmapVisual() {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      aria-label="Sequential timeline roadmap"
      className={`${wrapperAlign} relative h-[420px] flex flex-col justify-between py-6 group`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Central Axis Line */}
      <div className="absolute top-6 bottom-6 left-1/2 w-0.5 bg-gradient-to-b from-yellow-500/50 via-white/10 to-transparent -translate-x-1/2" />

      {TIMELINE_NODES.map((node, i) => {
        const isLeft = i % 2 === 0;
        const delay = hovered ? i * 120 : 0;
        return (
          <div
            key={node.id}
            className="w-full flex items-center relative z-10 transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
            style={{
              opacity: hovered ? 1 : 0.3,
              transform: hovered ? "translateY(0)" : "translateY(10px)",
              transitionDelay: `${delay}ms`,
            }}
          >
            {/* Left Box */}
            <div
              className={`w-[45%] flex ${isLeft ? "justify-end pr-5" : "justify-start"}`}
            >
              {isLeft && (
                <div className="flex flex-col items-end text-right">
                  <span className="text-sm font-black text-white">
                    {node.title}
                  </span>
                  <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mt-0.5">
                    {node.desc}
                  </span>
                </div>
              )}
            </div>

            {/* Center Node */}
            <div className="w-[10%] flex justify-center flex-shrink-0">
              <div
                className="w-3 h-3 rounded-full border-2 border-[#09090B] transition-all duration-700 relative flex items-center justify-center"
                style={{
                  backgroundColor: hovered
                    ? "rgba(234,179,8,1)"
                    : "rgba(51,51,51,1)",
                  boxShadow: hovered ? "0 0 15px rgba(234,179,8,0.8)" : "none",
                  transform: hovered ? "scale(1.25)" : "scale(1)",
                  transitionDelay: `${delay}ms`,
                }}
              >
                {hovered && (
                  <div
                    className="absolute inset-0 bg-yellow-500 rounded-full animate-ping opacity-60"
                    style={{ animationDelay: `${delay}ms` }}
                  />
                )}
              </div>
            </div>

            {/* Right Box */}
            <div
              className={`w-[45%] flex ${!isLeft ? "justify-start pl-5" : "justify-end"}`}
            >
              {!isLeft && (
                <div className="flex flex-col items-start text-left">
                  <span className="text-sm font-black text-white">
                    {node.title}
                  </span>
                  <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mt-0.5">
                    {node.desc}
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────
   2. SHEETS — 3D Flip Card
   ───────────────────────────────────────────── */
type Difficulty = "Easy" | "Medium" | "Hard";
const SHEET_PROBLEMS: { id: number; title: string; diff: Difficulty }[] = [
  { id: 1, title: "Two Sum", diff: "Easy" },
  { id: 2, title: "Valid Parentheses", diff: "Easy" },
  { id: 3, title: "Longest Substring", diff: "Medium" },
  { id: 4, title: "3Sum", diff: "Medium" },
  { id: 5, title: "Coin Change", diff: "Medium" },
  { id: 6, title: "Word Ladder", diff: "Hard" },
];

export function SheetsVisual() {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className={`${wrapperAlign} group relative h-[380px] perspective-[1800px]`}
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
    >
      <div
        className={`relative flex h-full w-full transition-transform duration-700 preserve-3d cursor-pointer ${
          flipped ? "[transform:rotateY(180deg)]" : ""
        }`}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* FRONT */}
        <div
          className="absolute inset-0 backface-hidden rounded-[2rem] border border-white/5 bg-gradient-to-b from-[#18181A] to-[#0A0A0C] p-8 flex flex-col justify-between shadow-2xl transition-all duration-500 group-hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.8)]"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div>
            <div className="mb-4 inline-flex items-center rounded-lg bg-emerald-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-400 border border-emerald-500/20">
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
              Auto-Curated
            </div>
            <h3 className="text-3xl font-black text-white mb-3">
              Targeted Sheets
            </h3>
            <p className="text-sm text-gray-500 font-semibold leading-relaxed">
              Hover over this card to dive into an automatically aligned problem
              set curated for MNC goals.
            </p>
          </div>
          <div className="flex border-t border-white/10 pt-4 gap-4">
            <div className="flex-1">
              <span className="block text-[10px] text-gray-400 uppercase tracking-widest font-black mb-1">
                Total Qs
              </span>
              <span className="text-2xl font-bold text-white">45</span>
            </div>
            <div className="w-px bg-white/10" />
            <div className="flex-1">
              <span className="block text-[10px] text-gray-400 uppercase tracking-widest font-black mb-1">
                Time
              </span>
              <span className="text-2xl font-bold text-white">4W</span>
            </div>
          </div>
        </div>

        {/* BACK */}
        <div
          className="absolute inset-0 backface-hidden rounded-[2rem] border border-white/10 bg-gradient-to-t from-[#0A0A0C] to-[#121214] p-6 [transform:rotateY(180deg)] flex flex-col shadow-2xl"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="mb-4 flex flex-col gap-2 border-b border-white/5 pb-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-widest text-white">
                Preview Sheet
              </span>
              <span className="text-[10px] uppercase font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-sm">
                2/45 Done
              </span>
            </div>
            <div className="w-full bg-black/50 h-1.5 rounded-full overflow-hidden mt-1 shadow-inner">
              <div className="w-[15%] bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full" />
            </div>
          </div>
          <div className={`flex flex-col gap-2 overflow-y-auto ${noScrollbar}`}>
            {SHEET_PROBLEMS.map((p, i) => (
              <div
                key={p.id}
                className="group/item flex items-center justify-between rounded-xl bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-300 border border-transparent hover:border-white/10 hover:shadow-lg hover:-translate-y-0.5 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-2 w-2 rounded-full shrink-0 ${i < 2 ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]" : "bg-white/10"}`}
                  />
                  <span
                    className={`text-xs font-bold transition-colors ${i < 2 ? "text-gray-200" : "text-gray-400 group-hover/item:text-white"}`}
                  >
                    {p.title}
                  </span>
                </div>
                <span
                  className={`shrink-0 text-[10px] font-black uppercase ${
                    p.diff === "Easy"
                      ? "text-green-500"
                      : p.diff === "Medium"
                        ? "text-yellow-500"
                        : "text-rose-500"
                  }`}
                >
                  {p.diff}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   3. REVISIONS — Fully Interactive Deck (Framer Motion Swipe)
   ───────────────────────────────────────────── */
const REVISION_CARDS = [
  {
    id: 1,
    topic: "Dynamic Prog",
    sub: "1D Array State",
    urgency: "High Priority",
    color: "bg-rose-500",
  },
  {
    id: 2,
    topic: "Graph BFS",
    sub: "Shortest Path Matrix",
    urgency: "Due Today",
    color: "bg-amber-500",
  },
  {
    id: 3,
    topic: "Two Pointers",
    sub: "Sliding Window",
    urgency: "Tomorrow",
    color: "bg-blue-500",
  },
];

export function RevisionsVisual() {
  const [cards, setCards] = useState(REVISION_CARDS);
  const [swipingId, setSwipingId] = useState<number | null>(null);

  const handleSwipeClick = (id: number) => {
    if (swipingId) return; // Prevent spam clicking
    setSwipingId(id);

    // Allow the swipe-out animation to play, then mathematically cycle the queue
    setTimeout(() => {
      setCards((prev) => {
        const copy = [...prev];
        const first = copy.shift();
        if (first) copy.push(first);
        return copy;
      });
      setSwipingId(null);
    }, 250);
  };

  return (
    <div
      className={`${wrapperAlign} relative h-[360px] flex items-center justify-center`}
    >
      {cards.map((c, i) => {
        const isTop = i === 0;
        const isSwiping = swipingId === c.id;

        return (
          <motion.div
            key={c.id}
            layout
            initial={false}
            animate={{
              scale: isSwiping ? 0.9 : 1 - i * 0.08,
              y: isSwiping ? -50 : i * 25,
              x: isSwiping ? -250 : 0,
              rotate: isSwiping ? -20 : i % 2 === 0 ? i * -2 : i * 2,
              opacity: isSwiping ? 0 : 1 - i * 0.3,
              zIndex: cards.length - i,
            }}
            whileHover={isTop && !isSwiping ? { y: -10, scale: 1.02 } : {}}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            onClick={isTop ? () => handleSwipeClick(c.id) : undefined}
            className={`absolute w-full max-w-[340px] h-[220px] rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#1A1A1E] to-[#0A0A0C] p-8 shadow-2xl select-none flex flex-col justify-between
              ${isTop ? "cursor-pointer hover:shadow-[0_25px_45px_-10px_rgba(0,0,0,0.8)]" : "cursor-default"}`}
          >
            <div>
              <div className="flex justify-between items-start mb-6">
                <span className="text-[10px] font-black uppercase tracking-widest text-white flex items-center gap-2.5">
                  <div
                    className={`w-2 h-2 rounded-full ${c.color} shadow-[0_0_8px_${c.color}]`}
                  />
                  {c.urgency}
                </span>
              </div>
              <h4 className="text-2xl font-black text-white mb-2 tracking-tight">
                {c.topic}
              </h4>
              <p className="text-xs font-semibold text-gray-400">{c.sub}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────
   4. PROGRESS — Bar + Ring Dash
   ───────────────────────────────────────────── */
export function ProgressVisual() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const pct = 68;
  const circ = 2 * Math.PI * 40;
  const bars = [40, 20, 80, 50, 60, 100, 70];

  return (
    <div
      className={`${wrapperAlign} h-[auto] rounded-[2.5rem] border border-white/5 bg-[#0C0C0E] p-8 flex flex-col gap-8 shadow-2xl`}
    >
      <div className="flex items-center justify-between border-b border-white/5 pb-6">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
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
            Current Streak
          </span>
          <span className="text-3xl font-black text-white">12 Days</span>
        </div>
        <div className="bg-primary/10 border border-primary/20 text-primary text-xs font-bold px-4 py-2 rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.2)]">
          Top 5%
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:-translate-y-1 transition-transform duration-500">
          <div className="relative mb-3">
            <svg
              width="90"
              height="90"
              viewBox="0 0 100 100"
              className="transform -rotate-90"
            >
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#27272A"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#6366f1"
                strokeWidth="8"
                strokeDasharray={circ}
                strokeDashoffset={mounted ? circ - (circ * pct) / 100 : circ}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
                style={{ filter: "drop-shadow(0 0 6px rgba(99,102,241,0.5))" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-black text-white">
                {mounted ? pct : 0}%
              </span>
            </div>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
            Solved
          </span>
        </div>

        <div className="flex flex-col justify-end p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:-translate-y-1 transition-transform duration-500">
          <div className="flex items-end gap-1.5 h-20 mb-3">
            {bars.map((h, i) => (
              <div
                key={i}
                className="flex-1 bg-white/5 rounded-t-sm group relative flex justify-center h-full"
              >
                <div
                  className={`absolute bottom-0 w-full rounded-t-sm transition-all duration-1000 ease-out delay-[${i * 100}ms] ${i === bars.length - 1 ? "bg-primary shadow-[0_0_10px_rgba(99,102,241,0.8)]" : "bg-white/30"}`}
                  style={{ height: mounted ? `${h}%` : "0%" }}
                />
              </div>
            ))}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 text-center">
            Activity
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   5. TAILOR JOURNEY — Automated Curriculum Wizard
   ───────────────────────────────────────────── */

const TARGETS = [
  {
    id: "startup",
    label: "Startups",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 10V3L4 14h7v7l9-11h-7z"
      />
    ),
  },
  {
    id: "product",
    label: "Product-based",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
      />
    ),
  },
];

const TIMELINES = [
  { id: "2", label: "2 Mos" },
  { id: "6", label: "6 Mos" },
  { id: "12", label: "12 Mos" },
];

const EXPS = [
  { id: "fresh", label: "Fresher" },
  { id: "mid", label: "Mid" },
  { id: "snr", label: "Senior" },
];

function Confetti() {
  const particles = Array.from({ length: 40 });
  return (
    <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-sm"
          style={{
            backgroundColor: ["#EAB308", "#6366F1", "#A855F7", "#10B981"][
              i % 4
            ],
            left: "50%",
            top: "50%",
          }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
          animate={{
            x: (Math.random() - 0.5) * 400,
            y: (Math.random() - 0.5) * 400 - 200,
            opacity: 0,
            scale: [0, 1, 0.5],
            rotate: Math.random() * 360,
          }}
          transition={{
            duration: 2,
            ease: "easeOut",
            delay: Math.random() * 0.2,
          }}
        />
      ))}
    </div>
  );
}

function SimulatedCursor({
  targetSelector,
  containerRef,
}: {
  targetSelector: string | null;
  containerRef: React.RefObject<HTMLDivElement>;
}) {
  const [pos, setPos] = useState({ x: 100, y: 100 });

  useEffect(() => {
    if (!targetSelector || !containerRef.current) return;
    const el = containerRef.current.querySelector(
      targetSelector,
    ) as HTMLElement;
    if (!el) return;

    // Using offsetParent to find local position relative to container
    let x = el.offsetLeft + el.offsetWidth / 2;
    let y = el.offsetTop + el.offsetHeight / 2;

    // Account for nested offsets if necessary
    let parent = el.offsetParent as HTMLElement;
    while (parent && parent !== containerRef.current) {
      x += parent.offsetLeft;
      y += parent.offsetTop;
      parent = parent.offsetParent as HTMLElement;
    }

    setPos({ x, y });
  }, [targetSelector]);

  return (
    <motion.div
      className="absolute z-[100] pointer-events-none"
      animate={{ x: pos.x, y: pos.y, opacity: targetSelector ? 1 : 0 }}
      transition={{ type: "spring", damping: 25, stiffness: 120 }}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        className="text-white drop-shadow-[0_2px_5px_rgba(0,0,0,0.5)]"
      >
        <path
          d="M5.5 3.5L5.5 20.5L10.5 15.5L20.5 15.5L5.5 3.5Z"
          fill="white"
          stroke="black"
          strokeWidth="1.5"
        />
      </svg>
      <motion.div
        className="absolute -inset-2 bg-primary/20 rounded-full blur-md"
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.5, 0] }}
        transition={{ duration: 0.5 }}
        key={targetSelector}
      />
    </motion.div>
  );
}

export function TailorJourneyVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [target, setTarget] = useState("product");
  const [time, setTime] = useState("6");
  const [exp, setExp] = useState("mid");

  const [step, setStep] = useState<
    "idle" | "choosing" | "generating" | "complete"
  >("idle");
  const [cursorTarget, setCursorTarget] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  // Auto-play trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      if (step === "idle") startAutoplay();
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const startAutoplay = async () => {
    setStep("choosing");

    // Choose Target
    await new Promise((r) => setTimeout(r, 600));
    setCursorTarget('[data-tid="target-startup"]');
    await new Promise((r) => setTimeout(r, 800));
    setTarget("startup");

    // Choose Timeline
    await new Promise((r) => setTimeout(r, 400));
    setCursorTarget('[data-tid="time-12"]');
    await new Promise((r) => setTimeout(r, 800));
    setTime("12");

    // Choose Exp
    await new Promise((r) => setTimeout(r, 400));
    setCursorTarget('[data-tid="exp-snr"]');
    await new Promise((r) => setTimeout(r, 800));
    setExp("snr");

    // Generate
    setCursorTarget(null);
    setStep("generating");

    let p = 0;
    const interval = setInterval(() => {
      p += 2.5;
      setProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        setStep("complete");
        setShowConfetti(true);
      }
    }, 30);
  };

  const logs = ["Analyzing...", "Optimizing...", "Mapping..."];

  return (
    <div
      ref={containerRef}
      className={`${wrapperAlign} relative min-h-[400px] flex items-center justify-center`}
      onMouseDown={() => {
        if (step !== "complete") setStep("idle");
        setCursorTarget(null);
      }}
    >
      {/* Background Plate - More glassmorphic */}
      <div className="absolute inset-0 bg-[#0C0C0E]/70 backdrop-blur-3xl rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-primary/20 blur-[80px]" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-indigo-500/10 blur-[80px]" />
      </div>

      <SimulatedCursor
        containerRef={containerRef}
        targetSelector={cursorTarget}
      />
      {showConfetti && <Confetti />}

      <div
        className={`relative z-10 w-full flex flex-col gap-6 p-6 transition-all duration-500 ${step === "generating" ? "opacity-10 blur-md scale-90" : "opacity-100"}`}
      >
        {/* Targets - Sleeker Cards */}
        <div className="flex gap-2">
          {TARGETS.map((t) => (
            <button
              key={t.id}
              data-tid={`target-${t.id}`}
              onClick={() => setTarget(t.id)}
              className={`flex-1 py-3 rounded-xl border-2 transition-all duration-500 ${target === t.id ? "bg-white/5 border-primary/50 shadow-[0_0_20px_rgba(99,102,241,0.2)]" : "bg-black/20 border-white/5 hover:border-white/10"}`}
            >
              <div className="flex flex-col items-center gap-2">
                <svg
                  className={`w-4 h-4 transition-colors ${target === t.id ? "text-primary" : "text-gray-600"}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {t.icon}
                </svg>
                <span
                  className={`text-[9px] font-black uppercase tracking-[0.2em] ${target === t.id ? "text-white" : "text-gray-500"}`}
                >
                  {t.label}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Timelines - Minimal Toggle */}
        <div className="flex bg-[#121215] p-1 rounded-xl border border-white/5">
          {TIMELINES.map((t) => (
            <button
              key={t.id}
              data-tid={`time-${t.id}`}
              onClick={() => setTime(t.id)}
              className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${time === t.id ? "bg-white/10 text-white shadow-sm" : "text-gray-600 hover:text-gray-400"}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Experience - Sleek Slider */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between px-1">
            {EXPS.map((e) => (
              <button
                key={e.id}
                data-tid={`exp-${e.id}`}
                onClick={() => setExp(e.id)}
                className={`text-[8px] font-black uppercase tracking-[0.15em] transition-all ${exp === e.id ? "text-primary" : "text-gray-600"}`}
              >
                {e.label}
              </button>
            ))}
          </div>
          <div className="h-1 w-full bg-white/5 rounded-full relative overflow-hidden">
            <motion.div
              className="absolute top-0 h-full bg-primary rounded-full"
              animate={{
                left:
                  exp === "fresh" ? "0%" : exp === "mid" ? "33.3%" : "66.6%",
                width: "33.3%",
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          </div>
        </div>

        {/* Final Result Card - Compact & Modern */}
        <motion.div
          className={`mt-2 p-3 rounded-xl border flex items-center justify-between transition-all duration-700 ${step === "complete" ? "bg-primary/10 border-primary/30 shadow-lg" : "bg-white/5 border-white/5 opacity-40"}`}
          animate={step === "complete" ? { y: [0, -3, 0] } : {}}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-black text-white uppercase tracking-wider">
              Dynamic Path Ready
            </span>
            <span className="text-[8px] font-bold text-gray-500">
              Curriculum generated for your goals
            </span>
          </div>
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center ${step === "complete" ? "bg-primary shadow-[0_0_15px_rgba(99,102,241,0.5)]" : "bg-gray-800"}`}
          >
            <svg
              className="w-3 h-3 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={4}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </motion.div>
      </div>

      {/* Generating Overlay - Sleeker Loader */}
      {step === "generating" && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-4">
          <div className="relative w-16 h-16">
            <svg className="w-full h-full -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="currentColor"
                strokeWidth="4"
                fill="transparent"
                className="text-white/5"
              />
              <motion.circle
                cx="32"
                cy="32"
                r="28"
                stroke="currentColor"
                strokeWidth="4"
                fill="transparent"
                className="text-primary"
                strokeDasharray="175.9"
                animate={{ strokeDashoffset: 175.9 - (175.9 * progress) / 100 }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center font-black text-white text-sm">
              {Math.round(progress)}%
            </div>
          </div>
          <div className="flex flex-col items-center">
            <motion.span
              className="text-[9px] font-black uppercase tracking-[0.3em] text-white/50"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              Building Path
            </motion.span>
          </div>
        </div>
      )}
    </div>
  );
}
