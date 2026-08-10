import { Text } from "@tbe/components";
import type { ProgressRingProps } from "@tbe/interface";
import React from "react";

/**
 * Circular progress ring used as a compact points/level indicator.
 *
 * Supports dark and light themes — the track circle colour adapts accordingly.
 */
const ProgressRing = ({
  progress = 0,
  point,
  theme = "light",
}: ProgressRingProps) => {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;

  // Ensure progress is between 0-100%
  const clampedProgress = Math.min(100, Math.max(0, progress));

  // Calculate stroke offset
  const strokeDashoffset =
    circumference - (clampedProgress / 100) * circumference;

  const trackColor = theme === "dark" ? "#2A2A2A" : "#E0E0E0";

  return (
    <div className="relative w-20 h-20 flex items-center justify-center">
      <svg className="absolute w-full h-full" viewBox="0 0 100 100">
        {/* Background Circle */}
        <circle
          cx="50"
          cy="50"
          fill="transparent"
          r={radius}
          stroke={trackColor}
          strokeWidth="8"
        />
        {/* Progress Circle */}
        <circle
          className="transition-all duration-300 ease-in-out"
          cx="50"
          cy="50"
          fill="transparent"
          r={radius}
          stroke="#FF4A4A"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          strokeWidth="8"
        />
      </svg>
      {/* Display Progress Percentage */}
      <Text
        className={`p-3 text-base md:text-lg font-bold ${
          theme === "dark" ? "text-white" : "text-gray-900"
        }`}
        level="span"
      >
        {point}
      </Text>
    </div>
  );
};

export default ProgressRing;
