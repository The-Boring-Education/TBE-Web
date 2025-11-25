import {
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
} from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { usePathname } from 'next/navigation';
import { Fragment, useEffect, useRef } from 'react';

import type { PopoverContainerProps } from '@tbe/interface';

const PopoverContainer = ({
  label,
  children,
  panelClasses,
  isOpen: open,
  onToggle,
}: PopoverContainerProps) => {
  const pathname = usePathname();
  const popoverButtonRef = useRef<HTMLButtonElement>(null);
  const previousPathname = useRef(pathname);

  useEffect(() => {
    // Close popover when route changes (works with both Pages and App Router)
    if (pathname !== previousPathname.current && open) {
      onToggle();
      previousPathname.current = pathname;
    }
  }, [pathname, open, onToggle]);

  return (
    <Popover className='relative'>
      {({ open }) => (
        <Fragment>
          <PopoverButton
            ref={popoverButtonRef}
            className='inline-flex items-center text-base text-black outline-none'
            onClick={onToggle}
          >
            <span>{label}</span>
            <ChevronDownIcon aria-hidden='true' className='h-3 w-3' />
          </PopoverButton>

          <Transition
            as={Fragment}
            enter='transition ease-out duration-200'
            enterFrom='opacity-0 translate-y-1'
            enterTo='opacity-100 translate-y-0'
            leave='transition ease-in duration-150'
            leaveFrom='opacity-100 translate-y-0'
            leaveTo='opacity-0 translate-y-1'
            show={open}
          >
            <PopoverPanel
              className={`absolute z-10 mt-2 flex w-screen max-w-max -translate-x-1/2 ${panelClasses}`}
            >
              <div className='overflow-hidden rounded-2 bg-white text-sm leading-6 shadow-lg ring-1 ring-gray-900/5'>
                {children}
              </div>
            </PopoverPanel>
          </Transition>
        </Fragment>
      )}
    </Popover>
  );
};

export default PopoverContainer;
