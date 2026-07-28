import "./edge-polyfill";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : [];

const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "0",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
};

const ALLOWED_METHODS = "GET, POST, PUT, DELETE, PATCH, OPTIONS";
const ALLOWED_HEADERS =
  "Content-Type, Authorization, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version, cache, Cache-Control";

function resolveOrigin(request: NextRequest): string | undefined {
  const origin = request.headers.get("origin");
  if (!origin) return undefined;
  if (ALLOWED_ORIGINS.length === 0) {
    // Reflect the origin in development for convenience, but fail closed in
    // production/preview when no allowlist is configured.
    return process.env.NODE_ENV === "production" ? undefined : origin;
  }
  return ALLOWED_ORIGINS.includes(origin) ? origin : undefined;
}

function generateRequestId(): string {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function middleware(request: NextRequest) {
  const start = Date.now();
  const requestId = generateRequestId();
  const { method, nextUrl } = request;
  const path = nextUrl.pathname + nextUrl.search;
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const userAgent = request.headers.get("user-agent") || "-";

  console.log(
    JSON.stringify({
      level: "info",
      type: "request_start",
      requestId,
      method,
      path,
      ip,
      userAgent: userAgent.slice(0, 120),
      timestamp: new Date().toISOString(),
    }),
  );

  if (method === "OPTIONS") {
    const preflightOrigin = resolveOrigin(request);
    const preflightHeaders: Record<string, string> = {
      "Access-Control-Allow-Methods": ALLOWED_METHODS,
      "Access-Control-Allow-Headers": ALLOWED_HEADERS,
      "Access-Control-Max-Age": "86400",
      ...SECURITY_HEADERS,
    };
    if (preflightOrigin) {
      preflightHeaders["Access-Control-Allow-Origin"] = preflightOrigin;
    }
    console.log(
      JSON.stringify({
        level: "info",
        type: "request_end",
        requestId,
        method,
        path,
        status: 204,
        durationMs: Date.now() - start,
      }),
    );
    return new NextResponse(null, {
      status: 204,
      headers: preflightHeaders,
    });
  }

  const response = NextResponse.next();

  response.headers.set("x-request-id", requestId);

  // CORS
  const allowedOrigin = resolveOrigin(request);
  if (allowedOrigin) {
    response.headers.set("Access-Control-Allow-Origin", allowedOrigin);
  }
  response.headers.set("Access-Control-Allow-Methods", ALLOWED_METHODS);
  response.headers.set("Access-Control-Allow-Headers", ALLOWED_HEADERS);

  // Security headers
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  console.log(
    JSON.stringify({
      level: "info",
      type: "request_routed",
      requestId,
      method,
      path,
      durationMs: Date.now() - start,
    }),
  );

  return response;
}

export const config = {
  matcher: "/api/:path*",
};
