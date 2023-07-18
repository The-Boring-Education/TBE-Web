import { CardGradientContainerProps } from '@/interfaces';

// To Put Border Color => border-borderColor${variant}
const CardGradientContainer = ({
  children,
  className = '',
  backgroundColor,
}: CardGradientContainerProps) => {
  return (
    <div
      className={`flex-auto rounded-2 border ${className} ${
        backgroundColor ?? 'bg-white'
      }`}
    >
      <div className='rounded-2 p-3'>{children}</div>
    </div>
  );
};

export default CardGradientContainer;
