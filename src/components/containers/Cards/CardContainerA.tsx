import {
  CardSectionContainer,
  FlexContainer,
  PrimaryCard,
  Section,
  SectionHeaderContainer,
} from '@/components';
import type { CardContainerAProps } from '@/interfaces';

const CardContainerA = ({
  heading,
  focusText,
  cards,
  borderColour,
  subtext,
}: CardContainerAProps) => (
  <Section>
    <FlexContainer className='gap-4' direction='col'>
      <SectionHeaderContainer
        focusText={focusText}
        heading={heading}
        subtext={subtext}
      />
      <CardSectionContainer>
        {cards.map((item) => (
          <PrimaryCard key={item.id} {...item} borderColour={borderColour} />
        ))}
      </CardSectionContainer>
    </FlexContainer>
  </Section>
);

export default CardContainerA;
