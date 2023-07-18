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
          {WORKSHOP_CARDS.map((program) => {
            const { image, imageAltText, title, href, content, active } =
              program;
            return (
              <ProgramCard
                key={href}
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

export default OurWorkshops;
