import {
  FlexContainer,
  MentorshipCard,
  Section,
  SectionHeaderContainer,
} from '@/components';
import { MENTORSHIP_CARDS } from '@/constant';

const MentorshipPlans = () => (
    <Section className='md:p-5 px-2 py-4'>
      <FlexContainer className='gap-4' direction='col'>
        <SectionHeaderContainer
          focusText='Mentorship'
          heading='Get Personalised'
          headingLevel={3}
        />
        <FlexContainer className='gap-2 h-full'>
          {MENTORSHIP_CARDS.map((plan) => (
            <MentorshipCard
              key={plan.heading}
              description={plan.description}
              heading={plan.heading}
              link={plan.link}
            />
          ))}
        </FlexContainer>
      </FlexContainer>
    </Section>
  );

export default MentorshipPlans;
