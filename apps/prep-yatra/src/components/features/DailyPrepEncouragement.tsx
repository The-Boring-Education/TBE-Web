import {Button, FlexContainer,Text} from "@tbe/components";
import {Calendar, Clock, Flame, Plus,TrendingUp} from "lucide-react";

import {Card, CardContent} from "@/components/ui/card";
import {useDailyPrepEncouragement} from "@/hooks/useDailyPrepEncouragement";

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
                <FlexContainer className='flex-col md:flex-row items-start md:items-center justify-between gap-4'>
                    {/* Main Content */}
                    <div className='flex-1'>
                        <FlexContainer className='items-center gap-3 mb-3'>
                            <Text level='span' className='text-2xl'>
                                {encouragementEmoji}
                            </Text>
                            <Text level='h3' className='text-lg font-bold text-white'>
                                Daily Prep Check-in
                            </Text>
                        </FlexContainer>

                        <Text level='p' className='text-white font-medium mb-2'>
                            {encouragementMessage}
                        </Text>

                        <Text level='p' className='text-gray-300 text-sm mb-4'>
                            {motivationalTip}
                        </Text>

                        {/* Stats Row */}
                        <FlexContainer className='flex-wrap gap-4 text-sm text-gray-300'>
                            {streak > 0 && (
                                <FlexContainer className='items-center gap-1'>
                                    <Flame className='h-4 w-4 text-orange-500' />
                                    <Text level='span'>{streak} day streak</Text>
                                </FlexContainer>
                            )}

                            <FlexContainer className='items-center gap-1'>
                                <Clock className='h-4 w-4 text-blue-500' />
                                <Text level='span'>{totalTimeSpent}h total</Text>
                            </FlexContainer>

                            <FlexContainer className='items-center gap-1'>
                                <Calendar className='h-4 w-4 text-green-500' />
                                <Text level='span'>
                                    {hasLoggedToday
                                        ? "Logged today"
                                        : "No log today"}
                                </Text>
                            </FlexContainer>
                        </FlexContainer>
                    </div>

                    {/* Action Button */}
                    <FlexContainer direction='col' className='items-center gap-2'>
                        <Button
                            text={buttonText}
                            onClick={onAddPrepLog}
                            variant={hasLoggedToday ? 'SUCCESS' : 'PRIMARY'}
                            className="min-w-[140px] font-medium transition-all duration-300"
                            icon={<Plus className='h-4 w-4 mr-2' />}
                        />

                        {!hasLoggedToday && streak > 0 && (
                            <FlexContainer className='items-center text-xs text-orange-400'>
                                <TrendingUp className='h-3 w-3 mr-1' />
                                <Text level='span'>Streak at risk!</Text>
                            </FlexContainer>
                        )}
                    </FlexContainer>
                </FlexContainer>
            </CardContent>
        </Card>
    );
};

export default DailyPrepEncouragement;
