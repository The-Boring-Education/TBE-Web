'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Layout } from "@/components/Layout"
import { useAuth } from "@/contexts/AuthContext"
import { leaderboardApi, APIError } from "@/services/api"
import {
  Trophy,
  Medal,
  Award,
  Crown,
  User,
  Target,
  Clock
} from "lucide-react"

interface LeaderboardEntry {
  _id: string
  username: string
  image: string
  bestScore: number
  totalAttempts: number
  averageScore: number
  totalTimeSpent: number
  rank: number
}

function LeaderboardContent() {
  const { user } = useAuth()
  const router = useRouter()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadLeaderboard()
  }, [])

  const loadLeaderboard = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await leaderboardApi.getLeaderboard()

      if (response.success) {
        // Transform LeaderboardData to LeaderboardEntry
        const transformedData: LeaderboardEntry[] = response.data.map((item, index) => ({
          _id: item._id || '',
          username: item.username || 'Unknown User',
          image: item.image || '',
          bestScore: item.bestScore || 0,
          totalAttempts: item.totalAttempts || 0,
          averageScore: item.averageScore || 0,
          totalTimeSpent: item.totalTimeSpent || 0,
          rank: index + 1
        }))
        setLeaderboard(transformedData)
      } else {
        throw new APIError(response.message || 'Failed to load leaderboard', 500)
      }
    } catch (err) {
      // Failed to load leaderboard data
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />
      default:
        return <span className="text-lg font-bold text-gray-600">#{rank}</span>
    }
  }

  const getRankStyle = (rank: number, isCurrentUser: boolean) => {
    if (isCurrentUser) {
      return "bg-blue-50 border-blue-200 border-2"
    }
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200"
      case 2:
        return "bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200"
      case 3:
        return "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200"
      default:
        return "bg-white border-gray-100"
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const currentUserRank = leaderboard.findIndex(entry => entry._id === user?.id) + 1

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-lg text-gray-600">Loading leaderboard...</p>
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
            <Button onClick={loadLeaderboard}>Try Again</Button>
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
            <h1 className="text-4xl font-bold text-gray-900 mb-4">🏆 Leaderboard</h1>
            <p className="text-xl text-gray-600">See who&apos;s leading the pack in our quiz community</p>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* Current User Position */}
            {currentUserRank > 0 && currentUserRank > 3 && (
              <Card className="mb-6 bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-lg text-blue-900">Your Position</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-lg font-bold text-blue-600">#{currentUserRank}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-blue-900">You</p>
                        <p className="text-sm text-blue-700">
                          {leaderboard[currentUserRank - 1]?.totalAttempts || 0} attempts
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-900">
                        {leaderboard[currentUserRank - 1]?.averageScore || 0}%
                      </p>
                      <p className="text-sm text-blue-700">Average Score</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Leaderboard */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="h-6 w-6 text-yellow-500" />
                  <span>Top Performers</span>
                </CardTitle>
                <CardDescription>
                  Rankings based on average quiz scores
                </CardDescription>
              </CardHeader>
              <CardContent>
                {leaderboard.length === 0 ? (
                  <div className="text-center py-12">
                    <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No leaderboard data available yet</p>
                    <Button onClick={() => router.push('/dashboard')}>
                      Take Your First Quiz
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {leaderboard.slice(0, 20).map((entry, index) => {
                      const isCurrentUser = entry._id === user?.id
                      const rank = entry.rank

                      return (
                        <div
                          key={entry._id}
                          className={`p-4 rounded-lg border transition-all duration-200 ${getRankStyle(rank, isCurrentUser)}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 rounded-full flex items-center justify-center">
                                {rank <= 3 ? (
                                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${rank === 1 ? 'bg-yellow-100' :
                                      rank === 2 ? 'bg-gray-100' : 'bg-amber-100'
                                    }`}>
                                    {getRankIcon(rank)}
                                  </div>
                                ) : (
                                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                                    <span className="text-lg font-bold text-gray-600">#{rank}</span>
                                  </div>
                                )}
                              </div>

                              <div>
                                <div className="flex items-center space-x-2">
                                  <p className={`font-semibold ${isCurrentUser ? 'text-blue-900' : 'text-gray-900'}`}>
                                    {isCurrentUser ? 'You' : entry.username}
                                  </p>
                                  {isCurrentUser && <User className="h-4 w-4 text-blue-600" />}
                                </div>
                                <div className="flex items-center space-x-4 text-sm text-gray-600">
                                  <div className="flex items-center space-x-1">
                                    <Target className="h-3 w-3" />
                                    <span>{entry.totalAttempts || 0} attempts</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Trophy className="h-3 w-3" />
                                    <span>Best: {entry.bestScore || 0}%</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Clock className="h-3 w-3" />
                                    <span>{formatTime(entry.totalTimeSpent || 0)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="text-right">
                              <div className={`text-2xl font-bold ${(entry.bestScore || 0) >= 90 ? 'text-green-600' :
                                  (entry.bestScore || 0) >= 75 ? 'text-blue-600' :
                                    (entry.bestScore || 0) >= 60 ? 'text-yellow-600' : 'text-red-600'
                                }`}>
                                {entry.bestScore || 0}%
                              </div>
                              <p className="text-sm text-gray-600">Best Score</p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4 mt-12">
              <Button
                onClick={() => router.push('/dashboard')}
                className="bg-indigo-600 hover:bg-indigo-700"
                size="lg"
              >
                Take a Quiz
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/performance')}
                className="border-indigo-600 text-indigo-600 hover:bg-indigo-50"
                size="lg"
              >
                View Your Performance
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default function Leaderboard() {
  return <LeaderboardContent />
}