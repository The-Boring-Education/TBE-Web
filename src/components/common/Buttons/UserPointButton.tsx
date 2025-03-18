import { Fragment } from 'react';
import { Popover, Transition } from '@headlessui/react';
import { LevelProgressCard } from '@/components';
import { useUser } from '@/hooks';

const UserPointButton = () => {
  const { user, isAuth, loading } = useUser();

  if (!isAuth || loading) return null;

  return (
    <Popover className='relative p-0 w-[40px] h-[40px] rounded-[50%] border-[2px]'>
      {({ open }) => (
        <>
          <Popover.Button className='outline-none rounded-full border-2 border-primary p-2 w-[40px] h-[40px] flex items-center justify-center text-primary'>
            {user?.points ?? 0}
            {/* Replace `points` with the actual property from your User model */}
          </Popover.Button>

          <Transition
            as={Fragment}
            enter='transition ease-out duration-200'
            enterFrom='opacity-0 translate-y-1'
            enterTo='opacity-100 translate-y-0'
            leave='transition ease-in duration-150'
            leaveFrom='opacity-100 translate-y-0'
            leaveTo='opacity-0 translate-y-1'
          >
            <Popover.Panel className='absolute z-10 mt-1 flex w-screen max-w-max -translate-x-2/3'>
              <LevelProgressCard />
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
};

export default UserPointButton;
