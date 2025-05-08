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
import { motion } from 'framer-motion';
import { getUnskilledLandingPageProps } from '@/utils';
import { OutlineCardProps, UnskilledLandingPageProps } from '@/interfaces';
import {
  routes,
  STATIC_FILE_PATH,
  UNSKILLED_LANDING_GRAPH_TAB_PARAMS,
} from '@/constant';

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
        <FlexContainer className='mx-auto gap-12 md:flex-row flex-col-reverse'>
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
          <FlexContainer className='max-w-md'>
            <Image
              src={`${STATIC_FILE_PATH.svg}/unskilled-hero.svg`}
              alt='unskilled-img'
              className='rounded-2xl object-cover'
            />
          </FlexContainer>
        </FlexContainer>
      </Section>

      <Section className='relative overflow-hidden bg-gradient-to-r from-indigo-50 via-white to-pink-50 py-20'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className='relative z-10'
        >
          <FlexContainer
            direction='col'
            className='gap-6 items-center text-center'
          >
            <Text level='h2' className='text-4xl font-extrabold text-gray-900'>
              What’s Missing in Your Resume?{' '}
              <span role='img' aria-label='search'>
                🔍
              </span>
            </Text>
            <Text level='p' className='text-lg max-w-2xl text-gray-700'>
              Upload your resume and uncover the in-demand skills you’re missing
              for your dream tech role.
            </Text>

            <label className='border-dashed border-2 border-primary px-6 py-8 rounded-md w-full max-w-lg text-center cursor-pointer hover:bg-primary/10 transition-all shadow-md hover:shadow-lg bg-white'>
              <input
                type='file'
                accept='.pdf'
                className='hidden'
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    console.log('Uploaded:', file.name);
                  }
                }}
              />
              <Text level='p' className='text-gray-500'>
                📄 Click or drag your resume here to upload (PDF only)
              </Text>
            </label>

            <FlexContainer
              direction='col'
              className='gap-4 w-full max-w-xl text-left mt-6'
            >
              <Text level='h4' className='text-xl font-semibold text-red-600'>
                🚫 Skills Missing from Your Resume
              </Text>
              <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                {['Tailwind CSS', 'TypeScript', 'Redux'].map((skill) => (
                  <motion.div
                    key={skill}
                    whileHover={{ scale: 1.05 }}
                    className='bg-red-50 border border-red-300 text-red-800 px-4 py-2 rounded-md shadow-sm text-center text-sm font-medium transition'
                  >
                    {skill}
                  </motion.div>
                ))}
              </div>
            </FlexContainer>

            <FlexContainer
              direction='col'
              className='gap-4 w-full max-w-xl text-left mt-4'
            >
              <Text level='h4' className='text-xl font-semibold text-blue-600'>
                📚 Recommended Resources
              </Text>
              <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                {[
                  {
                    title: 'Tailwind CSS',
                    link: 'https://tailwindcss.com/docs',
                    label: 'Official Docs',
                  },
                  {
                    title: 'TypeScript',
                    link: 'https://www.youtube.com/watch?v=BCg4U1FzODs',
                    label: 'YouTube Video',
                  },
                  {
                    title: 'Redux Essentials',
                    link: 'https://redux.js.org/tutorials/essentials/part-1-overview-concepts',
                    label: 'Redux Docs',
                  },
                ].map((resource) => (
                  <motion.div
                    key={resource.title}
                    whileHover={{ scale: 1.05 }}
                    className='bg-white border border-blue-200 px-4 py-3 rounded-md shadow-sm text-sm transition'
                  >
                    <div className='font-semibold mb-1 text-blue-700'>
                      {resource.title}
                    </div>
                    <a
                      href={resource.link}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-blue-500 underline'
                    >
                      {resource.label}
                    </a>
                  </motion.div>
                ))}
              </div>
            </FlexContainer>
          </FlexContainer>
        </motion.div>
        <div className='absolute inset-0 z-0 bg-gradient-to-br from-indigo-100 via-transparent to-pink-100 opacity-30 animate-pulse' />
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
