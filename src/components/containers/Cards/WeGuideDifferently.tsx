import {
  CardSectionContainer,
  FlexContainer,
  Section,
  SectionHeaderContainer,
  WeGuideDifferentlyCard,
} from '@/components';
import { USP } from '@/constant';

const WeGuideDifferently = () => {
  return (
    <Section>
      <FlexContainer direction='col'>
        <SectionHeaderContainer heading='What We Do' focusText='Differently' />
        <CardSectionContainer>
          {USP.map((item) => {
            const { id, image, imageAltText, title, content } = item;
            return (
              <WeGuideDifferentlyCard
                key={id}
                image={image}
                imageAltText={imageAltText}
                title={title}
                content={content}
              />
            );
          })}
        </CardSectionContainer>
      </FlexContainer>
    </Section>
  );
};

export default WeGuideDifferently;
