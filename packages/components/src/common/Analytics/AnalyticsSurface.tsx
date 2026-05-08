import { TBE_ANALYTICS_ATTR_SURFACE } from "@tbe/utils/analytics";
import type { HTMLAttributes } from "react";

export type AnalyticsSurfaceProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "dangerouslySetInnerHTML"
> & {
  /** GA segmentation; maps to delegated attribute `data-tbe-surface`. */
  surface: string;
  children: React.ReactNode;
};

const truncateSurface = (s: string): string =>
  s.length <= 120 ? s : `${s.slice(0, 120)}…`;

/**
 * Boundary for delegated analytics: nearest `data-tbe-surface` wins when resolving clicks.
 * Uses `display: contents` so flex/grid layouts behave as if unwrapped.
 */
const AnalyticsSurface = ({
  surface,
  children,
  style,
  className,
  ...rest
}: AnalyticsSurfaceProps) => {
  const normalized = truncateSurface(surface.trim());
  if (!normalized) return <>{children}</>;

  const surfaceSpread = {
    [TBE_ANALYTICS_ATTR_SURFACE]: normalized,
  };

  return (
    <div
      {...rest}
      {...surfaceSpread}
      style={{ display: "contents", ...style }}
      className={className}
    >
      {children}
    </div>
  );
};

export default AnalyticsSurface;
