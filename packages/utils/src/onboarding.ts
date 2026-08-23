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

/**
 * Checks if a user has completed global unified onboarding across the TBE ecosystem.
 * When a user completes the unified onboarding flow, `isOnboarded: true` is set on the user record,
 * allowing seamless access across all ecosystem products without repeating onboarding.
 */
export function isUserGloballyOnboarded(userData: unknown): boolean {
  if (!userData || typeof userData !== "object") return false;
  const user = userData as Record<string, any>;

  // Check top-level isOnboarded flag
  return user.isOnboarded === true;
}

/**
 * Derives initial learning personalization data from existing cross-app user profile data
 * (e.g. if user onboarded on DSAYatra, PrepYatra, TechYatra, OnCampus).
 */
export function deriveInitialPersonalization(userData: unknown): {
  isCompleted: boolean;
  interests: string[];
  goals: string[];
  experienceLevel: string;
  weeklyCommitment: string;
  source: string;
} {
  if (!userData || typeof userData !== "object") {
    return {
      isCompleted: true,
      interests: ["web_dev"],
      goals: ["switch_careers"],
      experienceLevel: "beginner",
      weeklyCommitment: "regular",
      source: "default",
    };
  }

  const user = userData as Record<string, any>;
  const interests: string[] = [];
  let experienceLevel = "beginner";
  const goals: string[] = ["switch_careers"];

  // Check DSAYatra details
  if (user.dsaYatra) {
    if (
      user.dsaYatra.targetTopics &&
      Array.isArray(user.dsaYatra.targetTopics)
    ) {
      interests.push("computer_science");
      interests.push("web_dev");
    }
    if (user.dsaYatra.experienceLevel) {
      const exp = String(user.dsaYatra.experienceLevel).toLowerCase();
      if (exp.includes("senior") || exp.includes("5+")) {
        experienceLevel = "advanced";
      } else if (
        exp.includes("mid") ||
        exp.includes("junior") ||
        exp.includes("1-3") ||
        exp.includes("3-5")
      ) {
        experienceLevel = "intermediate";
      } else {
        experienceLevel = "beginner";
      }
    }
  }

  // Check PrepYatra details
  if (user.prepYatra) {
    if (user.prepYatra.preferredCategories) {
      interests.push("computer_science");
    }
    if (user.prepYatra.experienceLevel) {
      const exp = String(user.prepYatra.experienceLevel).toLowerCase();
      if (exp.includes("senior")) experienceLevel = "advanced";
      else if (exp.includes("mid") || exp.includes("junior")) {
        experienceLevel = "intermediate";
      }
    }
  }

  // Check TechYatra details
  if (user.techYatra?.focus) {
    if (user.techYatra.focus === "roadmaps") interests.push("web_dev");
    else if (user.techYatra.focus === "projects") interests.push("web_dev");
    else if (user.techYatra.focus === "interviews") {
      interests.push("computer_science");
    }
  }

  // Check Oncampus details
  if (user.oncampus) {
    interests.push("computer_science");
  }

  // Fallback interest if none found
  if (interests.length === 0) {
    interests.push("web_dev");
  }

  const uniqueInterests = Array.from(new Set(interests));

  return {
    isCompleted: true,
    interests: uniqueInterests,
    goals,
    experienceLevel,
    weeklyCommitment: "regular",
    source: "cross_app_onboarding",
  };
}
