import { ANALYTICS_EVENTS } from "@tbe/constants";
import type { ChapterLinkProps } from "@tbe/interface";
import { trackEvent } from "@tbe/utils";
import { CheckCircle2, Circle, Lock } from "lucide-react";

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
  const isCurrent = currentChapterId === chapterId;

  const activeClasses = isCurrent
    ? "bg-primary/10 text-primary font-semibold border-l-3 border-primary shadow-2xs"
    : "text-muted-foreground hover:bg-muted hover:text-foreground";

  return (
    <LinkText
      suppressGlobalUiClick
      analyticsId={`course_chapter_${chapterId}`}
      analyticsLabel={`chapter:${name}`}
      key={chapterId}
      className={`flex items-start gap-2 w-full px-3 py-2 rounded-lg text-left text-xs sm:text-sm transition-all duration-150 ${
        isLocked
          ? "text-muted-foreground/60 cursor-not-allowed opacity-75"
          : activeClasses
      }`}
      href={href}
      onClick={(e) => {
        if (isLocked) {
          e.preventDefault();
          return;
        }
        try {
          trackEvent(ANALYTICS_EVENTS.COURSE_CHAPTER_START, {
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
        <Lock className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
      ) : isCompleted ? (
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
      ) : (
        <Circle
          className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
            isCurrent ? "text-primary" : "text-muted-foreground/50"
          }`}
        />
      )}
      <span className="leading-snug break-words flex-1 font-medium">
        {name}
      </span>
    </LinkText>
  );
};

export default ChapterLink;
