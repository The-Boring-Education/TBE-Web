import { sendRequest } from "./api";

/**
 * Onboarding-specific utility functions
 * Extracted from onboarding app to shared utils
 *
 * Username availability uses GET `/user/onboarding?userName=` (see apps/api user/onboarding.ts).
 * Pass `apiBaseUrl` in Vite or non-Next clients so `sendRequest` hits the API directly.
 */

export async function checkUsernameAvailable(
  username: string,
  token?: string,
  apiBaseUrl?: string,
): Promise<boolean> {
  try {
    const response = await sendRequest({
      url: `/user/onboarding?userName=${encodeURIComponent(username)}`,
      method: "GET",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      baseURL: apiBaseUrl,
    });

    return Boolean((response as { status?: boolean }).status === true);
  } catch {
    return false;
  }
}

export async function getOnboardingUser(
  userId: string,
  token?: string,
  apiBaseUrl?: string,
): Promise<unknown> {
  try {
    const response = await sendRequest({
      url: `/user?userId=${encodeURIComponent(userId)}`,
      method: "GET",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      baseURL: apiBaseUrl,
    });

    const r = response as { data?: unknown; success?: boolean };
    if (r.success === false) {
      return null;
    }
    return r.data ?? null;
  } catch {
    return null;
  }
}
