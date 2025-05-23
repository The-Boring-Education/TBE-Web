import {
  CardSectionContainer,
  FlexContainer,
  PrimaryCardWithCTA,
  Section,
  SectionHeaderContainer,
} from '@/components';
import { CardContainerBProps } from '@/interfaces';

const CardContainerB = ({
  heading,
  focusText,
  cards,
  borderColour,
  subtext,
  id,
  sectionClassName,
}: CardContainerBProps) => {
  return (
    <Section id={id} className={sectionClassName}>
      <FlexContainer direction='col' className='gap-4'>
        <SectionHeaderContainer
          heading={heading}
          focusText={focusText}
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
};

export default CardContainerB;
