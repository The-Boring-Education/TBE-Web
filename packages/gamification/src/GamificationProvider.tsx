import type { ReactNode } from "react";
import React, { createContext, useContext, useState } from "react";

import CelebrationAnimation from "./CelebrationAnimation";
import GamificationToast from "./GamificationToast";
import type {
  CelebrationData,
  GamificationContextType,
  ThemeType,
  ToastData,
} from "./types";

const GamificationContext = createContext<GamificationContextType | null>(null);

interface GamificationProviderProps {
  children: ReactNode;
  /** Controls the colour scheme of all gamification UI overlays.
   *  Pass "dark" for apps with a dark background (oncampus, dsayatra).
   *  Defaults to "light". */
  theme?: ThemeType;
}

/**
 * Wraps an app with gamification UI state (celebration + toast overlays).
 *
 * Place this near the root of any app that uses gamification.
 * Does NOT own data fetching — that's handled by useGamification via React Query.
 *
 * @param theme - "light" (default) or "dark" — controls the visual style of
 *                all gamification overlays (toast, celebration, points badge).
 */
export const GamificationProvider = ({
  children,
  theme = "light",
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

  return (
    <GamificationContext.Provider
      value={{ triggerCelebration, showToast, theme }}
    >
      {children}

      <CelebrationAnimation
        isActive={showCelebration}
        type={celebrationData?.type || "points"}
        intensity={celebrationData?.intensity || "medium"}
        onComplete={handleCelebrationComplete}
      />

      <GamificationToast
        isVisible={showToastState}
        type={toastData?.type || "points"}
        message={toastData?.message || ""}
        points={toastData?.points}
        level={toastData?.level}
        levelName={toastData?.levelName}
        theme={theme}
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
      theme: "light" as ThemeType,
    };
  }
  return context;
};

export default GamificationProvider;
