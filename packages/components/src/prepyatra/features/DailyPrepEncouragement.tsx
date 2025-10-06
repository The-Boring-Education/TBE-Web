import {Calendar, Clock, Flame, TrendingUp, Plus} from "lucide-react";

import {Button} from "../ui/button";
import {Card, CardContent} from "../ui/card";
import {useDailyPrepEncouragement} from "@tbe/hooks";

interface DailyPrepEncouragementProps {
    userId: string
    onAddPrepLog: () => void
    className?: string
}

const DailyPrepEncouragement = ({
    userId,
    onAddPrepLog,
    className = ""
}: DailyPrepEncouragementProps) => {
    const {
        hasLoggedToday,
        streak,
        totalTimeSpent,
        encouragementMessage,
        encouragementEmoji,
        buttonText,
        motivationalTip
    } = useDailyPrepEncouragement(userId);

    return (
        <Card
            className={`glass-dark border-primary/20 hover:border-primary/40 transition-all duration-300 ${className}`}>
            <CardContent className='p-6'>
                <div className='flex flex-col md:flex-row items-start md:items-center justify-between gap-4'>
                    {/* Main Content */}
                    <div className='flex-1'>
                        <div className='flex items-center gap-3 mb-3'>
                            <span className='text-2xl'>
                                {encouragementEmoji}
                            </span>
                            <h3 className='text-lg font-bold text-white'>
                                Daily Prep Check-in
                            </h3>
                        </div>

                        <p className='text-white font-medium mb-2'>
                            {encouragementMessage}
                        </p>

                        <p className='text-gray text-sm mb-4'>
                            {motivationalTip}
                        </p>

                        {/* Stats Row */}
                        <div className='flex flex-wrap gap-4 text-sm text-gray'>
                            {streak > 0 && (
                                <div className='flex items-center gap-1'>
                                    <Flame className='h-4 w-4 text-orange-500' />
                                    <span>{streak} day streak</span>
                                </div>
                            )}

                            <div className='flex items-center gap-1'>
                                <Clock className='h-4 w-4 text-blue-500' />
                                <span>{totalTimeSpent}h total</span>
                            </div>

                            <div className='flex items-center gap-1'>
                                <Calendar className='h-4 w-4 text-green-500' />
                                <span>
                                    {hasLoggedToday
                                        ? "Logged today"
                                        : "No log today"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Action Button */}
                    <div className='flex flex-col items-center gap-2'>
                        <Button
                            onClick={onAddPrepLog}
                            className={`
                                min-w-[140px] font-medium transition-all duration-300
                                ${
                                    hasLoggedToday
                                        ? "bg-green-600 hover:bg-green-700 text-white"
                                        : "bg-primary hover:bg-primary/90 text-primary-foreground"
                                }
                            `}
                            size='sm'>
                            <Plus className='h-4 w-4 mr-2' />
                            {buttonText}
                        </Button>

                        {!hasLoggedToday && streak > 0 && (
                            <div className='flex items-center text-xs text-orange-400'>
                                <TrendingUp className='h-3 w-3 mr-1' />
                                Streak at risk!
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default DailyPrepEncouragement;
