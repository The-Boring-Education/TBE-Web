import { FlexContainer, Image, LinkButton, Section, Text } from '@/components';
import { LINKS, STATIC_FILE_PATH } from '@/constant';

const CanYouBeAProgrammer = () => {
  return (
    <Section>
      <FlexContainer direction='row' justifyCenter={false}>
        <FlexContainer
          direction='row'
          className='w-full gap-4 rounded-2 bg-dark px-8 py-8 shadow-lg sm:px-8 sm:py-8 lg:px-4 lg:py-4'
        >
          <div className='max-w-md'>
            <Image src={`${STATIC_FILE_PATH.svg}/laptop.svg`} alt='laptop' />
          </div>
          <FlexContainer direction='col' itemCenter={true}>
            <Text
              level='h3'
              className='heading-3 text-contentDark'
              textCenter={true}
            >
              Can you be a programmer?
            </Text>
            <Text
              level='p'
              className='paragraph pt-1 text-grey'
              textCenter={true}
            >
              Book your session and discuss if programming is for you. Purely
              unbiased.
            </Text>
            <LinkButton
              href={LINKS.freeTechConsultation}
              className='pt-3'
              buttonProps={{
                variant: 'PRIMARY',
                text: 'Book Free Session',
              }}
              target='BLANK'
            />
          </FlexContainer>
        </FlexContainer>
      </FlexContainer>
    </Section>
  );
};

export default CanYouBeAProgrammer;
