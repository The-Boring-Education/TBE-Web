export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  image?: string;
}

/**
 * Get authenticated user from Next.js API request by decoding the JWT
 * from the tbe_access_token cookie or Authorization header.
 */
export const getAuthenticatedUser = async (
  req: any,
): Promise<AuthUser | null> => {
  try {
    const token =
      req.cookies?.tbe_access_token ||
      req.headers?.authorization?.replace("Bearer ", "");

    if (!token) return null;

    const parts = token.split(".");
    if (parts.length !== 3 || !parts[1]) return null;

    const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());

    if (payload.exp && payload.exp * 1000 < Date.now()) return null;

    return {
      id: payload.sub || "",
      email: payload.email || "",
      name: payload.name || undefined,
      image: payload.image || undefined,
    };
  } catch (error) {
    console.error("Error getting authenticated user:", error);
    return null;
  }
};

export const isAuthenticated = async (req: any): Promise<boolean> => {
  const user = await getAuthenticatedUser(req);
  return user !== null;
};

export const hasRole = async (
  req: any,
  _requiredRole: string,
): Promise<boolean> => {
  const user = await getAuthenticatedUser(req);
  if (!user) return false;
  return true;
};
