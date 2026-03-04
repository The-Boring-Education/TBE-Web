"use client";

import { createContext, useContext } from "react";
import { useAuth } from "@tbe/auth";
import { useTimeTracker } from "@tbe/hooks";

interface TimeTrackerContextType {
    seconds: number;
    minutes: string;
    hours: string;
    formattedTime: string;
}

const TimeTrackerContext = createContext<TimeTrackerContextType>({
    seconds: 0,
    minutes: "0.0",
    hours: "0.00",
    formattedTime: "0s"
});

export const useAppTimeTracker = () => useContext(TimeTrackerContext);

export function TimeTrackerProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    // This will start tracking and syncing to backend automatically across all pages
    const timeStats = useTimeTracker(user?.id);

    return (
        <TimeTrackerContext.Provider value={timeStats}>
            {children}
        </TimeTrackerContext.Provider>
    );
}
