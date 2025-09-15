'use client'

import { useEffect, useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { analyticsApi, APIError } from '@/services/api'
import { PerformanceMetrics, CategoryPerformance } from '@/types/api'
import { 
    TrendingUp, 
    Target, 
    Clock, 
    Award, 
    BarChart3, 
    Zap, 
    Calendar,
    Activity,
    Star,
    Trophy
} from 'lucide-react'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { DashboardNav } from '@/components/layout/DashboardNav'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { formatTimeAgo, formatDuration } from '@/lib/utils'

// Loading component
const MetricLoader = () => (
    <div className="animate-pulse">
        <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
        <div className="h-8 bg-muted rounded w-1/2"></div>
    </div>
)

// Metric Card Component
interface MetricCardProps {
    title: string
    value: string | number | React.ReactNode
    subtitle?: string
    icon: React.ReactNode
    trend?: {
        value: number
        isPositive: boolean
    }
    className?: string
    style?: React.CSSProperties
}

function MetricCard({ title, value, subtitle, icon, trend, className = '' }: MetricCardProps) {
    return (
        <Card className={`glass animate-fade-in ${className}`}>
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <p className="text-sm font-medium text-muted-foreground mb-1">
                            {title}
                        </p>
                        <div className="flex items-center space-x-2">
                            <p className="text-3xl font-bold text-foreground">
                                {value}
                            </p>
                            {trend && (
                                <div className={`flex items-center text-sm ${
                                    trend.isPositive ? 'text-green-600' : 'text-red-600'
                                }`}>
                                    <TrendingUp className={`w-4 h-4 mr-1 ${
                                        trend.isPositive ? '' : 'rotate-180'
                                    }`} />
                                    {trend.value}%
                                </div>
                            )}
                        </div>
                        {subtitle && (
                            <p className="text-sm text-muted-foreground mt-1">
                                {subtitle}
                            </p>
                        )}
                    </div>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        {icon}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

// Performance Chart Component (Simplified)
function PerformanceChart({ data }: { data: CategoryPerformance[] }) {
    if (!data || data.length === 0) {
        return (
            <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No performance data available yet</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {data.map((category, index) => (
                <div key={category.categoryId} className="flex items-center space-x-4 p-4 bg-muted/30 rounded-lg">
                    <div className="w-4 h-4 bg-primary rounded-full"></div>
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{category.categoryName}</h4>
                            <span className="text-sm text-muted-foreground">
                                {category.attempts} attempts
                            </span>
                        </div>
                        <div className="flex items-center space-x-6 text-sm">
                            <span>Best: <strong>{category.bestScore}%</strong></span>
                            <span>Avg: <strong>{category.averageScore}%</strong></span>
                            <span>Time: <strong>{formatDuration(category.totalTimeSpent)}</strong></span>
                        </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        category.improvementTrend === 'improving' ? 'bg-green-100 text-green-800' :
                        category.improvementTrend === 'declining' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                    }`}>
                        {category.improvementTrend}
                    </div>
                </div>
            ))}
        </div>
    )
}

function StatsContent() {
    const { user } = useAuth()
    const { toast } = useToast()
    const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')

    const {
        data: metricsData,
        isLoading: metricsLoading,
        error: metricsError
    } = useQuery<PerformanceMetrics>({
        queryKey: ['performance-metrics', user?.id, timeRange],
        queryFn: async () => {
            if (!user?.id) throw new Error('User not authenticated')
            const response = await analyticsApi.getPerformanceMetrics(user.id)
            return response.data
        },
        enabled: !!user?.id
    })

    const {
        data: categoryData,
        isLoading: categoryLoading,
        error: categoryError
    } = useQuery<CategoryPerformance[]>({
        queryKey: ['category-performance', user?.id, timeRange],
        queryFn: async () => {
            if (!user?.id) throw new Error('User not authenticated')
            const response = await analyticsApi.getCategoryPerformance(user.id)
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
                description: "Failed to load analytics data",
                variant: "destructive",
            })
        }
    }, [toast])

    useEffect(() => {
        if (metricsError) handleError(metricsError)
        if (categoryError) handleError(categoryError)
    }, [metricsError, categoryError, handleError])

    const metrics = metricsData || {
        totalAttempts: 0,
        totalScore: 0,
        averageScore: 0,
        bestScore: 0,
        totalTimeSpent: 0,
        averageTimePerQuiz: 0,
        accuracyRate: 0,
        improvementRate: 0,
        streakDays: 0,
        lastActiveDate: new Date().toISOString()
    }

    return (
        <div className="min-h-screen bg-background">
            <DashboardNav />
            
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground mb-2">
                        📊 Stats & Analytics
                    </h1>
                    <p className="text-muted-foreground">
                        Track your learning progress and performance insights
                    </p>
                </div>

                {/* Time Range Selector */}
                <div className="mb-6">
                    <div className="flex space-x-2">
                        {(['7d', '30d', '90d'] as const).map((range) => (
                            <Button
                                key={range}
                                variant={timeRange === range ? "default" : "outline"}
                                size="sm"
                                onClick={() => setTimeRange(range)}
                            >
                                {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <MetricCard
                        title="Total Attempts"
                        value={metricsLoading ? <MetricLoader /> : metrics.totalAttempts}
                        subtitle="Quizzes completed"
                        icon={<Target className="w-6 h-6 text-blue-500" />}
                        className="animate-slide-in-left"
                    />
                    
                    <MetricCard
                        title="Average Score"
                        value={metricsLoading ? <MetricLoader /> : `${metrics.averageScore}%`}
                        subtitle="Overall performance"
                        icon={<BarChart3 className="w-6 h-6 text-green-500" />}
                        trend={{ value: metrics.improvementRate ?? 0, isPositive: (metrics.improvementRate ?? 0) > 0 }}
                        className="animate-slide-in-left"
                        style={{ animationDelay: '0.1s' }}
                    />
                    
                    <MetricCard
                        title="Best Score"
                        value={metricsLoading ? <MetricLoader /> : `${metrics.bestScore}%`}
                        subtitle="Personal record"
                        icon={<Trophy className="w-6 h-6 text-yellow-500" />}
                        className="animate-slide-in-left"
                        style={{ animationDelay: '0.2s' }}
                    />
                    
                    <MetricCard
                        title="Streak Days"
                        value={metricsLoading ? <MetricLoader /> : metrics.streakDays ?? 0}
                        subtitle="Consecutive active days"
                        icon={<Zap className="w-6 h-6 text-purple-500" />}
                        className="animate-slide-in-left"
                        style={{ animationDelay: '0.3s' }}
                    />
                </div>

                {/* Detailed Metrics */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Time & Accuracy */}
                    <Card className="glass animate-scale-in">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Clock className="w-5 h-5" />
                                <span>Time & Accuracy</span>
                            </CardTitle>
                            <CardDescription>
                                Your time management and accuracy metrics
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center p-4 bg-muted/30 rounded-lg">
                                    <p className="text-2xl font-bold text-foreground">
                                        {metricsLoading ? '...' : formatDuration(metrics.totalTimeSpent)}
                                    </p>
                                    <p className="text-sm text-muted-foreground">Total Time</p>
                                </div>
                                <div className="text-center p-4 bg-muted/30 rounded-lg">
                                    <p className="text-2xl font-bold text-foreground">
                                        {metricsLoading ? '...' : formatDuration(metrics.averageTimePerQuiz ?? 0)}
                                    </p>
                                    <p className="text-sm text-muted-foreground">Avg per Quiz</p>
                                </div>
                            </div>
                            <div className="text-center p-4 bg-muted/30 rounded-lg">
                                <p className="text-3xl font-bold text-foreground">
                                    {metricsLoading ? '...' : `${metrics.accuracyRate ?? 0}%`}
                                </p>
                                <p className="text-sm text-muted-foreground">Overall Accuracy</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Activity */}
                    <Card className="glass animate-scale-in">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Activity className="w-5 h-5" />
                                <span>Recent Activity</span>
                            </CardTitle>
                            <CardDescription>
                                Your latest learning activity
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-center space-x-3">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span className="text-sm">Last active: {formatTimeAgo(metrics.lastActiveDate ?? new Date().toISOString())}</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span className="text-sm">Total points earned: {metrics.totalScore ?? 0}</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                    <span className="text-sm">Questions answered: {metrics.totalAttempts * 10}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Category Performance */}
                <Card className="glass animate-scale-in">
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Star className="w-5 h-5" />
                            <span>Category Performance</span>
                        </CardTitle>
                        <CardDescription>
                            How you&apos;re performing across different quiz categories
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {categoryLoading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="animate-pulse">
                                        <div className="h-16 bg-muted rounded-lg"></div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <PerformanceChart data={categoryData || []} />
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}

export default function StatsPage() {
    return (
        <ProtectedRoute>
            <StatsContent />
        </ProtectedRoute>
    )
} 