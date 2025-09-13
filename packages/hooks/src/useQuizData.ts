import { useState, useEffect } from 'react'
import { sendRequest } from '@tbe/utils'
import { QuizCategoryAPI } from '@tbe/types'

/**
 * useQuizData Hook
 * 
 * Extracted from quizes app and made reusable
 * Handles quiz category and data fetching
 */

interface UseQuizDataReturn {
    categories: QuizCategoryAPI[]
    loading: boolean
    error: string | null
    refetch: () => void
}

export default function useQuizData(): UseQuizDataReturn {
    const [categories, setCategories] = useState<QuizCategoryAPI[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchCategories = async () => {
        try {
            setLoading(true)
            setError(null)

            const response = await sendRequest({
                url: '/api/v1/quiz/categories',
                method: 'GET'
            })

            if (response.success) {
                setCategories(response.data || [])
            } else {
                throw new Error(response.error || 'Failed to load categories')
            }
        } catch (err) {
            console.error('Error loading categories:', err)
            const errorMessage = err instanceof Error ? err.message : 'Failed to load categories'
            setError(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCategories()
    }, [])

    return {
        categories,
        loading,
        error,
        refetch: fetchCategories
    }
}
