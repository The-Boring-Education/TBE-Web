'use client'

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Layout } from "@/components/Layout"
import { useAuth } from "@/contexts/AuthContext"
import { analyticsApi, APIError } from "@/services/api"
import { PerformanceMetrics } from "@/types/api"
import { 
  BarChart3, 
  Trophy, 
  Clock, 
  Target,
  TrendingUp,
  Calendar
} from "lucide-react"
import { ProtectedRoute } from "@/components/ProtectedRoute"

// Use the PerformanceMetrics type from the API

const PerformanceContent = () => {
  const { user } = useAuth()
  const router = useRouter()
  const [performance, setPerformance] = useState<PerformanceMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadPerformance = useCallback(async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      setError(null)
      
      const response = await analyticsApi.getPerformanceMetrics(user.id)
      
      if (response.success) {
        setPerformance(response.data)
      } else {
        throw new APIError(response.message || 'Failed to load performance', 500)
      }
    } catch (err) {
        // Failed to load performance data
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    if (user?.id) {
      loadPerformance()
    }
  }, [user?.id, loadPerformance])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`
    } else {
      return `${remainingSeconds}s`
    }
  }



  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-lg text-gray-600">Loading performance...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={loadPerformance}>Try Again</Button>
          </div>
        </div>
      </Layout>
    )
  }

  if (!performance) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 mb-4">No performance data available</p>
            <Button onClick={() => router.push('/dashboard')}>
              Take Your First Quiz
            </Button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Your Performance</h1>
            <p className="text-xl text-gray-600">Track your learning progress and achievements</p>
          </div>

        <div className="max-w-6xl mx-auto">
          {/* Overall Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Attempts</p>
                    <p className="text-2xl font-bold text-gray-900">{performance.totalAttempts}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Target className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Average Score</p>
                    <p className="text-2xl font-bold text-gray-900">{performance.averageScore}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Trophy className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Best Score</p>
                    <p className="text-2xl font-bold text-gray-900">{performance.bestScore}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Accuracy Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{performance.averageScore}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Clock className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Time Spent</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatTime(performance.totalTimeSpent)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4 mt-12">
            <Button 
              onClick={() => router.push('/dashboard')}
              className="bg-indigo-600 hover:bg-indigo-700"
              size="lg"
            >
              Take Another Quiz
            </Button>
            <Button 
              variant="outline" 
              onClick={() => router.push('/leaderboard')}
              className="border-indigo-600 text-indigo-600 hover:bg-indigo-50"
              size="lg"
            >
              View Leaderboard
            </Button>
          </div>
        </div>
        </div>
      </div>
    </Layout>
  )
}

export default function Performance() {
  return (
    <ProtectedRoute>
      <PerformanceContent />
    </ProtectedRoute>
  )
}