import { type NextRequest, NextResponse } from "next/server";

// During the SSO rollout, the browser may send a legacy host-only
// `tbe_access_token` alongside the new `.theboringeducation.com` domain-scoped
// one. `request.cookies.get` keeps the first match (the stale host-only
// value); walking the raw header from last to first lets us accept the newer
// shared cookie and still fall back to any valid earlier candidate.
function pickValidToken(cookieHeader: string): string | null {
  const regex = /(?:^|; )tbe_access_token=([^;]+)/g;
  const candidates: string[] = [];
  let m: RegExpExecArray | null = regex.exec(cookieHeader);
  while (m !== null) {
    if (m[1]) candidates.push(m[1]);
    m = regex.exec(cookieHeader);
  }
  for (let i = candidates.length - 1; i >= 0; i -= 1) {
    const token = candidates[i];
    if (!token) continue;
    try {
      const parts = token.split(".");
      if (parts.length !== 3 || !parts[1]) continue;
      const payload = JSON.parse(
        atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")),
      );
      if (payload.exp && payload.exp * 1000 < Date.now()) continue;
      return token;
    } catch {
      continue;
    }
  }
  return null;
}

export function middleware(request: NextRequest) {
  const cookieHeader = request.headers.get("cookie") || "";
  const token = pickValidToken(cookieHeader);

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
