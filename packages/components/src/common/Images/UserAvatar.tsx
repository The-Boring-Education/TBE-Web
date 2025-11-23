import { Popover, Transition } from '@headlessui/react';
import { signOut, useSession } from 'next-auth/react';
import { Fragment, useEffect } from 'react';

import { Image, Link } from '@tbe/components';
import { TOP_NAVIGATION } from '@tbe/constants';

interface UserAvatarProps {
  dashboardRoute?: string;
}

const UserAvatar = ({ dashboardRoute }: UserAvatarProps = {}) => {
  const session = useSession();

  if (session.status === 'loading') return null;
  if (session.status !== 'authenticated') return null;

  // Use provided dashboard route or default to platform app route
  const finalDashboardRoute = dashboardRoute || '/user/dashboard';

  // Map user navigation links with correct dashboard route
  const userNavLinks = TOP_NAVIGATION.user.map((link) => {
    if (link.href.includes('/user/dashboard') || link.href.includes('/dashboard')) {
      return {
        ...link,
        href: finalDashboardRoute,
      };
    }
    return link;
  });

  return (
    <div className='relative'>
      <Popover className='relative'>
        {({ open }) => (
          <>
            <Popover.Button
              className={`
                ${open ? 'ring-2 ring-primary' : ''}
                outline-none p-0 w-[40px] h-[40px] rounded-[50%] border-[2px] border-gray-300 relative overflow-hidden flex-shrink-0 flex items-center justify-center`}
            >
              {session.data.user?.image ? (
                <div 
                  className='w-[40px] h-[40px] relative rounded-[50%] overflow-hidden'
                  style={{ position: 'relative' }}
                >
                  <Image
                    alt={`${session.data.user?.name} | The Boring Education` || ''}
                    className='w-[40px] h-[40px] rounded-[50%]'
                    fullWidth={false}
                    fullHeight={false}
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
              <Popover.Panel
                className={`absolute z-50 mt-1 right-0 flex w-screen max-w-max`}
              >
                <div className='overflow-hidden rounded-2 bg-white text-sm shadow-lg ring-1 ring-gray-900/5 min-w-[200px]'>
                  <div className='flex flex-col p-1'>
                    {userNavLinks.map(({ id, name, href, target }) => (
                      <Link
                        key={id}
                        className='text-base text-left font-semibold text-gray-600 p-1 hover:bg-gray-100 rounded-md'
                        href={href}
                        target={target}
                      >
                        {name}
                      </Link>
                    ))}
                    <button
                      className='text-base text-left font-bold text-gray-500 p-1 hover:bg-gray-100 rounded-md'
                      onClick={() => {
                        signOut();
                      }}
                    >
                      Logout
                    </button>
                  </div>
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
