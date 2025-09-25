import { useState, useEffect } from 'react'
import { sendRequest, trackEvent } from '@tbe/utils'

/**
 * usePrepLogs Hook
 * 
 * Extracted from prep-yatra and made reusable
 * Handles prep log management and fetching
 */

export interface PrepLog {
    _id: string
    user: string
    day: number
    progress: string
    timeSpent: number
    nextGoals: string[]
    date: string
    createdAt: string
    updatedAt: string
}

export interface CreatePrepLogRequest {
    day: number
    progress: string
    timeSpent: number
    nextGoals: string[]
}

export default function usePrepLogs(userId: string) {
    const [prepLogs, setPrepLogs] = useState<PrepLog[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [refreshTrigger, setRefreshTrigger] = useState(0)

    const fetchPrepLogs = async () => {
        if (!userId) {
            setError('User ID is required')
            setLoading(false)
            return
        }

        try {
            setLoading(true)
            setError(null)

            const response = await sendRequest({
                url: `/api/v1/prepyatra/prep-logs?userId=${userId}`,
                method: 'GET'
            })

            if (!response.success) {
                throw new Error('Failed to fetch prep logs')
            }

            setPrepLogs(response.data || [])
        } catch (err) {
            console.error('Error fetching prep logs:', err)
            setError(
                err instanceof Error
                    ? err.message
                    : 'Failed to fetch prep logs'
            )
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPrepLogs()
    }, [userId, refreshTrigger])

    // Create a new prep log
    const createPrepLog = async (data: CreatePrepLogRequest): Promise<PrepLog> => {
        try {
            const response = await sendRequest({
                url: `/api/v1/prepyatra/prep-logs`,
                method: 'POST',
                data: {
                    ...data,
                    user: userId
                }
            })

            if (!response.success) {
                throw new Error('Failed to create prep log')
            }

            // Analytics
            try {
                trackEvent('prep_log_create', {
                    action: 'prep_log_create',
                    category: 'prep_yatra',
                    value: data.timeSpent as number,
                    day: data.day as number
                })
            } catch {}

            // Refresh the list
            setRefreshTrigger(prev => prev + 1)

            return response.data
        } catch (error) {
            console.error('Error creating prep log:', error)
            throw error
        }
    }

    // Calculate statistics
    const totalLogs = prepLogs.length
    const totalTimeSpent = prepLogs.reduce((acc, log) => acc + log.timeSpent, 0)
    const averageTimePerDay = totalLogs > 0 ? Math.round(totalTimeSpent / totalLogs) : 0
    
    // Get recent logs (last 7 days)
    const getRecentLogs = () => {
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

        return prepLogs
            .filter(log => new Date(log.createdAt) >= sevenDaysAgo)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }

    const recentLogs = getRecentLogs()
    
    // Get current streak
    const getCurrentStreak = () => {
        if (prepLogs.length === 0) return 0
        
        const sortedLogs = [...prepLogs].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        
        let streak = 0
        const today = new Date()
        
        for (const log of sortedLogs) {
            const logDate = new Date(log.createdAt)
            const diffDays = Math.floor((today.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24))
            
            if (diffDays === streak) {
                streak++
            } else {
                break
            }
        }
        
        return streak
    }

    const currentStreak = getCurrentStreak()

    return {
        prepLogs,
        totalLogs,
        totalTimeSpent,
        averageTimePerDay,
        recentLogs,
        currentStreak,
        loading,
        error,
        createPrepLog,
        refetch: () => {
            setRefreshTrigger(prev => prev + 1)
        }
    }
}
