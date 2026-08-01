"use client";

import { useEffect, useState } from "react";

import { getAuthApiUrl } from "../config";
import { PENDING_AUTH_ANALYTICS_KEY } from "../constants";
import { setTokens } from "../token";

/**
 * Exchange the auth code for tokens.
 * Tries same-origin proxy first (for Next.js apps with CSP), falls back to
 * direct API call (for Vite apps without proxy route).
 */
async function exchangeCodeForTokens(code: string): Promise<Response> {
  // Try same-origin proxy first — avoids CSP issues in Next.js apps
  const proxyUrl = "/api/proxy/auth/token";
  const proxyResponse = await fetch(proxyUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });

  // If proxy works or returns a real error (not 404), use that response
  if (proxyResponse.status !== 404) {
    return proxyResponse;
  }

  // Proxy route doesn't exist (Vite apps) — call API directly
  const apiUrl = getAuthApiUrl();
  return fetch(`${apiUrl}/auth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });
}

export const AuthCallback = () => {
  const [status, setStatus] = useState("Completing sign in...");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const errorParam = params.get("error");
    const returnTo = params.get("returnTo") || "/";

    if (errorParam) {
      setError(`Authentication error: ${errorParam}`);
      setTimeout(() => {
        window.location.href = `/login?error=${errorParam}`;
      }, 2000);
      return;
    }

    if (!code) {
      setError("Missing authorization code");
      setTimeout(() => {
        window.location.href = "/login?error=missing_code";
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
          const userId = result.data.user?.id;
          if (userId) {
            sessionStorage.setItem(
              PENDING_AUTH_ANALYTICS_KEY,
              JSON.stringify({
                userId,
                isNewUser: result.data.isNewUser === true,
              }),
            );
          }
          setStatus("Sign in successful! Redirecting...");
          window.location.href = returnTo;
        } else {
          throw new Error(result.message || "Authentication failed");
        }
      } catch (err) {
        console.error("Auth callback error:", err);
        setError("Authentication failed. Redirecting to login...");
        setTimeout(() => {
          window.location.href = "/login?error=token_exchange_failed";
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
            Redirecting to login...
          </p>
        </>
      ) : (
        <>
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "3px solid #e5e7eb",
              borderTopColor: "#3b82f6",
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
};
