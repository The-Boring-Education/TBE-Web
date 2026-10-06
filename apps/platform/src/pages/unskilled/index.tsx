import {
  ArrowRightIcon,
  ArrowTrendingUpIcon,
  CodeBracketIcon,
  MapPinIcon,
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
} from '@tbe/components';
import {
  JOB_DOMAINS,
  JOB_EXPERIENCE_LEVEL,
  routes,
  STATIC_FILE_PATH,
  UNSKILLED_LANDING_GRAPH_TAB_PARAMS,
} from '@tbe/constants';
import { useResumeEvaluation, useUnskilledGraphData } from '@tbe/hooks';
import type {
  OutlineCardProps,
  UnskilledLandingPageProps,
} from '@tbe/interface';
import { formatDate, getUnskilledLandingPageProps } from '@tbe/utils';
import { motion } from 'framer-motion';
import React, { Fragment, useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

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
  jobData: _initialJobData, // Not used - data fetched client-side
  isDev,
}: UnskilledLandingPageProps) => {
  // Fetch graph data on client-side after page loads
  const {
    data: jobData,
    loading: graphLoading,
    error: graphError,
  } = useUnskilledGraphData();

  const {
    file,
    handleFileUpload,
    isParsing,
    selectedDomains,
    setSelectedDomains,
    selectedExperience,
    setSelectedExperience,
    isEvaluating,
    evaluationData,
    handleResumeEvaluation,
    error,
  } = useResumeEvaluation();

  const onSelectSkills = (value: string[]) => {
    setSelectedDomains(value);
  };

  const onSelectExperience = (value: string) => {
    setSelectedExperience(value);
  };

  const jobMarketPanels = jobData && [
    <ResponsiveContainer key={0} height={400} width='100%'>
      <BarChart data={jobData.jobDomains} layout='horizontal'>
        <CartesianGrid strokeDasharray='3 3' />
        <YAxis type='number' />
        <XAxis dataKey='name' type='category' width={100} />
        <Tooltip />
        <Bar dataKey='count' fill='hsl(var(--chart-1))' />
      </BarChart>
    </ResponsiveContainer>,

    <ResponsiveContainer key={1} height={400} width='100%'>
      <BarChart data={jobData.trendingSkills} layout='horizontal'>
        <CartesianGrid strokeDasharray='3 3' />
        <YAxis type='number' />
        <XAxis dataKey='name' type='category' width={100} />
        <Tooltip />
        <Bar dataKey='count' fill='hsl(var(--chart-1))' />
      </BarChart>
    </ResponsiveContainer>,

    <ResponsiveContainer key={3} height={400} width='100%'>
      <BarChart data={jobData.companyTypes} layout='horizontal'>
        <CartesianGrid strokeDasharray='3 3' />
        <YAxis type='number' />
        <XAxis dataKey='name' type='category' width={100} />
        <Tooltip />
        <Bar dataKey='count' fill='hsl(var(--chart-1))' />
      </BarChart>
    </ResponsiveContainer>,

    <ResponsiveContainer key={4} height={400} width='100%'>
      <BarChart data={jobData.topLocations} layout='horizontal'>
        <CartesianGrid strokeDasharray='3 3' />
        <YAxis type='number' />
        <XAxis dataKey='name' type='category' width={100} />
        <Tooltip />
        <Bar dataKey='count' fill='hsl(var(--chart-1))' />
      </BarChart>
    </ResponsiveContainer>,
  ];

  const jobGraphContainer = graphLoading ? (
    <FlexContainer className='py-12' direction='col' itemCenter>
      <Text className='text-gray-500 animate-pulse' level='p'>
        Loading market insights...
      </Text>
    </FlexContainer>
  ) : graphError ? (
    <FlexContainer className='py-12' direction='col' itemCenter>
      <Text className='text-red-500' level='p'>
        Unable to load graph data. Please try again later.
      </Text>
    </FlexContainer>
  ) : jobMarketPanels ? (
    <TabComponent
      tabLabels={UNSKILLED_LANDING_GRAPH_TAB_PARAMS}
      tabPanels={jobMarketPanels}
    />
  ) : (
    <FlexContainer>
      <Text className='text-gray-500' level='p'>
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

  const [dateDisplay, setDateDisplay] = useState<{
    date: string;
    time: string;
  } | null>(null);

  useEffect(() => {
    if (jobData?.updatedAt) {
      const formatted = formatDate({
        dateAndTime: jobData.updatedAt,
      });
      setDateDisplay(formatted);
    }
  }, [jobData?.updatedAt]);

  return (
    <Fragment>
      <SEO seoMeta={seoMeta} />
      <Section>
        <FlexContainer className='mx-auto gap-12 md:flex-row flex-col-reverse'>
          <FlexContainer className='gap-4' direction='col' itemCenter={false}>
            <FlexContainer className='gap-2' direction='col' itemCenter={false}>
              <Text className='heading-3' level='h3'>
                What's Missing in Your{' '}
                <Text className='heading-3 text-primary' level='span'>
                  Resume?
                </Text>{' '}
                🚀 <br /> Find and Crack Your Next{' '}
                <Text className='heading-3 text-primary' level='span'>
                  Tech Job
                </Text>
              </Text>
              <Text className='paragraph max-w-md leading-relaxed' level='p'>
                Discover in-demand skills & tech roles. Get insights to
                supercharge your career.
              </Text>
            </FlexContainer>
            <FlexContainer
              className='sm:flex-row gap-2 justify-center lg:justify-start'
              direction='col'
            >
              <LinkButton
                buttonProps={{
                  text: 'Explore Trending Skills',
                  variant: 'PRIMARY',
                  className: 'w-full sm:w-auto',
                  icon: <ArrowRightIcon className='h-2 w-2' />,
                }}
                className='w-full sm:w-auto'
                href={`#${routes.internals.landing.explore}`}
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
              alt='unskilled-img'
              className='rounded-2xl object-cover'
              src={`${STATIC_FILE_PATH.svg}/unskilled-hero.svg`}
            />
          </FlexContainer>
        </FlexContainer>
      </Section>

      <Section
        className='bg-gradient-to-r from-white via-blue-50 to-violet-100 py-20 md:px-10 px-4'
        id={`${routes.internals.landing.upload}`}
        // isDev={isDev}
      >
        <motion.div
          className='relative max-w-5xl mx-auto'
          initial={{ opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <FlexContainer className='gap-8' direction='col'>
            <FlexContainer className='gap-6' direction='col'>
              <FlexContainer className='gap-2' direction='col'>
                <Text className='heading-3' level='h3'>
                  Evaluate Your
                  <span className='heading-3 text-primary'> Resume </span>
                  <span role='img'>🔍</span>
                </Text>
                <Text className='max-w-2xl paragraph' level='p' textCenter>
                  Upload your resume and let us analyze thousands of job
                  listings to highlight missing skills and suggest tailored
                  resources.
                </Text>
              </FlexContainer>
              <UploadFileInput
                accept='pdf'
                file={file}
                isProcessing={isParsing}
                onChange={handleFileUpload}
              />
            </FlexContainer>
            <FlexContainer className='gap-6' direction='col'>
              <FlexContainer className='gap-6' direction='col'>
                <FlexContainer className='gap-2' direction='col'>
                  <Text className='heading-5' level='h5'>
                    Pick Your
                    <span className='heading-5 text-primary'> Domains </span>
                  </Text>
                  <Text className='pre-title' level='p'>
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
              <FlexContainer className='gap-6' direction='col'>
                <FlexContainer className='gap-2' direction='col'>
                  <Text className='heading-5' level='h5'>
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
                icon={<ArrowRightIcon className='h-2 w-2' />}
                text={isEvaluating ? 'Evaluating...' : 'Start Evaluation'}
                variant='PRIMARY'
                onClick={handleResumeEvaluation}
                disabled={isEvaluating}
              />

              {error && (
                <Text className='text-red-600 text-sm text-center' level='p'>
                  {error}
                </Text>
              )}

              {evaluationData && (
                <motion.div
                  animate={{ opacity: 1, y: 0 }}
                  className='mt-12 bg-white shadow-md rounded-xl border border-gray-100 p-8 flex flex-col gap-8'
                  initial={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.5 }}
                >
                  <FlexContainer className='gap-4' direction='col'>
                    <FlexContainer className='gap-0.5' direction='col'>
                      <Text className='heading-5' level='h5'>
                        🧾 Your Resume Summary
                      </Text>
                      <Text
                        className='paragraph text-sm text-gray-500 text-center mt-2'
                        level='p'
                      >
                        {evaluationData.jobsAnalyzed} Jobs Analyzed
                      </Text>
                    </FlexContainer>
                    <FlexContainer wrap className='gap-6'>
                      <FlexContainer
                        itemCenter
                        justifyCenter
                        className='gap-1'
                        direction='col'
                      >
                        <Text className='heading-4 text-green-500' level='h4'>
                          {evaluationData.resumeScore}%
                        </Text>
                        <Text
                          className='strong-text text-gray-500'
                          level='span'
                        >
                          Resume Score
                        </Text>
                      </FlexContainer>
                      <FlexContainer
                        itemCenter
                        justifyCenter
                        className='gap-1'
                        direction='col'
                      >
                        <Text className='heading-4 text-green-600' level='h4'>
                          {evaluationData.skillsMatched}
                        </Text>
                        <Text
                          className='strong-text text-gray-500'
                          level='span'
                        >
                          Skills Matched
                        </Text>
                      </FlexContainer>
                      <FlexContainer
                        itemCenter
                        justifyCenter
                        className='gap-1'
                        direction='col'
                      >
                        <Text className='heading-4 text-red-600' level='h4'>
                          {evaluationData.skillsMissing}
                        </Text>
                        <Text
                          className='strong-text text-gray-500'
                          level='span'
                        >
                          Skills Missing
                        </Text>
                      </FlexContainer>
                      <FlexContainer
                        itemCenter
                        justifyCenter
                        className='gap-1'
                        direction='col'
                      >
                        <Text className='heading-4 text-blue-500' level='h4'>
                          {evaluationData.remoteJobs}
                        </Text>
                        <Text
                          className='strong-text text-gray-500'
                          level='span'
                        >
                          Remote Jobs
                        </Text>
                      </FlexContainer>
                    </FlexContainer>
                  </FlexContainer>

                  <ResumeEvaluationSection
                    colorScheme={colorSchemes.match}
                    items={evaluationData.matchingSkills.map((skill) => ({
                      skill: skill.skill,
                      percentage: skill.percentage,
                      frequency: skill.jobCount,
                    }))}
                    subtitle='Skills that Match with Your Resume'
                    title='✅ Matching Skills'
                  />
                  <ResumeEvaluationSection
                    colorScheme={colorSchemes.missing}
                    items={evaluationData.missingSkills.map((skill) => ({
                      skill: skill.skill,
                      percentage: skill.percentage,
                      frequency: skill.jobCount,
                    }))}
                    subtitle='Some Skills maybe not relevant to your profile. You can skip them'
                    title='❌ Missing Skills'
                  />
                  <ResumeEvaluationSection
                    colorScheme={colorSchemes.company}
                    items={evaluationData.companyTypeDistribution.map(
                      (company) => ({
                        name: company.type,
                        percentage: company.percentage,
                        count: company.jobCount,
                      }),
                    )}
                    subtitle='You should focus on applying at these companies'
                    title='🏢 Companies Hiring'
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
            <Text className='heading-3' level='h3'>
              Job Market Insights
            </Text>
            {dateDisplay && (
              <Text className='pre-title text-gray-500' level='p'>
                Last Updated on: {dateDisplay.date} at {dateDisplay.time}
              </Text>
            )}
          </FlexContainer>

          {jobGraphContainer}

          <Text className='pre-title text-gray-500' level='p'>
            Data from 1000+ job listings across various platforms. <br />
          </Text>
        </FlexContainer>
      </Section>
    </Fragment>
  );
};

export const getServerSideProps = getUnskilledLandingPageProps;

export default UnskilledLandingPage;
