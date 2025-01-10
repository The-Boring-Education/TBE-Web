import React, { useEffect, useState } from 'react';
import {
  FlexContainer,
  Section,
  Text,
  Image,
  WebinarHeroContainer,
  LinkButton,
  SEO,
  CardSectionContainer,
  TestimonialCard,
  BackgroundImage,
  Pill,
  AboutTBE,
  Button,
} from '@/components';
import {
  AddCertificateRequestPayloadProps,
  WebinarPageProps,
} from '@/interfaces';
import { formatDate, getWebinarPageProps } from '@/utils';
import { useApi, useUser } from '@/hooks';
import { routes, TESTIMONIALS } from '@/constant';
import { FiCalendar } from 'react-icons/fi';
import { LuClock3 } from 'react-icons/lu';
import { SiLinkedin } from 'react-icons/si';
import { useRouter } from 'next/router';

const WebinarPage = ({
  seoMeta,
  webinarId,
  name,
  isFree,
  description,
  about,
  whatYoullLearn,
  slug,
  host,
  date,
  time,
  isWebinarStarted,
  bannerImageUrl,
  registrationUrl,
  recordedVideoUrl,
}: WebinarPageProps) => {
  const { user, isAuth } = useUser();
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [registrationErrorMessage, setRegistrationErrorMessage] = useState<
    null | string
  >();

  useEffect(() => {
    if (user) {
      setUserName(user.name);
      setUserEmail(user.email);
    }
  }, [user]);

  const { makeRequest } = useApi('webinar', {
    url: `${routes.api.webinar}/${slug}`,
  });

  const onGenerateCertificate = async () => {
    try {
      const {
        status,
        error,
        data: { isRegistered },
        message,
      } = await makeRequest({
        url: `${routes.api.webinar}/${slug}?email=${user?.email}`,
      });

      if (!status || error) {
        setRegistrationErrorMessage('Certificate generation failed');
      }

      if (isRegistered) {
        const { status, data } = await makeRequest({
          method: 'POST',
          url: routes.api.certificate,
          body: {
            type: 'WEBINAR',
            userId: user?.id,
            userName: user?.name,
            programId: webinarId,
            programName: name,
            date: formatDate({
              dateFormat: {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              },
            }).date,
          } as AddCertificateRequestPayloadProps,
        });

        if (status) {
          router.push(`/certificate/${data._id}`);
        }
      } else {
        setRegistrationErrorMessage(message);
      }
    } catch (error) {
      console.error('Detailed error while generating certificate: ', error);
    }
  };

  let certificateContainer, generateCertificateCard, recordingVideoContainer;

  if (recordedVideoUrl) {
    recordingVideoContainer = (
      <Section className='gradient-6 py-4 m-auto mt-2 mb-4 md:max-w-screen-lg rounded-2'>
        <FlexContainer direction='col' className='gap-2'>
          <Text level='h4' className='heading-4' textCenter={true}>
            Missed the webinar?
          </Text>
          <LinkButton
            buttonProps={{
              variant: 'PRIMARY',
              text: 'Watch Recording',
              className: 'w-full',
            }}
            href={recordedVideoUrl}
            target='_blank'
          />
        </FlexContainer>
      </Section>
    );
  }

  if (!isAuth && isWebinarStarted) {
    certificateContainer = <WebinarHeroContainer />;
  } else if (!isWebinarStarted) {
    certificateContainer = <></>;
  } else {
    certificateContainer = (
      <FlexContainer
        direction='col'
        className='w-full max-w-screen-lg gradient-8 py-4 m-auto my-4 rounded-2 gap-6'
      >
        <Text level='h1' textCenter className='heading-5'>
          Generate Your Certificate
        </Text>

        <FlexContainer
          fullWidth={true}
          direction='col'
          className='gap-4 md:px-0 px-4'
        >
          <FlexContainer className='gap-4'>
            <FlexContainer className='gap-4 items-start'>
              <FlexContainer
                direction='col'
                className='md:w-fit w-full'
                itemCenter={false}
              >
                <Text level='label' className='pre-title'>
                  Your Name
                </Text>
                <Text level='p' className='w-full strong-text'>
                  {userName}
                </Text>
              </FlexContainer>
              <FlexContainer
                direction='col'
                className='md:w-fit w-full'
                itemCenter={false}
              >
                <Text level='label' className='pre-title'>
                  Your Email
                </Text>
                <Text level='p' className='w-full strong-text'>
                  {userEmail}
                </Text>
              </FlexContainer>
            </FlexContainer>
            <Button
              text='Generate Certificate'
              onClick={onGenerateCertificate}
              variant='SUCCESS'
            />
          </FlexContainer>

          {registrationErrorMessage && (
            <Text level='p' textCenter={true}>
              {registrationErrorMessage}
            </Text>
          )}
        </FlexContainer>

        {generateCertificateCard}
      </FlexContainer>
    );
  }

  const registerationContainer = !isWebinarStarted && (
    <FlexContainer
      direction='col'
      fullWidth={true}
      justifyCenter={true}
      className='p-3 gradient-1 rounded-2 md:w-1/2 w-full m-auto my-4'
    >
      <FlexContainer
        direction='col'
        className='justify-start items-center gap-2'
      >
        <FlexContainer
          direction='col'
          className='justify-start items-center gap-2'
          fullWidth={true}
        >
          <Text level='p' className='heading-5'>
            Register Now
          </Text>
          <LinkButton
            href={registrationUrl}
            target='_blank'
            className='w-full'
            buttonProps={{
              variant: 'PRIMARY',
              text: 'Register Now',
              className: 'w-full',
            }}
          />
        </FlexContainer>

        <Text level='p' className='pre-title'>
          25 Slots only. Few seats left.
        </Text>
      </FlexContainer>
    </FlexContainer>
  );

  return (
    <React.Fragment>
      <SEO seoMeta={seoMeta} />
      <Section className='md:px-8 md:py-2 px-2 py-2'>
        <FlexContainer className='relative'>
          <BackgroundImage bannerImageUrl={bannerImageUrl} />
          <FlexContainer
            className='py-6 md:py-8 gap-4 md:px-0 px-2'
            direction='col'
          >
            <FlexContainer className='gap-2' direction='col'>
              {isFree && <Pill text='Free Webinar' variant='SECONDARY' />}
              {!isFree && <Pill text='Paid Webinar' variant='SECONDARY' />}

              <FlexContainer className='gap-1' direction='col'>
                <Text level='h2' textCenter className='heading-2'>
                  {name}
                </Text>
                <Text level='p' textCenter className='paragraph'>
                  {description}
                </Text>
              </FlexContainer>
            </FlexContainer>

            <FlexContainer className='gap-2'>
              <Image
                alt={host.name}
                src={host.imageUrl}
                fullHeight={false}
                fullWidth={false}
                className='rounded-full w-16 h-16 bg-contain border border-dark'
              />
              <FlexContainer
                direction='col'
                itemCenter={false}
                className='md:items-start items-center'
              >
                <Text level='h4' className='heading-4'>
                  {host.name}
                </Text>
                <Text level='p' className='paragraph text-center'>
                  {host.role}
                </Text>
              </FlexContainer>
            </FlexContainer>

            <FlexContainer className='h-6 items-start gap-2 md:gap-4'>
              <FlexContainer className='justify-start gap-2.5'>
                <FiCalendar className='w-4 h-4' />
                <Text level='p' className='strong-text'>
                  {date}
                </Text>
              </FlexContainer>
              <FlexContainer
                itemCenter={true}
                className='justify-start gap-2.5'
              >
                <LuClock3 className='w-4 h-4' />
                <Text level='p' className='strong-text'>
                  {time}
                </Text>
              </FlexContainer>
            </FlexContainer>
          </FlexContainer>
        </FlexContainer>

        {registerationContainer}
        {certificateContainer}
        {recordingVideoContainer}

        <FlexContainer direction='col' className='m-auto'>
          <FlexContainer
            direction='col'
            className='justify-start rounded-lg md:w-1/2 w-full gap-6'
          >
            <FlexContainer direction='col' className='justify-start gap-4'>
              <FlexContainer direction='col' className='gap-2'>
                <Text level='h4' className='heading-4'>
                  About webinar
                </Text>
                <FlexContainer className='gap-1 md:gap-2'>
                  <FlexContainer
                    justifyCenter={true}
                    className='px-1 py-1 bg-black rounded gap-1'
                  >
                    <FiCalendar className='w-3 h-3 text-white' />
                    <Text level='p' className='strong-text text-white'>
                      {date}
                    </Text>
                  </FlexContainer>
                  <FlexContainer className='px-1 py-1 bg-black rounded gap-1'>
                    <LuClock3 className='w-3 h-3 text-white' />
                    <Text level='p' className='strong-text text-white'>
                      {time}
                    </Text>
                  </FlexContainer>
                </FlexContainer>
              </FlexContainer>

              <FlexContainer
                direction='col'
                className='gap-1'
                itemCenter={false}
              >
                {about.map((item, index) => {
                  return (
                    <Text
                      level='p'
                      key={index}
                      textCenter={false}
                      className='paragraph'
                    >
                      {item}
                    </Text>
                  );
                })}
              </FlexContainer>
            </FlexContainer>
            <FlexContainer direction='col' fullWidth={true} className='gap-3'>
              <Text level='h4' className='heading-4'>
                What will you learn
              </Text>
              <ol className='list-decimal w-full flex flex-col gap-1 ml-2'>
                {whatYoullLearn?.map((item, index) => (
                  <li key={index}>
                    <Text level='p' className='paragraph'>
                      {item}
                    </Text>
                  </li>
                ))}
              </ol>
            </FlexContainer>
            <FlexContainer direction='col' fullWidth={true} className='gap-4'>
              <Text level='h4' className='heading-4'>
                Meet your instructor
              </Text>

              <FlexContainer
                direction='col'
                itemCenter={false}
                justifyCenter={false}
                className='justify-start items-start gap-4 w-full'
              >
                <FlexContainer
                  justifyCenter={false}
                  className='justify-start items-start gap-2 w-full'
                >
                  <FlexContainer
                    justifyCenter={false}
                    className='md:gap-3 gap-1 w-full justify-center md:justify-start items-start'
                  >
                    <Image
                      src={host.imageUrl}
                      alt={host.name}
                      fullHeight={false}
                      fullWidth={false}
                      className='rounded-full w-16 h-16 bg-contain border border-dark'
                    />

                    <FlexContainer
                      direction='col'
                      itemCenter={false}
                      justifyCenter={false}
                      className='md:items-start items-center'
                    >
                      <Text level='h5' className='heading-5'>
                        {host.name}
                      </Text>
                      <Text level='p' className='paragraph'>
                        {host.role}
                      </Text>
                    </FlexContainer>
                    <SiLinkedin
                      className='md:w-5 md:h-5 w-4 h-4 cursor-pointer text-blue-600'
                      onClick={() => window.open(host.linkedInUrl, '_blank')}
                    />
                  </FlexContainer>
                </FlexContainer>
                <ol className='list-decimal flex flex-col gap-1'>
                  {host.about?.map((item, index) => (
                    <li key={index} className='pl- ml-2'>
                      <Text level='p' className='paragraph'>
                        {item}
                      </Text>
                    </li>
                  ))}
                </ol>
              </FlexContainer>
            </FlexContainer>
            <AboutTBE />
          </FlexContainer>
        </FlexContainer>

        <FlexContainer
          direction='col'
          fullWidth={true}
          className='md:max-w-screen-lg py-4 m-auto mt-2 gap-3'
        >
          <Text level='h4' className='heading-4' textCenter={true}>
            What are <span className='text-primary'>students</span> saying ?
          </Text>
          <CardSectionContainer
            gap='gap-2'
            className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          >
            {TESTIMONIALS.map((item) => {
              return <TestimonialCard {...item} key={item.id} />;
            })}
          </CardSectionContainer>
        </FlexContainer>
      </Section>
    </React.Fragment>
  );
};

export const getServerSideProps = getWebinarPageProps;

export default WebinarPage;
