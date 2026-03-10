import { routes } from "@tbe/constants";
import { useApi } from "@tbe/hooks";
import type { useQuestionStarredProps } from "@tbe/interface";
import { useEffect, useState } from "react";

const useQuestionStarred = ({
  userId,
  sheetId,
  questionId,
  initialIsStarred,
}: useQuestionStarredProps) => {
  const [isStarred, setIsStarred] = useState(initialIsStarred);
  const [isLoading, setIsLoading] = useState(false);
  const { makeRequest } = useApi(routes.api.markSheetQuestionAsStarred);

  useEffect(() => {
    setIsStarred(initialIsStarred);
  }, [initialIsStarred, questionId]);

  const toggleStar = async () => {
    if (!userId) return;
    const oldState = isStarred;
    setIsStarred(!isStarred); // Optimistic update
    setIsLoading(true);
    try {
      const result = await makeRequest({
        method: "POST",
        url: routes.api.markSheetQuestionAsStarred,
        body: {
          userId,
          sheetId,
          questionId,
          isStarred: !isStarred,
        },
      });
      if (!result.status) setIsStarred(oldState);
    } catch (e) {
      console.error(e);
      setIsStarred(oldState);
    } finally {
      setIsLoading(false);
    }
  };

  return { isStarred, isLoading, toggleStar, setIsStarred };
};

export default useQuestionStarred;
