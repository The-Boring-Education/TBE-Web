import type { GridContainerProps } from '@/interfaces';

const GridContainer = ({ children, className = '' }: GridContainerProps) => (
  <div className={`grid ${className}`}>{children}</div>
);

export default GridContainer;
