import { FlexContainer, LinkButton, Section, Text } from '@/components';

const ContactCard = () => {
  return (
    <Section>
      <FlexContainer itemCenter={true}>
        <FlexContainer
          className='gradient-5 mx-auto w-full overflow-hidden rounded-2 py-6 px-4 sm:w-2/3 sm:px-6 sm:py-6 lg:w-2/5'
          direction='col'
          itemCenter={false}
        >
          <Text
            className='heading-4 text-contentDark'
            level='h4'
            textCenter={true}
          >
            Get In Touch With Us
          </Text>
          <FlexContainer
            className='mt-2 w-full justify-start gap-2'
            itemCenter={true}
            justifyCenter={true}
          >
            <LinkButton
              buttonProps={{
                variant: 'PRIMARY',
                text: 'Email',
              }}
              href='mailto:theboringeducation@gmail.com'
            ></LinkButton>
            <LinkButton
              buttonProps={{
                variant: 'PRIMARY',
                text: 'Call',
              }}
              href='tel:+91-8884966267'
            ></LinkButton>
          </FlexContainer>
        </FlexContainer>
      </FlexContainer>
    </Section>
  );
};

export default ContactCard;
