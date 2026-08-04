import type { LevelProgressCardProps } from "@tbe/interface";
import { Flame, Gift, TrendingUp } from "lucide-react";
import React from "react";

const UserLevelProgressContainer = ({
  points,
  currentLevel,
  currentLevelName,
  nextLevelName,
  pointsLeftToNextLevel,
  percentageProgress,
  theme = "light",
}: LevelProgressCardProps) => {
  const isDark = theme === "dark";

  const nextLevelMinPts =
    pointsLeftToNextLevel > 0 ? points + pointsLeftToNextLevel : null;

  const cardStyle = isDark
    ? {
        background: "rgba(12, 12, 18, 0.92)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        boxShadow:
          "0 16px 40px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06)",
      }
    : {};

  const divider = (
    <div
      className={`border-t ${isDark ? "border-white/[0.06]" : "border-gray-100"}`}
    />
  );

  const motivationalText =
    points === 0
      ? "Keep solving, keep growing! 🚀"
      : points < 100
        ? "Great start! Keep it up! ⚡"
        : points < 500
          ? "You're on fire! 🔥"
          : "Legend in the making! 🏆";

  return (
    <div
      className={`rounded-xl overflow-hidden w-[272px] ${
        isDark
          ? "border border-white/10"
          : "border border-gray-100 bg-white shadow-lg"
      }`}
      style={cardStyle}
    >
      {/* ── Header ── */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${
              isDark ? "bg-primary/20" : "bg-primary/10"
            }`}
          >
            <Flame size={16} className="text-primary" aria-hidden="true" />
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

      {/* ── Current Level ── */}
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

      {/* ── Next Milestone ── */}
      {nextLevelName && pointsLeftToNextLevel > 0 ? (
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
      ) : (
        !nextLevelName && (
          <>
            {divider}
            <div className="px-4 py-1.5">
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
          </>
        )
      )}

      {/* ── Progress bar ── */}
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
          {nextLevelName && (
            <span
              className={`text-[9px] ${isDark ? "text-white/25" : "text-gray-300"}`}
            >
              Lv {currentLevel + 1}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserLevelProgressContainer;
