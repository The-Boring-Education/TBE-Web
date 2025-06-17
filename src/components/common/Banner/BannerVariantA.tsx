import { FlexContainer, Image, LinkButton, Section, Text } from '@/components';
import type { BannerProps } from '@/interfaces';

const BannerVariantA = ({
  title,
  description,
  buttonText,
  buttonLink,
  imageSrc,
}: BannerProps) => (
  <Section className='md:px-8 md:py-4 px-2 py-4'>
    <FlexContainer justifyCenter={false}>
      <FlexContainer className='w-full gap-4 rounded-2 bg-dark md:px-8 md:py-8 px-2 py-4 shadow-lg sm:px-8 sm:py-8 lg:px-4 lg:py-4'>
        <div className='max-w-md'>
          <Image alt='banner image' src={imageSrc} />
        </div>
        <FlexContainer direction='col' itemCenter>
          <Text className='heading-3 text-contentDark' level='h3' textCenter>
            {title}
          </Text>
          <Text className='paragraph pt-1 text-grey' level='p' textCenter>
            {description}
          </Text>
          <LinkButton
            buttonProps={{
              variant: 'PRIMARY',
              text: buttonText,
            }}
            className='pt-3'
            href={buttonLink}
            target='_blank'
          />
        </FlexContainer>
      </FlexContainer>
    </FlexContainer>
  </Section>
);

export default BannerVariantA;
