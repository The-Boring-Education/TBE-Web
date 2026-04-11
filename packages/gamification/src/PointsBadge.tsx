import { USER_LEVELS } from "@tbe/constants";
import { AnimatePresence, motion } from "framer-motion";
import { Flame } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { PointsBadgeProps } from "./types";
import useGamification from "./useGamification";

/**
 * Compact points display for navbars and headers.
 *
 * Shows a circular badge with current points. On click, expands to reveal
 * a card with level progress, next-level target, and a circular progress ring.
 *
 * Variants:
 * - "navbar" (default): fixed-size circle designed for top navbars
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

  const radius = variant === "navbar" ? 40 : 30;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference * (1 - percentageProgress / 100);
  const nextLevel = USER_LEVELS.find((l) => l.level === currentLevel + 1);

  if (variant === "inline") {
    return (
      <button
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors text-sm font-semibold ${className}`}
        onClick={() => setIsOpen((v) => !v)}
      >
        <Flame size={14} />
        {loading ? "..." : points}
        <span className="text-xs opacity-60">L{currentLevel}</span>
      </button>
    );
  }

  return (
    <div className="relative" ref={containerRef}>
      <motion.button
        className={`w-12 h-12 bg-[#ef4444] rounded-full flex items-center justify-center hover:bg-[#dc2626] transition-colors shadow-md ${className}`}
        onClick={() => setIsOpen((v) => !v)}
        whileTap={{ scale: 0.9 }}
      >
        <span className="text-white font-bold text-sm">
          {loading ? "..." : points}
        </span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="absolute top-full right-0 mt-3 z-50"
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            <div className="bg-white rounded-2xl shadow-xl p-5 w-80 border border-gray-200">
              <div className="flex items-center gap-4">
                {/* Progress ring */}
                <div className="flex-shrink-0 relative">
                  <svg
                    className="transform -rotate-90"
                    height={radius * 2 + 16}
                    width={radius * 2 + 16}
                  >
                    <circle
                      cx={radius + 8}
                      cy={radius + 8}
                      fill="white"
                      r={radius}
                      stroke="#f3f4f6"
                      strokeWidth="7"
                    />
                    <circle
                      cx={radius + 8}
                      cy={radius + 8}
                      fill="none"
                      r={radius}
                      stroke="#ef4444"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeOffset}
                      strokeLinecap="round"
                      strokeWidth="7"
                      style={{ transition: "stroke-dashoffset 0.5s ease" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-xl font-bold text-gray-900">
                      {points}
                    </span>
                  </div>
                </div>

                {/* Level info */}
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] uppercase text-gray-400 font-semibold tracking-widest">
                    YOU&apos;RE AT
                  </p>
                  <p className="text-lg font-bold text-[#ef4444] leading-tight mt-0.5">
                    Level {currentLevel}: {currentLevelName}
                  </p>

                  {nextLevel && pointsLeftToNextLevel > 0 ? (
                    <div className="mt-2 bg-gradient-to-r from-pink-500 to-yellow-400 rounded-lg px-3 py-1.5">
                      <p className="text-xs font-bold text-white text-center">
                        {pointsLeftToNextLevel} pts to {nextLevelName}
                      </p>
                    </div>
                  ) : (
                    <div className="mt-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg px-3 py-1.5">
                      <p className="text-xs font-bold text-white text-center">
                        Max Level Achieved!
                      </p>
                    </div>
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
