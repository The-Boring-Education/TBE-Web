import type { ComponentType, ReactNode } from "react";

/** Any icon component that accepts `className` (Lucide, etc.). */
export type StatCardIcon = ComponentType<{ className?: string }>;

export type StatCardProps = {
  title: string;
  value: ReactNode;
  /** Main line of supporting copy under the value. */
  description?: string;
  /** Smaller tertiary line (e.g. footnote). */
  caption?: string;
  icon?: StatCardIcon;
  /** 0–100; shows a progress bar when set. */
  progress?: number;
  /** Optional status chip; `variant` sets styling (no label string matching). */
  badge?: { label: string; variant: "success" | "danger" };
  className?: string;
};
