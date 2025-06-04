import Link from 'next/link';
import { FaRegCircle } from 'react-icons/fa';
import { IoIosCheckmarkCircle } from 'react-icons/io';

import type { ChapterLinkProps } from '@/interfaces';

const ChapterLink = ({
  href,
  chapterId,
  name,
  content,
  isCompleted,
  currentChapterId,
  handleChapterClick,
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
      className={`flex items-center gap-1 w-full p-2 rounded text-left pre-title hover:bg-gray-200 hover:text-contentLight ${additionalClasses}`}
      href={href}
      onClick={() => handleChapterClick(content)}
    >
      {isCompleted ? (
        <IoIosCheckmarkCircle className={iconColor} size={24} />
      ) : (
        <FaRegCircle className={iconColor} size={24} />
      )}
      {name}
    </Link>
  );
};

export default ChapterLink;
