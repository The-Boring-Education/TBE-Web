import { FlexContainer, Section } from '@/components';
import { OnboardingLayoutProps } from '@/interfaces';

const OnboardingLayout = ({ children }: OnboardingLayoutProps) => {
  return (
    <Section className='md:py-4 px-2 py-2'>
      <FlexContainer
        direction='col'
        className='max-w-3xl mx-auto bg-white rounded-2 border shadow-sm px-4 py-6 gap-4'
      >
        {children}
      </FlexContainer>
    </Section>
  );
};

export default OnboardingLayout;
