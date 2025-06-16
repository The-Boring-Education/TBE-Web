import {
  CardSectionContainer,
  FlexContainer,
  PrimaryCardWithCTA,
  Section,
  SectionHeaderContainer,
} from '@/components';
import type { CardContainerBProps } from '@/interfaces';

const CardContainerB = ({
  heading,
  focusText,
  cards,
  borderColour,
  subtext,
  id,
  sectionClassName,
}: CardContainerBProps) => (
  <Section className={sectionClassName} id={id}>
    <FlexContainer className='gap-4' direction='col'>
      <SectionHeaderContainer
        focusText={focusText}
        heading={heading}
        subtext={subtext}
      />
      <CardSectionContainer>
        {cards.map((program, key) => (
          <PrimaryCardWithCTA
            {...program}
            key={key}
            borderColour={borderColour}
          />
        ))}
      </CardSectionContainer>
    </FlexContainer>
  </Section>
);

export default CardContainerB;
