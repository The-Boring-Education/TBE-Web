import type { LearningChapterListProps } from "@tbe/interface";

import ChapterLink from "./ChapterLink";
import LearningSidebarList from "./LearningSidebarList";

const LearningChapterList = ({
  chapters,
  currentChapterId,
  isLocked = false,
  href,
  onChapterSelect,
  includeIndex = true,
}: LearningChapterListProps) => {
  return (
    <LearningSidebarList
      items={chapters ?? []}
      getKey={(item) => item?._id?.toString() ?? ""}
      renderItem={(item, index) => {
        const chapterId = item?._id?.toString();
        if (!chapterId) return null;

        const title = includeIndex ? `${index + 1} - ${item.name}` : item.name;

        return (
          <div className="flex items-center w-full">
            <ChapterLink
              chapterId={chapterId}
              content={item.content}
              currentChapterId={currentChapterId}
              handleChapterClick={onChapterSelect}
              href={href}
              isCompleted={item.isCompleted}
              name={title}
              isLocked={isLocked}
            />
          </div>
        );
      }}
    />
  );
};

export default LearningChapterList;
