import { LoadingSpinnerProps } from '@/interfaces';

const LoadingSpinner = ({
  className,
  height = 2,
  width = 2,
  marginClass = 'ml-1',
}: LoadingSpinnerProps) => {
  return (
    <div
      className={`inline-block h-${height} w-${width} ${marginClass} animate-spin rounded-full border-2 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite] ${className}`}
    ></div>
  );
};

export default LoadingSpinner;
