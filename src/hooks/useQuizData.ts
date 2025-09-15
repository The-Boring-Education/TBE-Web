import { useState, useEffect } from 'react'
import { quizApi, APIError } from '@/services/api'
import { QuizCategoryAPI } from '@/types/api'

interface UseQuizDataReturn {
  categories: QuizCategoryAPI[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useQuizData(): UseQuizDataReturn {
  const [categories, setCategories] = useState<QuizCategoryAPI[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await quizApi.getCategories()
      
      if (response.success) {
        setCategories(response.data)
      } else {
        throw new APIError(response.message || 'Failed to load categories', 500)
      }
    } catch (err) {
      console.error('Error loading categories:', err)
      const errorMessage = err instanceof APIError ? err.message : 'Failed to load categories'
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