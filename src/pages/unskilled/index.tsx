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
  CircularProgressBar,
  FlexContainer,
  Image,
  LinkButton,
  OutlineCard,
  RadioButtonContainer,
  Section,
  SEO,
  TabComponent,
  Text,
  UploadFileInput,
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
  JOB_EXPERIENCE_LEVEL,
} from '@/constant';
import { usePDFFile, useResumeEvaluation } from '@/hooks';

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
  const {
    file,
    handleFileUpload,
    selectedDomains,
    setSelectedDomains,
    selectedExperience,
    setSelectedExperience,
    isEvaluating,
    evaluationData,
    handleResumeEvaluation,
  } = useResumeEvaluation();

  const onSelectSkills = (value: string[]) => {
    setSelectedDomains(value);
  };

  const onSelectExperience = (value: string) => {
    setSelectedExperience(value);
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
                  text: 'Evaluate My Resume',
                  icon: <ArrowRightIcon className='h-2 w-2' />,
                }}
              />
              <LinkButton
                href={`#${routes.internals.landing.explore}`}
                buttonProps={{
                  text: 'Explore Trending Skills',
                  variant: 'GHOST',
                  className: 'w-full sm:w-auto',
                }}
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
        className='bg-gradient-to-r from-white via-blue-50 to-violet-100 py-20 md:px-10 px-4'
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
                  Evaluate Your
                  <span className='heading-3 text-primary'> Resume </span>
                  <span role='img'>🔍</span>
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
              <UploadFileInput
                onChange={handleFileUpload}
                file={file}
                accept='pdf'
              />
            </FlexContainer>
            <FlexContainer direction='col' className='gap-6'>
              <FlexContainer direction='col' className='gap-6'>
                <FlexContainer direction='col' className='gap-2'>
                  <Text level='h5' className='heading-5'>
                    Pick Your
                    <span className='heading-5 text-primary'> Domains </span>
                  </Text>
                  <Text level='p' className='pre-title'>
                    Select the Domains You're Interested(Max 2 Preferred)
                  </Text>
                </FlexContainer>
                <CheckboxButtonContainer
                  options={JOB_DOMAINS.map(({ label, value }) => ({
                    label,
                    value,
                  }))}
                  selectedValues={selectedDomains}
                  onChange={onSelectSkills}
                />
              </FlexContainer>
              <FlexContainer direction='col' className='gap-6'>
                <FlexContainer direction='col' className='gap-2'>
                  <Text level='h5' className='heading-5'>
                    Select Experience
                    <span className='heading-5 text-primary'> Level </span>
                  </Text>
                </FlexContainer>
                <RadioButtonContainer
                  options={JOB_EXPERIENCE_LEVEL.map(({ label, value }) => ({
                    label,
                    value,
                  }))}
                  selectedValue={selectedExperience}
                  onChange={onSelectExperience}
                />
              </FlexContainer>

              <Button
                text={isEvaluating ? 'Evaluating...' : 'Start Evaluation'}
                variant='PRIMARY'
                icon={<ArrowRightIcon className='h-2 w-2' />}
                onClick={handleResumeEvaluation}
              />
              {evaluationData && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className='mt-12 bg-white shadow-md rounded-xl border border-gray-100 p-8 flex flex-col gap-8'
                >
                  {/* Resume Summary */}
                  <FlexContainer className='mb-6' direction='col'>
                    <Text level='h4' className='text-2xl font-semibold mb-4'>
                      🧾 Resume Summary
                    </Text>
                    <FlexContainer className='gap-6' wrap>
                      <FlexContainer
                        className='text-center'
                        direction='col'
                        itemCenter
                        justifyCenter
                      >
                        <div className='text-4xl font-bold text-primary'>
                          {evaluationData.totalJobsAnalyzed}
                        </div>
                        <div className='text-sm text-gray-600'>
                          Jobs Analyzed
                        </div>
                      </FlexContainer>
                      <FlexContainer
                        className='text-center'
                        direction='col'
                        itemCenter
                        justifyCenter
                      >
                        <div className='text-4xl font-bold text-indigo-600'>
                          {evaluationData.resumeScore}%
                        </div>
                        <div className='text-sm text-gray-600'>
                          Resume Score
                        </div>
                      </FlexContainer>
                      <FlexContainer
                        className='text-center'
                        direction='col'
                        itemCenter
                        justifyCenter
                      >
                        <div className='text-4xl font-bold text-green-600'>
                          {evaluationData.matchedSkills.length}
                        </div>
                        <div className='text-sm text-gray-600'>
                          Skills Matched
                        </div>
                      </FlexContainer>
                      <FlexContainer
                        className='text-center'
                        direction='col'
                        itemCenter
                        justifyCenter
                      >
                        <div className='text-4xl font-bold text-red-600'>
                          {evaluationData.missingSkills.length}
                        </div>
                        <div className='text-sm text-gray-600'>
                          Skills Missing
                        </div>
                      </FlexContainer>
                    </FlexContainer>
                  </FlexContainer>

                  <EvaluationSection
                    title='✅ Matching Skills'
                    type='match'
                    items={evaluationData.matchedSkills}
                  />
                  <EvaluationSection
                    title='❌ Missing Skills'
                    type='missing'
                    items={evaluationData.missingSkills}
                  />
                  <EvaluationSection
                    title='🏢 Companies Hiring'
                    type='company'
                    items={evaluationData.companyTypeDistribution}
                  />
                </motion.div>
              )}
            </FlexContainer>
          </FlexContainer>
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

const EvaluationSection = ({
  title,
  type,
  items,
}: {
  title: string;
  type: 'match' | 'missing' | 'company';
  items: any[];
}) => {
  const colorMap = {
    match: {
      text: 'text-green-800',
      ring: '#16a34a',
      bg: '#d1fae5',
    },
    missing: {
      text: 'text-red-800',
      ring: '#ef4444',
      bg: '#fee2e2',
    },
    company: {
      text: 'text-gray-700',
      ring: '#6366f1',
      bg: '#e0e7ff',
    },
  };

  const getTextColor = () => colorMap[type].text;
  const getBgColor = () => colorMap[type].bg;
  const getRingColor = () => colorMap[type].ring;

  return (
    <FlexContainer direction='col' className='mb-6'>
      <Text level='h4' className='text-lg font-semibold mb-2'>
        {title}
      </Text>
      <FlexContainer className='gap-4' wrap>
        {items.map((item: any) => (
          <FlexContainer
            key={item.skill || item.name}
            className='gap-3'
            itemCenter
          >
            <CircularProgressBar
              percentage={item.percentage}
              color={getRingColor()}
              bg={getBgColor()}
              size={50}
              strokeWidth={5}
            >
              <Text
                level='span'
                className={`text-xs font-bold ${getTextColor()}`}
              >
                {item.percentage}%
              </Text>
            </CircularProgressBar>
            <FlexContainer
              direction='col'
              className='gap-0.5 justify-start'
              itemCenter={false}
            >
              <Text
                level='span'
                className={`strong-text capitalize ${getTextColor()}`}
              >
                {item.skill || item.name}
              </Text>
              <Text level='span' className='pre-title text-gray-500'>
                Seen in {item.frequency || item.count} jobs
              </Text>
            </FlexContainer>
          </FlexContainer>
        ))}
      </FlexContainer>
    </FlexContainer>
  );
};
