import { FlexContainer, Text } from "@tbe/components";
import type { SectionHeaderProps } from "@tbe/interface";

const SectionHeaderContainer = ({
  heading,
  focusText,
  headingLevel = 4,
  className = "",
  flexContainerProps,
  subtext,
  textCenter = true,
}: SectionHeaderProps) => {
  return (
    <FlexContainer
      className={`gap-1 ${className}`}
      {...flexContainerProps}
      direction="col"
      itemCenter={textCenter}
      justifyCenter={textCenter}
    >
      <Text
        className={`heading-${headingLevel} text-foreground`}
        level={`h${headingLevel}`}
        textCenter={textCenter}
      >
        {heading}
        <Text
          className={`heading-${headingLevel} text-primary`}
          level="span"
          textCenter={textCenter}
        >
          &nbsp;{focusText}
        </Text>
      </Text>
      {subtext && (
        <Text
          className="pre-text text-muted-foreground"
          level="span"
          textCenter={textCenter}
        >
          {subtext}
        </Text>
      )}
    </FlexContainer>
  );
};

export default SectionHeaderContainer;
