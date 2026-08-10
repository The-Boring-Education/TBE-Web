import { USER_LEVELS } from "@tbe/constants";
import { AnimatePresence, motion } from "framer-motion";
import { Flame, Gift, TrendingUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useGamificationContext } from "./GamificationProvider";
import type { PointsBadgeProps } from "./types";
import useGamification from "./useGamification";

/**
 * Compact points display for navbars and headers.
 *
 * Shows a pill badge with current points. On click, expands to reveal
 * a compact card with level progress, next-level target, and a progress bar.
 *
 * Respects the theme from GamificationProvider context.
 *
 * Variants:
 * - "navbar" (default): pill-shaped, designed for top navbars
 * - "inline": smaller badge that fits inside text rows
 */
const PointsBadge = ({
  variant = "navbar",
  className = "",
}: PointsBadgeProps) => {
  const {
    points,
    loading,
    currentLevel,
    currentLevelName,
    nextLevelName,
    pointsLeftToNextLevel,
    percentageProgress,
  } = useGamification();

  const { theme } = useGamificationContext();
  const isDark = theme === "dark";

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const nextLevel = USER_LEVELS.find((l) => l.level === currentLevel + 1);
  const nextLevelMinPts = nextLevel?.minPoints ?? null;

  const motivationalText =
    points === 0
      ? "Keep solving, keep growing! 🚀"
      : points < 100
        ? "Great start! Keep it up! ⚡"
        : "You're on fire! 🔥";

  /* ── Inline variant ── */
  if (variant === "inline") {
    return (
      <button
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-sm font-semibold transition-colors ${
          isDark
            ? "bg-primary/20 border-primary/30 text-white hover:bg-primary/30"
            : "bg-primary/10 border-primary/20 text-primary hover:bg-primary/20"
        } ${className}`}
        onClick={() => setIsOpen((v) => !v)}
      >
        <Flame size={14} className="text-primary" />
        {loading ? "..." : points}
        <span className={`text-xs ${isDark ? "opacity-50" : "opacity-60"}`}>
          L{currentLevel}
        </span>
      </button>
    );
  }

  const divider = (
    <div
      className={`border-t ${isDark ? "border-white/[0.06]" : "border-gray-100"}`}
    />
  );

  /* ── Navbar pill variant ── */
  return (
    <div className="relative" ref={containerRef}>
      <motion.button
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold text-sm outline-none transition-all duration-200 ${
          isDark
            ? "bg-primary/20 border border-primary/30 text-white hover:bg-primary/30 hover:border-primary/50"
            : "bg-primary/10 border border-primary/25 text-primary hover:bg-primary/20 hover:border-primary/40"
        } ${className}`}
        onClick={() => setIsOpen((v) => !v)}
        whileTap={{ scale: 0.96 }}
        aria-label={`${points} points`}
      >
        <Flame size={15} className="text-primary" aria-hidden="true" />
        <span>{loading ? "..." : points}</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="absolute top-full right-0 mt-2 z-50"
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            {/* ── Card ── */}
            <div
              className={`rounded-xl overflow-hidden w-[272px] ${
                isDark
                  ? "border border-white/10"
                  : "border border-gray-100 bg-white shadow-lg"
              }`}
              style={
                isDark
                  ? {
                      background: "rgba(12, 12, 18, 0.92)",
                      backdropFilter: "blur(24px)",
                      WebkitBackdropFilter: "blur(24px)",
                      boxShadow:
                        "0 16px 40px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06)",
                    }
                  : {}
              }
            >
              {/* Header */}
              <div className="px-4 pt-4 pb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${
                      isDark ? "bg-primary/20" : "bg-primary/10"
                    }`}
                  >
                    <Flame
                      size={16}
                      className="text-primary"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-[9px] uppercase tracking-widest font-semibold ${
                        isDark ? "text-white/40" : "text-gray-400"
                      }`}
                    >
                      Your Points
                    </p>
                    <p
                      className={`text-2xl font-black leading-none ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {points}{" "}
                      <span
                        className={`text-base font-bold ${
                          isDark ? "text-white/40" : "text-gray-400"
                        }`}
                      >
                        pts
                      </span>
                    </p>
                    <p
                      className={`text-[10px] mt-0.5 ${
                        isDark ? "text-white/45" : "text-gray-400"
                      }`}
                    >
                      {motivationalText}
                    </p>
                  </div>
                </div>
              </div>

              {divider}

              {/* Current Level */}
              <div className="px-4 py-1.5 flex items-center gap-3">
                <TrendingUp
                  size={18}
                  className={
                    isDark
                      ? "text-violet-400 flex-shrink-0"
                      : "text-violet-600 flex-shrink-0"
                  }
                  aria-hidden="true"
                />
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-[9px] uppercase tracking-widest font-semibold ${
                      isDark ? "text-white/40" : "text-gray-400"
                    }`}
                  >
                    Current Level
                  </p>
                  <p
                    className={`text-xs font-bold mt-0.5 ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Lv {currentLevel} {currentLevelName}
                  </p>
                </div>
              </div>

              {/* Next Milestone */}
              {nextLevel && pointsLeftToNextLevel > 0 && (
                <>
                  {divider}
                  <div className="px-4 py-1.5 flex items-center gap-3">
                    <Gift
                      size={18}
                      className={
                        isDark
                          ? "text-emerald-400 flex-shrink-0"
                          : "text-emerald-600 flex-shrink-0"
                      }
                      aria-hidden="true"
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-[9px] uppercase tracking-widest font-semibold ${
                          isDark ? "text-white/40" : "text-gray-400"
                        }`}
                      >
                        Next Milestone
                      </p>
                      <p
                        className={`text-xs font-bold mt-0.5 ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {pointsLeftToNextLevel} pts → {nextLevelName}
                      </p>
                    </div>
                  </div>
                </>
              )}

              {/* Max level */}
              {!nextLevel && (
                <div className="px-4 py-2.5">
                  <div
                    className={`rounded-lg px-3 py-1.5 text-center text-xs font-bold ${
                      isDark
                        ? "bg-amber-500/15 text-amber-300 border border-amber-500/20"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                  >
                    🏆 Max Level Achieved!
                  </div>
                </div>
              )}

              {/* Progress bar */}
              <div className="px-4 pb-3 pt-2">
                <div
                  className={`h-1 rounded-full overflow-hidden ${
                    isDark ? "bg-white/8" : "bg-gray-100"
                  }`}
                >
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-orange-400 transition-all duration-500 ease-out"
                    style={{ width: `${Math.max(2, percentageProgress)}%` }}
                    role="progressbar"
                    aria-valuenow={percentageProgress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span
                    className={`text-[9px] ${isDark ? "text-white/25" : "text-gray-300"}`}
                  >
                    Lv {currentLevel}
                  </span>
                  {nextLevel && (
                    <span
                      className={`text-[9px] ${isDark ? "text-white/25" : "text-gray-300"}`}
                    >
                      Lv {currentLevel + 1}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PointsBadge;
