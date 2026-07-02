import { getActiveAdminEmailsFromDB } from "@/lib/database";
import { logger } from "@/lib/utils/logger";

const CACHE_TTL_MS = 5 * 60 * 1000;

let cachedEmails: Set<string> = new Set();
let lastLoadedAt = 0;
let refreshPromise: Promise<void> | null = null;

const isCacheStale = (): boolean =>
  Date.now() - lastLoadedAt > CACHE_TTL_MS || cachedEmails.size === 0;

const loadAdminEmailCache = async (): Promise<void> => {
  const { data, error } = await getActiveAdminEmailsFromDB();
  if (error) {
    logger.error("Admin cache: failed to load active admin emails", { error });
    return;
  }

  if (Array.isArray(data)) {
    cachedEmails = new Set(data.map((email) => email.toLowerCase()));
    lastLoadedAt = Date.now();
  }
};

const ensureAdminEmailCache = async (): Promise<void> => {
  if (!isCacheStale()) {
    return;
  }

  if (!refreshPromise) {
    refreshPromise = loadAdminEmailCache().finally(() => {
      refreshPromise = null;
    });
  }

  await refreshPromise;
};

export const invalidateAdminCache = (): void => {
  cachedEmails = new Set();
  lastLoadedAt = 0;
};

export const isAdminEmailCached = (
  email: string | undefined | null,
): boolean => {
  if (!email) {
    return false;
  }
  return cachedEmails.has(email.trim().toLowerCase());
};

export const isAdminEmail = async (
  email: string | undefined | null,
): Promise<boolean> => {
  if (!email) {
    return false;
  }

  await ensureAdminEmailCache();
  return isAdminEmailCached(email);
};

export const warmAdminEmailCache = async (): Promise<void> => {
  await ensureAdminEmailCache();
};

export const __resetAdminCacheForTests = (): void => {
  cachedEmails = new Set();
  lastLoadedAt = 0;
  refreshPromise = null;
};

export const __setAdminCacheForTests = (emails: string[]): void => {
  cachedEmails = new Set(emails.map((email) => email.toLowerCase()));
  lastLoadedAt = Date.now();
};
