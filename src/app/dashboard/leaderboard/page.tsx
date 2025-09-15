'use client'

import { useEffect, useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { leaderboardApi, userProfileApi, APIError } from '@/services/api'
import { LeaderboardData, UserProfile } from '@/types/api'
import { 
    Trophy, 
    Medal, 
    Crown, 
    Star, 
    TrendingUp, 
    Target, 
    Award,
    Users,
    Calendar,
    Zap,
    Eye,
    RefreshCw,
    Filter,
    Clock
} from 'lucide-react'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { DashboardNav } from '@/components/layout/DashboardNav'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/components/ui/use-toast'
import { formatTimeAgo } from '@/lib/utils'

// Rank Badge Component
interface RankBadgeProps {
    rank: number
    className?: string
}

function RankBadge({ rank, className = '' }: RankBadgeProps) {
    if (rank === 1) {
        return (
            <div className={`flex items-center justify-center w-8 h-8 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full ${className}`}>
                <Crown className="w-5 h-5 text-white" />
            </div>
        )
    } else if (rank === 2) {
        return (
            <div className={`flex items-center justify-center w-8 h-8 bg-gradient-to-r from-gray-300 to-gray-500 rounded-full ${className}`}>
                <Medal className="w-5 h-5 text-white" />
            </div>
        )
    } else if (rank === 3) {
        return (
            <div className={`flex items-center justify-center w-8 h-8 bg-gradient-to-r from-amber-600 to-amber-800 rounded-full ${className}`}>
                <Trophy className="w-5 h-5 text-white" />
            </div>
        )
    } else {
        return (
            <div className={`flex items-center justify-center w-8 h-8 bg-muted rounded-full text-sm font-bold ${className}`}>
                {rank}
            </div>
        )
    }
}

// Leaderboard Entry Component
interface LeaderboardEntryProps {
    entry: LeaderboardData & { rank: number }
    isCurrentUser: boolean
    onViewProfile: (userId: string) => void
}

function LeaderboardEntry({ entry, isCurrentUser, onViewProfile }: LeaderboardEntryProps) {
    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
    }

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)
        if (hours > 0) {
            return `${hours}h ${minutes}m`
        }
        return `${minutes}m`
    }

    return (
        <div className={`flex items-center space-x-4 p-4 rounded-lg transition-all duration-200 ${
            isCurrentUser 
                ? 'bg-primary/10 border border-primary/20' 
                : 'hover:bg-muted/50'
        }`}>
            <RankBadge rank={entry.rank} />
            
            <div className="flex items-center space-x-3 flex-1">
                <Avatar className="h-10 w-10">
                    <AvatarImage src={entry.image} alt={entry.username} />
                    <AvatarFallback className="text-sm">
                        {getInitials(entry.username)}
                    </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                    <div className="flex items-center space-x-2">
                        <h3 className={`font-semibold ${isCurrentUser ? 'text-primary' : ''}`}>
                            {entry.username}
                        </h3>
                        {isCurrentUser && (
                            <Badge variant="secondary" className="text-xs">
                                You
                            </Badge>
                        )}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span className="flex items-center space-x-1">
                            <Target className="w-3 h-3" />
                            <span>{entry.totalAttempts} attempts</span>
                        </span>
                        <span className="flex items-center space-x-1">
                            <TrendingUp className="w-3 h-3" />
                            <span>{entry.averageScore}% avg</span>
                        </span>
                        <span className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{formatTime(entry.totalTimeSpent)}</span>
                        </span>
                    </div>
                </div>
            </div>
            
            <div className="text-right">
                <div className="text-2xl font-bold text-primary">
                    {entry.bestScore}%
                </div>
                <div className="text-sm text-muted-foreground">best score</div>
            </div>
            
            <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewProfile(entry._id)}
                className="ml-4"
            >
                <Eye className="w-4 h-4" />
            </Button>
        </div>
    )
}

// User Profile Modal Component
interface UserProfileModalProps {
    profile: UserProfile | null
    isOpen: boolean
    onClose: () => void
}

function UserProfileModal({ profile, isOpen, onClose }: UserProfileModalProps) {
    if (!isOpen || !profile) return null

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold">User Profile</h2>
                        <Button variant="ghost" size="sm" onClick={onClose}>
                            ×
                        </Button>
                    </div>
                    
                    <div className="text-center mb-6">
                        <Avatar className="h-20 w-20 mx-auto mb-4">
                            <AvatarImage src={profile.userImage} alt={profile.userName} />
                            <AvatarFallback className="text-2xl">
                                {getInitials(profile.userName)}
                            </AvatarFallback>
                        </Avatar>
                        <h3 className="text-lg font-semibold">{profile.userName}</h3>
                        <p className="text-muted-foreground">{profile.userEmail}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="text-center p-3 bg-muted/30 rounded-lg">
                            <p className="text-2xl font-bold text-primary">{profile.totalPoints}</p>
                            <p className="text-sm text-muted-foreground">Total Points</p>
                        </div>
                        <div className="text-center p-3 bg-muted/30 rounded-lg">
                            <p className="text-2xl font-bold text-blue-600">#{profile.rank}</p>
                            <p className="text-sm text-muted-foreground">Rank</p>
                        </div>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                        <div className="flex justify-between text-sm">
                            <span>Member since:</span>
                            <span className="font-medium">{new Date(profile.joinDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>Last active:</span>
                            <span className="font-medium">{formatTimeAgo(profile.lastActiveDate)}</span>
                        </div>
                    </div>
                    
                    {profile.achievements.length > 0 && (
                        <div>
                            <h4 className="font-semibold mb-3">Achievements</h4>
                            <div className="space-y-2">
                                {profile.achievements.map((achievement, index) => (
                                    <div key={index} className="flex items-center space-x-3 p-2 bg-muted/30 rounded-lg">
                                        <Star className="w-4 h-4 text-yellow-500" />
                                        <div className="flex-1">
                                            <p className="font-medium text-sm">{achievement.name}</p>
                                            <p className="text-xs text-muted-foreground">{achievement.description}</p>
                                        </div>
                                        <Badge variant="secondary" className="text-xs">
                                            {achievement.points} pts
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function LeaderboardContent() {
    const { user } = useAuth()
    const { toast } = useToast()
    const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null)
    const [showProfileModal, setShowProfileModal] = useState(false)
    const [leaderboardLimit, setLeaderboardLimit] = useState(50)

    const {
        data: leaderboardData,
        isLoading: leaderboardLoading,
        error: leaderboardError,
        refetch: refetchLeaderboard
    } = useQuery<(LeaderboardData & { rank: number })[]>({
        queryKey: ['leaderboard', leaderboardLimit],
        queryFn: async () => {
            const response = await leaderboardApi.getLeaderboard(leaderboardLimit)
            // Add rank to each entry based on position
            return response.data.map((entry, index) => ({
                ...entry,
                rank: index + 1
            }))
        }
    })

    const {
        data: userRankData,
        isLoading: userRankLoading
    } = useQuery<{ rank: number }>({
        queryKey: ['user-rank', user?.id],
        queryFn: async () => {
            if (!user?.id) return { rank: 0 }
            const response = await leaderboardApi.getUserRank(user.id)
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
                description: "Failed to load leaderboard data",
                variant: "destructive",
            })
        }
    }, [toast])

    useEffect(() => {
        if (leaderboardError) handleError(leaderboardError)
    }, [leaderboardError, handleError])

    const handleViewProfile = async (userId: string) => {
        try {
            const response = await userProfileApi.getUserProfile(userId)
            setSelectedProfile(response.data)
            setShowProfileModal(true)
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to load user profile",
                variant: "destructive",
            })
        }
    }

    const leaderboard = leaderboardData || []
    const userRank = userRankData?.rank || 0

    return (
        <div className="min-h-screen bg-background">
            <DashboardNav />
            
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-foreground mb-2">
                                🏆 Leaderboard
                            </h1>
                            <p className="text-muted-foreground">
                                Compete with other learners and track your ranking
                            </p>
                        </div>
                        <Button
                            onClick={() => refetchLeaderboard()}
                            variant="outline"
                            size="sm"
                            disabled={leaderboardLoading}
                        >
                            <RefreshCw className={`w-4 h-4 mr-2 ${leaderboardLoading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                    </div>
                </div>

                {/* User Rank Card */}
                {user && (
                    <Card className="glass mb-8 animate-fade-in">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Award className="w-5 h-5" />
                                <span>Your Ranking</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <RankBadge rank={userRank} />
                                    <div>
                                        <h3 className="text-lg font-semibold">{user.name}</h3>
                                        <p className="text-muted-foreground">
                                            {userRank === 0 ? 'Not ranked yet' : `Ranked #${userRank} globally`}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-muted-foreground">Keep practicing to improve your rank!</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Leaderboard Controls */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                        <h2 className="text-xl font-semibold">
                            Top Learners ({leaderboard.length})
                        </h2>
                        <div className="flex items-center space-x-2">
                            <Filter className="w-4 h-4 text-muted-foreground" />
                            <select
                                value={leaderboardLimit}
                                onChange={(e) => setLeaderboardLimit(parseInt(e.target.value))}
                                className="px-3 py-1 border border-input rounded-md bg-background text-foreground text-sm"
                            >
                                <option value={25}>Top 25</option>
                                <option value={50}>Top 50</option>
                                <option value={100}>Top 100</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Leaderboard */}
                <Card className="glass animate-scale-in">
                    <CardContent className="p-6">
                        {leaderboardLoading ? (
                            <div className="space-y-4">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="animate-pulse">
                                        <div className="h-16 bg-muted rounded-lg"></div>
                                    </div>
                                ))}
                            </div>
                        ) : leaderboard.length === 0 ? (
                            <div className="text-center py-12">
                                <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No rankings available</h3>
                                <p className="text-muted-foreground">
                                    Start taking quizzes to appear on the leaderboard
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                                        {leaderboard.map((entry, index) => (
                            <div
                                key={entry._id}
                                className="animate-fade-in"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <LeaderboardEntry
                                    entry={entry}
                                    isCurrentUser={entry._id === user?.id}
                                    onViewProfile={handleViewProfile}
                                />
                            </div>
                        ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>

            {/* Profile Modal */}
            <UserProfileModal
                profile={selectedProfile}
                isOpen={showProfileModal}
                onClose={() => {
                    setShowProfileModal(false)
                    setSelectedProfile(null)
                }}
            />
        </div>
    )
}

export default function LeaderboardPage() {
    return (
        <ProtectedRoute>
            <LeaderboardContent />
        </ProtectedRoute>
    )
} 