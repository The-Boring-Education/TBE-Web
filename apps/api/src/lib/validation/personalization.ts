import type { CompanyType } from "@/lib/interfaces";

export type DsaDurationKey = "1Month" | "3Months" | "6Months" | "1Year";
export type DsaProductContext = "DSA_YATRA" | "ONCAMPUS";

export const ONCAMPUS_EXPERIENCE_LEVEL = "Fresher (0-1 yr)" as const;
export const ONCAMPUS_EXPERIENCE_YEARS = 0 as const;

const DSA_DURATION_ALIAS_MAP: Record<string, DsaDurationKey> = {
  "1month": "1Month",
  "1months": "1Month",
  "3month": "3Months",
  "3months": "3Months",
  "6month": "6Months",
  "6months": "6Months",
  "12month": "1Year",
  "12months": "1Year",
  "1year": "1Year",
  "23month": "3Months",
  "23months": "3Months",
  "46month": "6Months",
  "46months": "6Months",
  "812month": "1Year",
  "812months": "1Year",
};

const COMPANY_TYPE_ALIAS_MAP: Record<string, CompanyType> = {
  startup: "Startup",
  startups: "Startup",
  midsize: "MidSize",
  midsized: "MidSize",
  mnc: "MNC",
  mnccompany: "MNC",
  mncs: "MNC",
  faang: "FAANG",
};

const DSA_PRODUCT_CONTEXT_ALIAS_MAP: Record<string, DsaProductContext> = {
  dsayatra: "DSA_YATRA",
  oncampus: "ONCAMPUS",
};

const normalizeLooseKey = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[\s_-]/g, "");

export const normalizeDsaDuration = (
  value: string | undefined | null,
): DsaDurationKey | null => {
  if (!value) return null;
  const key = normalizeLooseKey(value);
  return DSA_DURATION_ALIAS_MAP[key] || null;
};

export const normalizeCompanyType = (
  value: string | undefined | null,
): CompanyType | null => {
  if (!value) return null;
  const key = normalizeLooseKey(value);
  return COMPANY_TYPE_ALIAS_MAP[key] || null;
};

export const normalizeCompanyTypeArray = (
  values: string[] | undefined,
): { values: CompanyType[]; invalid: string[] } => {
  if (!values?.length) return { values: [], invalid: [] };

  const normalized: CompanyType[] = [];
  const invalid: string[] = [];

  for (const raw of values) {
    const value = normalizeCompanyType(raw);
    if (!value) {
      invalid.push(raw);
      continue;
    }
    if (!normalized.includes(value)) {
      normalized.push(value);
    }
  }

  return { values: normalized, invalid };
};

export const normalizeDsaProductContext = (
  value: string | undefined | null,
): DsaProductContext | null => {
  if (!value) return null;
  const key = normalizeLooseKey(value);
  return DSA_PRODUCT_CONTEXT_ALIAS_MAP[key] || null;
};
