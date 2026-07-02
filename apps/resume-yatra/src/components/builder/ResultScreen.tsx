import { motion } from "framer-motion";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import type { UseResumeBuilderReturn } from "@/types/builder";

interface ResultScreenProps {
  builder: UseResumeBuilderReturn;
}

// ── Inline SVG icons ──────────────────────────────────────────────────────────

const CopyIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 15 15"
    fill="none"
    aria-hidden="true"
  >
    <rect
      x="4.5"
      y="1.5"
      width="9"
      height="9"
      rx="1.5"
      stroke="currentColor"
      strokeWidth="1.3"
    />
    <path
      d="M1.5 5.5v8a1 1 0 001 1h8"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
    />
  </svg>
);

const ResetIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="currentColor"
    className="bi bi-repeat"
    viewBox="0 0 16 16"
    aria-hidden="true"
  >
    <path d="M11 5.466V4H5a4 4 0 0 0-3.584 5.777.5.5 0 1 1-.896.446A5 5 0 0 1 5 3h6V1.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384l-2.36 1.966a.25.25 0 0 1-.41-.192m3.81.086a.5.5 0 0 1 .67.225A5 5 0 0 1 11 13H5v1.466a.25.25 0 0 1-.41.192l-2.36-1.966a.25.25 0 0 1 0-.384l2.36-1.966a.25.25 0 0 1 .41.192V12h6a4 4 0 0 0 3.585-5.777.5.5 0 0 1 .225-.67Z" />
  </svg>
);

const HomeIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 15 15"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M1.5 7L7.5 2l6 5V13.5a1 1 0 01-1 1h-3V9.5H8v5H2.5a1 1 0 01-1-1V7z"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// ── Confetti piece ──────────────────────────────────────────────────────────

interface ConfettiPiece {
  id: number;
  left: string;
  color: string;
  size: number;
  delay: number;
  duration: number;
  shape: "square" | "circle" | "rect";
  rotation: number;
}

const CONFETTI_COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#3b82f6",
  "#a855f7",
  "#ec4899",
  "#14b8a6",
];

function generateConfetti(count: number): ConfettiPiece[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)]!,
    size: 6 + Math.random() * 8,
    delay: Math.random() * 1.5,
    duration: 2.5 + Math.random() * 2,
    shape: (["square", "circle", "rect"] as const)[
      Math.floor(Math.random() * 3)
    ]!,
    rotation: Math.random() * 720,
  }));
}

// ── Animated score counter ────────────────────────────────────────────────────

function AnimatedScore({ target }: { target: number }) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    if (target === 0) return;
    let start = 0;
    const step = Math.ceil(target / 40);
    const interval = setInterval(() => {
      start += step;
      if (start >= target) {
        setDisplayed(target);
        clearInterval(interval);
      } else {
        setDisplayed(start);
      }
    }, 30);
    return () => clearInterval(interval);
  }, [target]);

  return <>{displayed}</>;
}

// ── Score message ─────────────────────────────────────────────────────────────

function getScoreMessage(score: number) {
  if (score >= 90) return "Outstanding! Recruiters will love your resume.";
  if (score >= 75) return "Great job! Your resume is highly competitive.";
  if (score >= 50) return "Good progress! A few more tweaks and you're set.";
  return "Keep going — every improvement increases your chances.";
}

// ── Achievements ─────────────────────────────────────────────────────────────

const achievements = [
  "Your resume now follows industry best practices",
  "You've included recruiter-approved content",
  "You're ready to apply for top companies",
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function ResultScreen({ builder }: ResultScreenProps) {
  const router = useRouter();
  const { calculateOverallScore, resetBuilder, setShowConfetti, showConfetti } =
    builder;
  const confettiPieces = useRef<ConfettiPiece[]>(generateConfetti(80));
  const score = calculateOverallScore();

  useEffect(() => {
    setShowConfetti(true);
    const timer = setTimeout(() => setShowConfetti(false), 4000);
    return () => clearTimeout(timer);
  }, [setShowConfetti]);

  useEffect(() => {
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleShareResult = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success("Link Copied!", {
      description:
        "Resume builder link copied to clipboard. Share it with your friends!",
    });
  };

  const handleStartFresh = () => {
    resetBuilder();
    toast.success("Reset Complete!", {
      description:
        "All progress has been reset. Start building your perfect resume again!",
    });
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] pt-[64px]">
      {/* ── Confetti ── */}
      {showConfetti && (
        <div
          className="fixed inset-0 pointer-events-none z-50 overflow-hidden"
          aria-hidden="true"
        >
          <style>{`
            @keyframes confetti-fall {
              0%   { transform: translateY(-20px) rotate(0deg); opacity: 1; }
              85%  { opacity: 1; }
              100% { transform: translateY(110vh) rotate(var(--rot)); opacity: 0; }
            }
          `}</style>
          {confettiPieces.current.map((p) => (
            <div
              key={p.id}
              style={{
                position: "absolute",
                top: "-20px",
                left: p.left,
                width: p.shape === "rect" ? p.size * 2 : p.size,
                height: p.size,
                backgroundColor: p.color,
                borderRadius:
                  p.shape === "circle"
                    ? "50%"
                    : p.shape === "square"
                      ? "2px"
                      : "1px",
                animationName: "confetti-fall",
                animationDuration: `${p.duration}s`,
                animationDelay: `${p.delay}s`,
                animationTimingFunction: "linear",
                animationFillMode: "both",
                ["--rot" as string]: `${p.rotation}deg`,
              }}
            />
          ))}
        </div>
      )}

      <div className="max-w-[720px] mx-auto px-[16px] py-[48px]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-[24px]"
        >
          {/* ── Score hero card ── */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#ef4444] via-[#e63939] to-[#c91e1e] rounded-3xl p-[40px] sm:p-[56px] text-white text-center shadow-lg">
            {/* Background decorative circles */}
            <div className="absolute -top-[40px] -right-[40px] w-[200px] h-[200px] rounded-full bg-white/5" />
            <div className="absolute -bottom-[60px] -left-[40px] w-[240px] h-[240px] rounded-full bg-white/5" />

            <div className="relative z-10 space-y-[16px]">
              {/* Trophy icon */}
              <div className="flex justify-center">
                <div className="w-[64px] h-[64px] rounded-2xl bg-white/20 flex items-center justify-center">
                  <svg
                    width="36"
                    height="36"
                    viewBox="0 0 36 36"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    {/* Cup body */}
                    <path
                      d="M10 4h16v14a8 8 0 01-16 0V4z"
                      fill="white"
                      fillOpacity="0.9"
                    />
                    {/* Handles */}
                    <path
                      d="M10 7H6a3 3 0 000 6h4"
                      stroke="white"
                      strokeOpacity="0.7"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M26 7h4a3 3 0 010 6h-4"
                      stroke="white"
                      strokeOpacity="0.7"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    {/* Stem */}
                    <path
                      d="M18 22v5"
                      stroke="white"
                      strokeOpacity="0.9"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    {/* Base */}
                    <rect
                      x="11"
                      y="27"
                      width="14"
                      height="3"
                      rx="1.5"
                      fill="white"
                      fillOpacity="0.85"
                    />
                    {/* Star inside cup */}
                    <path
                      d="M18 9l1.2 2.4 2.8.4-2 1.9.5 2.8L18 15.2l-2.5 1.3.5-2.8-2-1.9 2.8-.4z"
                      fill="#fef08a"
                    />
                  </svg>
                </div>
              </div>

              <div>
                <h2 className="text-[22px] font-bold mb-[4px]">
                  Congratulations! 🎉
                </h2>
                <p className="text-[13px] text-white/75">
                  {getScoreMessage(score)}
                </p>
              </div>

              {/* Score */}
              <div className="inline-flex flex-col items-center">
                <div className="text-[72px] sm:text-[88px] font-black leading-none tracking-tight">
                  <AnimatedScore target={score} />
                  <span className="text-[40px] sm:text-[48px] font-bold text-white/60">
                    %
                  </span>
                </div>
                <p className="text-[12px] text-white/60 mt-[4px] uppercase tracking-widest font-medium">
                  Resume Score
                </p>
              </div>

              {/* Score bar */}
              <div className="max-w-[280px] mx-auto">
                <div className="h-[8px] bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-white rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Achievements card ── */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-[24px] shadow-sm">
            <h3 className="text-[14px] font-semibold text-zinc-900 mb-[16px]">
              What you accomplished
            </h3>
            <ul className="space-y-[12px]">
              {achievements.map((ach, i) => (
                <li key={i} className="flex items-start gap-[10px]">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 18 18"
                    fill="none"
                    className="shrink-0 mt-[1px]"
                    aria-hidden="true"
                  >
                    <circle cx="9" cy="9" r="9" fill="#ef4444" />
                    <path
                      d="M5.5 9l2.5 2.5 4.5-5"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="text-[13px] text-zinc-700 leading-relaxed">
                    {ach}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Actions ── */}
          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-[12px]">
            <button
              id="result-share-btn"
              onClick={handleShareResult}
              className="flex items-center justify-center gap-[8px] px-[20px] py-[12px] rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-[13px] font-semibold transition-colors duration-200 flex-1 sm:flex-initial"
            >
              <CopyIcon />
              Share with Friends
            </button>
            <button
              id="result-reset-btn"
              onClick={handleStartFresh}
              className="flex items-center justify-center gap-[8px] px-[20px] py-[12px] rounded-xl border border-[#ef4444] text-[#ef4444] hover:bg-[#ef4444] hover:text-white text-[13px] font-medium transition-all duration-200 flex-1 sm:flex-initial"
            >
              <ResetIcon />
              Start Fresh
            </button>
            <button
              id="result-home-btn"
              onClick={() => router.push("/")}
              className="flex items-center justify-center gap-[8px] px-[20px] py-[12px] rounded-xl border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 text-zinc-600 text-[13px] font-medium transition-all duration-200 flex-1 sm:flex-initial"
            >
              <HomeIcon />
              Back to Home
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
