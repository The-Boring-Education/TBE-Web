import { CONFETTI_COLORS } from "@tbe/constants";
import type { CelebrationAnimationProps } from "@tbe/interface";
import { useEffect, useState } from "react";

const CelebrationAnimation = ({
  show,
  pointsEarned = 0,
  onComplete,
}: CelebrationAnimationProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      {/* Confetti */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(24)].map((_, i) => {
          const color =
            CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
          return (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random() * 2}s`,
              }}
            />
          );
        })}
      </div>

      {/* Center celebration */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-black/80 rounded-2xl p-8 text-center animate-pulse">
          <div className="text-6xl mb-4">🎉</div>
          <div className="text-2xl font-bold text-white mb-2">
            +{pointsEarned} Points!
          </div>
          <div className="text-gray">Great job! Keep it up!</div>
        </div>
      </div>
    </div>
  );
};

export default CelebrationAnimation;
