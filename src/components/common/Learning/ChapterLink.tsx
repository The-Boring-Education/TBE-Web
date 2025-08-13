import Link from 'next/link';
import { FaLock, FaRegCircle } from 'react-icons/fa';
import { IoIosCheckmarkCircle } from 'react-icons/io';

import type { ChapterLinkProps } from '@/interfaces';
import { trackEvent } from '@/utils/analytics';

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
        ? 'text-dark font-semibold bg-green-200'
        : 'text-dark font-semibold bg-gray-200'
      : '';

  const iconColor = isCompleted ? 'text-green-500' : 'text-greyDark';

  return (
    <Link
      key={chapterId}
      className={`flex items-center gap-1 w-full p-2 rounded text-left pre-title ${
        isLocked
          ? 'text-gray-700 cursor-not-allowed'
          : `hover:bg-gray-200 hover:text-contentLight ${additionalClasses}`
      }`}
      href={href}
      data-analytics
      data-analytics-label={`chapter:${name}`}
      onClick={(e) => {
        if (isLocked) {
          e.preventDefault();
          return;
        }
        try {
          trackEvent('COURSE_CHAPTER_START', {
            category: 'Course',
            label: name,
            chapterId,
          });
        } catch {}
        handleChapterClick(content);
      }}
    >
      {isLocked ? (
        <FaLock className='text-gray-400' size={20} />
      ) : isCompleted ? (
        <IoIosCheckmarkCircle className={iconColor} size={24} />
      ) : (
        <FaRegCircle className={iconColor} size={24} />
      )}
      {name}
    </Link>
  );
};

export default ChapterLink;
