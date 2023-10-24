import { FlexContainerProps } from '@/interfaces';

const FlexContainer = ({
  children,
  className = '',
  direction = 'row',
  itemCenter = true,
  justifyCenter = true,
  wrap = true,
  fullWidth = false,
  id = '',
}: FlexContainerProps) => {
  return (
    <div
      className={`flex flex-${direction} ${itemCenter && 'items-center'} ${
        justifyCenter && 'justify-center'
      } ${className} ${wrap && 'flex-wrap'} ${fullWidth && 'w-full'}`}
      id={id}
    >
      {children}
    </div>
  );
};

export default FlexContainer;
