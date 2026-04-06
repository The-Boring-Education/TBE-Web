import { routes } from "@tbe/constants";
import { sendRequest } from "@tbe/utils";

export interface OncampusPreferences {
  duration: string; // "1Month" | "3Months" | "6Months" | "1Year"
  offCampus: boolean;
}

export const ONCAMPUS_DURATION_OPTIONS = [
  { value: "1Month", label: "1 Month", description: "Quick prep", icon: "⚡" },
  {
    value: "3Months",
    label: "3 Months",
    description: "Short-term",
    icon: "📅",
  },
  {
    value: "6Months",
    label: "6 Months",
    description: "Standard prep",
    icon: "🎯",
    popular: true,
  },
  { value: "1Year", label: "1 Year", description: "Long-term", icon: "🌟" },
];

export const saveOncampusPreferences = async (
  userId: string,
  preferences: OncampusPreferences,
): Promise<boolean> => {
  try {
    const res = await sendRequest({
      url: `${routes.api.base}${routes.api.oncampusPrefs}`,
      method: "PATCH",
      body: { userId, ...preferences },
    });
    return res?.status === true;
  } catch {
    return false;
  }
};

export const getOncampusPreferences = async (
  userId: string,
): Promise<OncampusPreferences | null> => {
  try {
    const res = await sendRequest({
      url: `${routes.api.base}${routes.api.oncampusPrefs}?userId=${userId}`,
      method: "GET",
    });
    if (res?.status && res?.data) {
      return res.data as OncampusPreferences;
    }
    return null;
  } catch {
    return null;
  }
};
