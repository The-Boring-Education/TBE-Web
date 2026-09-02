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
    ? "bg-primary/10 text-foreground font-medium rounded-xl shadow-2xs"
    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground rounded-xl";

  return (
    <LinkText
      suppressGlobalUiClick
      analyticsId={`course_chapter_${chapterId}`}
      analyticsLabel={`chapter:${name}`}
      key={chapterId}
      className={`flex items-start gap-2.5 w-full px-3.5 py-2.5 rounded-xl text-left text-xs sm:text-sm font-primary transition-all duration-150 ${
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
        <Lock className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0 mt-0.5 stroke-[1.5]" />
      ) : isCompleted ? (
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5 stroke-[1.5]" />
      ) : isCurrent ? (
        <div className="w-3.5 h-3.5 rounded-full border-[1.25px] border-primary flex items-center justify-center shrink-0 mt-0.5">
          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
        </div>
      ) : (
        <Circle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-muted-foreground/35 stroke-[1.25]" />
      )}
      <span className="leading-snug break-words flex-1 font-medium">
        {name}
      </span>
    </LinkText>
  );
};

export default ChapterLink;
