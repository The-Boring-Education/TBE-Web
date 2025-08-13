import Link from 'next/link';
import { FaLock, FaRegCircle } from 'react-icons/fa';
import { IoIosCheckmarkCircle } from 'react-icons/io';

import { useAnalytics } from '@/hooks';
import type { QuestionLinkProps } from '@/interfaces';
import { trackEvent as sendEvent } from '@/utils/analytics';

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
}: QuestionLinkProps) => {
  const { trackEvent } = useAnalytics();
  let additionalClasses =
    currentQuestionId === questionId
      ? isCompleted
        ? 'text-dark font-semibold bg-green-200'
        : 'text-dark font-semibold bg-gray-200'
      : '';

  const iconColor = isCompleted ? 'text-green-500' : 'text-greyDark';

  if (frequency === 'Most Asked') {
    additionalClasses += ' border-l-4 border-primary';
  } else if (frequency === 'Asked Frequently') {
    additionalClasses += ' border-l-4 border-secondary';
  } else if (frequency === 'Asked Sometimes') {
    additionalClasses += ' border-l-4 border-greyDark';
  }

  return (
    <Link
      key={questionId}
      className={`flex items-center gap-1 w-full p-2 mb-1 rounded text-left pre-title ${
        isLocked
          ? 'text-gray-700 cursor-not-allowed'
          : `hover:bg-gray-200 hover:text-contentLight ${additionalClasses}`
      }`}
      href={href}
      data-analytics
      data-analytics-label={`question:${title}`}
      onClick={(e) => {
        if (isLocked) {
          e.preventDefault();
          return;
        }

        // Track question start
        trackEvent({
          action: 'QUESTION_START',
          category: 'Learning',
          label: 'Question Started',
          value: {
            questionId,
            questionTitle: title,
            frequency,
            isCompleted,
          },
        });

        try {
          sendEvent('question_start', {
            category: 'learning',
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
      <div className='flex-shrink-0'>
        {isLocked ? (
          <FaLock className='text-gray-400' size={20} />
        ) : isCompleted ? (
          <IoIosCheckmarkCircle className={iconColor} size={24} />
        ) : (
          <FaRegCircle className={iconColor} size={24} />
        )}
      </div>
      {title}
    </Link>
  );
};

export default QuestionLink;
