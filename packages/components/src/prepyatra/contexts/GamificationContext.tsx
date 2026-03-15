import type { ReactNode } from "react";
import React, { createContext, useContext, useState } from "react";

import CelebrationAnimation from "../gamification/CelebrationAnimation";

interface GamificationContextType {
  showCelebration: (pointsEarned: number) => void;
  triggerRefetch: () => void;
}

const PrepYatraGamificationContext = createContext<
  GamificationContextType | undefined
>(undefined);

interface GamificationProviderProps {
  children: ReactNode;
}

export function PrepYatraGamificationProvider({
  children,
}: GamificationProviderProps) {
  const [celebration, setCelebration] = useState<{
    show: boolean;
    pointsEarned: number;
  }>({
    show: false,
    pointsEarned: 0,
  });

  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const showCelebration = (pointsEarned: number) => {
    setCelebration({
      show: true,
      pointsEarned,
    });
  };

  const triggerRefetch = () => {
    setRefetchTrigger((prev) => prev + 1);
  };

  const handleCelebrationComplete = () => {
    setCelebration((prev) => ({ ...prev, show: false }));
  };

  return (
    <PrepYatraGamificationContext.Provider
      value={{ showCelebration, triggerRefetch }}
    >
      {children}
      <CelebrationAnimation
        show={celebration.show}
        pointsEarned={celebration.pointsEarned}
        onComplete={handleCelebrationComplete}
      />
    </PrepYatraGamificationContext.Provider>
  );
}

export function usePrepYatraGamificationContext() {
  const context = useContext(PrepYatraGamificationContext);
  if (context === undefined) {
    throw new Error(
      "useGamificationContext must be used within a GamificationProvider",
    );
  }
  return context;
}
