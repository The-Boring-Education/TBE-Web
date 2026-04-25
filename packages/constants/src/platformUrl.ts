import { envConfig } from "./envConfig";

const DEFAULT_PLATFORM_ORIGIN = "https://theboringeducation.com";

const getPlatformOrigin = (): string => {
  const raw = envConfig.PLATFORM_URL;
  if (raw && String(raw).trim() !== "") {
    return String(raw).replace(/\/$/, "");
  }
  return DEFAULT_PLATFORM_ORIGIN;
};

/** Build an absolute URL to a path on the platform app (for shared nav in satellite apps). */
const toPlatformUrl = (path: string): string => {
  if (!path) {
    return getPlatformOrigin();
  }
  const trimmed = path.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  const normalized = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${getPlatformOrigin()}${normalized}`;
};

export { getPlatformOrigin, toPlatformUrl };
