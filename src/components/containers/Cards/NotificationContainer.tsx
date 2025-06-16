import { LinkIcon } from '@heroicons/react/20/solid';

import { FlexContainer, Link, Section, Text } from '@/components';
import { useNotifications } from '@/hooks';

const NotificationContainer = () => {
  const { notifications } = useNotifications();

  const noNotificationContainer = notifications.length === 0 && (
    <Text className='text-center' level='p'>
      We're Building Something Exciting For You. Stay tuned!
    </Text>
  );

  return (
    <Section>
      <FlexContainer
        className='px-2 py-4 m-auto gradient-6 md:w-1/3 w-full rounded-2 border gap-4'
        direction='col'
      >
        <FlexContainer className='gap-4' direction='col'>
          <FlexContainer className='gap-1.5' direction='col'>
            <Text className='pre-title text-greyDark' level='span'>
              What’s Happening at
            </Text>
            <Text className='heading-5 text-light' level='h5'>
              The Boring Education
            </Text>
          </FlexContainer>
          {noNotificationContainer}
          {notifications && (
            <FlexContainer className='gap-1' direction='col'>
              {notifications.map((notification, index) => {
                const { type, text, isExternalLink, link } = notification;

                return (
                  <FlexContainer
                    key={index}
                    className='p-2 w-full bg-lightBG rounded-2 border border-secondary gap-2.5'
                    direction='col'
                  >
                    <FlexContainer className='gap-0.5' direction='col'>
                      <FlexContainer
                        className='gap-1 w-full'
                        justifyCenter={false}
                      >
                        <Text className='strong-text text-primary' level='span'>
                          {type}
                        </Text>
                        {isExternalLink && link && (
                          <Link href={link} target='_blank'>
                            <LinkIcon className='w-2 text-primary' />
                          </Link>
                        )}
                      </FlexContainer>
                      <Text className='pre-title' level='p'>
                        {text}
                      </Text>
                    </FlexContainer>
                  </FlexContainer>
                );
              })}
            </FlexContainer>
          )}
        </FlexContainer>
      </FlexContainer>
    </Section>
  );
};

export default NotificationContainer;
