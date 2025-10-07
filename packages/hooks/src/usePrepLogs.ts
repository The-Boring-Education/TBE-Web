import {useState, useEffect} from "react";

import {prepLogsService} from "@tbe/services";

export interface PrepLog {
    _id: string
    user: string
    title: string
    description?: string
    timeSpent: number
    mentorFeedback?: string
    createdAt: string
    updatedAt: string
    __v: number
}

export interface PrepLogsResponse {
    status: boolean
    data: PrepLog[]
}

export function usePrepLogs(userId: string) {
    const [logs, setLogs] = useState<PrepLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const fetchPrepLogs = async () => {
        if (!userId) {
            setError("User ID is required");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const data = await prepLogsService.getByUserId(userId);
            setLogs(data);
        } catch (err) {
            console.error("Error fetching prep logs:", err);
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to fetch prep logs"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPrepLogs();
    }, [userId, refreshTrigger]);

    // Debounced refetch function to prevent excessive API calls
    const refetch = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    // Calculate statistics
    const totalTimeSpent = logs.reduce(
        (acc, log) => acc + (log.timeSpent || 0),
        0
    );
    const totalLogs = logs.length;

    // Calculate streak (consecutive days with logs)
    const calculateStreak = () => {
        if (logs.length === 0) {return 0;}

        const sortedLogs = [...logs].sort(
            (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
        );

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let streak = 0;
        let currentDate = new Date(today);

        for (const log of sortedLogs) {
            const logDate = new Date(log.createdAt);
            logDate.setHours(0, 0, 0, 0);

            const diffTime = currentDate.getTime() - logDate.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays <= 1) {
                streak++;
                currentDate = logDate;
            } else {
                break;
            }
        }

        return streak;
    };

    const streak = calculateStreak();

    // Get recent activity (last 7 days)
    const getRecentActivity = () => {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        return logs.filter((log) => new Date(log.createdAt) >= sevenDaysAgo);
    };

    const recentActivity = getRecentActivity();

    return {
        logs,
        setLogs,
        loading,
        error,
        totalTimeSpent,
        totalLogs,
        streak,
        recentActivity,
        refetch
    };
}
