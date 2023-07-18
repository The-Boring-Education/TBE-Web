import { FlexContainer, Image, ImageLink, Section, Text } from '@/components';
import { STATIC_FILE_PATH } from '@/constant';
import { MicrocampInstructorProps } from '@/interfaces';

const MicrocampInstructor = ({
  name,
  about,
  imageLink,
  linkedInProfile,
}: MicrocampInstructorProps) => {
  return (
    <Section>
      <FlexContainer direction='col'>
        <div className='inline-flex flex-col items-center justify-center rounded-2 bg-white px-4 py-6 lg:w-1/3'>
          <div className='inline-flex flex-col items-center justify-start gap-[30px] self-stretch'>
            <Text
              level='p'
              className='text-base font-semibold text-grey'
              textCenter={true}
            >
              PROGRAM INSTRUCTOR
            </Text>
            <div className='flex flex-col items-center justify-start gap-5'>
              <div className='flex flex-col items-center justify-start gap-5'>
                <div className='flex flex-col items-center justify-start gap-2.5'>
                  <Image
                    src={imageLink}
                    alt='developer activities'
                    className='w-24'
                    fullWidth={false}
                  />
                  <Text
                    level='h4'
                    className='heading-4 text-primary'
                    textCenter={true}
                  >
                    {name}
                  </Text>
                  <Text level='p' className='pre-title' textCenter={true}>
                    {about}
                  </Text>
                  <ImageLink
                    linkProps={{ href: linkedInProfile, target: 'BLANK' }}
                    imageProps={{
                      src: `${STATIC_FILE_PATH.image}/linkedin.svg`,
                      className: 'w-3',
                      fullWidth: false,
                      alt: 'linkedin',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </FlexContainer>
    </Section>
  );
};

export default MicrocampInstructor;
