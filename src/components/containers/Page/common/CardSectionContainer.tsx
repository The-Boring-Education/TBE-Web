import { FlexContainer } from '@/components';
import type { CardSectionContainerProps } from '@/interfaces';

const CardSectionContainer = ({
  children,
  isWidthFull = true,
  className = '',
  gap,
}: CardSectionContainerProps) => {
  return (
    <FlexContainer
      className={`${isWidthFull && 'w-full'} ${gap ?? 'gap-4'} ${className}`}
      itemCenter={false}
    >
      {children}
    </FlexContainer>
  );
};

export default CardSectionContainer;
