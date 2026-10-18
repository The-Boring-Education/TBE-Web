"use client";

import { setTokens } from "@tbe/auth";
import { useEffect, useState } from "react";

const getAuthApiUrl = () => {
  return (
    process.env.NEXT_PUBLIC_AUTH_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "https://api.theboringeducation.com/api/v1"
  );
};

const ALLOWED_RETURN_PATHS = new Set<string>([
  "/dashboard",
]);

function getSafeReturnTo(rawReturnTo: string | null): string {
  if (!rawReturnTo) return "/dashboard";

  // Only allow explicitly approved internal routes.
  // Parse relative URLs safely and compare normalized pathname.
  try {
    const parsed = new URL(rawReturnTo, window.location.origin);
    const candidate = parsed.pathname;

    if (parsed.origin === window.location.origin && ALLOWED_RETURN_PATHS.has(candidate)) {
      return candidate;
    }
  } catch {
    // Fall through to default
  }

  return "/dashboard";
}

async function exchangeCodeForTokens(code: string): Promise<Response> {
  const proxyUrl = "/api/proxy/auth/token";
  const proxyResponse = await fetch(proxyUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  }).catch(() => null);

  if (proxyResponse && proxyResponse.status !== 404) {
    return proxyResponse;
  }

  const apiUrl = getAuthApiUrl();
  return fetch(`${apiUrl}/auth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });
}

export default function ContributorAuthCallback() {
  const [status, setStatus] = useState("Completing sign in...");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const errorParam = params.get("error");
    const returnTo = getSafeReturnTo(params.get("returnTo"));

    if (errorParam) {
      setError(`Authentication error: ${errorParam}`);
      setTimeout(() => {
        window.location.href = `/?error=${encodeURIComponent(errorParam)}`;
      }, 2000);
      return;
    }

    if (!code) {
      setError("Missing authorization code");
      setTimeout(() => {
        window.location.href = "/?error=missing_code";
      }, 2000);
      return;
    }

    const doExchange = async () => {
      try {
        setStatus("Completing sign in...");
        const response = await exchangeCodeForTokens(code);

        if (!response.ok) {
          const result = await response.json().catch(() => null);
          throw new Error(result?.message || "Token exchange failed");
        }

        const result = await response.json();
        if (result.status && result.data) {
          setTokens(result.data.accessToken, result.data.refreshToken);
          setStatus("Sign in successful! Redirecting...");
          window.location.href = returnTo;
        } else {
          throw new Error(result.message || "Authentication failed");
        }
      } catch (err) {
        setError("Authentication failed. Redirecting...");
        setTimeout(() => {
          window.location.href = "/?error=token_exchange_failed";
        }, 2000);
      }
    };

    doExchange();
  }, []);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        flexDirection: "column",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {error ? (
        <>
          <p style={{ color: "#ef4444", fontSize: "16px" }}>{error}</p>
          <p style={{ color: "#6b7280", marginTop: "8px" }}>
            Redirecting to home...
          </p>
        </>
      ) : (
        <>
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "3px solid #e5e7eb",
              borderTopColor: "#EA4544",
              borderRadius: "50%",
              animation: "tbe-auth-spin 0.8s linear infinite",
            }}
          />
          <p style={{ color: "#6b7280", marginTop: "16px" }}>{status}</p>
          <style>{`@keyframes tbe-auth-spin { to { transform: rotate(360deg); } }`}</style>
        </>
      )}
    </div>
  );
}
