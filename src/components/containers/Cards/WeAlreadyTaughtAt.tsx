import { Section, Text, Image, FlexContainer } from '@/components';
import { WE_TAUGHT } from '@/constant';
const WeAlreadyTaughtAt = () => {
  return (
    <Section>
      <FlexContainer>
        <Text level='h1' className='heading-1'>
          We already <span className=' text-primary'>taught</span> at
        </Text>
      </FlexContainer>
      <FlexContainer>
        {WE_TAUGHT.map((item) => (
          <FlexContainer
            key={item.id}
            className='w-88 justify-between space-x-4'
            justifyCenter={false}
          >
            <Image
              src={item.image}
              className='w-full'
              alt={item.imageAltText}
            />
          </FlexContainer>
        ))}
      </FlexContainer>
    </Section>
  );
};

export default WeAlreadyTaughtAt;
