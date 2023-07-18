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
          {PROGRAMS.map((program) => {
            const { image, imageAltText, title, href, content, active } =
              program;
            return (
              <ProgramCard
                key={title}
                image={image}
                imageAltText={imageAltText}
                title={title}
                href={href}
                content={content}
                active={active}
              />
            );
          })}
        </CardSectionContainer>
      </FlexContainer>
    </Section>
  );
};

export default OurPrograms;
