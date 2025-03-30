import { motion } from 'framer-motion';
import {
  AcademicCapIcon,
  RocketLaunchIcon,
  UserGroupIcon,
  SparklesIcon,
  LightBulbIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { Fragment } from 'react';
import { getPreFetchProps } from '@/utils';
import { PageProps, TestimonialCardProps } from '@/interfaces';
import {
  SEO,
  Image,
  Carousel,
  Section,
  Text,
  FlexContainer,
  SectionHeaderContainer,
  LinkButton,
  IconCard,
  HeaderLabel,
  Banner,
} from '@/components';
import { LINKS, STATIC_FILE_PATH, TESTIMONIALS } from '@/constant';

const BrinYourIdeaLandingPage = ({ seoMeta }: PageProps) => {
  const projectIdeas = [
    {
      title: 'AI-Powered Resume Analyzer',
      description:
        'Build an AI tool that analyzes resumes and provides personalized feedback',
      icon: <SparklesIcon className='w-8 h-8 text-primary' />,
    },
    {
      title: 'NFT Marketplace for Digital Art',
      description:
        'Create a decentralized marketplace for artists to sell their digital creations',
      icon: <RocketLaunchIcon className='w-8 h-8 text-primary' />,
    },
    {
      title: 'Full Stack Social Learning Platform',
      description:
        'Build a platform where developers can share knowledge and collaborate on projects',
      icon: <UserGroupIcon className='w-8 h-8 text-primary' />,
    },
  ];

  const whyUs = [
    {
      title: 'Live Mentorship Every Week',
      description: 'Get mentorship from industry experts every week',
      icon: <AcademicCapIcon className='w-8 h-8 text-primary' />,
    },
    {
      title: 'Join with Your Friends',
      description: 'Bring up to 4 friends and build together as a team',
      icon: <RocketLaunchIcon className='w-8 h-8 text-primary' />,
    },
    {
      title: 'Hands-on Experience',
      description: 'Build real projects with modern tech stack',
      icon: <LightBulbIcon className='w-8 h-8 text-primary' />,
    },
    {
      title: 'Idea to Product Launch Journey',
      description:
        'From idea to product launch, we will guide you every step of the way',
      icon: <RocketLaunchIcon className='w-8 h-8 text-primary' />,
    },
    {
      title: 'Access to Builder Community',
      description: 'Join a community of builders to learn and grow together',
      icon: <UserGroupIcon className='w-8 h-8 text-primary' />,
    },
    {
      title: 'Free Resources',
      description: 'Get free resources to help you build your idea',
      icon: <LightBulbIcon className='w-8 h-8 text-primary' />,
    },
    {
      title: 'Lifetime Alumni Network',
      description: 'Join a network of alumni to learn and grow together',
      icon: <UserGroupIcon className='w-8 h-8 text-primary' />,
    },
    {
      title: '24x7 QnA with Mentors',
      description: 'Get help with your idea anytime you need',
      icon: <AcademicCapIcon className='w-8 h-8 text-primary' />,
    },
    {
      title: '7 Days Money Back Guarantee',
      description: '7-day money back guarantee - no questions asked.',
      icon: <CheckCircleIcon className='w-8 h-8 text-primary' />,
    },
  ];

  return (
    <Fragment>
      <SEO seoMeta={seoMeta} />
      <HeaderLabel label='🚀 Next cohort starting soon - Limited spots available!' />

      <Section className='relative py-12 md:py-20 text-white'>
        <div className='absolute inset-0 overflow-hidden'>
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=800&q=80')] bg-cover bg-center opacity-20" />
          <div className='absolute inset-0 gradient-5' />
        </div>
        <div className='container mx-auto md:px-8 px-2'>
          <FlexContainer className='relative md:flex-row flex-col-reverse gap-4 lg:gap-8 items-center'>
            <motion.div
              className='flex flex-col flex-1 gap-4'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <FlexContainer direction='col' className='gap-2'>
                <Text
                  level='h1'
                  className='heading-1 text-contentDark leading-tight md:text-left text-center'
                >
                  Build Your First Tech Startup in 2 Months
                </Text>
                <Text
                  level='p'
                  className='text-contentDark md:text-left text-center'
                >
                  Join our cohort program and get the mentorship, resources, and
                  community you need to build your first tech startup in 2
                  months.
                </Text>
              </FlexContainer>
              <FlexContainer
                direction='col'
                className='sm:flex-row gap-2 justify-center lg:justify-start'
              >
                <LinkButton
                  href={LINKS.applyBYICohort}
                  buttonProps={{
                    text: 'Apply Now',
                    variant: 'PRIMARY',
                    className: 'w-full sm:w-auto',
                  }}
                  target='_blank'
                  className='w-full sm:w-auto'
                />
                <LinkButton
                  href={LINKS.demoBYICohort}
                  buttonProps={{
                    text: 'Book Free Demo',
                    variant: 'GHOST',
                    className: 'w-full sm:w-auto',
                  }}
                  target='_blank'
                  className='w-full sm:w-auto'
                />
              </FlexContainer>
            </motion.div>
            <motion.div
              className='relative flex-1 w-full'
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Image
                src='https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&h=600&q=80'
                alt='Team collaboration'
                className='rounded-2xl shadow-2xl w-full object-cover'
              />
              <div className='absolute -bottom-6 -right-6 bg-white p-4 rounded-lg shadow-xl hidden md:block'>
                <div className='flex items-center gap-2'>
                  <SparklesIcon className='w-6 h-6 text-primary' />
                  <span className='text-primary font-semibold'>
                    20+ Projects Launched
                  </span>
                </div>
              </div>
            </motion.div>
          </FlexContainer>
        </div>
      </Section>

      <Section className='py-12 md:py-20 bg-gray-50'>
        <div className='mx-auto md:px-4 px-2'>
          <motion.h2
            className='text-2xl md:text-3xl font-bold text-center mb-6 md:mb-12'
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <SectionHeaderContainer
              heading='What You Can'
              focusText='Build'
              headingLevel={3}
            />
          </motion.h2>
          <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4'>
            {projectIdeas.map((idea, index) => (
              <IconCard
                key={index}
                icon={idea.icon}
                title={idea.title}
                description={idea.description}
              />
            ))}
          </div>
        </div>
      </Section>

      <Section className='py-12 md:py-20 bg-white'>
        <div className='mx-auto md:px-4 px-2'>
          <motion.h2
            className='text-2xl md:text-3xl font-bold text-center mb-4 md:mb-6'
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <SectionHeaderContainer
              heading='Your 2-Month'
              focusText='Builder Journey'
              headingLevel={3}
            />
          </motion.h2>
          <ol className='relative border-l border-gray-300 ml-4 space-y-8'>
            {[
              {
                week: 'Week 1',
                title: 'Idea Validation & Team Formation',
                description:
                  'Identify your project idea, validate the problem, and form your team.',
              },
              {
                week: 'Week 2',
                title: 'User Research & Wireframing',
                description:
                  'Conduct user research, gather feedback, and design wireframes.',
              },
              {
                week: 'Week 3',
                title: 'Tech Stack Finalization & Setup',
                description:
                  'Choose the right tech stack and set up the development environment.',
              },
              {
                week: 'Week 4',
                title: 'Build MVP - Phase 1',
                description:
                  'Start developing the MVP and implement core features.',
              },
              {
                week: 'Week 5',
                title: 'Build MVP - Phase 2',
                description:
                  'Continue building and refine product features based on feedback.',
              },
              {
                week: 'Week 6',
                title: 'Product Polishing & Testing',
                description:
                  'Polish UI/UX, fix bugs, and perform usability testing.',
              },
              {
                week: 'Week 7',
                title: 'Marketing & Pre-launch Strategy',
                description:
                  'Craft your go-to-market plan and set up launch pages and waitlists.',
              },
              {
                week: 'Week 8',
                title: 'Launch & Demo Day',
                description:
                  'Launch your product publicly and present during demo day!',
              },
            ].map((item, index) => (
              <motion.li
                key={index}
                className='mb-8 ml-4'
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className='absolute w-3 h-3 bg-primary rounded-full -left-1.5 border border-white' />
                <time className='mb-1 text-sm font-medium text-primary'>
                  {item.week}
                </time>
                <h3 className='text-lg font-semibold text-gray-900'>
                  {item.title}
                </h3>
                <p className='text-gray-600'>{item.description}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </Section>

      <Section className='py-12 md:py-20'>
        <div className='mx-auto md:px-4 px-2'>
          <motion.h2
            className='text-2xl md:text-3xl font-bold text-center mb-6 md:mb-12'
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <SectionHeaderContainer
              heading='Why Choose'
              focusText='Us'
              headingLevel={3}
            />
          </motion.h2>
          <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4'>
            {whyUs.map((item, index) => {
              return <IconCard key={index} {...item} />;
            })}
          </div>
        </div>
      </Section>

      <Section className='py-12 md:py-20'>
        <div className='md:px-4 px-2'>
          <motion.h2
            className='text-2xl md:text-3xl font-bold text-center mb-4 md:mb-6'
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <SectionHeaderContainer
              heading='Investment in'
              focusText='Your Future'
            />
          </motion.h2>
          <motion.div
            className='md:px-10 md:py-8 py-4 px-2 w-fit bg-white mx-auto rounded-lg'
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <FlexContainer direction='col' className='gap-3'>
              <Text level='h5' className='heading-5'>
                Bring Your Idea Cohort
              </Text>
              <FlexContainer direction='col' className='gap-1'>
                <Text
                  level='h5'
                  className='heading-5 line-through text-gray-400'
                >
                  ₹ 9999
                </Text>
                <FlexContainer direction='col' className='gap-1'>
                  <Text level='h3' className='heading-3 text-primary'>
                    ₹ 4999
                  </Text>
                  <span className='bg-primary/10 text-primary px-2 py-1 rounded text-sm font-medium'>
                    50% OFF
                  </span>
                </FlexContainer>
              </FlexContainer>
            </FlexContainer>
            <ul className='space-y-2 md:space-y-4 my-4'>
              {[
                '2 Months Intensive Program',
                'Weekly 1:1 Live Mentorship',
                'Join with Your Friends(Max 4 people)',
                'Access to Builder Community',
                'Access to Free Resources',
                'Lifetime Alumni Network',
                '24x7 QnA with Mentors',
                '7 Days Money Back Guarantee',
              ].map((feature, index) => (
                <motion.li
                  key={index}
                  className='flex items-center'
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <CheckCircleIcon className='w-5 h-5 text-primary mr-2 flex-shrink-0' />
                  <Text level='span' className='span'>
                    {feature}
                  </Text>
                </motion.li>
              ))}
            </ul>
            <LinkButton
              href={LINKS.applyBYICohort}
              buttonProps={{
                text: 'Register Now',
                variant: 'PRIMARY',
                animationClasses: 'w-full sm:w-auto',
                className: 'm-auto',
              }}
              target='_blank'
            />
          </motion.div>
        </div>
      </Section>

      <Banner
        title='We Offer 7 Days Money Back Guarantee'
        description='If you are not satisfied with the program, we will refund your money within 7 days. No questions asked.'
        buttonText='Register Now'
        buttonLink={LINKS.applyBYICohort}
        imageSrc={`${STATIC_FILE_PATH.svg}/community.svg`}
        variant='VARIANT_B'
      />

      <Section className='py-12 md:py-20 bg-gray-50'>
        <div className='mx-auto md:px-4 px-2'>
          <motion.h2
            className='text-2xl md:text-3xl font-bold text-center mb-4 md:mb-6'
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <SectionHeaderContainer
              heading='What Our'
              focusText='Alumni Say'
              headingLevel={3}
            />
          </motion.h2>
          <Carousel
            items={TESTIMONIALS}
            renderItem={(item: TestimonialCardProps) => {
              const { title, content, image, work } = item;

              return (
                <div className='md:px-10 md:py-8 py-4 px-2 w-fit bg-white mx-auto rounded-lg'>
                  <div className='flex flex-col md:flex-row items-center gap-6'>
                    <Image
                      src={image}
                      alt={title}
                      className='w-24 h-24 rounded-full object-cover'
                      fullWidth={false}
                      fullHeight={false}
                    />
                    <div className='flex-1 text-center md:text-left'>
                      <p className='text-lg md:text-xl italic mb-4'>
                        &ldquo;{content}&rdquo;
                      </p>
                      <div>
                        <h4 className='font-semibold text-lg'>{title}</h4>
                        <p className='text-gray-600'>{work}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }}
          />
        </div>
      </Section>
    </Fragment>
  );
};

export const getServerSideProps = getPreFetchProps;

export default BrinYourIdeaLandingPage;
