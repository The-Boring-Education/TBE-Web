import { FlexContainer, LinkButton, Text } from '@/components';
import { routes } from '@/constant';

const AboutTBE = () => {
  return (
    <FlexContainer
      direction='col'
      fullWidth={true}
      className='gradient-6 py-4 gap-2.5'
    >
      <Text level='h5' textCenter className='heading-5'>
        About the Boring Education
      </Text>
      <FlexContainer direction='col' fullWidth={true} className='px-4 gap-2'>
        <Text level='p' className='pre-title' textCenter={true}>
          We at TBE, building An Open Source Tech Education platform to make
          learning faster with Hands-on Experience.
        </Text>
        <LinkButton
          href={routes.home}
          className='w-full sm:w-fit'
          buttonProps={{
            variant: 'PRIMARY',
            text: 'Explore Free Resources',
            className: 'w-full',
          }}
        />
      </FlexContainer>
    </FlexContainer>
  );
};

export default AboutTBE;
