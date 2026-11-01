import { routes } from "@tbe/constants";
import type { useQuestionStarredProps } from "@tbe/interface";
import { useEffect, useState } from "react";

import useApi from "./useApi";

const useQuestionStarred = ({
  userId,
  sheetId,
  questionId,
  initialIsStarred,
  onSuccess,
}: useQuestionStarredProps) => {
  const [isStarred, setIsStarred] = useState(initialIsStarred);
  const [isLoading, setIsLoading] = useState(false);
  const { makeRequest } = useApi(routes.api.markSheetQuestionAsStarred);

  useEffect(() => {
    setIsStarred(initialIsStarred);
  }, [initialIsStarred, questionId]);

  const toggleStar = async () => {
    if (!userId || !questionId || !sheetId) return;
    const oldState = isStarred;
    const newState = !oldState;
    setIsStarred(newState); // Optimistic update
    setIsLoading(true);
    try {
      const result = await makeRequest({
        method: "POST",
        url: routes.api.markSheetQuestionAsStarred,
        body: {
          userId,
          sheetId,
          questionId,
          isStarred: newState,
        },
      });
      if (result && (result.status === true || result.success === true)) {
        onSuccess?.(newState);
      } else {
        setIsStarred(oldState);
      }
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
