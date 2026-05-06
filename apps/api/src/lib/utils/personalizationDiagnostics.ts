import { logger } from "./logger";

type PersonalizationMetricKey =
  | "durationFallbackCount"
  | "companyTypeFallbackCount"
  | "invalidDurationRejectCount"
  | "invalidCompanyTypeRejectCount"
  | "invalidProductTypeRejectCount"
  | "invalidUserIdRejectCount";

type InvalidPersonalizationField =
  | "duration"
  | "timeline"
  | "companyType"
  | "productType"
  | "userId";

const personalizationMetricCounters: Record<PersonalizationMetricKey, number> =
  {
    durationFallbackCount: 0,
    companyTypeFallbackCount: 0,
    invalidDurationRejectCount: 0,
    invalidCompanyTypeRejectCount: 0,
    invalidProductTypeRejectCount: 0,
    invalidUserIdRejectCount: 0,
  };

const invalidFieldMetricMap: Record<
  InvalidPersonalizationField,
  PersonalizationMetricKey
> = {
  duration: "invalidDurationRejectCount",
  timeline: "invalidDurationRejectCount",
  companyType: "invalidCompanyTypeRejectCount",
  productType: "invalidProductTypeRejectCount",
  userId: "invalidUserIdRejectCount",
};

const bumpMetric = (key: PersonalizationMetricKey, by = 1): number => {
  personalizationMetricCounters[key] += by;
  return personalizationMetricCounters[key];
};

interface NormalizationFallbackParams {
  route: string;
  field: "duration" | "timeline" | "companyType";
  fallbackCount?: number;
  rawValue?: string;
  normalizedValue?: string;
}

export const trackPersonalizationNormalizationFallback = ({
  route,
  field,
  fallbackCount = 1,
  rawValue,
  normalizedValue,
}: NormalizationFallbackParams) => {
  const metricKey: PersonalizationMetricKey =
    field === "companyType"
      ? "companyTypeFallbackCount"
      : "durationFallbackCount";

  const metricCount = bumpMetric(metricKey, Math.max(1, fallbackCount));

  logger.info("Personalization normalization fallback", {
    route,
    field,
    fallbackCount,
    ...(rawValue ? { rawValue } : {}),
    ...(normalizedValue ? { normalizedValue } : {}),
    metricKey,
    metricCount,
  });
};

interface InvalidInputParams {
  route: string;
  field: InvalidPersonalizationField;
  reason: string;
  value?: unknown;
}

export const trackPersonalizationInvalidInput = ({
  route,
  field,
  reason,
  value,
}: InvalidInputParams) => {
  const metricKey = invalidFieldMetricMap[field];
  const metricCount = bumpMetric(metricKey);

  logger.warn("Personalization invalid input rejected", {
    route,
    field,
    reason,
    ...(value !== undefined ? { value } : {}),
    metricKey,
    metricCount,
  });
};

export const getPersonalizationDiagnosticsMetrics = () => ({
  ...personalizationMetricCounters,
});
