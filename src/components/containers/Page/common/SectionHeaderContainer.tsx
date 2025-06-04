import { FlexContainer, Text } from '@/components';

import type { SectionHeaderProps } from '@/interfaces';

const SectionHeaderContainer = ({
  heading,
  focusText,
  headingLevel = 4,
  className = '',
  flexContainerProps,
  subtext,
}: SectionHeaderProps) => {
  return (
    <FlexContainer
      className={`gap-1 ${className}`}
      {...flexContainerProps}
      direction='col'
    >
      <Text
        className={`heading-${headingLevel}`}
        level={`h${headingLevel}`}
        textCenter={true}
      >
        {heading}
        <Text
          className={`heading-${headingLevel} text-primary`}
          level='span'
          textCenter={true}
        >
          &nbsp;{focusText}
        </Text>
      </Text>
      {subtext && (
        <Text className='pre-text text-greyDark' level='span' textCenter={true}>
          {subtext}
        </Text>
      )}
    </FlexContainer>
  );
};

export default SectionHeaderContainer;
