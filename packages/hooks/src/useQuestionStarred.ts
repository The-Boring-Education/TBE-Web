  import { routes } from '@tbe/constants';
import { useApi } from '@tbe/hooks';
import type { useQuestionStarredProps } from '@tbe/interface';
import { useState } from 'react';

const useQuestionStarred = ({
  userId,
  sheetId,
  questionId,
  initialIsStarred,
}: useQuestionStarredProps) => {
  const [isStarred, setIsStarred] = useState(initialIsStarred);
  const [isLoading, setIsLoading] = useState(false);
  const { makeRequest } = useApi(routes.api.markSheetQuestionAsStarred);

  const toggleStar = async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const result = await makeRequest({
        method: 'POST',
        url: routes.api.markSheetQuestionAsStarred,
        body: {
          userId,
          sheetId,
          questionId,
          isStarred: !isStarred,
        },
      });
      if (result.status) setIsStarred(!isStarred);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return { isStarred, isLoading, toggleStar, setIsStarred };
};

export default useQuestionStarred;
