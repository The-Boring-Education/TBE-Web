import { FlexContainer, Image, LinkButton, Section, Text } from '@/components';
import { BannerProps } from '@/interfaces';

const BannerVariantA = ({
  title,
  description,
  buttonText,
  buttonLink,
  imageSrc,
}: BannerProps) => {
  return (
    <Section className='px-8 py-4'>
      <FlexContainer justifyCenter={false}>
        <FlexContainer className='w-full gap-4 rounded-2 bg-dark px-8 py-8 shadow-lg sm:px-8 sm:py-8 lg:px-4 lg:py-4'>
          <div className='max-w-md'>
            <Image src={imageSrc} alt='banner image' />
          </div>
          <FlexContainer direction='col' itemCenter={true}>
            <Text
              level='h3'
              className='heading-3 text-contentDark'
              textCenter={true}
            >
              {title}
            </Text>
            <Text
              level='p'
              className='paragraph pt-1 text-grey'
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

export default BannerVariantA;
