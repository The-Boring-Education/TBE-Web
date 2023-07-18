import {
  FlexContainer,
  Section,
  Text,
  Image,
  Pill,
  CountdownTimerContainer,
  WorkshopRegisterContainer,
  IconPill,
  WorkshopInstructor,
} from '@/components';
import { STATIC_FILE_PATH } from '@/constant';
import { WorkshopMetaDataProps } from '@/interfaces';
import { formatDate } from '@/utils';

const WorkshopHeader = ({
  title,
  image,
  imageAltText,
  description,
  instructor,
  date,
  time,
  link,
}: WorkshopMetaDataProps) => {
  return (
    <Section>
      <FlexContainer direction='col'>
        <FlexContainer
          itemCenter={true}
          justifyCenter={true}
          className='m-auto w-full lg:w-3/4'
        >
          <div className='relative w-full overflow-hidden rounded-2'>
            <Image
              className='absolute object-cover'
              src={image}
              alt={imageAltText}
            />
            <FlexContainer direction='col' className='px-2 py-4 md:p-8'>
              <Pill
                text='Free Workshop'
                variant='SECONDARY'
                textStyleClasses='text-contentLight'
              />
              <FlexContainer direction='col' className='mt-6 w-full gap-1'>
                <Text level='h3' textCenter={true} className='heading-3'>
                  {title}
                </Text>

                <Text level='p' className='paragraph' textCenter={true}>
                  {description}
                </Text>
              </FlexContainer>
              <WorkshopInstructor
                imagePath={instructor.image}
                imageAltText={instructor.imageAltText}
                name={instructor.name}
                position={instructor.designation}
              />
              <FlexContainer
                className='mt-4 gap-4 md:mt-6'
                justifyCenter={false}
              >
                <IconPill
                  iconPath={`${STATIC_FILE_PATH.svg}/calendar.svg`}
                  iconAltText='Calendar'
                  label={formatDate(date)}
                  backgroundColor=''
                />
                <IconPill
                  iconPath={`${STATIC_FILE_PATH.svg}/clock.svg`}
                  iconAltText='Clock'
                  label={time}
                  backgroundColor=''
                />
              </FlexContainer>
              <CountdownTimerContainer date={date} />
            </FlexContainer>
          </div>
        </FlexContainer>
      </FlexContainer>
      <WorkshopRegisterContainer link={link} />
    </Section>
  );
};

export default WorkshopHeader;
