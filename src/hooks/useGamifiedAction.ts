import { useCallback, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useGamificationContext } from '@/contexts/GamificationContext'
import { gamificationApi } from '@/services/api'
import { useToast } from '@/components/ui/use-toast'

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

export type UserPointsActionType = 'COMPLETE_QUIZ' | 'QUIZ_PERFECT_SCORE' | 'QUIZ_STREAK'

export interface GamificationEvent {
  actionType: UserPointsActionType
  customMessage?: string
  metadata?: any
}

export interface GamificationState {
  isLoading: boolean
  showToast: boolean
  toastData: {
    type: 'points' | 'levelup'
    message: string
    points?: number
    level?: number
    levelName?: string
  } | null
}

// Points awarded for each action
const POINTS_MAP: Record<UserPointsActionType, number> = {
  'COMPLETE_QUIZ': 50,
  'QUIZ_PERFECT_SCORE': 100,
  'QUIZ_STREAK': 25,
}

const useGamifiedAction = () => {
  const { user } = useAuth()
  const { points: currentPoints, refreshPoints } = useGamificationContext()
  const { toast } = useToast()

  const [state, setState] = useState<GamificationState>({
    isLoading: false,
    showToast: false,
    toastData: null,
  })

  // Calculate current level based on points
  const getCurrentLevel = useCallback((userPoints: number) => {
    for (let i = USER_LEVELS.length - 1; i >= 0; i--) {
      if (userPoints >= USER_LEVELS[i].minPoints) {
        return USER_LEVELS[i]
      }
    }
    return USER_LEVELS[0] // Fallback to first level
  }, [])

  const triggerGamifiedAction = useCallback(
    async (event: GamificationEvent) => {
      if (!user?.id) {
        return
      }

      setState((prev) => ({ ...prev, isLoading: true }))

      try {
        const pointsEarned = POINTS_MAP[event.actionType]
        const previousLevel = getCurrentLevel(currentPoints)
        const newTotalPoints = currentPoints + pointsEarned
        const newLevel = getCurrentLevel(newTotalPoints)

        // Update points in database
        await gamificationApi.updateuserGamificationPoints({  
          userId: user.id,
          actionType: event.actionType
        })
        
        // Determine if user leveled up
        const leveledUp = newLevel.level > previousLevel.level

        // Show toast notification
        const toastMessage = event.customMessage || 
          (leveledUp 
            ? `Level Up! Welcome to ${newLevel.name}!` 
            : `+${pointsEarned} points earned!`)

        toast({
          title: leveledUp ? "🎉 Level Up!" : "🎯 Points Earned!",
          description: toastMessage,
          duration: 4000,
        })

        // Auto-refresh points to get updated data
        await refreshPoints()

      } catch (error) {
        console.error('Gamified action failed:', error)
        toast({
          title: "Error",
          description: "Failed to update points. Please try again.",
          variant: "destructive",
        })
      } finally {
        setState((prev) => ({ ...prev, isLoading: false }))
      }
    },
    [user?.id, currentPoints, getCurrentLevel, refreshPoints, toast]
  )

  const resetState = useCallback(() => {
    setState({
      isLoading: false,
      showToast: false,
      toastData: null,
    })
  }, [])

  return {
    ...state,
    triggerGamifiedAction,
    resetState,
  }
}

export default useGamifiedAction
