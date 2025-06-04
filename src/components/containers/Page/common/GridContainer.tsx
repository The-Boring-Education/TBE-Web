import type { GridContainerProps } from '@/interfaces';

const GridContainer = ({ children, className = '' }: GridContainerProps) => {
  return <div className={`grid ${className}`}>{children}</div>;
};

export default GridContainer;
