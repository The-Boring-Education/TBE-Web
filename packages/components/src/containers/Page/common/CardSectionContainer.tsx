import { FlexContainer } from '@tbe/components';
import type { CardSectionContainerProps } from '@tbe/interface';

const CardSectionContainer = ({
  children,
  isWidthFull = true,
  className = '',
  gap,
}: CardSectionContainerProps) => (
  <FlexContainer
    className={`${isWidthFull && 'w-full'} ${gap ?? 'gap-4'} ${className}`}
    itemCenter={false}
  >
    {children}
  </FlexContainer>
);

export default CardSectionContainer;
