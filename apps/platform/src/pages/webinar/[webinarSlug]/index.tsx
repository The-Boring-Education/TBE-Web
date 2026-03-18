import {
  AboutTBE,
  BackgroundImage,
  Button,
  CardSectionContainer,
  CertificateModal,
  FlexContainer,
  Image,
  LinkButton,
  Pill,
  Section,
  SEO,
  TestimonialCard,
  Text,
  WebinarHeroContainer,
} from '@tbe/components';
import { routes, TESTIMONIALS } from '@tbe/constants';
import { useAnalytics, useUser } from '@tbe/hooks';
import type {
  AddCertificateRequestPayloadProps,
  WebinarPageProps,
} from '@tbe/interface';
import { useMutation } from '@tbe/query';
import { formatDate, getWebinarPageProps, sendRequest } from '@tbe/utils';
import { useRouter } from 'next/router';
import { Fragment, useEffect, useState } from 'react';
import { FiCalendar } from 'react-icons/fi';
import { LuClock3 } from 'react-icons/lu';
import { SiLinkedin } from 'react-icons/si';

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
  const { trackEvent } = useAnalytics();
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [registrationErrorMessage, setRegistrationErrorMessage] = useState<
    null | string
  >();

  useEffect(() => {
    if (user) {
      setUserName(user.name);
      setUserEmail(user.email);
    }
  }, [user]);

  const { mutateAsync: makeRequest } = useMutation({
    mutationFn: (params: Parameters<typeof sendRequest>[0]) =>
      sendRequest(params),
  });

  const onGenerateCertificate = async (certificateName: string) => {
    try {
      setRegistrationErrorMessage(null);
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
        return;
      }

      if (isRegistered) {
        const { status, data } = await makeRequest({
          method: 'POST',
          url: routes.api.certificate,
          body: {
            type: 'WEBINAR',
            userId: user?.id,
            userName: certificateName || user?.name, // Use edited name or fallback to user name
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
          trackEvent({
            action: 'CERTIFICATE_GENERATED',
            category: 'Webinar',
            label: 'Certificate Generated',
            value: {
              userId: user?.id,
              webinarId,
            },
          });

          setIsModalOpen(false); // Close modal on success
          router.push(`/certificate/${data._id}`);
        }
      } else {
        setRegistrationErrorMessage(message);
      }
    } catch (error) {
      console.error('Detailed error while generating certificate: ', error);
      setRegistrationErrorMessage(
        'Failed to generate certificate. Please try again.',
      );
    }
  };

  const handleOpenModal = () => {
    setRegistrationErrorMessage(null); // Clear any previous errors
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setRegistrationErrorMessage(null);
  };

  let certificateContainer, generateCertificateCard, recordingVideoContainer;

  if (recordedVideoUrl) {
    recordingVideoContainer = (
      <Section className='gradient-6 py-4 m-auto mt-2 mb-4 md:max-w-screen-lg rounded-2'>
        <FlexContainer className='gap-2' direction='col'>
          <Text className='heading-4' level='h4' textCenter>
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
        className='w-full max-w-screen-lg gradient-8 py-4 m-auto my-4 rounded-2 gap-6'
        direction='col'
      >
        <Text textCenter className='heading-5' level='h1'>
          Generate Your Certificate
        </Text>

        <FlexContainer className='gap-4 md:px-0 px-4' direction='col' fullWidth>
          <FlexContainer className='gap-4'>
            <FlexContainer className='gap-4 items-start'>
              <FlexContainer
                className='md:w-fit w-full'
                direction='col'
                itemCenter={false}
              >
                <Text className='pre-title' level='label'>
                  Your Name
                </Text>
                <Text className='w-full strong-text' level='p'>
                  {userName}
                </Text>
              </FlexContainer>
              <FlexContainer
                className='md:w-fit w-full'
                direction='col'
                itemCenter={false}
              >
                <Text className='pre-title' level='label'>
                  Your Email
                </Text>
                <Text className='w-full strong-text' level='p'>
                  {userEmail}
                </Text>
              </FlexContainer>
            </FlexContainer>
            <Button
              animationClasses='w-fit'
              text='Generate Certificate'
              variant='SUCCESS'
              onClick={handleOpenModal}
            />
          </FlexContainer>

          {registrationErrorMessage && (
            <Text level='p' textCenter>
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
      className='p-3 gradient-1 rounded-2 md:w-1/2 w-full m-auto my-4'
      direction='col'
      fullWidth
      justifyCenter
    >
      <FlexContainer
        className='justify-start items-center gap-2'
        direction='col'
      >
        <FlexContainer
          className='justify-start items-center gap-2'
          direction='col'
          fullWidth
        >
          <Text className='heading-5' level='p'>
            Register Now
          </Text>
          <LinkButton
            buttonProps={{
              variant: 'PRIMARY',
              text: 'Register Now',
              className: 'w-full',
            }}
            className='w-full'
            href={registrationUrl}
            target='_blank'
          />
        </FlexContainer>

        <Text className='pre-title' level='p'>
          25 Slots only. Few seats left.
        </Text>
      </FlexContainer>
    </FlexContainer>
  );

  return (
    <Fragment>
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
                <Text textCenter className='heading-2' level='h2'>
                  {name}
                </Text>
                <Text textCenter className='paragraph' level='p'>
                  {description}
                </Text>
              </FlexContainer>
            </FlexContainer>

            <FlexContainer className='gap-2'>
              <Image
                alt={host.name}
                className='rounded-full w-16 h-16 bg-contain border border-dark'
                fullHeight={false}
                fullWidth={false}
                src={host.imageUrl}
              />
              <FlexContainer
                className='md:items-start items-center'
                direction='col'
                itemCenter={false}
              >
                <Text className='heading-4' level='h4'>
                  {host.name}
                </Text>
                <Text className='paragraph text-center' level='p'>
                  {host.role}
                </Text>
              </FlexContainer>
            </FlexContainer>

            <FlexContainer className='h-6 items-start gap-2 md:gap-4'>
              <FlexContainer className='justify-start gap-2.5'>
                <FiCalendar className='w-4 h-4' />
                <Text className='strong-text' level='p'>
                  {date}
                </Text>
              </FlexContainer>
              <FlexContainer className='justify-start gap-2.5' itemCenter>
                <LuClock3 className='w-4 h-4' />
                <Text className='strong-text' level='p'>
                  {time}
                </Text>
              </FlexContainer>
            </FlexContainer>
          </FlexContainer>
        </FlexContainer>

        {registerationContainer}
        {certificateContainer}
        {recordingVideoContainer}
        <CertificateModal
          isOpen={isModalOpen}
          closeModal={handleCloseModal}
          userName={userName}
          userEmail={userEmail}
          onGenerateCertificate={onGenerateCertificate}
          errorMessage={registrationErrorMessage}
        />

        <FlexContainer className='m-auto' direction='col'>
          <FlexContainer
            className='justify-start rounded-lg md:w-1/2 w-full gap-6'
            direction='col'
          >
            <FlexContainer className='justify-start gap-4' direction='col'>
              <FlexContainer className='gap-4' direction='col'>
                <Text className='heading-4' level='h4'>
                  About webinar
                </Text>
                <FlexContainer className='gap-1 md:gap-2'>
                  <FlexContainer
                    className='px-1 py-1 bg-black rounded gap-1'
                    justifyCenter
                  >
                    <FiCalendar className='w-3 h-3 text-white' />
                    <Text className='strong-text text-white' level='p'>
                      {date}
                    </Text>
                  </FlexContainer>
                  <FlexContainer className='px-1 py-1 bg-black rounded gap-1'>
                    <LuClock3 className='w-3 h-3 text-white' />
                    <Text className='strong-text text-white' level='p'>
                      {time}
                    </Text>
                  </FlexContainer>
                </FlexContainer>
              </FlexContainer>

              <FlexContainer
                className='gap-1'
                direction='col'
                itemCenter={false}
              >
                {about.map((item, index) => (
                  <Text
                    key={index}
                    className='paragraph'
                    level='p'
                    textCenter={false}
                  >
                    {item}
                  </Text>
                ))}
              </FlexContainer>
            </FlexContainer>
            <FlexContainer className='gap-3' direction='col' fullWidth>
              <Text className='heading-4' level='h4'>
                What will you learn
              </Text>
              <ol className='list-decimal w-full flex flex-col gap-1 ml-2'>
                {whatYoullLearn?.map((item, index) => (
                  <li key={index}>
                    <Text className='paragraph' level='p'>
                      {item}
                    </Text>
                  </li>
                ))}
              </ol>
            </FlexContainer>
            <FlexContainer className='gap-4' direction='col' fullWidth>
              <Text className='heading-4' level='h4'>
                Meet your instructor
              </Text>

              <FlexContainer
                className='justify-start items-start gap-4 w-full'
                direction='col'
                itemCenter={false}
                justifyCenter={false}
              >
                <FlexContainer
                  className='justify-start items-start gap-2 w-full'
                  justifyCenter={false}
                >
                  <FlexContainer
                    className='md:gap-3 gap-1 w-full justify-center md:justify-start items-start'
                    justifyCenter={false}
                  >
                    <Image
                      alt={host.name}
                      className='rounded-full w-16 h-16 bg-contain border border-dark'
                      fullHeight={false}
                      fullWidth={false}
                      src={host.imageUrl}
                    />

                    <FlexContainer
                      className='md:items-start items-center'
                      direction='col'
                      itemCenter={false}
                      justifyCenter={false}
                    >
                      <Text className='heading-5' level='h5'>
                        {host.name}
                      </Text>
                      <Text className='paragraph' level='p'>
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
                      <Text className='paragraph' level='p'>
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
          className='md:max-w-screen-lg py-4 m-auto mt-2 gap-3'
          direction='col'
          fullWidth
        >
          <Text className='heading-4' level='h4' textCenter>
            What are <span className='text-primary'>students</span> saying ?
          </Text>
          <CardSectionContainer
            className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            gap='gap-2'
          >
            {TESTIMONIALS.map((item) => (
              <TestimonialCard {...item} key={item.id} />
            ))}
          </CardSectionContainer>
        </FlexContainer>
      </Section>
    </Fragment>
  );
};

export const getServerSideProps = getWebinarPageProps;

export default WebinarPage;
