import React from 'react';
import {
  Banner,
  Button,
  CertificateContent,
  FlexContainer,
  Section,
  SEO,
  Text,
} from '@/components';
import { CertificatePageProps } from '@/interfaces';
import {
  formatDate,
  generateShareTemplate,
  getCertificatePageProps,
} from '@/utils';
import { useCertificate, useUser } from '@/hooks';
import { routes, STATIC_FILE_PATH } from '@/constant';

const Home = ({
  seoMeta,
  certificate: { programName, type, userName },
}: CertificatePageProps) => {
  const { isAuth } = useUser();
  const { certificateRef, handleDownload } = useCertificate();

  const socialShareContent = generateShareTemplate(programName, userName, type);

  return (
    <React.Fragment>
      <SEO seoMeta={seoMeta} />
      <Section className='md:px-4 md:py-4 px-2 py-2'>
        <FlexContainer direction='col' className='gap-1'>
          <Text level='span' className='pre-title'>
            View Your Certificate for {type}
          </Text>
          <Text level='h4' className='heading-4 text-primary' textCenter={true}>
            {programName}
          </Text>
        </FlexContainer>
        <div ref={certificateRef} className='my-2'>
          <CertificateContent
            type={type}
            userName={userName}
            courseName={programName}
            date={formatDate({}).date}
          />
          {isAuth && (
            <FlexContainer direction='col' className='gap-2'>
              <FlexContainer className='py-2 gap-1'>
                <Button
                  variant='PRIMARY'
                  text='Download'
                  onClick={() => handleDownload(programName)}
                />
                <Button
                  variant='OUTLINE'
                  text='Copy Link'
                  onClick={() =>
                    navigator.clipboard.writeText(window.location.href)
                  }
                />
              </FlexContainer>
              <FlexContainer
                direction='col'
                className='gap-2 mt-4 md:w-1/2 w-full m-auto'
              >
                <Text level='h5' className='heading-5' textCenter={true}>
                  Share your achievement on social media:
                </Text>
                <FlexContainer direction='col' className='gap-2 w-full'>
                  <pre className='bg-gray-100 border p-2 rounded w-full overflow-x-auto'>
                    {socialShareContent}
                  </pre>
                  <Button
                    variant='SUCCESS'
                    text='Copy'
                    onClick={() =>
                      navigator.clipboard.writeText(socialShareContent)
                    }
                  />
                </FlexContainer>
              </FlexContainer>
            </FlexContainer>
          )}
          {!isAuth && (
            <Banner
              title='Start Your Tech Journey'
              description='Learn the latest technologies and build real-world projects with the help of industry experts.'
              buttonText='Start Learning'
              buttonLink={routes.home}
              imageSrc={`${STATIC_FILE_PATH.svg}/community.svg`}
              variant='VARIANT_B'
            />
          )}
        </div>
      </Section>
    </React.Fragment>
  );
};

export const getServerSideProps = getCertificatePageProps;

export default Home;
