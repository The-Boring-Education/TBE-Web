import { Button, FlexContainer } from '@/components';
import { StepNavigationProps } from '@/interfaces';
import { Fragment } from 'react';

const StepNavigation = ({
  isValid,
  currentStep,
  isLastStep,
  onNext,
  onBack,
  onSubmit,
}: StepNavigationProps) => {
  return (
    <FlexContainer className='gap-2'>
      {currentStep > 0 && (
        <Button text='Back' variant='OUTLINE' onClick={onBack} className='' />
      )}
      <Button
        text={isLastStep ? 'Complete Onboarding' : 'Next'}
        variant='PRIMARY'
        active={isValid}
        onClick={isLastStep ? onSubmit : onNext}
        className='m-auto'
      />
    </FlexContainer>
  );
};
export default StepNavigation;
