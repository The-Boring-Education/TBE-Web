import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

/**
 * Middleware to add CORS headers to all API routes including NextAuth
 * This is especially important for the auth endpoints which need CORS
 */
export function middleware(request: NextRequest) {
    // Handle OPTIONS request for CORS preflight
    if (request.method === "OPTIONS") {
        return new NextResponse(null, {
            status: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods":
                    "GET, POST, PUT, DELETE, PATCH, OPTIONS",
                "Access-Control-Allow-Headers":
                    "Content-Type, Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version, cache, Cache-Control",
                "Access-Control-Max-Age": "86400"
            }
        })
    }

    // Add CORS headers to the response
    const response = NextResponse.next()

    response.headers.set("Access-Control-Allow-Origin", "*")
    response.headers.set(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, PATCH, OPTIONS"
    )
    response.headers.set(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version, cache, Cache-Control"
    )

    return response
}

/**
 * Configure which routes the middleware should run on
 */
export const config = {
    matcher: "/api/:path*"
}

