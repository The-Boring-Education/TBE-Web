import { useState, useEffect } from 'react'
import { challengesService } from '@tbe/utils'
import { Challenge, ChallengeProgress } from '@tbe/types'

/**
 * useChallenges Hook
 * 
 * Extracted from prep-yatra and made reusable
 * Handles challenge fetching and management
 */
export default function useChallenges(userId: string) {
    const [challenges, setChallenges] = useState<Challenge[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [refreshTrigger, setRefreshTrigger] = useState(0)

    const fetchChallenges = async () => {
        if (!userId) {
            setError('User ID is required')
            setLoading(false)
            return
        }

        try {
            setLoading(true)
            setError(null)

            const data = await challengesService.getByUserId(userId)
            setChallenges(data)
        } catch (err) {
            console.error('Error fetching challenges:', err)
            setError(
                err instanceof Error
                    ? err.message
                    : 'Failed to fetch challenges'
            )
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchChallenges()
    }, [userId, refreshTrigger])

    // Calculate statistics
    const activeChallenges = challenges.filter(challenge => challenge.isActive)
    const completedChallenges = challenges.filter(challenge => !challenge.isActive)
    const totalChallenges = challenges.length

    // Get current active challenge (most recent)
    const currentChallenge = activeChallenges.length > 0 
        ? activeChallenges.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
        : null

    // Calculate total days across all challenges
    const totalDaysCommitted = challenges.reduce(
        (acc, challenge) => acc + challenge.totalDays,
        0
    )

    // Calculate completion rate
    const completionRate = totalChallenges > 0 
        ? Math.round((completedChallenges.length / totalChallenges) * 100)
        : 0

    // Get recent challenges (last 30 days)
    const getRecentChallenges = () => {
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        return challenges.filter(
            (challenge) => new Date(challenge.createdAt) >= thirtyDaysAgo
        )
    }

    const recentChallenges = getRecentChallenges()

    return {
        challenges,
        activeChallenges,
        completedChallenges,
        currentChallenge,
        totalChallenges,
        totalDaysCommitted,
        completionRate,
        recentChallenges,
        loading,
        error,
        refetch: () => {
            setRefreshTrigger(prev => prev + 1)
        }
    }
}

/**
 * useChallengeProgress Hook
 * 
 * Tracks progress for a specific challenge
 */
export function useChallengeProgress(challengeId: string | null) {
    const [progress, setProgress] = useState<ChallengeProgress | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!challengeId) {
            setProgress(null)
            return
        }

        const fetchProgress = async () => {
            try {
                setLoading(true)
                setError(null)

                const data = await challengesService.getProgress(challengeId)
                setProgress(data)
            } catch (err) {
                console.error('Error fetching challenge progress:', err)
                setError(
                    err instanceof Error
                        ? err.message
                        : 'Failed to fetch challenge progress'
                )
            } finally {
                setLoading(false)
            }
        }

        fetchProgress()
    }, [challengeId])

    return {
        progress,
        loading,
        error,
        refetch: () => {
            if (challengeId) {
                // Trigger a re-fetch by updating the effect dependency
                setProgress(null)
            }
        }
    }
}
