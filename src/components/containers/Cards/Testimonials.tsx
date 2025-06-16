import {
  CardSectionContainer,
  FlexContainer,
  Section,
  SectionHeaderContainer,
  TestimonialCard,
} from '@/components';
import { TESTIMONIALS } from '@/constant';

const Testimonials = () => {
  return (
    <Section>
      <FlexContainer className='gap-2' direction='col'>
        <SectionHeaderContainer
          focusText='ex-learners'
          heading='Hear the words of'
        />
        <CardSectionContainer gap='gap-2'>
          {TESTIMONIALS.map((item) => {
            return <TestimonialCard {...item} key={item.id} />;
          })}
        </CardSectionContainer>
      </FlexContainer>
    </Section>
  );
};

export default Testimonials;
