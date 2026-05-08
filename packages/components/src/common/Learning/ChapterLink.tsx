import type { ChapterLinkProps } from "@tbe/interface";
import { trackEvent } from "@tbe/utils";
import { FaLock, FaRegCircle } from "react-icons/fa";
import { IoIosCheckmarkCircle } from "react-icons/io";

import LinkText from "../Typography/Link";

const ChapterLink = ({
  href,
  chapterId,
  name,
  content,
  isCompleted,
  currentChapterId,
  handleChapterClick,
  isLocked,
}: ChapterLinkProps) => {
  const additionalClasses =
    currentChapterId === chapterId
      ? isCompleted
        ? "text-dark font-semibold bg-green-200"
        : "text-dark font-semibold bg-gray-200"
      : "";

  const iconColor = isCompleted ? "text-green-500" : "text-greyDark";

  return (
    <LinkText
      suppressGlobalUiClick
      analyticsId={`course_chapter_${chapterId}`}
      analyticsLabel={`chapter:${name}`}
      key={chapterId}
      className={`flex items-center gap-1 w-full p-2 rounded text-left pre-title ${
        isLocked
          ? "text-gray-700 cursor-not-allowed"
          : `hover:bg-gray-200 hover:text-contentLight ${additionalClasses}`
      }`}
      href={href}
      onClick={(e) => {
        if (isLocked) {
          e.preventDefault();
          return;
        }
        try {
          trackEvent("COURSE_CHAPTER_START", {
            category: "Course",
            label: name,
            chapterId,
          });
        } catch {
          /* ignore analytics errors */
        }
        handleChapterClick(content, chapterId);
      }}
    >
      {isLocked ? (
        <FaLock className="text-gray-400" size={20} />
      ) : isCompleted ? (
        <IoIosCheckmarkCircle className={iconColor} size={24} />
      ) : (
        <FaRegCircle className={iconColor} size={24} />
      )}
      {name}
    </LinkText>
  );
};

export default ChapterLink;
