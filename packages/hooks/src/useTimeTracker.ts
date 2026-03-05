import { useEffect, useRef, useState } from "react";
import { prepLogsService } from "@tbe/services";

/**
 * useTimeTracker hook
 * Automatically tracks time spent on the platform.
 * Syncs time to the backend periodically.
 * 
 * @param userId - The ID of the authenticated user
 * @param active - Whether tracking is currently active (defaults to true)
 */
export function useTimeTracker(userId: string | undefined, active: boolean = true) {
    const [seconds, setSeconds] = useState(0);
    const accumulatedTime = useRef(0);
    const lastSyncTime = useRef(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!userId || !active) return;

        const startTimer = () => {
            if (timerRef.current) return;
            timerRef.current = setInterval(() => {
                if (document.visibilityState === "visible") {
                    accumulatedTime.current += 1;
                    setSeconds(prev => prev + 1);
                }
            }, 1000);
        };

        const stopTimer = () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                startTimer();
            } else {
                stopTimer();
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        startTimer();

        // Periodically sync to backend (every 60 seconds of actual time spent)
        // We check every 30 seconds if we have at least 1 minute to sync
        const syncInterval = setInterval(async () => {
            const timeToSync = accumulatedTime.current - lastSyncTime.current;
            if (timeToSync >= 60) {
                try {
                    const minutesToSync = Math.floor(timeToSync / 60);
                    
                    await prepLogsService.create({
                        title: "DSA Study Session",
                        description: "Automatic background tracking",
                        timeSpent: minutesToSync,
                        userId
                    });
                    
                    // Only update lastSyncTime by the amount actually synced
                    lastSyncTime.current += minutesToSync * 60;
                } catch (error) {
                    console.error("Failed to sync automatically tracked time:", error);
                }
            }
        }, 30000);

        return () => {
            stopTimer();
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            clearInterval(syncInterval);
        };
    }, [userId, active]);

    return {
        seconds,
        minutes: (seconds / 60).toFixed(1),
        hours: (seconds / 3600).toFixed(2),
        formattedTime: formatDuration(seconds)
    };
}

function formatDuration(totalSeconds: number) {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
}
