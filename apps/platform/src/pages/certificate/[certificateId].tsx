import {
  Banner,
  Button,
  CertificateContent,
  CopyButton,
  FeedbackPopup,
  FlexContainer,
  Section,
  SEO,
  Text,
} from '@tbe/components';
import { routes, STATIC_FILE_PATH } from '@tbe/constants';
import { useCertificate, useUser } from '@tbe/hooks';
import type { CertificatePageProps } from '@tbe/interface';
import {
  formatDate,
  generateShareTemplate,
  getCertificatePageProps,
} from '@tbe/utils';
import { Fragment, useState } from 'react';

const Home = ({
  seoMeta,
  certificate: { programName, type, userName },
}: CertificatePageProps) => {
  const { isAuth } = useUser();
  const { certificateRef, handleDownload } = useCertificate();
  const [showFeedback, setShowFeedback] = useState(false);

  const socialShareContent = generateShareTemplate(programName, userName, type);

  const handleDownloadClick = () => {
    handleDownload(programName);
    setShowFeedback(true);
  };

  return (
    <Fragment>
      <SEO seoMeta={seoMeta} />
      <Section className='md:px-4 md:py-4 px-2 py-2'>
        <FlexContainer className='gap-1' direction='col'>
          <Text className='pre-title' level='span'>
            View Your Certificate for {type}
          </Text>
          <Text className='heading-4 text-primary' level='h4' textCenter>
            {programName}
          </Text>
        </FlexContainer>
        <div className='my-2'>
          <CertificateContent
            certificateRef={certificateRef}
            courseName={programName}
            date={formatDate({}).date}
            type={type}
            userName={userName}
          />
          <FlexContainer className='gap-2' direction='col'>
            <FlexContainer className='py-2 gap-1'>
              <Button
                animationClasses='w-fit'
                text='Download'
                variant='PRIMARY'
                onClick={handleDownloadClick}
              />
              <CopyButton />
            </FlexContainer>
            <FlexContainer
              className='gap-2 mt-4 md:w-1/2 w-full m-auto'
              direction='col'
            >
              <Text className='heading-5' level='h5' textCenter>
                Share your achievement on social media:
              </Text>
              <FlexContainer className='gap-2 w-full' direction='col'>
                <pre className='bg-gray-100 border p-2 rounded w-full overflow-x-auto'>
                  {socialShareContent}
                </pre>
                <CopyButton
                  animationClasses='w-fit'
                  text='Copy'
                  copiedText='Copied!'
                  value={socialShareContent}
                  variant='SUCCESS'
                />
              </FlexContainer>
            </FlexContainer>
          </FlexContainer>
          {!isAuth && (
            <Banner
              buttonLink={routes.home}
              buttonText='Start Learning'
              description='Learn the latest technologies and build real-world projects with the help of industry experts.'
              imageSrc={`${STATIC_FILE_PATH.svg}/community.svg`}
              title='Start Your Tech Journey'
              variant='VARIANT_B'
            />
          )}
        </div>
      </Section>
      {showFeedback && <FeedbackPopup type='CERTIFICATE' />}
    </Fragment>
  );
};

export const getServerSideProps = getCertificatePageProps;

export default Home;
