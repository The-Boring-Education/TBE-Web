import {Calendar, Clock, Flame, TrendingUp, Plus} from "lucide-react";

import {Card, CardContent} from "../ui/card";
import {useDailyPrepEncouragement} from "@tbe/hooks";
import Button from "../../common/Buttons/Button";
import Text from "../../common/Typography/Text";
import FlexContainer from "../../containers/Page/common/FlexContainer";

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
                <div className='flex flex-col md:flex-row items-start justify-between gap-4'>
                    {/* Main Content */}
                    <div className='flex-1 w-full'>
                        <div className='flex items-center gap-3 mb-3'>
                            <span className='text-2xl'>
                                {encouragementEmoji}
                            </span>
                            <Text level="h3" className='text-lg font-bold text-white'>
                                Daily Prep Check-in
                            </Text>
                        </div>

                        <Text level="p" className='text-white font-medium mb-2'>
                            {encouragementMessage}
                        </Text>

                        <Text level="p" className='text-gray-400 text-sm mb-4'>
                            {motivationalTip}
                        </Text>

                        {/* Stats Row */}
                        <div className='flex flex-wrap gap-4 text-sm text-gray-400 justify-start'>
                            {streak > 0 && (
                                <div className='flex items-center gap-1'>
                                    <Flame className='h-4 w-4 text-orange-500' />
                                    <Text level="span">{streak} day streak</Text>
                                </div>
                            )}

                            <div className='flex items-center gap-1'>
                                <Clock className='h-4 w-4 text-blue-500' />
                                <Text level="span">{totalTimeSpent}h total</Text>
                            </div>

                            <div className='flex items-center gap-1'>
                                <Calendar className='h-4 w-4 text-green-500' />
                                <Text level="span">
                                    {hasLoggedToday
                                        ? "Logged today"
                                        : "No log today"}
                                </Text>
                            </div>
                        </div>
                    </div>

                    {/* Action Button */}
                    <FlexContainer direction="col" className='items-center gap-2'>
                        <Button
                            onClick={onAddPrepLog}
                            variant="NEUTRAL"
                            text={buttonText}
                            icon={<Plus className='h-4 w-4 mr-2' />}
                            className={`
                                min-w-[140px] font-medium transition-all rounded-md duration-300
                                ${
                                    hasLoggedToday
                                        ? "bg-green-600 hover:bg-green-700 text-white"
                                        : "bg-primary hover:bg-primary/90 text-primary-foreground"
                                }
                            `}
                        />

                        {!hasLoggedToday && streak > 0 && (
                            <FlexContainer className='items-center text-xs text-orange-400'>
                                <TrendingUp className='h-3 w-3 mr-1' />
                                <Text level="span">Streak at risk!</Text>
                            </FlexContainer>
                        )}
                    </FlexContainer>
                </div>
            </CardContent>
        </Card>
    );
};

export default DailyPrepEncouragement;
