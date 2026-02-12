import { Popover, Transition } from '@headlessui/react';
import { Image, Link } from '@tbe/components';
import { signOut, useSession } from 'next-auth/react';
import { Fragment } from 'react';

interface UserAvatarProps {
  dashboardRoute?: string;
}

const UserAvatar = ({ dashboardRoute }: UserAvatarProps = {}) => {
  const session = useSession();

  if (session.status === 'loading') return null;
  if (session.status !== 'authenticated') return null;

  // Use provided dashboard route or default to platform app route
  const finalDashboardRoute = dashboardRoute || '/user/dashboard';

  return (
    <div className='relative'>
      <Popover className='relative'>
        {({ open }) => (
          <>
            <Popover.Button
              aria-label='User profile menu'
              className={`
                ${open ? 'ring-2 ring-primary' : ''}
                outline-none p-0 w-[40px] h-[40px] border-[2px] border-gray-300 relative overflow-hidden flex-shrink-0 flex items-center justify-center
                hover:opacity-80 transition focus:outline-none rounded-full`}
            >
              {session.data.user?.image ? (
                <div
                  className='w-[40px] h-[40px] relative rounded-[50%] overflow-hidden'
                  style={{ position: 'relative' }}
                >
                  <Image
                    alt={session.data.user?.name || ''}
                    className='w-[40px] h-[40px] rounded-[50%]'
                    fullHeight={false}
                    fullWidth={false}
                    src={session.data.user.image}
                  />
                </div>
              ) : (
                <div className='w-[40px] h-[40px] rounded-[50%] bg-gray-200 flex items-center justify-center text-gray-500 text-xs font-semibold'>
                  {session.data.user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
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
              <Popover.Panel className="absolute z-50 mt-1 right-0">
                <div className='bg-white rounded shadow-md ring-1 ring-gray-200 py-1 px-2 space-y-1'>
                  <Link
                    className='text-xs text-gray-700 hover:text-primary transition block'
                    href={finalDashboardRoute}
                  >
                    Dashboard
                  </Link>
                  <button
                    className='text-xs text-gray-700 hover:text-primary transition text-left block'
                    onClick={() => {
                      signOut();
                    }}
                  >
                    Logout
                  </button>
                </div>
              </Popover.Panel>
            </Transition>
          </>
        )}
      </Popover>
    </div>
  );
};

export default UserAvatar;