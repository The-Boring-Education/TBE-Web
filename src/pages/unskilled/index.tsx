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
  RadioButtonContainer,
  ResumeEvaluationSection,
  Section,
  SEO,
  TabComponent,
  Text,
  UploadFileInput,
} from '@/components';
import { Fragment } from 'react';
import { motion } from 'framer-motion';
import { formatDate, getUnskilledLandingPageProps } from '@/utils';
import { OutlineCardProps, UnskilledLandingPageProps } from '@/interfaces';
import {
  routes,
  STATIC_FILE_PATH,
  UNSKILLED_LANDING_GRAPH_TAB_PARAMS,
  JOB_DOMAINS,
  JOB_EXPERIENCE_LEVEL,
} from '@/constant';
import { useResumeEvaluation } from '@/hooks';

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
  isDev,
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

  // Define color schemes for the evaluation sections
  const colorSchemes = {
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

  const dateAndTime = formatDate({
    dateAndTime: jobData?.updatedAt,
  });

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
                href={`#${routes.internals.landing.explore}`}
                buttonProps={{
                  text: 'Explore Trending Skills',
                  variant: 'PRIMARY',
                  className: 'w-full sm:w-auto',
                  icon: <ArrowRightIcon className='h-2 w-2' />,
                }}
                className='w-full sm:w-auto'
              />
              {/* <LinkButton
                className='w-fit'
                href={`#${routes.internals.landing.upload}`}
                buttonProps={{
                  variant: 'GHOST',
                  text: 'Evaluate My Resume',
                  icon: <ArrowRightIcon className='h-2 w-2' />,
                }}
              /> */}
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
        isDev={isDev}
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
                  <FlexContainer className='gap-4' direction='col'>
                    <FlexContainer className='gap-0.5' direction='col'>
                      <Text level='h5' className='heading-5'>
                        🧾 Your Resume Summary
                      </Text>
                      <Text
                        level='p'
                        className='paragraph text-sm text-gray-500 text-center mt-2'
                      >
                        {evaluationData.totalJobsAnalyzed} Jobs Analyzed
                      </Text>
                    </FlexContainer>
                    <FlexContainer className='gap-6' wrap>
                      <FlexContainer
                        className='gap-1'
                        direction='col'
                        itemCenter
                        justifyCenter
                      >
                        <Text level='h4' className='heading-4 text-green-500'>
                          {evaluationData.resumeScore}%
                        </Text>
                        <Text
                          level='span'
                          className='strong-text text-gray-500'
                        >
                          Resume Score
                        </Text>
                      </FlexContainer>
                      <FlexContainer
                        className='gap-1'
                        direction='col'
                        itemCenter
                        justifyCenter
                      >
                        <Text level='h4' className='heading-4 text-green-600'>
                          {evaluationData.matchedSkills.length}
                        </Text>
                        <Text
                          level='span'
                          className='strong-text text-gray-500'
                        >
                          Skills Matched
                        </Text>
                      </FlexContainer>
                      <FlexContainer
                        className='gap-1'
                        direction='col'
                        itemCenter
                        justifyCenter
                      >
                        <Text level='h4' className='heading-4 text-red-600'>
                          {evaluationData.missingSkills.length}
                        </Text>
                        <Text
                          level='span'
                          className='strong-text text-gray-500'
                        >
                          Skills Missing
                        </Text>
                      </FlexContainer>
                      <FlexContainer
                        className='gap-1'
                        direction='col'
                        itemCenter
                        justifyCenter
                      >
                        <Text level='h4' className='heading-4 text-blue-500'>
                          {evaluationData.remoteJobs}
                        </Text>
                        <Text
                          level='span'
                          className='strong-text text-gray-500'
                        >
                          Remote Jobs
                        </Text>
                      </FlexContainer>
                    </FlexContainer>
                  </FlexContainer>

                  <ResumeEvaluationSection
                    title='✅ Matching Skills'
                    subtitle='Skills that Match with Your Resume'
                    items={evaluationData.matchedSkills}
                    colorScheme={colorSchemes.match}
                  />
                  <ResumeEvaluationSection
                    title='❌ Missing Skills'
                    subtitle='Some Skills maybe not relevant to your profile. You can skip them'
                    items={evaluationData.missingSkills}
                    colorScheme={colorSchemes.missing}
                  />
                  <ResumeEvaluationSection
                    title='🏢 Companies Hiring'
                    subtitle='You should focus on applying at these companies'
                    items={evaluationData.companyTypeDistribution}
                    colorScheme={colorSchemes.company}
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
          <FlexContainer className='gap-2' direction='col'>
            <Text level='h3' className='heading-3'>
              Job Market Insights
            </Text>
            <Text level='p' className='pre-title text-gray-500'>
              Last Updated on: {dateAndTime.date} at {dateAndTime.time}
            </Text>
          </FlexContainer>

          {jobGraphContainer}

          <Text level='p' className='pre-title text-gray-500'>
            Data from 1000+ job listings across various platforms. <br />
          </Text>
        </FlexContainer>
      </Section>
    </Fragment>
  );
};

export const getServerSideProps = getUnskilledLandingPageProps;

export default UnskilledLandingPage;
