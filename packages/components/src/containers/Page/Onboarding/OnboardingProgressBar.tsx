import { FlexContainer, Text } from "@tbe/components";
import type { OnboardingProgressBarProps } from "@tbe/interface";
import { motion } from "framer-motion";

const OnboardingProgressBar = ({
  currentStep,
  totalSteps,
}: OnboardingProgressBarProps) => {
  const progressPercent = (currentStep / totalSteps) * 100;

  return (
    <FlexContainer className="gap-2" fullWidth>
      <FlexContainer
        className="h-2 bg-gray-200 rounded-full overflow-hidden"
        fullWidth
        justifyCenter={false}
      >
        <motion.div
          animate={{ width: `${progressPercent}%` }}
          className="h-full bg-success rounded-full"
          initial={{ width: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        />
      </FlexContainer>
      <Text className="pre-title" level="span">
        Step {currentStep + 1} of {totalSteps}
      </Text>
    </FlexContainer>
  );
};

export default OnboardingProgressBar;
