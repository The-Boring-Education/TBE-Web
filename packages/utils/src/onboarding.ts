import { sendRequest } from "./api";

/**
 * Onboarding-specific utility functions
 * Extracted from onboarding app to shared utils
 *
 * Username availability uses GET `/user/onboarding?userName=` (see apps/api user/onboarding.ts).
 * Pass `apiBaseUrl` in Vite or non-Next clients so `sendRequest` hits the API directly.
 */

// Prep-yatra's "goal" has been stored in a few different raw formats over time
// (e.g. "6_months", "6Months"), so map the known ones explicitly and fall back
// to a generic humanization for anything else.
const GOAL_TIMELINE_LABELS: Record<string, string> = {
  "3_months": "3 Months",
  "6_months": "6 Months",
  "1_year": "1 Year",
  "3Months": "3 Months",
  "6Months": "6 Months",
  "1Year": "1 Year",
};

export function formatGoalTimelineLabel(goal?: string | null): string {
  if (!goal) return "";
  if (GOAL_TIMELINE_LABELS[goal]) return GOAL_TIMELINE_LABELS[goal];

  return goal
    .replace(/_/g, " ")
    .replace(/([0-9])([A-Za-z])/g, "$1 $2")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
}

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
