import type { UserProfile } from "@tbe/interface";
import { sendRequest } from "@tbe/utils";

export const userService = {
  async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      const base = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
      const url = `/user?userId=${encodeURIComponent(userId)}`;

      const response = await sendRequest({
        method: "GET",
        url,
        baseURL: base,
      });

      if (response.status && response.data) {
        return response.data as UserProfile;
      }

      return null;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  },
};
