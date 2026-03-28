import { routes } from "@tbe/constants";
import { useQuery } from "@tbe/query";
import { sendRequest } from "@tbe/utils";

export const useStudyGuideTopic = (topicId: string) => {
  const normalizedTopicId = topicId.toUpperCase().replace(/\s+/g, "_");

  return useQuery({
    queryKey: ["study-guide", normalizedTopicId],
    queryFn: async () => {
      const result = await sendRequest({
        url: `${routes.api.base}${routes.api.studyGuide(normalizedTopicId)}`,
        method: "GET",
      });

      if (!result.status) {
        throw new Error(result.message || "Failed to fetch study guide");
      }
      return result.data;
    },
    enabled: !!topicId,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};
