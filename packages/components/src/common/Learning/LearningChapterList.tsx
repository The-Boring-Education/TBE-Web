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
  className = "",
}: LearningChapterListProps) => {
  return (
    <LearningSidebarList
      items={chapters ?? []}
      className={className}
      getKey={(item) => item?._id?.toString() ?? ""}
      renderItem={(item, index) => {
        const chapterId = item?._id?.toString();
        if (!chapterId) return null;

        const title = includeIndex ? `${index + 1}. ${item.name}` : item.name;
        const chapterHref =
          typeof href === "function" ? href(item, index) : href;

        return (
          <div className="flex items-center w-full">
            <ChapterLink
              chapterId={chapterId}
              content={item.content}
              currentChapterId={currentChapterId}
              handleChapterClick={onChapterSelect}
              href={chapterHref}
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
