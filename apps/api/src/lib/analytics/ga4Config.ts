export interface Ga4DateRange {
  startDate: string;
  endDate: string;
}

export interface Ga4Config {
  propertyId: string;
  credentials: Record<string, unknown>;
}

export const getGa4Config = (): Ga4Config | null => {
  const propertyId = process.env.GA4_PROPERTY_ID?.trim();
  const credentialsJson = process.env.GA4_SERVICE_ACCOUNT_JSON?.trim();

  if (!propertyId || !credentialsJson) {
    return null;
  }

  try {
    const credentials = JSON.parse(credentialsJson) as Record<string, unknown>;
    return { propertyId, credentials };
  } catch {
    return null;
  }
};

export const periodToGa4DateRange = (period: string): Ga4DateRange => {
  switch (period) {
    case "7d":
      return { startDate: "7daysAgo", endDate: "today" };
    case "90d":
      return { startDate: "90daysAgo", endDate: "today" };
    case "365d":
      return { startDate: "365daysAgo", endDate: "today" };
    default:
      return { startDate: "30daysAgo", endDate: "today" };
  }
};

export const formatGa4Date = (raw: string): string => {
  if (raw.length !== 8) return raw;
  return `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
};
