import { envConfig } from "@/lib/constants";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";

const getCredentials = () => {
  const clientId = envConfig.GOOGLE_AUTH_CLIENT_ID;
  const clientSecret = envConfig.GOOGLE_AUTH_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error(
      "GOOGLE_AUTH_CLIENT_ID and GOOGLE_AUTH_CLIENT_SECRET are required",
    );
  }
  return { clientId, clientSecret };
};

const getCallbackUrl = (): string => {
  const baseUrl = envConfig.AUTH_URL;
  if (!baseUrl) {
    throw new Error(
      "AUTH_URL must be set to the API app base URL (e.g. https://api.example.com) for OAuth callback",
    );
  }
  return `${baseUrl.replace(/\/$/, "")}/api/v1/auth/callback/google`;
};

export const buildGoogleAuthUrl = (state: string): string => {
  const { clientId } = getCredentials();
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getCallbackUrl(),
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "offline",
    prompt: "select_account",
  });
  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
};

interface GoogleTokenResponse {
  access_token: string;
  id_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in: number;
}

export const exchangeCodeForTokens = async (
  code: string,
): Promise<GoogleTokenResponse> => {
  const { clientId, clientSecret } = getCredentials();

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: getCallbackUrl(),
      grant_type: "authorization_code",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Google token exchange failed: ${error}`);
  }

  return response.json();
};

export interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  picture?: string;
  verified_email: boolean;
}

export const fetchGoogleUserInfo = async (
  accessToken: string,
): Promise<GoogleUserInfo> => {
  const response = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch Google user info");
  }

  return response.json();
};
