import type { NextApiRequest } from "next";

/** First value for a Next.js query param (string or string[]). */
export function firstQueryValue(
  v: string | string[] | undefined,
): string | undefined {
  if (v === undefined) return undefined;
  return Array.isArray(v) ? v[0] : v;
}

/** All values for a query param (repeated keys or single). */
export function allQueryValues(
  v: string | string[] | undefined,
): string[] | undefined {
  if (v === undefined) return undefined;
  return Array.isArray(v) ? v.map(String) : [String(v)];
}

export type ParsedQuery = NextApiRequest["query"];
