import {
  CardSectionContainer,
  FlexContainer,
  ProgramCard,
  Section,
  SectionHeaderContainer,
} from '@/components';
import { PROGRAMS, routes } from '@/constant';

const OurPrograms = () => {
  return (
    <Section id={routes.internals.landing.programs}>
      <FlexContainer direction='col'>
        <SectionHeaderContainer heading='Our' focusText='Programs' />
        <CardSectionContainer>
          {PROGRAMS.map((program, key) => (
            <ProgramCard {...program} key={key} />
          ))}
        </CardSectionContainer>
      </FlexContainer>
    </Section>
  );
};

export default OurPrograms;
