import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  ArrowRightIcon,
  ArrowTrendingUpIcon,
  MapPinIcon,
  CodeBracketIcon,
} from '@heroicons/react/20/solid';
import {
  FlexContainer,
  Image,
  LinkButton,
  OutlineCard,
  Section,
  SEO,
  TabComponent,
  Text,
} from '@/components';
import { Fragment } from 'react';
import { getUnskilledLandingPageProps } from '@/utils';
import { OutlineCardProps, UnskilledLandingPageProps } from '@/interfaces';
import { routes, UNSKILLED_LANDING_GRAPH_TAB_PARAMS } from '@/constant';

const UNSKILLED_FEATURES: OutlineCardProps[] = [
  {
    icon: <ArrowTrendingUpIcon className='h-6 w-6 text-primary' />,
    title: 'Stay Updated on Trending Tech',
    description:
      'Get real-time insights into the most in-demand programming languages, frameworks, and tools that employers are seeking.',
  },
  {
    icon: <MapPinIcon className='h-6 w-6 text-primary' />,
    title: 'Discover High-Demand Locations',
    description:
      'Explore tech hubs and cities where top companies are actively hiring software engineers.',
  },
  {
    icon: <CodeBracketIcon className='h-6 w-6 text-primary' />,
    title: 'Explore Job Roles & Domains',
    description:
      'Find the most sought-after software engineering domains and roles to focus your learning journey.',
  },
];

const UnskilledLandingPage = ({
  seoMeta,
  jobData,
}: UnskilledLandingPageProps) => {
  const jobMarketPanels = jobData && [
    <ResponsiveContainer key={0} width='100%' height={400}>
      <BarChart data={jobData.jobDomains} layout='horizontal'>
        <CartesianGrid strokeDasharray='3 3' />
        <YAxis type='number' />
        <XAxis dataKey='name' type='category' width={100} />
        <Tooltip />
        <Bar dataKey='count' fill='bg-primary' />
      </BarChart>
    </ResponsiveContainer>,

    <ResponsiveContainer key={1} width='100%' height={400}>
      <BarChart data={jobData.trendingSkills} layout='horizontal'>
        <CartesianGrid strokeDasharray='3 3' />
        <YAxis type='number' />
        <XAxis dataKey='name' type='category' width={100} />
        <Tooltip />
        <Bar dataKey='count' fill='hsl(var(--chart-1))' />
      </BarChart>
    </ResponsiveContainer>,

    <ResponsiveContainer key={3} width='100%' height={400}>
      <BarChart data={jobData.companyTypes} layout='horizontal'>
        <CartesianGrid strokeDasharray='3 3' />
        <YAxis type='number' />
        <XAxis dataKey='name' type='category' width={100} />
        <Tooltip />
        <Bar dataKey='count' fill='hsl(var(--chart-1))' />
      </BarChart>
    </ResponsiveContainer>,

    <ResponsiveContainer key={4} width='100%' height={400}>
      <BarChart data={jobData.topLocations} layout='horizontal'>
        <CartesianGrid strokeDasharray='3 3' />
        <YAxis type='number' />
        <XAxis dataKey='name' type='category' width={100} />
        <Tooltip />
        <Bar dataKey='count' fill='hsl(var(--chart-1))' />
      </BarChart>
    </ResponsiveContainer>,
  ];

  const jobGraphContainer = jobMarketPanels ? (
    <TabComponent
      tabLabels={UNSKILLED_LANDING_GRAPH_TAB_PARAMS}
      tabPanels={jobMarketPanels}
    />
  ) : (
    <FlexContainer>
      <Text level='p' className='text-gray-500'>
        No data available
      </Text>
    </FlexContainer>
  );

  return (
    <Fragment>
      <SEO seoMeta={seoMeta} />
      <Section>
        <FlexContainer className='mx-auto gap-12'>
          <FlexContainer className='gap-4' direction='col' itemCenter={false}>
            <FlexContainer className='gap-2' direction='col' itemCenter={false}>
              <Text level='h3' className='heading-3'>
                What's Missing in Your{' '}
                <Text level='span' className='heading-3 text-primary'>
                  Resume?
                </Text>{' '}
                🚀 <br /> Find and Crack Your Next{' '}
                <Text level='span' className='heading-3 text-primary'>
                  Tech Job
                </Text>
              </Text>
              <Text level='p' className='paragraph max-w-md leading-relaxed'>
                Discover in-demand skills & tech roles. Get insights to
                supercharge your career.
              </Text>
            </FlexContainer>
            <LinkButton
              className='w-fit'
              href={`#${routes.internals.landing.explore}`}
              buttonProps={{
                variant: 'PRIMARY',
                text: 'Explore Trending Skills',
                icon: <ArrowRightIcon className='h-5 w-5' />,
              }}
            />
          </FlexContainer>
          <FlexContainer className='w-full max-w-md'>
            <Image
              src='https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80'
              alt='Developer workspace'
              className='rounded-2xl shadow-xl w-full object-cover'
            />
          </FlexContainer>
        </FlexContainer>
      </Section>

      <Section>
        <div className='mx-auto grid grid-cols-1 md:grid-cols-3 gap-8'>
          {UNSKILLED_FEATURES.map((feature, index) => (
            <OutlineCard key={index} {...feature} />
          ))}
        </div>
      </Section>

      <Section id={`${routes.internals.landing.explore}`}>
        <FlexContainer className='gap-6' direction='col'>
          <Text level='h3' className='heading-3'>
            Job Market Insights
          </Text>

          {jobGraphContainer}

          <Text level='p' className='text-gray-500 text-sm text-center'>
            Data aggregated from multiple leading job portals and updated daily
          </Text>
        </FlexContainer>
      </Section>
    </Fragment>
  );
};

export const getServerSideProps = getUnskilledLandingPageProps;

export default UnskilledLandingPage;
