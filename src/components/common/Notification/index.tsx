import { Fragment } from 'react';
import {
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
} from '@headlessui/react';
import { FlexContainer, Link, Text } from '@/components';
import { BellIcon, LinkIcon } from '@heroicons/react/20/solid';
import { useNotifications } from '@/hooks';

const NotificationPopover = () => {
  const { notifications } = useNotifications();

  const noNotificationContainer = notifications.length === 0 && (
    <Text level='p' className='text-center'>
      We're Building Something Exciting For You. Stay tuned!
    </Text>
  );

  return (
    <Popover className='relative'>
      {() => (
        <>
          <PopoverButton className='flex p-1 w-10 h-10 justify-center items-center rounded-full border-2 border-primary text-primary hover:text-white hover:bg-primary outline-none font-bold'>
            <BellIcon className='h-6 w-6' aria-hidden='true' color='primary' />
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
            <PopoverPanel className='absolute z-10 mt-1 flex w-screen max-w-max md:-translate-x-2/3 -translate-x-2/4 shadow-md rounded-2'>
              {noNotificationContainer}
              {notifications && (
                <FlexContainer direction='col' className='gap-1'>
                  {notifications.map((notification, index) => {
                    const { type, text, isExternalLink, link } = notification;

                    return (
                      <FlexContainer
                        key={index}
                        direction='col'
                        className='p-2 w-full bg-lightBG rounded-2 border border-secondary gap-2.5'
                      >
                        <FlexContainer direction='col' className='gap-0.5'>
                          <FlexContainer
                            className='gap-1 w-full'
                            justifyCenter={false}
                          >
                            <Text
                              level='span'
                              className='strong-text text-primary'
                            >
                              {type}
                            </Text>
                            {isExternalLink && link && (
                              <Link href={link} target='_blank'>
                                <LinkIcon className='w-2 text-primary' />
                              </Link>
                            )}
                          </FlexContainer>
                          <Text level='p' className='pre-title'>
                            {text}
                          </Text>
                        </FlexContainer>
                      </FlexContainer>
                    );
                  })}
                </FlexContainer>
              )}
            </PopoverPanel>
          </Transition>
        </>
      )}
    </Popover>
  );
};

export default NotificationPopover;
