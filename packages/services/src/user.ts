import type { UserProfile } from "@tbe/interface";
import { sendRequest } from "@tbe/utils";

export const userService = {
  async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      const url = `/user?userId=${encodeURIComponent(userId)}`;

      const response = await sendRequest({
        method: "GET",
        url,
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
