import { FlexContainer, ProgressRing, Text } from "@tbe/components";
import type { LevelProgressCardProps } from "@tbe/interface";
import React from "react";

const UserLevelProgressContainer = ({
  points,
  currentLevel,
  currentLevelName,
  nextLevelName,
  pointsLeftToNextLevel,
  percentageProgress,
}: LevelProgressCardProps) => (
  <div className="bg-white dark:bg-white px-2 py-2 rounded-2xl shadow-md border border-gray-200 dark:border-gray-200 relative w-full min-w-[200px] max-w-[320px]">
    <FlexContainer className="flex-col flex-nowrap sm:flex-row gap-2">
      <ProgressRing point={points} progress={percentageProgress} />
      <FlexContainer
        className="gap-1 w-full"
        direction="col"
        itemCenter={false}
      >
        <FlexContainer direction="col" itemCenter={false}>
          <Text className="pre-title text-greyDark" level="span">
            YOU'RE AT
          </Text>
          <Text className="strong-text text-primary" level="span">
            Level {currentLevel} : {currentLevelName}
          </Text>
        </FlexContainer>
        {nextLevelName && (
          <FlexContainer className="py-1 md:px-1 w-full bg-gradient-to-r from-pink-400 to-yellow-400 font-semibold rounded-md text-center text-xs md:text-base">
            <Text className="button-text" level="p">
              {pointsLeftToNextLevel} Points to {nextLevelName}
            </Text>
          </FlexContainer>
        )}
      </FlexContainer>
    </FlexContainer>
  </div>
);

export default UserLevelProgressContainer;
