import { FlexContainer } from '@/components';
import { CardSectionContainerProps } from '@/interfaces';

const CardSectionContainer = ({
  children,
  isWidthFull = true,
  className = '',
  gap,
}: CardSectionContainerProps) => {
  return (
    <FlexContainer
      itemCenter={false}
      className={`${isWidthFull && 'w-full'} ${
        gap ?? 'gap-4'
      } pt-4 ${className}`}
    >
      {children}
    </FlexContainer>
  );
};

export default CardSectionContainer;
