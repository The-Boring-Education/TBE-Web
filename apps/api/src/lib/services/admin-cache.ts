import { getActiveAdminEmailsFromDB } from "@/lib/database";
import { logger } from "@/lib/utils/logger";

const CACHE_TTL_MS = 5 * 60 * 1000;

let cachedEmails = new Set<string>();
let lastLoadedAt = 0;
let refreshPromise: Promise<void> | null = null;

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

const loadAdminEmails = async (): Promise<void> => {
  const { data, error } = await getActiveAdminEmailsFromDB();
  if (error || !Array.isArray(data)) {
    logger.error("Admin cache: failed to load active admin emails", { error });
    return;
  }
  cachedEmails = new Set(data.map(normalizeEmail));
  lastLoadedAt = Date.now();
};

const refreshIfStale = async (): Promise<void> => {
  const isStale =
    cachedEmails.size === 0 || Date.now() - lastLoadedAt > CACHE_TTL_MS;
  if (!isStale) return;

  if (!refreshPromise) {
    refreshPromise = loadAdminEmails().finally(() => {
      refreshPromise = null;
    });
  }
  await refreshPromise;
};

export const isAdminEmail = async (
  email: string | undefined | null,
): Promise<boolean> => {
  if (!email) return false;
  await refreshIfStale();
  return cachedEmails.has(normalizeEmail(email));
};

export const invalidateAdminCache = (): void => {
  cachedEmails = new Set();
  lastLoadedAt = 0;
};

export const __resetAdminCacheForTests = (): void => {
  invalidateAdminCache();
  refreshPromise = null;
};

export const __setAdminCacheForTests = (emails: string[]): void => {
  cachedEmails = new Set(emails.map(normalizeEmail));
  lastLoadedAt = Date.now();
};
