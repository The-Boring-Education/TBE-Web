import { FlexContainer, Image, LinkButton, Section, Text } from '@/components';
import { BannerProps } from '@/interfaces';

const BannerVariantB = ({
  title,
  description,
  buttonText,
  buttonLink,
  imageSrc,
}: BannerProps) => {
  return (
    <Section className='md:px-8 md:py-4 px-2 py-4'>
      <FlexContainer justifyCenter={false}>
        <FlexContainer className='w-full gap-4 rounded-2 gradient-7 md:px-8 md:py-8 px-2 py-4 shadow-lg sm:px-8 sm:py-8 lg:px-4 lg:py-4'>
          <Image
            src={imageSrc}
            alt='banner image'
            fullHeight={false}
            fullWidth={false}
          />
          <FlexContainer direction='col' itemCenter={true}>
            <Text
              level='h3'
              className='heading-3 text-contentLight'
              textCenter={true}
            >
              {title}
            </Text>
            <Text
              level='p'
              className='paragraph pt-1 text-contentLight'
              textCenter={true}
            >
              {description}
            </Text>
            <LinkButton
              href={buttonLink}
              className='pt-3'
              buttonProps={{
                variant: 'PRIMARY',
                text: buttonText,
              }}
              target='_blank'
            />
          </FlexContainer>
        </FlexContainer>
      </FlexContainer>
    </Section>
  );
};

export default BannerVariantB;
