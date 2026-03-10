import { FlexContainer, Text } from "@tbe/components";
import type { SectionHeaderProps } from "@tbe/interface";

const SectionHeaderContainer = ({
  heading,
  focusText,
  headingLevel = 4,
  className = "",
  flexContainerProps,
  subtext,
}: SectionHeaderProps) => (
  <FlexContainer
    className={`gap-1 ${className}`}
    {...flexContainerProps}
    direction="col"
  >
    <Text
      className={`heading-${headingLevel}`}
      level={`h${headingLevel}`}
      textCenter
    >
      {heading}
      <Text
        className={`heading-${headingLevel} text-primary`}
        level="span"
        textCenter
      >
        &nbsp;{focusText}
      </Text>
    </Text>
    {subtext && (
      <Text className="pre-text text-greyDark" level="span" textCenter>
        {subtext}
      </Text>
    )}
  </FlexContainer>
);

export default SectionHeaderContainer;
