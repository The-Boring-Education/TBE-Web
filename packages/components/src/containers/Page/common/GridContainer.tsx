import type { GridContainerProps } from '@tbe/interface';

const GridContainer = ({ children, className = '' }: GridContainerProps) => (
  <div className={`grid ${className}`}>{children}</div>
);

export default GridContainer;
