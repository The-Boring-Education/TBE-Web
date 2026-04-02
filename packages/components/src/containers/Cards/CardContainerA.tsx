import {
  CardSectionContainer,
  FlexContainer,
  PrimaryCard,
  Section,
  SectionHeaderContainer,
} from "@tbe/components";
import type { CardContainerAProps } from "@tbe/interface";

const CardContainerA = ({
  heading,
  focusText,
  cards,
  borderColour,
  subtext,
  theme = "light",
}: CardContainerAProps) => (
  <Section className={theme === "dark" ? "bg-[#0A0A0A]" : ""}>
    <FlexContainer className="gap-4" direction="col">
      <SectionHeaderContainer
        focusText={focusText || ""}
        heading={heading}
        subtext={subtext}
        theme={theme}
      />
      <CardSectionContainer>
        {cards.map((item) => (
          <PrimaryCard
            key={item.id}
            {...item}
            borderColour={borderColour}
            theme={theme}
          />
        ))}
      </CardSectionContainer>
    </FlexContainer>
  </Section>
);

export default CardContainerA;
