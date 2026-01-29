import {
  CardContainerA,
  FlexContainer,
  LinkButton,
  ModernLandingHero,
  PortfolioTemplate,
  Section,
  SEO,
  Text,
} from '@tbe/components';
import {
  LINKS,
  PAGE_REFRESH_TIMEOUT,
  PORTFOLIO_FEATURES,
  PORTFOLIO_TEMPLATES,
  routes,
} from '@tbe/constants';
import type { PageProps } from '@tbe/interface';
import { getPreFetchProps } from '@tbe/utils';
import { useRouter } from 'next/router';
import { Fragment } from 'react';
import { FaCertificate, FaClock, FaUsers } from 'react-icons/fa';


const stats = [
  {
    icon: <FaCertificate />,
    text: '4+ Free Templates',
    color: 'text-green-400',
  },
  {
    icon: <FaClock />,
    text: 'Customizable',
    color: 'text-yellow-400',
  },
  {
    icon: <FaUsers />,
    text: 'Showcase Your Skills',
    color: 'text-blue-400',
  },
  {
    icon: <FaCertificate />,
    text: 'Showcase Your Projects',
    color: 'text-purple-400',
  },
];

const previewContent = {
  title: 'Preview Our Portfolio',
  description: 'See how our portfolio templates can help you showcase your projects',
  buttonText: 'Explore Portfolio',
  onPreviewClick: () => {
    document.getElementById('portfolio-section')?.scrollIntoView({ behavior: 'smooth' });
  },
};
const Portfolio = ({ seoMeta }: PageProps) => {
  const router = useRouter();

  return (
    <Fragment>
      <SEO seoMeta={seoMeta} />
            <ModernLandingHero
        heading='Get a Portfolio'
        focusText='In Minutes'
        heroText='Create Your Portfolio Websites in Minutes and Show your skills and projects to the world.'
        gradientFrom='from-emerald-600'
        gradientTo='to-blue-700'
        stats={stats}
        previewContent={previewContent}
        primaryButton={
          <LinkButton
            buttonProps={{
              variant: 'PRIMARY',
              text: 'Explore Portfolio',
              className: 'bg-red hover:bg-gray-100 hover:text-black px-4 py-2 text-base font-semibold w-full sm:w-auto',
            }}
            className='w-full sm:w-fit'
            href={`${router.asPath}#${routes.internals.landing.portfolio}`}
            />
        }
      />
      <div id='features-section'>
        <CardContainerA
          borderColour={4}
          cards={PORTFOLIO_FEATURES}
          focusText='Differently'
          heading='What We Do'
        />
      </div>
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
