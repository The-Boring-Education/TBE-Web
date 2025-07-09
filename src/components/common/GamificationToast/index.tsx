import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { FaCrown, FaStar, FaTrophy } from 'react-icons/fa';

interface GamificationToastProps {
  isVisible: boolean;
  type: 'points' | 'levelup' | 'achievement';
  message: string;
  points?: number;
  level?: number;
  levelName?: string;
  onClose: () => void;
  duration?: number;
}

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
    if (isVisible) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'points':
        return <FaStar className="text-yellow-400" />;
      case 'levelup':
        return <FaCrown className="text-amber-400" />;
      case 'achievement':
        return <FaTrophy className="text-purple-400" />;
      default:
        return <FaStar className="text-yellow-400" />;
    }
  };

  const getGradient = () => {
    switch (type) {
      case 'points':
        return 'from-green-600 to-blue-600';
      case 'levelup':
        return 'from-amber-500 to-orange-600';
      case 'achievement':
        return 'from-purple-600 to-pink-600';
      default:
        return 'from-green-600 to-blue-600';
    }
  };

  const getGlow = () => {
    switch (type) {
      case 'points':
        return 'shadow-green-500/50';
      case 'levelup':
        return 'shadow-amber-500/50';
      case 'achievement':
        return 'shadow-purple-500/50';
      default:
        return 'shadow-green-500/50';
    }
  };

  return (
    <motion.div
      animate={{ 
        opacity: 1, 
        y: 0, 
        scale: 1,
      }}
      className="fixed top-20 right-6 z-50 max-w-sm"
      exit={{ 
        opacity: 0, 
        y: -20, 
        scale: 0.95,
      }}
      initial={{ 
        opacity: 0, 
        y: -20, 
        scale: 0.9,
      }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 25,
      }}
    >
      <div className={`bg-gradient-to-r ${getGradient()} p-4 rounded-xl shadow-2xl ${getGlow()} backdrop-blur-sm border border-white/20`}>
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, 360] }}
            className="text-2xl"
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {getIcon()}
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
            
            {points && (
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
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Progress bar for duration */}
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