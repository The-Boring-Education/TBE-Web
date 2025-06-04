import { motion } from 'framer-motion';

import { FlexContainer, Text } from '@/components';

import type { OnboardingProgressBarProps } from '@/interfaces';

const OnboardingProgressBar = ({
  currentStep,
  totalSteps,
}: OnboardingProgressBarProps) => {
  const progressPercent = (currentStep / totalSteps) * 100;

  return (
    <FlexContainer className='gap-2' fullWidth={true}>
      <FlexContainer
        className='h-2 bg-gray-200 rounded-full overflow-hidden'
        fullWidth={true}
        justifyCenter={false}
      >
        <motion.div
          animate={{ width: `${progressPercent}%` }}
          className='h-full bg-success rounded-full'
          initial={{ width: 0 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        />
      </FlexContainer>
      <Text className='pre-title' level='span'>
        Step {currentStep + 1} of {totalSteps}
      </Text>
    </FlexContainer>
  );
};

export default OnboardingProgressBar;
