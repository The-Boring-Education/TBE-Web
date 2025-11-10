import {
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
} from '@headlessui/react';
import { Fragment, useEffect, useState } from 'react';

import { UserLevelProgressContainer } from '@tbe/components';
import { useGamification, useUser } from '@tbe/hooks';

const UserPointButton = () => {
  const [isClient, setIsClient] = useState(false);
  const { isAuth, loading } = useUser();
  const {
    points,
    currentLevel,
    currentLevelName,
    nextLevelName,
    pointsLeftToNextLevel,
    percentageProgress,
  } = useGamification();

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient || !isAuth || loading) return null;

  return (
    <Popover className='relative'>
      <PopoverButton className='flex p-1 w-10 h-10 justify-center items-center rounded-full border-2 border-primary text-primary hover:text-white hover:bg-primary outline-none font-bold'>
        <span className='w-full h-full flex text-xs items-center justify-center'>
          {points}
        </span>
      </PopoverButton>
      <Transition
        as={Fragment}
        enter='transition ease-out duration-200'
        enterFrom='opacity-0 translate-y-1'
        enterTo='opacity-100 translate-y-0'
        leave='transition ease-in duration-150'
        leaveFrom='opacity-100 translate-y-0'
        leaveTo='opacity-0 translate-y-1'
      >
        <PopoverPanel className='absolute z-10 mt-1 flex w-screen max-w-max md:-translate-x-2/3 -translate-x-2/4'>
          <UserLevelProgressContainer
            currentLevel={currentLevel}
            currentLevelName={currentLevelName}
            nextLevelName={nextLevelName}
            percentageProgress={percentageProgress}
            points={points}
            pointsLeftToNextLevel={pointsLeftToNextLevel}
          />
        </PopoverPanel>
      </Transition>
    </Popover>
  );
};

export default UserPointButton;
