import { FlexContainer, Image, ImageLink, Text } from '@/components';
import { WorkshopAboutInstructorProps } from '@/interfaces';

const WorkshopInstructor = ({
  containerClasses = 'mt-6 gap-2',
  imagePath,
  imageAltText,
  name,
  linkedInURL,
  position,
}: WorkshopAboutInstructorProps) => {
  return (
    <FlexContainer className={`${containerClasses} gap-2`}>
      <Image
        src={imagePath}
        alt={imageAltText}
        className='w-20'
        fullWidth={false}
      />
      <FlexContainer
        direction='col'
        itemCenter={false}
        className='items-center gap-1 sm:items-start'
      >
        <FlexContainer className='gap-1'>
          <Text level='h5' className='heading-5'>
            {name}
          </Text>
          {linkedInURL && (
            <ImageLink
              linkProps={{ href: '#' }}
              imageProps={{
                src: '/svg/linkedin.svg',
                className: 'w-3',
                fullWidth: false,
                alt: 'linkedin',
              }}
            />
          )}
        </FlexContainer>
        <Text level='p' className='paragraph' textCenter={true}>
          {position}
        </Text>
      </FlexContainer>
    </FlexContainer>
  );
};

export default WorkshopInstructor;
