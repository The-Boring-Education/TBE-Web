import {useState, useEffect} from "react";

import type { PrepStats} from "@tbe/services";
import {prepStatsService} from "@tbe/services";

export function usePrepStats(userId: string) {
    const [stats, setStats] = useState<PrepStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPrepStats = async () => {
            if (!userId) {
                setError("User ID is required");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                const data = await prepStatsService.getByUserId(userId);
                setStats(data);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to fetch prep stats"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchPrepStats();
    }, [userId]);

    // Calculate total time spent from weekly logs
    const totalTimeSpent =
        stats?.weeklyLogs?.reduce(
            (acc: number, log: { timeSpent?: number }) => acc + (log.timeSpent || 0),
            0
        ) || 0;

    // Calculate average time per session
    const averageTimePerSession =
        stats?.totalLogs && stats.totalLogs > 0
            ? Math.round((totalTimeSpent / stats.totalLogs) * 10) / 10
            : 0;

    return {
        stats,
        loading,
        error,
        currentStreak: stats?.currentStreak || 0,
        longestStreak: stats?.longestStreak || 0,
        totalLogs: stats?.totalLogs || 0,
        totalTimeSpent,
        averageTimePerSession,
        hasLoggedToday: stats?.hasLoggedToday || false,
        recentLogs: stats?.recentLogs || 0,
        weeklyLogs: stats?.weeklyLogs || [],
        lastLoggedDate: stats?.lastLoggedDate,
        refetch: () => {
            setLoading(true);
            setError(null);
        }
    };
}
