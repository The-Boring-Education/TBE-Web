import { motion } from 'framer-motion';
import { OnboardingProgressBarProps } from '@/interfaces';
import { FlexContainer, Text } from '@/components';

const OnboardingProgressBar = ({
  currentStep,
  totalSteps,
}: OnboardingProgressBarProps) => {
  const progressPercent = (currentStep / totalSteps) * 100;

  return (
    <FlexContainer fullWidth={true} className='gap-2'>
      <FlexContainer
        fullWidth={true}
        justifyCenter={false}
        className='h-2 bg-gray-200 rounded-full overflow-hidden'
      >
        <motion.div
          className='h-full bg-success rounded-full'
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        />
      </FlexContainer>
      <Text level='span' className='pre-title'>
        Step {currentStep + 1} of {totalSteps}
      </Text>
    </FlexContainer>
  );
};

export default OnboardingProgressBar;
