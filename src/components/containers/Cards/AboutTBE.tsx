import { FlexContainer, LinkButton, Text } from '@/components';
import { routes } from '@/constant';

const AboutTBE = () => (
    <FlexContainer
      className='gradient-6 py-4 gap-2.5'
      direction='col'
      fullWidth
    >
      <Text textCenter className='heading-5' level='h5'>
        About the Boring Education
      </Text>
      <FlexContainer className='px-4 gap-2' direction='col' fullWidth>
        <Text className='pre-title' level='p' textCenter>
          We at TBE, building An Open Source Tech Education platform to make
          learning faster with Hands-on Experience.
        </Text>
        <LinkButton
          buttonProps={{
            variant: 'PRIMARY',
            text: 'Explore Free Resources',
            className: 'w-full',
          }}
          className='w-full sm:w-fit'
          href={routes.home}
        />
      </FlexContainer>
    </FlexContainer>
  );

export default AboutTBE;
