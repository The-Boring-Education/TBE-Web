import jwt from "jsonwebtoken";

const getSecret = (): string => {
  const secret = process.env.AUTH_JWT_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error(
      "AUTH_JWT_SECRET or NEXTAUTH_SECRET environment variable is required",
    );
  }
  return secret;
};

export interface AccessTokenPayload {
  sub: string;
  email: string;
  name: string;
  image?: string;
  isOnboarded?: boolean;
  type: "access";
}

export interface RefreshTokenPayload {
  sub: string;
  type: "refresh";
}

export interface AuthCodePayload {
  sub: string;
  type: "auth_code";
  redirect_uri: string;
}

export interface OAuthStatePayload {
  redirect_uri: string;
  provider: string;
  type: "oauth_state";
}

export const signAccessToken = (
  payload: Omit<AccessTokenPayload, "type">,
): string => {
  return jwt.sign({ ...payload, type: "access" }, getSecret(), {
    expiresIn: "24h",
  });
};

export const signRefreshToken = (userId: string): string => {
  return jwt.sign(
    { sub: userId, type: "refresh" } satisfies RefreshTokenPayload,
    getSecret(),
    { expiresIn: "30d" },
  );
};

export const signAuthCode = (userId: string, redirectUri: string): string => {
  return jwt.sign(
    {
      sub: userId,
      type: "auth_code",
      redirect_uri: redirectUri,
    } satisfies AuthCodePayload,
    getSecret(),
    { expiresIn: "5m" },
  );
};

export const signOAuthState = (
  redirectUri: string,
  provider: string,
): string => {
  return jwt.sign(
    {
      redirect_uri: redirectUri,
      provider,
      type: "oauth_state",
    } satisfies OAuthStatePayload,
    getSecret(),
    { expiresIn: "10m" },
  );
};

export const verifyToken = <T = Record<string, unknown>>(token: string): T => {
  return jwt.verify(token, getSecret()) as T;
};

export const decodeToken = <T = Record<string, unknown>>(
  token: string,
): T | null => {
  try {
    return jwt.decode(token) as T;
  } catch {
    return null;
  }
};
