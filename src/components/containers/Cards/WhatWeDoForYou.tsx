import {
  CardSectionContainer,
  FlexContainer,
  Section,
  SectionHeaderContainer,
  WhatWeDoForYouCard,
} from '@/components';
import { WhatWeDoForYouProps } from '@/interfaces';

const WhatWeDoForYou = ({ offerings }: WhatWeDoForYouProps) => {
  return (
    <Section>
      <FlexContainer direction='col' itemCenter={true} justifyCenter={true}>
        <SectionHeaderContainer
          heading='In The Program'
          focusText=''
          headingLevel={3}
        />
        <CardSectionContainer>
          {offerings.map((item) => {
            const { id } = item;
            return <WhatWeDoForYouCard key={id} {...item} />;
          })}
        </CardSectionContainer>
      </FlexContainer>
    </Section>
  );
};

export default WhatWeDoForYou;
