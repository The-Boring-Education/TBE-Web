'use client'

import { useEffect, useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { analyticsApi, quizApi, APIError } from '@/services/api'
import { PerformanceHistory, QuizAttempt } from '@/types/api'
import { 
    History, 
    Filter, 
    Search, 
    Calendar, 
    Clock, 
    Target, 
    TrendingUp,
    TrendingDown,
    Minus,
    Eye,
    RefreshCw,
    Award
} from 'lucide-react'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { DashboardNav } from '@/components/layout/DashboardNav'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { formatTimeAgo, formatDuration } from '@/lib/utils'

// Filter component
interface FilterBarProps {
    searchTerm: string
    setSearchTerm: (term: string) => void
    selectedCategory: string
    setSelectedCategory: (category: string) => void
    selectedTimeRange: string
    setSelectedTimeRange: (range: string) => void
    categories: string[]
}

function FilterBar({
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    selectedTimeRange,
    setSelectedTimeRange,
    categories
}: FilterBarProps) {
    return (
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                    placeholder="Search attempts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Category Filter */}
            <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-input rounded-md bg-background text-foreground"
            >
                <option value="">All Categories</option>
                {categories.map((category) => (
                    <option key={category} value={category}>
                        {category}
                    </option>
                ))}
            </select>

            {/* Time Range Filter */}
            <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="px-3 py-2 border border-input rounded-md bg-background text-foreground"
            >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">Last year</option>
                <option value="all">All time</option>
            </select>
        </div>
    )
}

// Performance Trend Component
function PerformanceTrend({ currentScore, previousScore }: { currentScore: number; previousScore: number }) {
    const difference = currentScore - previousScore
    
    if (difference > 0) {
        return (
            <div className="flex items-center text-green-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span className="text-sm">+{difference}%</span>
            </div>
        )
    } else if (difference < 0) {
        return (
            <div className="flex items-center text-red-600">
                <TrendingDown className="w-4 h-4 mr-1" />
                <span className="text-sm">{difference}%</span>
            </div>
        )
    } else {
        return (
            <div className="flex items-center text-muted-foreground">
                <Minus className="w-4 h-4 mr-1" />
                <span className="text-sm">No change</span>
            </div>
        )
    }
}

// Attempt Card Component
interface AttemptCardProps {
    attempt: QuizAttempt
    showDetails?: boolean
}

function AttemptCard({ attempt, showDetails = false }: AttemptCardProps) {
    const [expanded, setExpanded] = useState(false)
    
    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600'
        if (score >= 60) return 'text-yellow-600'
        return 'text-red-600'
    }

    const getScoreBadgeVariant = (score: number) => {
        if (score >= 80) return 'default'
        if (score >= 60) return 'secondary'
        return 'destructive'
    }

    return (
        <Card className="glass hover:shadow-lg transition-all duration-200">
            <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-semibold text-lg">{attempt.categoryName}</h3>
                            <Badge variant={getScoreBadgeVariant(attempt.score)}>
                                {attempt.score}%
                            </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-2">
                                <Target className="w-4 h-4" />
                                <span>{attempt.correctAnswers}/{attempt.totalQuestions} correct</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Clock className="w-4 h-4" />
                                <span>{formatDuration(attempt.timeTaken)}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4" />
                                <span>{formatTimeAgo(attempt.completedAt)}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <TrendingUp className="w-4 h-4" />
                                <span>{attempt.pointsEarned} points</span>
                            </div>
                        </div>
                    </div>
                    
                    {showDetails && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setExpanded(!expanded)}
                            className="ml-4"
                        >
                            <Eye className="w-4 h-4 mr-2" />
                            {expanded ? 'Hide' : 'Details'}
                        </Button>
                    )}
                </div>

                {expanded && showDetails && (
                    <div className="mt-4 pt-4 border-t border-muted">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="font-medium mb-2">Performance Breakdown:</p>
                                <div className="space-y-1">
                                    <div className="flex justify-between">
                                        <span>Accuracy:</span>
                                        <span className={getScoreColor(attempt.score)}>
                                            {((attempt.correctAnswers / attempt.totalQuestions) * 100).toFixed(1)}%
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Efficiency:</span>
                                        <span>{Math.round(attempt.pointsEarned / attempt.timeTaken * 60)} pts/min</span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <p className="font-medium mb-2">Quiz Details:</p>
                                <div className="space-y-1">
                                    <div className="flex justify-between">
                                        <span>Quiz ID:</span>
                                        <span className="font-mono text-xs">{attempt.quizId}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Attempt ID:</span>
                                        <span className="font-mono text-xs">{attempt._id}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

function HistoryContent() {
    const { user } = useAuth()
    const { toast } = useToast()
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('')
    const [selectedTimeRange, setSelectedTimeRange] = useState('30')
    const [showDetails, setShowDetails] = useState(false)

    // Fetch attempts data
    const {
        data: attemptsData,
        isLoading: attemptsLoading,
        error: attemptsError,
        refetch: refetchAttempts
    } = useQuery<QuizAttempt[]>({
        queryKey: ['quiz-attempts', user?.id],
        queryFn: async () => {
            if (!user?.id) return []
            const response = await quizApi.getUserAttempts(user.id)
            return response.data
        },
        enabled: !!user?.id
    })

    // Fetch performance history
    const {
        data: historyData,
        isLoading: historyLoading,
        error: historyError
    } = useQuery<PerformanceHistory[]>({
        queryKey: ['performance-history', user?.id, selectedTimeRange],
        queryFn: async () => {
            if (!user?.id) return []
            const days = selectedTimeRange === 'all' ? 365 : parseInt(selectedTimeRange)
            const response = await analyticsApi.getPerformanceHistory(user.id, days)
            return response.data
        },
        enabled: !!user?.id
    })

    const handleError = useCallback((error: unknown) => {
        if (error instanceof APIError) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            })
        } else {
            toast({
                title: "Error",
                description: "Failed to load performance history",
                variant: "destructive",
            })
        }
    }, [toast])

    useEffect(() => {
        if (attemptsError) handleError(attemptsError)
        if (historyError) handleError(historyError)
    }, [attemptsError, historyError, handleError])

    const attempts = attemptsData || []
    const history = historyData || []

    // Get unique categories
    const categories = Array.from(new Set(attempts.map(attempt => attempt.categoryName)))

    // Filter attempts based on search and filters
    const filteredAttempts = attempts.filter(attempt => {
        const matchesSearch = searchTerm === '' || 
            attempt.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            attempt.quizId.toLowerCase().includes(searchTerm.toLowerCase())
        
        const matchesCategory = selectedCategory === '' || attempt.categoryName === selectedCategory
        
        return matchesSearch && matchesCategory
    })

    // Calculate summary statistics
    const totalAttempts = attempts.length
    const averageScore = attempts.length > 0 
        ? Math.round(attempts.reduce((sum, attempt) => sum + attempt.score, 0) / attempts.length)
        : 0
    const totalTimeSpent = attempts.reduce((sum, attempt) => sum + attempt.timeTaken, 0)
    const totalPoints = attempts.reduce((sum, attempt) => sum + attempt.pointsEarned, 0)

    // Performance trends
    const recentAttempts = attempts.slice(0, 5)
    const previousAttempts = attempts.slice(5, 10)
    const recentAverage = recentAttempts.length > 0 
        ? Math.round(recentAttempts.reduce((sum, attempt) => sum + attempt.score, 0) / recentAttempts.length)
        : 0
    const previousAverage = previousAttempts.length > 0 
        ? Math.round(previousAttempts.reduce((sum, attempt) => sum + attempt.score, 0) / previousAttempts.length)
        : 0

    return (
        <div className="min-h-screen bg-background">
            <DashboardNav />
            
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-foreground mb-2">
                                📈 Performance History
                            </h1>
                            <p className="text-muted-foreground">
                                Track your quiz attempts and performance over time
                            </p>
                        </div>
                        <Button
                            onClick={() => refetchAttempts()}
                            variant="outline"
                            size="sm"
                            disabled={attemptsLoading}
                        >
                            <RefreshCw className={`w-4 h-4 mr-2 ${attemptsLoading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <Card className="glass animate-fade-in">
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                                    <Target className="w-5 h-5 text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Attempts</p>
                                    <p className="text-2xl font-bold">{totalAttempts}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="glass animate-fade-in">
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                                    <TrendingUp className="w-5 h-5 text-green-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Average Score</p>
                                    <p className="text-2xl font-bold">{averageScore}%</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="glass animate-fade-in">
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                                    <Clock className="w-5 h-5 text-purple-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Time</p>
                                    <p className="text-2xl font-bold">{formatDuration(totalTimeSpent)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="glass animate-fade-in">
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                                    <Award className="w-5 h-5 text-yellow-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Points</p>
                                    <p className="text-2xl font-bold">{totalPoints}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Performance Trend */}
                {recentAttempts.length > 0 && previousAttempts.length > 0 && (
                    <Card className="glass mb-8 animate-scale-in">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <TrendingUp className="w-5 h-5" />
                                <span>Performance Trend</span>
                            </CardTitle>
                            <CardDescription>
                                Compare your recent performance with previous attempts
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="text-center p-4 bg-muted/30 rounded-lg">
                                    <p className="text-sm text-muted-foreground mb-2">Recent Average</p>
                                    <p className="text-3xl font-bold text-green-600">{recentAverage}%</p>
                                    <p className="text-xs text-muted-foreground">Last 5 attempts</p>
                                </div>
                                <div className="text-center p-4 bg-muted/30 rounded-lg">
                                    <p className="text-sm text-muted-foreground mb-2">Previous Average</p>
                                    <p className="text-3xl font-bold text-blue-600">{previousAverage}%</p>
                                    <p className="text-xs text-muted-foreground">5 attempts before</p>
                                </div>
                            </div>
                            <div className="mt-4 text-center">
                                <PerformanceTrend currentScore={recentAverage} previousScore={previousAverage} />
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Filters */}
                <FilterBar
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    selectedTimeRange={selectedTimeRange}
                    setSelectedTimeRange={setSelectedTimeRange}
                    categories={categories}
                />

                {/* Attempts List */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">
                            Quiz Attempts ({filteredAttempts.length})
                        </h2>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowDetails(!showDetails)}
                        >
                            <Eye className="w-4 h-4 mr-2" />
                            {showDetails ? 'Hide Details' : 'Show Details'}
                        </Button>
                    </div>

                    {attemptsLoading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="animate-pulse">
                                    <div className="h-32 bg-muted rounded-lg"></div>
                                </div>
                            ))}
                        </div>
                    ) : filteredAttempts.length === 0 ? (
                        <Card className="glass">
                            <CardContent className="p-12 text-center">
                                <History className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No attempts found</h3>
                                <p className="text-muted-foreground">
                                    {searchTerm || selectedCategory 
                                        ? 'Try adjusting your filters or search terms'
                                        : 'Start taking quizzes to see your performance history here'
                                    }
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {filteredAttempts.map((attempt, index) => (
                                <div
                                    key={attempt._id}
                                    className="animate-fade-in"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <AttemptCard 
                                        attempt={attempt} 
                                        showDetails={showDetails}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}

export default function HistoryPage() {
    return (
        <ProtectedRoute>
            <HistoryContent />
        </ProtectedRoute>
    )
} 