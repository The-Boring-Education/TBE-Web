import { Button, FlexContainer, Text } from "@tbe/components";
import { useState } from "react";

import { useGamificationContext } from "./GamificationProvider";
import useGamifiedAction from "./useGamifiedAction";

const GamificationDemo = () => {
  const [demoMode, setDemoMode] = useState(false);
  const gamifiedAction = useGamifiedAction();
  const { triggerCelebration, showToast } = useGamificationContext();

  const testPointsEarning = async () => {
    await gamifiedAction.triggerGamifiedAction({
      gamificationAction: "COMPLETE_QUESTION",
      analytics: {
        action: "QUESTION_COMPLETE",
        category: "Learning",
        label: "Question Completed",
      },
      customMessage: "Demo: Question completed!",
      metadata: {
        demo: true,
      },
    });
  };

  const testLevelUp = () => {
    triggerCelebration({
      type: "levelup",
      intensity: "high",
    });

    showToast({
      type: "levelup",
      message: "Level Up! Welcome to Coder!",
      level: 2,
      levelName: "Coder",
    });
  };

  const testAchievement = () => {
    triggerCelebration({
      type: "achievement",
      intensity: "high",
    });

    showToast({
      type: "achievement",
      message: "Achievement Unlocked!",
      points: 100,
    });
  };

  if (!demoMode) {
    return (
      <div className="fixed bottom-4 left-4 z-40">
        <Button
          text="Show Gamification Demo"
          variant="GHOST"
          onClick={() => setDemoMode(true)}
        />
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-40 bg-white p-4 rounded-lg shadow-lg border max-w-xs">
      <FlexContainer direction="col" className="gap-2">
        <Text level="h6" className="font-bold text-sm">
          Gamification Demo
        </Text>

        <Button
          text="Test Points (+10)"
          variant="PRIMARY"
          onClick={testPointsEarning}
        />

        <Button
          text="Test Level Up"
          variant="SECONDARY"
          onClick={testLevelUp}
        />

        <Button
          text="Test Achievement"
          variant="SUCCESS"
          onClick={testAchievement}
        />

        <Button
          text="Hide Demo"
          variant="GHOST"
          onClick={() => setDemoMode(false)}
        />
      </FlexContainer>
    </div>
  );
};

export default GamificationDemo;
