import { CelebrationAnimation, GamificationToast } from "@tbe/components";
import type { ReactNode } from "react";
import React, { createContext, useContext, useState } from "react";

interface GamificationContextType {
  triggerCelebration: (data: CelebrationData) => void;
  showToast: (data: ToastData) => void;
}

interface CelebrationData {
  type: "points" | "levelup" | "achievement";
  intensity: "low" | "medium" | "high";
}

interface ToastData {
  type: "points" | "levelup" | "achievement";
  message: string;
  points?: number;
  level?: number;
  levelName?: string;
}

const GamificationContext = createContext<GamificationContextType | null>(null);

interface GamificationProviderProps {
  children: ReactNode;
}

export const GamificationProvider = ({
  children,
}: GamificationProviderProps) => {
  const [celebrationData, setCelebrationData] =
    useState<CelebrationData | null>(null);
  const [toastData, setToastData] = useState<ToastData | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showToastState, setShowToastState] = useState(false);

  const triggerCelebration = (data: CelebrationData) => {
    setCelebrationData(data);
    setShowCelebration(true);
  };

  const showToast = (data: ToastData) => {
    setToastData(data);
    setShowToastState(true);
  };

  const handleCelebrationComplete = () => {
    setShowCelebration(false);
    setCelebrationData(null);
  };

  const handleToastClose = () => {
    setShowToastState(false);
    setToastData(null);
  };

  const contextValue: GamificationContextType = {
    triggerCelebration,
    showToast,
  };

  return (
    <GamificationContext.Provider value={contextValue}>
      {children}

      {/* Global Celebration Animation */}
      <CelebrationAnimation
        isActive={showCelebration}
        type={celebrationData?.type || "points"}
        intensity={celebrationData?.intensity || "medium"}
        onComplete={handleCelebrationComplete}
      />

      {/* Global Gamification Toast */}
      <GamificationToast
        isVisible={showToastState}
        type={toastData?.type || "points"}
        message={toastData?.message || ""}
        points={toastData?.points}
        level={toastData?.level}
        levelName={toastData?.levelName}
        onClose={handleToastClose}
      />
    </GamificationContext.Provider>
  );
};

export const useGamificationContext = () => {
  const context = useContext(GamificationContext);
  if (!context) {
    return {
      triggerCelebration: () => {},
      showToast: () => {},
    };
  }
  return context;
};

export default GamificationProvider;
