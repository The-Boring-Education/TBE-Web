import "./edge-polyfill";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version, cache, Cache-Control, x-admin-secret",
};

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
      headers: { ...CORS_HEADERS, "Access-Control-Max-Age": "86400" },
    });
  }

  const response = NextResponse.next();

  response.headers.set("x-request-id", requestId);
  Object.entries(CORS_HEADERS).forEach(([key, value]) => {
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
