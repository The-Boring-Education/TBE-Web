import { Button, FlexContainer } from '@tbe/components';
import type { StepNavigationProps } from '@tbe/interface';

const StepNavigation = ({
  isValid,
  currentStep,
  isLastStep,
  onNext,
  onBack,
  onSubmit,
  isLoading = false,
}: StepNavigationProps) => (
  <FlexContainer className='gap-2'>
    {currentStep > 0 && (
      <Button
        className=''
        text='Back'
        variant='OUTLINE'
        onClick={onBack}
        disabled={isLoading}
      />
    )}
    <Button
      active={isValid && !isLoading}
      className='m-auto'
      text={
        isLastStep
          ? isLoading
            ? 'Completing...'
            : 'Complete Onboarding'
          : 'Next'
      }
      variant='PRIMARY'
      onClick={isLastStep ? onSubmit : onNext}
      disabled={isLoading}
    />
  </FlexContainer>
);
export default StepNavigation;
