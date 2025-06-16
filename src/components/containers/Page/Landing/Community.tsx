import { FlexContainer, Image, LinkButton, Pill, Section } from '@/components';
import { Text } from '@/components';
import { LINKS, STATIC_FILE_PATH } from '@/constant';

const Community = () => {
  return (
    <Section>
      <FlexContainer className='gradient-5 w-full p-4 flex-col  gap-4 rounded-2'>
        <Image
          alt='community'
          fullHeight={false}
          fullWidth={false}
          src={`${STATIC_FILE_PATH.svg}/community.svg`}
        />
        <FlexContainer className='gap-1' direction='col'>
          <Text
            className='heading-3 text-contentDark'
            level='h3'
            textCenter={true}
          >
            Community For Everyone
          </Text>
          <Text className='text-contentDark' level='p' textCenter={true}>
            You excel where you’re supported. Connect with like-minded peers who
            share the same goal as you.
          </Text>
        </FlexContainer>
        <FlexContainer className='gap-2' direction='col'>
          <Text
            className='heading-5 text-contentDark'
            level='h5'
            textCenter={true}
          >
            In Community, You'll
          </Text>
          <FlexContainer className='gap-1 justify-center items-center flex-wrap'>
            {[
              'Attend Tech Workshops',
              'Connect with Like-minded Peers',
              'Share your journey with others',
              'Find accountability parter',
            ].map((goal, index) => (
              <FlexContainer key={index} className='w-full md:w-[35%]'>
                <Pill text={goal} variant='GHOST' widthFull={true} />
              </FlexContainer>
            ))}
          </FlexContainer>
          <LinkButton
            buttonProps={{
              variant: 'PRIMARY',
              text: 'Join Community',
            }}
            className='pt-3'
            href={LINKS.whatsappCommunity}
            target='_blank'
          />
        </FlexContainer>
      </FlexContainer>
    </Section>
  );
};

export default Community;
