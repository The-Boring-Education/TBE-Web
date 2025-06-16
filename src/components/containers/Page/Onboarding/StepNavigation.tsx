import { Button, FlexContainer } from '@/components';
import type { StepNavigationProps } from '@/interfaces';

const StepNavigation = ({
  isValid,
  currentStep,
  isLastStep,
  onNext,
  onBack,
  onSubmit,
}: StepNavigationProps) => (
    <FlexContainer className='gap-2'>
      {currentStep > 0 && (
        <Button className='' text='Back' variant='OUTLINE' onClick={onBack} />
      )}
      <Button
        active={isValid}
        className='m-auto'
        text={isLastStep ? 'Complete Onboarding' : 'Next'}
        variant='PRIMARY'
        onClick={isLastStep ? onSubmit : onNext}
      />
    </FlexContainer>
  );
export default StepNavigation;
