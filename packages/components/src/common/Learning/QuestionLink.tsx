import { useAnalytics } from "@tbe/hooks";
import type { QuestionLinkProps } from "@tbe/interface";
import { trackEvent as sendEvent } from "@tbe/utils";
import Link from "next/link";
import { FaLock, FaRegCircle, FaStar } from "react-icons/fa";
import { IoIosCheckmarkCircle } from "react-icons/io";

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

  // Theme-based styling
  const isDark = theme === "dark";
  const defaultTextColor = isDark ? "text-contentDark" : "";
  const hoverBgClass = isDark ? "hover:bg-gray-800" : "hover:bg-gray-200";
  const hoverTextClass = isDark
    ? "hover:text-contentDark"
    : "hover:text-contentLight";

  let additionalClasses =
    currentQuestionId === questionId
      ? isDark
        ? "bg-[#111] border-gray-700/60 shadow-[0_0_12px_rgba(0,0,0,0.25)] text-white font-medium"
        : "bg-gray-100 border-gray-300 shadow-sm text-dark font-medium"
      : isCompleted
        ? "border-transparent opacity-80"
        : "border-transparent";

  const iconColor = isCompleted
    ? isDark
      ? "text-green-400"
      : "text-green-500"
    : isDark
      ? "text-gray-400"
      : "text-greyDark";

  // Frequency borders removed as per UI request


  return (
    <Link
      key={questionId}
      className={`flex items-center gap-1 w-full p-2 mb-1 rounded border text-left pre-title ${
        isLocked
          ? isDark
            ? "text-gray-500 cursor-not-allowed border-transparent"
            : "text-gray-700 cursor-not-allowed border-transparent"
          : `${defaultTextColor} ${hoverBgClass} ${hoverTextClass} ${additionalClasses}`
      }`}
      href={href}
      data-analytics
      data-analytics-label={`question:${title}`}
      onClick={(e) => {
        if (isLocked) {
          e.preventDefault();
          return;
        }

        e.preventDefault(); // Prevent full page navigation to support shallow routing

        // Track question start
        trackEvent({
          action: "QUESTION_START",
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
          sendEvent("question_start", {
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
      <div className="flex-shrink-0 flex items-center gap-1">
        {isLocked ? (
          <FaLock
            className={isDark ? "text-gray-500" : "text-gray-400"}
            size={20}
          />
        ) : isCompleted ? (
          <IoIosCheckmarkCircle className={iconColor} size={24} />
        ) : (
          <FaRegCircle className={iconColor} size={24} />
        )}
        {isStarred && (
          <FaStar
            className="text-yellow-400"
            style={{ fontSize: "0.9em" }}
            title="Starred"
          />
        )}
      </div>
      {title}
    </Link>
  );
};

export default QuestionLink;
