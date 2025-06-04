import { Disclosure } from '@headlessui/react';
import { FaRegCircle } from 'react-icons/fa';
import { IoIosCheckmarkCircle } from 'react-icons/io';

import { Link } from '@/components';

import type { AccordionLinkItemProps } from '@/interfaces';

const AccordionLinkItem = ({
  label,
  href,
  className,
  isCompleted,
  isActive,
  onClick,
}: AccordionLinkItemProps) => {
  const iconColor = isCompleted ? 'text-green-500' : 'text-greyDark';

  const additionalClasses = isActive
    ? isCompleted
      ? 'text-dark font-semibold bg-green-200'
      : 'text-dark font-semibold bg-gray-200'
    : '';

  return (
    <Link className='w-full' href={href}>
      <Disclosure.Panel
        className={`${className} flex items-center gap-1 p-2 rounded text-left pre-title text-greyDark hover:bg-gray-200 hover:text-primary ${additionalClasses}`}
        onClick={onClick}
      >
        <div className='flex-shrink-0'>
          {isCompleted ? (
            <IoIosCheckmarkCircle className={iconColor} size={24} />
          ) : (
            <FaRegCircle className={iconColor} size={24} />
          )}
        </div>
        {label}
      </Disclosure.Panel>
    </Link>
  );
};

export default AccordionLinkItem;
