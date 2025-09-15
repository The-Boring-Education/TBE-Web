import React, {createContext, useContext, useState, ReactNode} from "react";

import  CelebrationAnimation  from "@/components/gamification/CelebrationAnimation";

interface GamificationContextType {
    showCelebration: (pointsEarned: number) => void
    triggerRefetch: () => void
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

interface GamificationProviderProps {
    children: ReactNode
}

export function GamificationProvider({children}: GamificationProviderProps) {
    const [celebration, setCelebration] = useState<{
        show: boolean
        pointsEarned: number
    }>({
        show: false,
        pointsEarned: 0
    });

    const [refetchTrigger, setRefetchTrigger] = useState(0);

    const showCelebration = (pointsEarned: number) => {
        setCelebration({
            show: true,
            pointsEarned
        });
    };

    const triggerRefetch = () => {
        setRefetchTrigger(prev => prev + 1);
    };

    const handleCelebrationComplete = () => {
        setCelebration(prev => ({...prev, show: false}));
    };

    return (
        <GamificationContext.Provider value={{showCelebration, triggerRefetch}}>
            {children}
            <CelebrationAnimation
                show={celebration.show}
                pointsEarned={celebration.pointsEarned}
                onComplete={handleCelebrationComplete}
            />
        </GamificationContext.Provider>
    );
}

export function useGamificationContext() {
    const context = useContext(GamificationContext);
    if (context === undefined) {
        throw new Error("useGamificationContext must be used within a GamificationProvider");
    }
    return context;
} 