import { useRouter } from 'next/router';
import { Fragment } from 'react';

import {
  FlexContainer,
  Image,
  LinkButton,
  PortfolioCard,
  PortfolioTemplate,
  Section,
  SEO,
  Text,
} from '@tbe/components';
import {
  LINKS,
  PAGE_REFRESH_TIMEOUT,
  PORTFOLIO_CARDS,
  PORTFOLIO_TEMPLATES,
  routes,
  STATIC_FILE_PATH,
} from '@tbe/constants';
import type { PageProps } from '@tbe/interface';
import { getPreFetchProps } from '@tbe/utils';

const Portfolio = ({ seoMeta }: PageProps) => {
  const router = useRouter();

  return (
    <Fragment>
      <SEO seoMeta={seoMeta} />
      <Section>
        <FlexContainer
          className='max-w-screen-xl flex-col md:flex-row md:justify-around gradient-6 p-2 md:p-4 py-4 md:py-6 rounded-2 gap-4 md:gap-4'
          fullWidth
          wrap={false}
        >
          <Image
            alt='portfolio-img'
            className='md:min-w-[40%] lg:min-w-[20%] lg:w-[30%]'
            src={`${STATIC_FILE_PATH.svg}/the-boring-portfolio-hero.svg`}
          />
          <FlexContainer className='gap-1' direction='col'>
            <FlexContainer className='gap-1' direction='col'>
              <Text className='heading-3' level='h1' textCenter>
                Don't Just Have A Resume Own a Portfolio.
              </Text>
              <Text level='p' textCenter>
                Create Your Portfolio Websites in Minutes and Show your skills
                and projects to the world.
              </Text>
            </FlexContainer>
            <LinkButton
              buttonProps={{
                variant: 'PRIMARY',
                text: 'Get Started',
                className: 'px-5 mt-2 lg:mt-3',
              }}
              className=''
              href={`${router.asPath}#${routes.internals.landing.portfolio}`}
            />
          </FlexContainer>
        </FlexContainer>
      </Section>
      <Section className='flex flex-col items-center p-2 gap-3 my-4'>
        <Text className='heading-3' level='h2' textCenter>
          Why Own A{' '}
          <Text className='text-primary' level='span'>
            Portfolio?
          </Text>
        </Text>
        <FlexContainer className='max-w-screen-xl gap-3 md:flex-row' fullWidth>
          {PORTFOLIO_CARDS.map((card) => (
            <PortfolioCard
              key={card.id}
              description={card.description}
              imageUrl={card.imageUrl}
              index={card.id}
              title={card.title}
            />
          ))}
        </FlexContainer>
      </Section>
      <Section
        className='flex flex-col items-center bg-black p-2'
        id={routes.internals.landing.portfolio}
      >
        <FlexContainer className='py-4 gap-1 md:py-6' direction='col' fullWidth>
          <Text className='heading-4 text-white' level='h3' textCenter>
            Pick Your Portfolio Template
          </Text>
          <Text className='text-white' level='p' textCenter>
            Start quickly with templates and customize it as per your needs.
          </Text>
          <FlexContainer className='w-full max-w-screen-xl gap-2 md:flex-row mt-5'>
            {PORTFOLIO_TEMPLATES.map((portfolio) => (
              <PortfolioTemplate key={portfolio.id} {...portfolio} />
            ))}
          </FlexContainer>
          <Section className='gradient-5 p-4 rounded-2 mt-6'>
            <FlexContainer className='items-center' direction='col'>
              <FlexContainer className='items-center gap-1' direction='col'>
                <Text className='heading-4 text-white' level='h3' textCenter>
                  Want to Showcase Your Portfolio?
                </Text>
                <Text className='text-white' level='p' textCenter>
                  Submit your portfolio and get featured on our website.
                </Text>
              </FlexContainer>
              <LinkButton
                buttonProps={{
                  variant: 'PRIMARY',
                  text: 'Submit Now',
                  className: 'px-5 mt-2 lg:mt-3',
                }}
                className=''
                href={LINKS.submitPortfolio}
                target='_blank'
              />
            </FlexContainer>
          </Section>
        </FlexContainer>
      </Section>
    </Fragment>
  );
};

export const getStaticProps = async () => ({
  ...(await getPreFetchProps({ slug: routes.portfolio })),
  revalidate: PAGE_REFRESH_TIMEOUT.long,
});

export default Portfolio;
