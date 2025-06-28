import { Fragment } from 'react';

import { 
  CardContainerA, 
  FlexContainer,
  GradientContainer,
  GridContainer,
  Image,
  LinkButton, 
  Section,
  SectionHeaderContainer,
  SEO,
  Text} from '@/components';
import { OPEN_SOURCE_INFO, OS_GETTING_STARTED_STEPS, routes, STATIC_FILE_PATH } from '@/constant';
import type { PageProps } from '@/interfaces';
import { getPreFetchProps } from '@/utils';

const Contribute = ({ seoMeta }: PageProps) => (
  <Fragment>
    <SEO seoMeta={seoMeta} />
    <Section>
      <FlexContainer className='py-2 sm:py-6' direction='col' justifyCenter>
        <FlexContainer
          className='wrap-reverse flex-col-reverse gap-6 lg:flex-row'
          itemCenter
          justifyCenter
          wrap={false}
        >
          <FlexContainer className='w-full lg:w-1/2 items-center lg:items-start' direction='col'>
            <SectionHeaderContainer
              focusText='Source'
              heading='Contribute to Open'
              headingLevel={3}
            />
            <Text
              className='paragraph mt-1 w-full text-center lg:text-left text-grey'
              level='p'
            >
              Join our open source community and contribute to building the future of tech education. Learn, grow, and make a difference.
            </Text>
            <FlexContainer className='mt-4 gap-2'>
              <LinkButton
                buttonProps={{
                  variant: 'PRIMARY',
                  text: 'Start Contributing',
                  className: 'w-full',
                }}
                className='w-full sm:w-fit'
                href='#repositories'
              />
              <LinkButton
                buttonProps={{
                  variant: 'OUTLINE',
                  text: 'View Guidelines',
                  className: 'w-full',
                }}
                className='w-full sm:w-fit'
                href='https://theboringeducation.notion.site/Contribute-The-Boring-Education-8171f19257fd4ef99b7287555eb5062b'
                target='_blank'
              />
            </FlexContainer>
          </FlexContainer>
          {/* COLUMN: Image */}
          <Image
            alt='landing-page-hero-image'
            className='w-64'
            fullWidth={false}
            loading='eager'
            src={`${STATIC_FILE_PATH.svg}/projects.svg`}
          />
        </FlexContainer>
      </FlexContainer>
    </Section>

    {/* Why Contribute Section */}
    <CardContainerA
      borderColour={3}
      cards={OPEN_SOURCE_INFO}
      focusText='Open Source'
      heading='Why Contribute to'
      subtext='Discover the benefits of contributing to open source and how it can accelerate your career growth.'
    />

    {/* Getting Started Section */}
    <Section>
      <FlexContainer className='gap-8' direction='col'>
        <SectionHeaderContainer
          focusText='Started'
          heading='Getting'
          subtext='Follow these simple steps to begin your open source contribution journey.'
        />
        <GridContainer className='grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {OS_GETTING_STARTED_STEPS.map((step) => (
            <GradientContainer
              key={step.step}
              className='border-borderColor4 p-6 text-center'
            >
              <FlexContainer direction='col' itemCenter className='mb-4'>
                <FlexContainer className='h-12 w-12 items-center justify-center rounded-full bg-primary text-white mb-2' itemCenter justifyCenter>
                  <Text className='font-bold' level='span'>
                    {step.step}
                  </Text>
                </FlexContainer>
                <Text className='heading-5' level='h5'>
                  {step.title}
                </Text>
              </FlexContainer>
              <Text className='paragraph text-greyDark' level='p'>
                {step.description}
              </Text>
            </GradientContainer>
          ))}
        </GridContainer>
      </FlexContainer>
    </Section>

    {/* Call to Action Section */}
    <Section>
      <GradientContainer className='border-borderColor1 p-8 text-center'>
        <Text className='heading-4 mb-4' level='h4'>
          Ready to Start Contributing?
        </Text>
        <Text className='paragraph mb-6 text-greyDark' level='p'>
          Join hundreds of developers who are already contributing to our open source projects. 
          Every contribution, no matter how small, makes a difference.
        </Text>
        <FlexContainer className='gap-4' justifyCenter>
          <LinkButton
            buttonProps={{
              variant: 'PRIMARY',
              text: 'Join Our Community',
              className: 'w-full sm:w-fit',
            }}
            className='w-full sm:w-fit'
            href='https://chat.whatsapp.com/EeB7LrPRg2p3RyMOicyIAC'
            target='_blank'
          />
          <LinkButton
            buttonProps={{
              variant: 'OUTLINE',
              text: 'Read Contributing Guide',
              className: 'w-full sm:w-fit',
            }}
            className='w-full sm:w-fit'
            href='https://theboringeducation.notion.site/Contribute-The-Boring-Education-8171f19257fd4ef99b7287555eb5062b'
            target='_blank'
          />
        </FlexContainer>
      </GradientContainer>
    </Section>
  </Fragment>
);

export const getStaticProps = async () => ({
  ...(await getPreFetchProps({ slug: routes.contribute })),
});

export default Contribute;