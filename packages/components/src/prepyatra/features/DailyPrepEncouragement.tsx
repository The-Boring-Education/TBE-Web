import { useDailyPrepEncouragement } from "@tbe/hooks";
import { Calendar, Clock, Flame, Plus, TrendingUp } from "lucide-react";

import Button from "../../common/Buttons/Button";
import Text from "../../common/Typography/Text";
import FlexContainer from "../../containers/Page/common/FlexContainer";
import { Card, CardContent } from "../ui/card";

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
            className={`mt-4 glass border-greyLight hover:border-primary/30 transition-all duration-200 ${className}`}>
            <CardContent className='p-1'>
                <div className='flex flex-col md:flex-row items-start justify-between gap-3'>
                    {/* Main Content */}
                    <div className='flex-1 w-full'>
                        <div className='flex items-center gap-2 mb-1'>
                            <span className='text-xl'>
                                {encouragementEmoji}
                            </span>
                            <Text level="h3" className='text-base font-semibold text-contentLight'>
                                Daily Prep Check-in
                            </Text>
                        </div>

                        <Text level="p" className='text-contentLight text-sm mb-1'>
                            {encouragementMessage}
                        </Text>

                        <Text level="p" className='text-greyDark text-xs mb-1'>
                            {motivationalTip}
                        </Text>

                        {/* Stats Row */}
                        <div className='flex flex-wrap gap-3 text-xs text-greyDark justify-start'>
                            {streak > 0 && (
                                <div className='flex items-center gap-1'>
                                    <Flame className='h-3 w-3 text-orange-500' />
                                    <Text level="span">{streak} day streak</Text>
                                </div>
                            )}

                            <div className='flex items-center gap-1'>
                                <Clock className='h-3 w-3 text-blue-500' />
                                <Text level="span">{totalTimeSpent}h total</Text>
                            </div>

                            <div className='flex items-center gap-1'>
                                <Calendar className='h-3 w-3 text-green-500' />
                                <Text level="span">
                                    {hasLoggedToday
                                        ? "Logged today"
                                        : "No log today"}
                                </Text>
                            </div>
                        </div>
                    </div>

                    {/* Action Button */}
                    <FlexContainer direction="col" className='items-center gap-1.5'>
                        <Button
                            onClick={onAddPrepLog}
                            variant="PRIMARY"
                            text={buttonText}
                            size="SMALL"
                            icon={<Plus className='h-2 w-2' />}
                            className={`
                                 duration-200 text-sm
                                ${hasLoggedToday ? "bg-green-600 hover:bg-green-700" : ""}
                            `}
                        />

                        {!hasLoggedToday && streak > 0 && (
                            <FlexContainer className='items-center text-[11px] text-orange-500'>
                                <TrendingUp className='h-3 w-3' />
                                <Text level="span" className='text-orange-600'>Streak at risk!</Text>
                            </FlexContainer>
                        )}
                    </FlexContainer>
                </div>
            </CardContent>
        </Card>
    );
};

export default DailyPrepEncouragement;
