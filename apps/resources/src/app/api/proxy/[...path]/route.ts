import { envConfig } from "@tbe/constants";
import { type NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Proxy API route to forward requests to the actual API server in Next.js App Router.
 * This eliminates CORS issues by making all API calls from the same origin.
 *
 * Usage: /api/proxy/content-feedback -> {API_URL}/content-feedback
 */
async function proxyRequest(
  request: NextRequest,
  { params }: { params: { path: string[] } },
) {
  const apiUrl = envConfig.API_URL || process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    return NextResponse.json(
      {
        error: "API URL not configured",
        message: "Please set NEXT_PUBLIC_API_URL environment variable",
      },
      { status: 500 },
    );
  }

  try {
    const apiPath = Array.isArray(params.path)
      ? params.path.join("/")
      : params.path || "";

    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();
    const url = queryString
      ? `${apiUrl}/${apiPath}?${queryString}`
      : `${apiUrl}/${apiPath}`;

    const headers = new Headers();
    request.headers.forEach((value, key) => {
      const lower = key.toLowerCase();
      // Avoid forwarding host and connection headers
      if (
        lower !== "host" &&
        lower !== "connection" &&
        lower !== "content-length"
      ) {
        headers.set(key, value);
      }
    });

    const init: RequestInit = {
      method: request.method,
      headers,
    };

    if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) {
      const body = await request.arrayBuffer();
      if (body.byteLength > 0) {
        init.body = body;
      }
    }

    const response = await fetch(url, init);
    const data = await response.arrayBuffer();

    const responseHeaders = new Headers();
    const contentType = response.headers.get("content-type");
    if (contentType) {
      responseHeaders.set("content-type", contentType);
    }

    return new NextResponse(data, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error: unknown) {
    console.error("Proxy error:", error);
    const message =
      error instanceof Error ? error.message : "Internal Proxy Error";
    return NextResponse.json(
      {
        error: "Proxy error",
        message,
      },
      { status: 500 },
    );
  }
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
export const HEAD = proxyRequest;
export const OPTIONS = proxyRequest;
