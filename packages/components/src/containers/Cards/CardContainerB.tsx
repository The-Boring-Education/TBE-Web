import {
  CardSectionContainer,
  FlexContainer,
  PrimaryCardWithCTA,
  Section,
} from "@tbe/components";
import type { CardContainerBProps } from "@tbe/interface";

const CardContainerB = ({
  heading,
  focusText,
  cards,
  borderColour,
  subtext,
  id,
  sectionClassName,
  theme = "light",
}: CardContainerBProps) => (
  <Section className={sectionClassName} id={id}>
    <FlexContainer className="gap-4" direction="col">
      <CardSectionContainer>
        {cards.map((program, key) => (
          <PrimaryCardWithCTA
            {...program}
            key={key}
            borderColour={borderColour}
            theme={program.theme ?? theme}
          />
        ))}
      </CardSectionContainer>
    </FlexContainer>
  </Section>
);

export default CardContainerB;
