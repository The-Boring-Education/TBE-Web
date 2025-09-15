import { FlexContainer, Image, Section, Text } from '@/components';
import { MY_PREV_EXPERIENCE } from '@/constant';

const WeAlreadyTaughtAt = () => (
  <Section>
    <FlexContainer className='gap-4' direction='col'>
      <Text className='heading-4' level='h4'>
        We already <span className=' text-primary'>taught</span> at
      </Text>
      <FlexContainer>
        {MY_PREV_EXPERIENCE.map((item) => (
          <FlexContainer
            key={item.id}
            className='w-88 justify-between [&:not(:first-child)]:ml-2'
            justifyCenter={false}
          >
            <Image alt={item.imageAltText} fullWidth src={item.image} />
          </FlexContainer>
        ))}
      </FlexContainer>
    </FlexContainer>
  </Section>
);

export default WeAlreadyTaughtAt;
