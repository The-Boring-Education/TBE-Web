import { routes } from "@tbe/constants";
import { useQuery } from "@tbe/query";
import { sendRequest } from "@tbe/utils";
import { transformDsaQuestion } from "@tbe/utils";

export const useStudyGuideTopic = (topicId: string) => {
  return useQuery({
    queryKey: ["study-guide", topicId],
    queryFn: async () => {
      const result = await sendRequest({
        url: `${routes.api.base}${routes.api.studyGuide(topicId)}`,
        method: "GET",
      });

      if (!result.status) {
        throw new Error(result.message || "Failed to fetch study guide");
      }

      const data = result.data;
      if (data?.questions && Array.isArray(data.questions)) {
        data.questions = data.questions.map(transformDsaQuestion);
      }

      return data;
    },
    enabled: !!topicId,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};
