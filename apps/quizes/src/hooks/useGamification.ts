import { gamificationApi } from "@/services/api"
import { useState, useEffect, useCallback } from "react"

// User levels configuration
const USER_LEVELS = [
  { name: 'Noob', value: 'NOOB', minPoints: 0, level: 1 },
  { name: 'Coder', value: 'CODER', minPoints: 500, level: 2 },
  { name: 'Debugger', value: 'DEBUGGER', minPoints: 1000, level: 3 },
  { name: 'Ninja', value: 'NINJA', minPoints: 2000, level: 4 },
  { name: 'Squasher', value: 'SQUASHER', minPoints: 3000, level: 5 },
  { name: 'Hacker', value: 'HACKER', minPoints: 4500, level: 6 },
  { name: 'Wizard', value: 'WIZARD', minPoints: 6000, level: 7 },
  { name: 'Guru', value: 'GURU', minPoints: 7500, level: 8 },
  { name: 'Architect', value: 'ARCHITECT', minPoints: 9000, level: 9 },
  { name: 'Legend', value: 'LEGEND', minPoints: 10000, level: 10 },
]

export function useGamification(userId?: string) {
    const [points, setPoints] = useState(0)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Calculate current level based on points
    const getCurrentLevel = useCallback((userPoints: number) => {
        for (let i = USER_LEVELS.length - 1; i >= 0; i--) {
            if (userPoints >= USER_LEVELS[i].minPoints) {
                return USER_LEVELS[i]
            }
        }
        return USER_LEVELS[0] // Fallback to first level
    }, [])

    // Calculate points needed for next level
    const getPointsToNextLevel = useCallback((userPoints: number) => {
        const currentLevel = getCurrentLevel(userPoints)
        const nextLevelIndex = USER_LEVELS.findIndex(level => level.level === currentLevel.level + 1)
        
        if (nextLevelIndex === -1) {
            return 0 // Already at max level
        }
        
        const nextLevel = USER_LEVELS[nextLevelIndex]
        return nextLevel.minPoints - userPoints
    }, [getCurrentLevel])

    // Get current level info
    const currentLevel = getCurrentLevel(points)
    const pointsToNextLevel = getPointsToNextLevel(points)

    const fetchUserPoints = useCallback(async (id: string) => {
        if (!id) return

        setLoading(true)
        setError(null)
        
        try {
            const response = await gamificationApi.getuserGamificationPoints(id)
            console.log('🔄 Points response:', response)
            
            if (response?.data?.points !== undefined) {
                console.log('🔄 Setting points to:', response.data.points)
                setPoints(response.data.points)
            } else {
                console.log('🔄 No points data, setting to 0')
                setPoints(0)
            }
        } catch (err) {
            console.error('Error fetching points:', err)
            setError('Failed to fetch points')
            setPoints(0)
        } finally {
            setLoading(false)
        }
    }, [])

    // Auto-fetch points when userId changes
    useEffect(() => {
        if (userId) {
            fetchUserPoints(userId)
        }
    }, [userId, fetchUserPoints])

    const refreshPoints = useCallback(async () => {
        if (userId) {
            console.log('🔄 Refreshing points for userId:', userId)
            await fetchUserPoints(userId)
        }
    }, [userId, fetchUserPoints])

    return {
        points,
        loading,
        error,
        currentLevel,
        pointsToNextLevel,
        refreshPoints,
        fetchUserPoints
    }
}

