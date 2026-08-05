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

  const activeClasses = isCurrent
    ? "bg-primary/10 text-primary font-semibold border-l-3 border-primary shadow-2xs"
    : "text-muted-foreground hover:bg-muted hover:text-foreground";

  return (
    <LinkText
      suppressGlobalUiClick
      analyticsId={`learning_question_${questionId}`}
      analyticsLabel={`question:${title}`}
      key={questionId}
      className={`flex items-start gap-2 w-full px-3 py-2 rounded-lg text-left text-xs sm:text-sm transition-all duration-150 ${isLocked
          ? "text-muted-foreground/60 cursor-not-allowed opacity-75"
          : activeClasses
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
        <Lock className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
      ) : isCompleted ? (
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
      ) : (
        <Circle
          className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${isCurrent ? "text-primary" : "text-muted-foreground/50"
            }`}
        />
      )}
      {isStarred && (
        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0 mt-0.5" />
      )}
      <span className="leading-snug break-words flex-1 font-medium">
        {title}
      </span>
    </LinkText>
  );
};

export default QuestionLink;
