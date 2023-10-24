import { GradientContainerProps } from '@/interfaces';

// To Put Border Color => border-borderColor${variant}
const GradientContainer = ({
  children,
  className = '',
  backgroundColor,
  childrenClassName = 'p-3',
}: GradientContainerProps) => {
  return (
    <div
      className={`flex-auto rounded-2 border ${className} ${
        backgroundColor ?? 'bg-white'
      }`}
    >
      <div className={`rounded-2 ${childrenClassName}`}>{children}</div>
    </div>
  );
};

export default GradientContainer;
