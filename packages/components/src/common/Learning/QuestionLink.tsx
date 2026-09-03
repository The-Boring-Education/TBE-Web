import { ANALYTICS_EVENTS } from "@tbe/constants";
import { useAnalytics } from "@tbe/hooks";
import type { QuestionLinkProps } from "@tbe/interface";
import { trackEvent as sendEvent } from "@tbe/utils";
import { CheckCircle2, Circle, Lock, Star } from "lucide-react";

import LinkText from "../Typography/Link";

const QuestionLink = ({
  href,
  questionId,
  title,
  question,
  isCompleted,
  currentQuestionId,
  frequency,
  isLocked = false,
  handleQuestionClick,
  theme = "light",
  isStarred,
}: QuestionLinkProps) => {
  const { trackEvent } = useAnalytics();
  const isCurrent = currentQuestionId === questionId;
  const isDark = theme === "dark";

  const activeClasses = isDark
    ? isCurrent
      ? "bg-primary/15 !text-white font-semibold border border-primary/30 shadow-[0_0_12px_rgba(255,87,87,0.15)] rounded-xl"
      : "!text-gray-300 hover:bg-white/[0.06] hover:!text-white rounded-xl"
    : isCurrent
      ? "bg-primary/10 !text-primary font-semibold border border-primary/20 shadow-xs rounded-xl"
      : "!text-gray-600 hover:bg-gray-100/80 hover:!text-gray-900 rounded-xl";

  const lockedClasses = isDark
    ? "!text-gray-500/60 cursor-not-allowed opacity-60"
    : "!text-gray-400 cursor-not-allowed opacity-60";

  return (
    <LinkText
      suppressGlobalUiClick
      analyticsId={`learning_question_${questionId}`}
      analyticsLabel={`question:${title}`}
      key={questionId}
      className={`flex items-start gap-2.5 w-full px-3.5 py-2.5 rounded-xl text-left text-xs sm:text-sm font-primary transition-all duration-150 ${
        isLocked ? lockedClasses : activeClasses
      }`}
      href={href}
      onClick={(e) => {
        if (isLocked) {
          e.preventDefault();
          return;
        }

        e.preventDefault();

        trackEvent({
          action: ANALYTICS_EVENTS.QUESTION_START,
          category: "Learning",
          label: "Question Started",
          value: {
            questionId,
            questionTitle: title,
            frequency,
            isCompleted,
          },
        });

        try {
          sendEvent(ANALYTICS_EVENTS.QUESTION_START, {
            category: "learning",
            questionId,
            title,
            frequency,
          });
        } catch {
          /* ignore analytics errors */
        }

        handleQuestionClick(question, questionId);
      }}
    >
      {isLocked ? (
        <Lock
          className={`w-3.5 h-3.5 ${isDark ? "text-gray-500/60" : "text-gray-400"} shrink-0 mt-0.5 stroke-[1.5]`}
        />
      ) : isCompleted ? (
        <CheckCircle2
          className={`w-3.5 h-3.5 ${isDark ? "text-emerald-400" : "text-emerald-500"} shrink-0 mt-0.5 stroke-[1.5]`}
        />
      ) : isCurrent ? (
        <div
          className={`w-3.5 h-3.5 rounded-full border-[1.5px] border-primary flex items-center justify-center shrink-0 mt-0.5 ${isDark ? "shadow-[0_0_8px_rgba(255,87,87,0.35)]" : ""}`}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
        </div>
      ) : (
        <Circle
          className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${isDark ? "text-gray-600" : "text-gray-400"} stroke-[1.25]`}
        />
      )}
      {isStarred && (
        <Star
          className={`w-3.5 h-3.5 ${isDark ? "text-amber-400 fill-amber-400" : "text-amber-500 fill-amber-500"} shrink-0 mt-0.5`}
        />
      )}
      <span className="leading-snug break-words flex-1 font-medium">
        {title}
      </span>
    </LinkText>
  );
};

export default QuestionLink;
