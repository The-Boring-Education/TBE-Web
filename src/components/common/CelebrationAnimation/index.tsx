import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface CelebrationAnimationProps {
  isActive: boolean;
  onComplete?: () => void;
  type?: 'points' | 'levelup' | 'achievement';
  intensity?: 'low' | 'medium' | 'high';
}

const CelebrationAnimation = ({
  isActive,
  onComplete,
  type = 'points',
  intensity = 'medium',
}: CelebrationAnimationProps) => {
  const [particles, setParticles] = useState<Array<{ id: number; delay: number; color: string; size: number; x: number; y: number }>>([]);

  const colors = {
    points: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'],
    levelup: ['#f59e0b', '#eab308', '#f97316', '#ef4444'],
    achievement: ['#8b5cf6', '#a855f7', '#c084fc', '#e879f9'],
  };

  const particleCount = {
    low: 15,
    medium: 25,
    high: 40,
  };

  useEffect(() => {
    if (isActive) {
      const count = particleCount[intensity];
      const newParticles = Array.from({ length: count }, (_, i) => ({
        id: i,
        delay: Math.random() * 0.5,
        color: colors[type][Math.floor(Math.random() * colors[type].length)],
        size: Math.random() * 8 + 4,
        x: Math.random() * 100,
        y: Math.random() * 50,
      }));
      
      setParticles(newParticles);
      
      const timer = setTimeout(() => {
        setParticles([]);
        onComplete?.();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isActive, intensity, type, onComplete]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {/* Radial Glow Effect */}
      <motion.div
        animate={{ opacity: [0, 0.3, 0], scale: [0.8, 1.2, 1] }}
        className="absolute top-1/2 left-1/2 w-96 h-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-yellow-400/20 via-purple-500/20 to-pink-500/20 blur-3xl"
        initial={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      />
      
      {/* Confetti Particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          animate={{
            y: [0, -100, window.innerHeight + 50],
            x: [0, Math.sin(particle.id) * 100, Math.sin(particle.id * 2) * 200],
            rotate: [0, 360, 720],
            opacity: [0, 1, 1, 0],
          }}
          className="absolute rounded-full shadow-lg"
          initial={{
            x: `${particle.x}vw`,
            y: '50vh',
            scale: 0,
          }}
          style={{
            backgroundColor: particle.color,
            width: particle.size,
            height: particle.size,
            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}40`,
          }}
          transition={{
            duration: 2.5,
            delay: particle.delay,
            ease: "easeOut",
          }}
        />
      ))}
      
      {/* Sparkle Effects */}
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={`sparkle-${i}`}
          animate={{
            scale: [0, 1, 0],
            rotate: [0, 180],
            opacity: [0, 1, 0],
          }}
          className="absolute"
          initial={{ scale: 0 }}
          style={{
            left: `${20 + Math.random() * 60}%`,
            top: `${30 + Math.random() * 40}%`,
          }}
          transition={{
            duration: 1.5,
            delay: i * 0.1,
            ease: "easeOut",
          }}
        >
          <div className="w-4 h-4 bg-gradient-to-r from-yellow-300 to-yellow-500 rounded-full animate-pulse shadow-lg" />
        </motion.div>
      ))}
      
      {/* Success Ripple */}
      <motion.div
        animate={{
          scale: [0, 4],
          opacity: [0.6, 0],
        }}
        className="absolute top-1/2 left-1/2 w-32 h-32 -translate-x-1/2 -translate-y-1/2 border-4 border-green-400 rounded-full"
        initial={{ scale: 0, opacity: 0.6 }}
        transition={{
          duration: 1.5,
          ease: "easeOut",
        }}
      />
    </div>
  );
};

export default CelebrationAnimation;