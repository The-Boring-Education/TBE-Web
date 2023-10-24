import {
  CardSectionContainer,
  FlexContainer,
  ProgramCard,
  Section,
  SectionHeaderContainer,
} from '@/components';
import { WORKSHOP_CARDS, routes } from '@/constant';

const OurWorkshops = () => {
  return (
    <Section id={routes.internals.workshops}>
      <FlexContainer direction='col'>
        <SectionHeaderContainer heading='Our' focusText='Workshops' />
        <CardSectionContainer>
          {WORKSHOP_CARDS.map((program, key) => (
            <ProgramCard {...program} key={key} />
          ))}
        </CardSectionContainer>
      </FlexContainer>
    </Section>
  );
};

export default OurWorkshops;
