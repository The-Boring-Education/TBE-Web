import { routes } from "@tbe/constants";
import { sendRequest } from "@tbe/utils";

export interface OncampusPreferences {
  duration: string; // "1Month" | "3Months" | "6Months" | "1Year"
  offCampus: boolean;
}

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
