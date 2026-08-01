"use client";

import { useGamificationContext } from "./context/GamificationContext";

interface GamificationCardProps {
  isOpen: boolean;
  onClose: () => void;
  variant?: "popup" | "dashboard";
}

// User levels configuration
const USER_LEVELS = [
  { name: "Noob", value: "NOOB", minPoints: 0, level: 1 },
  { name: "Coder", value: "CODER", minPoints: 500, level: 2 },
  { name: "Debugger", value: "DEBUGGER", minPoints: 1000, level: 3 },
  { name: "Ninja", value: "NINJA", minPoints: 2000, level: 4 },
  { name: "Squasher", value: "SQUASHER", minPoints: 3000, level: 5 },
  { name: "Hacker", value: "HACKER", minPoints: 4500, level: 6 },
  { name: "Wizard", value: "WIZARD", minPoints: 6000, level: 7 },
  { name: "Guru", value: "GURU", minPoints: 7500, level: 8 },
  { name: "Architect", value: "ARCHITECT", minPoints: 9000, level: 9 },
  { name: "Legend", value: "LEGEND", minPoints: 10000, level: 10 },
];

export function GamificationCard({
  isOpen,
  variant = "popup",
}: GamificationCardProps) {
  const { points, loading, currentLevel, pointsToNextLevel } =
    useGamificationContext();

  if (!isOpen) return null;

  // Calculate progress percentage for the circle
  const getProgressPercentage = () => {
    if (currentLevel.level === 10) return 100; // Max level

    const currentLevelPoints = currentLevel.minPoints;
    const nextLevel = USER_LEVELS.find(
      (l) => l.level === currentLevel.level + 1,
    );
    if (!nextLevel) return 100;

    const levelRange = nextLevel.minPoints - currentLevel.minPoints;
    const progressInLevel = points - currentLevelPoints;
    return Math.min((progressInLevel / levelRange) * 100, 100);
  };

  const progressPercentage = getProgressPercentage();
  const nextLevel = USER_LEVELS.find((l) => l.level === currentLevel.level + 1);

  if (variant === "dashboard") {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 max-w-lg border border-gray-100">
        <div className="flex items-center gap-6">
          {/* Left side - Progress Circle */}
          <div className="relative flex-shrink-0">
            <div className="w-24 h-24 relative">
              {/* Background circle */}
              <svg
                className="w-24 h-24 transform -rotate-90"
                viewBox="0 0 100 100"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#f3f4f6"
                  strokeWidth="8"
                  fill="white"
                />
                {/* Progress circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#ef4444"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${
                    2 * Math.PI * 40 * (1 - progressPercentage / 100)
                  }`}
                  className="transition-all duration-500 ease-out"
                />
              </svg>

              {/* Points text in center */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-900">
                  {loading ? "..." : points}
                </span>
              </div>
            </div>
          </div>

          {/* Right side - Level Info */}
          <div className="flex-1 min-w-0">
            <div className="space-y-3">
              {/* "YOU'RE AT" text */}
              <p className="text-xs uppercase text-gray-500 font-semibold tracking-wider">
                YOU&apos;RE AT
              </p>

              {/* Level info */}
              <div>
                <p className="text-xl font-bold text-[#ef4444] leading-tight">
                  Level {currentLevel.level} : {currentLevel.name}
                </p>
              </div>

              {/* Points to next level */}
              {nextLevel && pointsToNextLevel > 0 && (
                <div className="bg-gradient-to-r from-pink-400 to-yellow-400 rounded-lg px-4 py-2.5">
                  <p className="text-sm font-bold text-white text-center leading-tight">
                    {pointsToNextLevel} Points to {nextLevel.name}
                  </p>
                </div>
              )}

              {/* Max level message */}
              {currentLevel.level === 10 && (
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg px-4 py-2.5">
                  <p className="text-sm font-bold text-white text-center leading-tight">
                    🏆 Max Level Achieved!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Popup version
  return (
    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 z-50 opacity-0 animate-[fadeIn_0.2s_ease-out_forwards]">
      <div className="bg-white rounded-xl shadow-xl p-6 w-96 relative border border-gray-200">
        <div className="flex items-center gap-5">
          {/* Left side - Progress Circle */}
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 relative">
              {/* Background circle */}
              <svg
                className="w-20 h-20 transform -rotate-90"
                viewBox="0 0 100 100"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#f3f4f6"
                  strokeWidth="8"
                  fill="white"
                />
                {/* Progress circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#ef4444"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${
                    2 * Math.PI * 40 * (1 - progressPercentage / 100)
                  }`}
                  className="transition-all duration-500 ease-out"
                />
              </svg>

              {/* Points text in center */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-gray-900">
                  {loading ? "..." : points}
                </span>
              </div>
            </div>
          </div>

          {/* Right side - Level Info */}
          <div className="flex-1 min-w-0">
            <div className="space-y-2.5">
              {/* "YOU'RE AT" text */}
              <p className="text-xs uppercase text-gray-500 font-semibold tracking-wider">
                YOU&apos;RE AT
              </p>

              {/* Level info */}
              <div>
                <p className="text-lg font-bold text-[#ef4444] leading-tight">
                  Level {currentLevel.level}: {currentLevel.name}
                </p>
              </div>

              {/* Points to next level */}
              {nextLevel && pointsToNextLevel > 0 && (
                <div className="bg-gradient-to-r from-pink-400 to-yellow-400 rounded-lg px-3 py-2 mt-2">
                  <p className="text-xs font-bold text-white text-center leading-tight">
                    {pointsToNextLevel} Points to {nextLevel.name}
                  </p>
                </div>
              )}

              {/* Max level message */}
              {currentLevel.level === 10 && (
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg px-3 py-2 mt-2">
                  <p className="text-xs font-bold text-white text-center leading-tight">
                    🏆 Max Level Achieved!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
