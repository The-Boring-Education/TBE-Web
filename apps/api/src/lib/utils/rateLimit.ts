import type { NextApiRequest, NextApiResponse } from "next";

import { sendAPIResponse } from "@/lib/utils";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Evict expired entries every 60 seconds to prevent memory leaks
const CLEANUP_INTERVAL_MS = 60_000;
let cleanupTimer: ReturnType<typeof setInterval> | null = null;

function startCleanup() {
  if (cleanupTimer) return;
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now >= entry.resetAt) {
        store.delete(key);
      }
    }
  }, CLEANUP_INTERVAL_MS);
  // Allow the Node process to exit even if the timer is still active
  if (
    cleanupTimer &&
    typeof cleanupTimer === "object" &&
    "unref" in cleanupTimer
  ) {
    cleanupTimer.unref();
  }
}

function getClientIdentifier(req: NextApiRequest, keyPrefix: string): string {
  const ip =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    "unknown";
  return `${keyPrefix}:${ip}`;
}

interface RateLimitOptions {
  /** Maximum requests allowed within the window. */
  maxRequests: number;
  /** Time window in milliseconds. */
  windowMs: number;
  /**
   * Optional function to derive a custom key from the request.
   * Defaults to IP-based key.
   */
  keyFn?: (req: NextApiRequest) => string;
}

/**
 * In-memory rate limiter for Next.js API routes.
 *
 * Returns `true` if the request is within limits, `false` if rate-limited
 * (response already sent with 429).
 *
 * Usage:
 * ```ts
 * const allowed = rateLimit(req, res, { maxRequests: 10, windowMs: 60_000 });
 * if (!allowed) return;
 * ```
 */
export function rateLimit(
  req: NextApiRequest,
  res: NextApiResponse,
  { maxRequests, windowMs, keyFn }: RateLimitOptions,
): boolean {
  startCleanup();

  const url = req.url ?? "api";
  const pathname = url.split("?")[0] || "api";
  const key = keyFn ? keyFn(req) : getClientIdentifier(req, pathname);

  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now >= entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  entry.count += 1;

  if (entry.count > maxRequests) {
    const retryAfterSec = Math.ceil((entry.resetAt - now) / 1000);
    res.setHeader("Retry-After", String(retryAfterSec));
    res.status(429).json(
      sendAPIResponse({
        status: false,
        message: "Too many requests. Please try again later.",
      }),
    );
    return false;
  }

  return true;
}

/** Exposed for testing – clears all rate-limit entries. */
export function _resetRateLimitStore(): void {
  store.clear();
}
