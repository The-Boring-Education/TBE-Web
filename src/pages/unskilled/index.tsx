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
  Button,
  CheckboxButtonContainer,
  FlexContainer,
  Image,
  LinkButton,
  OutlineCard,
  Section,
  SEO,
  TabComponent,
  Text,
} from '@/components';
import { Fragment, useState } from 'react';
import { motion } from 'framer-motion';
import { getUnskilledLandingPageProps } from '@/utils';
import { OutlineCardProps, UnskilledLandingPageProps } from '@/interfaces';
import {
  routes,
  STATIC_FILE_PATH,
  UNSKILLED_LANDING_GRAPH_TAB_PARAMS,
  JOB_DOMAINS,
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
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const onChangeSkills = (value: string[]) => {
    setSelectedSkills(value);
  };

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
            <FlexContainer
              direction='col'
              className='sm:flex-row gap-2 justify-center lg:justify-start'
            >
              <LinkButton
                className='w-fit'
                href={`#${routes.internals.landing.upload}`}
                buttonProps={{
                  variant: 'PRIMARY',
                  text: 'Explore Trending Skills',
                  icon: <ArrowRightIcon className='h-2 w-2' />,
                }}
              />
              <LinkButton
                href={`#${routes.internals.landing.explore}`}
                buttonProps={{
                  text: 'Book Free Call',
                  variant: 'GHOST',
                  className: 'w-full sm:w-auto',
                }}
                target='_blank'
                className='w-full sm:w-auto'
              />
            </FlexContainer>
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

      <Section
        id={`${routes.internals.landing.upload}`}
        className='relative overflow-hidden bg-gradient-to-r from-white via-blue-50 to-violet-100 py-20'
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className='relative max-w-5xl mx-auto'
        >
          <FlexContainer direction='col' className='gap-8'>
            <FlexContainer direction='col' className='gap-6'>
              <FlexContainer direction='col' className='gap-2'>
                <Text level='h3' className='heading-3'>
                  Evaluate Your Resume <span role='img'>🔍</span>
                </Text>
                <Text
                  level='p'
                  className='max-w-2xl paragraph'
                  textCenter={true}
                >
                  Upload your resume and let us analyze thousands of job
                  listings to highlight missing skills and suggest tailored
                  resources.
                </Text>
              </FlexContainer>
              <label className='border-2 border-dashed border-primary px-8 py-10 rounded-lg w-full max-w-xl text-center cursor-pointer bg-white hover:bg-primary/5 transition-all'>
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
                <Text level='p' className='paragraph text-gray-500'>
                  📄 Click or drag your resume here to upload (PDF only)
                </Text>
              </label>
            </FlexContainer>
            <FlexContainer direction='col' className='gap-6'>
              <CheckboxButtonContainer
                options={JOB_DOMAINS.map(({ label, value }) => ({
                  label,
                  value,
                }))}
                selectedValues={selectedSkills}
                onChange={onChangeSkills}
              />

              <Button
                text='Start Evaluation'
                variant='PRIMARY'
                icon={<ArrowRightIcon className='h-2 w-2' />}
              />
            </FlexContainer>
          </FlexContainer>

          <div className='mt-20 text-center'>
            <Text level='h3' className='text-2xl font-semibold text-gray-800'>
              🔍 What's Missing in Your Resume
            </Text>
            <Text level='p' className='text-sm text-gray-600 mt-1'>
              After scanning 3,500+ job listings for your role
            </Text>

            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-8'>
              {[
                {
                  skill: 'TypeScript',
                  percentage: '82%',
                  resources: [
                    {
                      title: 'TypeScript Docs',
                      link: 'https://www.typescriptlang.org/docs/',
                    },
                    {
                      title: 'Crash Course (YouTube)',
                      link: 'https://www.youtube.com/watch?v=30LWjhZzg50',
                    },
                  ],
                },
                {
                  skill: 'Tailwind CSS',
                  percentage: '74%',
                  resources: [
                    {
                      title: 'Tailwind Docs',
                      link: 'https://tailwindcss.com/docs',
                    },
                    {
                      title: 'Net Ninja Course',
                      link: 'https://www.youtube.com/watch?v=ft30zcMlFao',
                    },
                  ],
                },
                {
                  skill: 'Redux',
                  percentage: '65%',
                  resources: [
                    {
                      title: 'Redux Essentials',
                      link: 'https://redux.js.org/tutorials/essentials/part-1-overview-concepts',
                    },
                  ],
                },
              ].map(({ skill, percentage, resources }) => (
                <div
                  key={skill}
                  className='bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition'
                >
                  <div className='text-xl font-semibold text-primary mb-1'>
                    {skill}
                  </div>
                  <div className='text-sm text-gray-500 mb-2'>
                    Appears in {percentage} of listings
                  </div>
                  <ul className='text-sm text-blue-600 space-y-1'>
                    {resources.map((r) => (
                      <li key={r.link}>
                        <a
                          href={r.link}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='hover:underline'
                        >
                          📘 {r.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <div className='absolute inset-0 bg-gradient-to-br from-indigo-100 via-transparent to-pink-100 opacity-20 pointer-events-none' />
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
