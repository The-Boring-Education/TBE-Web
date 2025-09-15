'use client'

  import React, { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Layout } from "@/components/Layout"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { useAuth } from "@/contexts/AuthContext"
import { useQuizData } from "@/hooks/useQuizData"
import { debugAPIUrls } from "@/utils/apiDebug"
import { Play, BookOpen } from "lucide-react"
import { gamificationApi } from "@/services/api"

function DashboardContent() {
  const { user } = useAuth()
  const router = useRouter()
  const { categories, loading, error, refetch } = useQuizData()

  // Debug API URLs on dashboard load
  React.useEffect(() => {
    debugAPIUrls()
  }, [])

  const startQuiz = (categoryId: string) => {
    router.push(`/quiz/${categoryId}`)
  }

  useEffect(() => {
    gamificationApi.getuserGamificationPoints(user?.id || '').then((res:any) => {
     console.log(res)
    })
 }, [user?.id])

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-lg text-gray-600">Loading...</p>
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
            <Button onClick={refetch}>Try Again</Button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          {/* Welcome Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome back, {user?.name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-xl text-gray-600">
              Ready to test your knowledge? Choose a quiz below to get started.
            </p>
          </div>

          {/* Quiz Categories */}
          <div className="max-w-6xl mx-auto">
            <Card className="shadow-lg">
              <CardHeader className="bg-white">
                <CardTitle className="flex items-center space-x-2 text-2xl">
                  <BookOpen className="h-6 w-6 text-indigo-600" />
                  <span>Available Quizzes</span>
                </CardTitle>
                <CardDescription className="text-lg">
                  Choose a quiz category to start testing your knowledge
                </CardDescription>
              </CardHeader>
              <CardContent className="bg-white p-8">
                {categories.length === 0 ? (
                  <div className="text-center py-16">
                    <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg mb-6">No quizzes available</p>
                    <Button onClick={refetch} variant="outline" size="lg">
                      Refresh
                    </Button>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {categories.map((category) => (
                      <Card
                        key={category._id}
                        className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 border-gray-100 hover:border-indigo-200"
                        onClick={() => startQuiz(category._id)}
                      >
                        <CardContent className="p-8">
                          <div className="text-center">
                            <div className="text-5xl mb-6">
                              {category.categoryIcon}
                            </div>
                            <h3 className="font-semibold text-xl mb-3 text-gray-900">
                              {category.categoryName}
                            </h3>
                            <p className="text-gray-600 mb-6 line-clamp-3">
                              {category.categoryDescription}
                            </p>
                            <Button 
                              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" 
                              size="lg"
                            >
                              <Play className="h-5 w-5 mr-2" />
                              Start Quiz
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}