import { motion } from "framer-motion";
import { Crown, Star, Trophy, X } from "lucide-react";
import { useEffect } from "react";

import { TOAST_STYLES } from "./constants";
import type { GamificationToastProps } from "./types";

const ICONS = {
  points: <Star className="text-yellow-400" size={20} />,
  levelup: <Crown className="text-amber-400" size={20} />,
  achievement: <Trophy className="text-purple-400" size={20} />,
};

/**
 * Animated toast notification for gamification events.
 *
 * Slides in from the top-right with a spring animation.
 * Auto-dismisses after `duration` ms and shows a progress bar countdown.
 */
const GamificationToast = ({
  isVisible,
  type,
  message,
  points,
  level,
  levelName,
  onClose,
  duration = 4000,
}: GamificationToastProps) => {
  useEffect(() => {
    if (!isVisible) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const { gradient, glow } = TOAST_STYLES[type];

  return (
    <motion.div
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="fixed top-20 right-6 z-50 max-w-sm"
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      initial={{ opacity: 0, y: -20, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <div
        className={`bg-gradient-to-r ${gradient} p-4 rounded-xl shadow-2xl ${glow} backdrop-blur-sm border border-white/20`}
      >
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, 360] }}
            className="text-2xl"
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {ICONS[type]}
          </motion.div>

          <div className="flex-1">
            <motion.p
              animate={{ opacity: 1 }}
              className="text-white font-semibold text-sm"
              initial={{ opacity: 0 }}
              transition={{ delay: 0.2 }}
            >
              {message}
            </motion.p>

            {points !== undefined && points > 0 && (
              <motion.p
                animate={{ opacity: 1, scale: [1, 1.1, 1] }}
                className="text-white/90 text-xs font-medium"
                initial={{ opacity: 0 }}
                transition={{ delay: 0.3, scale: { duration: 0.5 } }}
              >
                +{points} points earned!
              </motion.p>
            )}

            {level && levelName && (
              <motion.p
                animate={{ opacity: 1 }}
                className="text-white/90 text-xs font-medium"
                initial={{ opacity: 0 }}
                transition={{ delay: 0.4 }}
              >
                Level {level}: {levelName}
              </motion.p>
            )}
          </div>

          <button
            className="text-white/70 hover:text-white transition-colors"
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </div>

        {/* Auto-dismiss progress bar */}
        <motion.div
          animate={{ width: "0%" }}
          className="mt-2 h-1 bg-white/30 rounded-full overflow-hidden"
          initial={{ width: "100%" }}
          transition={{ duration: duration / 1000, ease: "linear" }}
        >
          <div className="h-full bg-white/60 rounded-full" />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default GamificationToast;
