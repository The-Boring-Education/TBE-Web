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
  theme = "light",
}: LevelProgressCardProps) => {
  const isDark = theme === "dark";

  return (
    <div
      className={`px-3 py-3 rounded-2xl shadow-xl border relative w-full min-w-[220px] max-w-[320px] ${
        isDark
          ? "bg-[#121216] border-white/10 text-white"
          : "bg-white border-gray-200 text-gray-900"
      }`}
    >
      <FlexContainer className="flex-col flex-nowrap sm:flex-row gap-2.5 items-center">
        <ProgressRing
          point={points}
          progress={percentageProgress}
          theme={theme}
        />
        <FlexContainer
          className="gap-1.5 w-full"
          direction="col"
          itemCenter={false}
        >
          <FlexContainer direction="col" itemCenter={false}>
            <Text
              className={`pre-title ${isDark ? "text-gray-400" : "text-greyDark"}`}
              level="span"
            >
              YOU&apos;RE AT
            </Text>
            <Text className="strong-text text-primary font-bold" level="span">
              Level {currentLevel} : {currentLevelName}
            </Text>
          </FlexContainer>
          {nextLevelName ? (
            <FlexContainer className="py-1.5 px-2.5 w-full bg-primary font-semibold rounded-md text-center text-xs md:text-sm">
              <Text className="button-text text-white font-bold" level="p">
                {pointsLeftToNextLevel} Points to {nextLevelName}
              </Text>
            </FlexContainer>
          ) : (
            <FlexContainer className="py-1.5 px-2.5 w-full bg-primary font-semibold rounded-md text-center text-xs md:text-sm">
              <Text className="button-text text-white font-bold" level="p">
                Max Level Achieved!
              </Text>
            </FlexContainer>
          )}
        </FlexContainer>
      </FlexContainer>
    </div>
  );
};

export default UserLevelProgressContainer;
