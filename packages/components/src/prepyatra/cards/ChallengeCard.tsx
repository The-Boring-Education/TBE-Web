import {
    Calendar,
    Play,
    Pause,
    Trash2,
    Clock,
    TrendingUp,
    CheckCircle2,
    History,
    Trophy
} from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "../ui/alert-dialog"
import { Badge } from "../ui/badge"
import { Button } from "@tbe/components"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
    } from "../ui/card"
import { Progress } from "../ui/progress"
import { challengesService } from "@tbe/services"
import type { Challenge } from "@tbe/types"

interface ChallengeCardProps {
    challenge: Challenge
    onChallengeUpdated: () => void
    onLogProgress: (challenge: Challenge) => void
    onViewLogs?: (challenge: Challenge) => void
}

const ChallengeCard = ({
    challenge,
    onChallengeUpdated,
    onLogProgress,
    onViewLogs
}: ChallengeCardProps) => {
    const [loading, setLoading] = useState(false)

    const getStatusColor = (isActive: boolean) => {
        return isActive
            ? "bg-green-500/20 text-green-300 border-green-500/30"
            : "bg-blue-500/20 text-blue-300 border-blue-500/30"
    }

    const getStatusIcon = (isActive: boolean) => {
        return isActive ? (
            <Play className='w-2 h-2' />
        ) : (
            <CheckCircle2 className='w-2 h-2' />
        )
    }

    const getStatusText = (isActive: boolean) => {
        return isActive ? "Active" : "Completed"
    }

    const calculateProgress = () => {
        return Math.round((challenge.currentDay / challenge.totalDays) * 100)
    }

    const calculateDaysRemaining = () => {
        return Math.max(0, challenge.totalDays - challenge.currentDay)
    }

    const handlePauseResume = async () => {
        setLoading(true)
        try {
            const newStatus = !challenge.isActive
            await challengesService.update({
                challengeId: challenge._id,
                isActive: newStatus
            })

            toast.success(
                `Challenge ${newStatus ? "resumed" : "paused"} successfully!`
            )
            onChallengeUpdated()
        } catch (error) {
            console.error("Error updating challenge:", error)
            toast.error("Failed to update challenge")
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        setLoading(true)
        try {
            await challengesService.delete(challenge._id)
            toast.success("Challenge deleted successfully!")
            onChallengeUpdated()
        } catch (error) {
            console.error("Error deleting challenge:", error)
            toast.error("Failed to delete challenge")
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
        })
    }

    const progress = calculateProgress()
    const daysRemaining = calculateDaysRemaining()

    // Check if challenge is completed
    const isCompleted = challenge.currentDay >= challenge.totalDays

    return (
        <Card className='glass border-greyLight transition-all duration-200'>
            <CardHeader className='pb-2'>
                <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                        <div className='flex items-center gap-2 mb-1.5'>
                            <CardTitle className='text-base text-contentLight line-clamp-1'>
                                {challenge.name}
                            </CardTitle>
                            {challenge.category && (
                                <Badge
                                    variant='secondary'
                                    className='bg-primary/10 text-primary border-primary/20'>
                                    {challenge.category}
                                </Badge>
                            )}
                        </div>
                        <div className='flex items-center gap-2'>
                            <Badge
                                className={getStatusColor(challenge.isActive)}>
                                {getStatusIcon(challenge.isActive)}
                                <span className='ml-1 capitalize'>
                                    {getStatusText(challenge.isActive)}
                                </span>
                            </Badge>
                            {isCompleted && (
                                <Badge className='bg-yellow-500/20 text-yellow-300 border-yellow-500/30'>
                                    <Trophy className='w-3 h-3 mr-1' />
                                    Completed
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className='space-y-3'>
                {challenge.description && (
                    <CardDescription className='text-greyDark line-clamp-2'>
                        {challenge.description}
                    </CardDescription>
                )}

                {/* Progress Section */}
                <div className='space-y-2.5'>
                    <div className='flex items-center justify-between text-sm'>
                        <span className='text-greyDark'>Progress</span>
                        <span className='text-contentLight font-medium'>
                            {progress}%
                        </span>
                    </div>
                    <Progress value={progress} className='h-2' />

                    <div className='grid grid-cols-3 gap-3 text-sm'>
                        <div className='text-center'>
                            <div className='text-primary font-semibold'>
                                {challenge.currentDay + 1}
                            </div>
                            <div className='text-greyDark'>Current Day</div>
                        </div>
                        <div className='text-center'>
                            <div className='text-contentLight font-semibold'>
                                {daysRemaining}
                            </div>
                            <div className='text-greyDark'>Days Left</div>
                        </div>
                        <div className='text-center'>
                            <div className='text-contentLight font-semibold'>
                                {challenge.totalDays}
                            </div>
                            <div className='text-greyDark'>Total Days</div>
                        </div>
                    </div>
                </div>

                {/* Date Information */}
                <div className='flex items-center gap-4 text-xs text-greyDark'>
                    <div className='flex items-center gap-1'>
                        <Calendar className='w-2 h-2' />
                        Started: {formatDate(challenge.startDate)}
                    </div>
                    {challenge.endDate && (
                        <div className='flex items-center gap-1'>
                            <Clock className='w-2 h-2' />
                            Ended: {formatDate(challenge.endDate)}
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className='flex flex-wrap gap-2 pt-1.5'>
                    {challenge.isActive && !isCompleted && (
                        <Button
                            onClick={() => onLogProgress(challenge)}
                            variant='PRIMARY'
                            text='Log Progress'
                            size="SMALL"
                            icon={<TrendingUp className='w-2 h-2' />}
                            className='flex-1 text-sm px-3 py-1'
                        />
                    )}

                    {!isCompleted && (
                        <Button
                            onClick={handlePauseResume}
                            variant='OUTLINE'
                            text={challenge.isActive ? 'Pause' : 'Resume'}
                            size="SMALL"
                            icon={challenge.isActive ? <Pause className='w-2 h-2' /> : <Play className='w-2 h-2' />}
                            active={!loading}
                            className='text-sm px-3 py-1 border-gray-300 text-contentLight hover:border-black'
                        />
                    )}

                    {onViewLogs && (
                        <Button
                            onClick={() => onViewLogs(challenge)}
                            variant='OUTLINE'
                            text='View Logs'
                            size="SMALL"
                            icon={<History className='w-2 h-2' />}
                            className='text-sm px-3 py-1 border-blue-500 text-blue-600 hover:border-blue-600'
                        />
                    )}

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                variant='OUTLINE'
                                text=''
                                size="SMALL"
                                icon={<Trash2 className='w-2 h-2' />}
                                active={!loading}
                                className='text-sm px-2 py-1 border-red-500 text-red-500 hover:border-red-600'
                            />
                        </AlertDialogTrigger>
                        <AlertDialogContent className='bg-gray-800 border-primary/20'>
                            <AlertDialogHeader>
                                <AlertDialogTitle className='text-white'>
                                    Delete Challenge
                                </AlertDialogTitle>
                                <AlertDialogDescription className='text-gray'>
                                    Are you sure you want to delete this challenge? This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel className='bg-gray-800 text-white border-gray-600'>
                                    Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleDelete}
                                    disabled={loading}
                                    className='bg-red-500 text-white hover:bg-red-600'>
                                    {loading ? "Deleting..." : "Delete"}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </CardContent>
        </Card>
    )
}

export default ChallengeCard
