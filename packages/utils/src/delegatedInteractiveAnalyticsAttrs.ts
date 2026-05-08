import type { DelegatedInteractiveAnalyticsProps } from "@tbe/interface";

import {
  TBE_ANALYTICS_ATTR_ID,
  TBE_ANALYTICS_ATTR_LABEL,
  TBE_ANALYTICS_ATTR_MARKER,
  TBE_ANALYTICS_ATTR_SKIP_GLOBAL,
  TBE_ANALYTICS_ATTR_SURFACE,
} from "./analytics";

const MAX_SEGMENT = 120;

const truncate = (s: string): string =>
  s.length <= MAX_SEGMENT ? s : `${s.slice(0, MAX_SEGMENT)}…`;

/**
 * Flatten analytics props onto DOM attributes consumed by delegated GA capture (`installGlobalAnalyticsListeners`).
 */
export const buildDelegatedInteractiveAnalyticsDOMProps = (
  opts: DelegatedInteractiveAnalyticsProps,
): Record<string, string> => {
  const out: Record<string, string> = {};

  if (opts.suppressGlobalUiClick) {
    out[TBE_ANALYTICS_ATTR_SKIP_GLOBAL] = "";
  }

  if (opts.analyticsMarker) {
    out[TBE_ANALYTICS_ATTR_MARKER] = "";
  }

  const analyticsId = opts.analyticsId?.trim();
  if (analyticsId) {
    out[TBE_ANALYTICS_ATTR_ID] = truncate(analyticsId);
  }

  const analyticsLabel = opts.analyticsLabel?.trim();
  if (analyticsLabel) {
    out[TBE_ANALYTICS_ATTR_LABEL] = truncate(analyticsLabel);
  }

  const surface = opts.analyticsSurface?.trim();
  if (surface) {
    out[TBE_ANALYTICS_ATTR_SURFACE] = truncate(surface);
  }

  return out;
};
