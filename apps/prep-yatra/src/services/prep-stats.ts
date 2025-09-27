export interface PrepStats {
    currentStreak: number
    longestStreak: number
    lastLoggedDate: string
    totalLogs: number
    hasLoggedToday: boolean
    recentLogs: number
    weeklyLogs: Array<{
        _id: string
        user: string
        title: string
        description: string
        timeSpent: number
        createdAt: string
        updatedAt: string
        __v: number
    }>
}

export interface PrepStatsResponse {
    status: boolean
    data: PrepStats
}

export const prepStatsService = {
    async getByUserId(userId: string): Promise<PrepStats> {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/prepyatra/prep-log/stats?userId=${userId}`,
                {
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            )

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const result: PrepStatsResponse = await response.json()

            if (!result.status) {
                throw new Error("Failed to fetch prep stats")
            }

            return result.data
        } catch (error) {
            console.error("Error fetching prep stats:", error)
            throw error
        }
    }
}
