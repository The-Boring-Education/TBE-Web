'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { gamificationApi } from '@/services/api'

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

interface GamificationContextType {
  points: number
  loading: boolean
  error: string | null
  currentLevel: typeof USER_LEVELS[0]
  pointsToNextLevel: number
  refreshPoints: () => Promise<void>
  fetchUserPoints: (userId: string) => Promise<void>
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined)

interface GamificationProviderProps {
  children: React.ReactNode
  userId?: string
}

export function GamificationProvider({ children, userId }: GamificationProviderProps) {
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
      
      if (response?.data?.points !== undefined) {
        setPoints(response.data.points)
      } else {
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
      await fetchUserPoints(userId)
    }
  }, [userId, fetchUserPoints])

  const value: GamificationContextType = {
    points,
    loading,
    error,
    currentLevel,
    pointsToNextLevel,
    refreshPoints,
    fetchUserPoints
  }

  return (
    <GamificationContext.Provider value={value}>
      {children}
    </GamificationContext.Provider>
  )
}

export function useGamificationContext() {
  const context = useContext(GamificationContext)
  if (context === undefined) {
    throw new Error('useGamificationContext must be used within a GamificationProvider')
  }
  return context
}
