import {
  AcademicCapIcon,
  CheckCircleIcon,
  LightBulbIcon,
  RocketLaunchIcon,
  SparklesIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { Fragment, useState } from 'react';

import {
  Banner,
  Button,
  Carousel,
  CohortJourneyContainer,
  FAQSection,
  FlexContainer,
  HeaderLabel,
  IconCard,
  Image,
  InterviewPrepSection,
  LinkButton,
  Pill,
  PrevCohortProjects,
  Section,
  SectionHeaderContainer,
  SEO,
  SessionDetailsSection,
  Text,
} from '@tbe/components';
import {
  BYI_USER_CATEGORIES,
  LINKS,
  routes,
  STATIC_FILE_PATH,
  TESTIMONIALS,
} from '@tbe/constants';
import type {
  CohortUserCategoryProps,
  PageProps,
  TestimonialCardProps,
} from '@tbe/interface';
import { getPreFetchProps } from '@tbe/utils';

const BrinYourIdeaLandingPage = ({ seoMeta }: PageProps) => {
  const whyUs = [
    {
      title: 'Live Mentorship Every Week',
      description: 'Get Mentorship from Industry Mentors Every Week',
      icon: <AcademicCapIcon className='w-8 h-8 text-primary' />,
    },
    {
      title: 'Join with Your Friends',
      description: 'Bring up to 4 friends and Build together as a Team',
      icon: <RocketLaunchIcon className='w-8 h-8 text-primary' />,
    },
    {
      title: 'Implement Gen AI in Your Projects',
      description: 'Learn to implement Gen AI in your projects',
      icon: <LightBulbIcon className='w-8 h-8 text-primary' />,
    },
    {
      title: 'Personalised Interview Preparation',
      description: 'Get Personalised Interview Preparation and Mock Interviews',
      icon: <AcademicCapIcon className='w-8 h-8 text-primary' />,
    },
    {
      title: 'Resume Building with AI',
      description: 'Get AI-powered resume building and review',
      icon: <RocketLaunchIcon className='w-8 h-8 text-primary' />,
    },
    {
      title: '7 Days Money Back Guarantee',
      description: '7-day money back guarantee - no questions asked.',
      icon: <CheckCircleIcon className='w-8 h-8 text-primary' />,
    },
    {
      title: '50% Cashback on Completion',
      description:
        'Complete the program and get 50% cashback on your investment',
      icon: <CheckCircleIcon className='w-8 h-8 text-primary' />,
    },
    {
      title: 'Learn & Build with Hands-on Learning',
      description: 'Follow Our Personalised Roadmap and Build Your Idea',
      icon: <LightBulbIcon className='w-8 h-8 text-primary' />,
    },
    {
      title: 'Idea to Product + Launch',
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
      description: 'Get free resources to help you build the project',
      icon: <LightBulbIcon className='w-8 h-8 text-primary' />,
    },
    {
      title: '24x7 QnA with us',
      description: "Ping us anytime on WhatsApp and we'll be there to help you",
      icon: <AcademicCapIcon className='w-8 h-8 text-primary' />,
    },
  ];

  const [selectedUserCategory, setSelectedUserCategory] =
    useState<CohortUserCategoryProps>(BYI_USER_CATEGORIES[0]);
  const [teamSize, setTeamSize] = useState(1);
  const [perTeamMemberPrice, setPerTeamMemberPrice] = useState(
    selectedUserCategory.price / teamSize
  );

  const handleTeamSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setTeamSize(value);

    const newPrice = Math.round(selectedUserCategory.price / value);
    setPerTeamMemberPrice(newPrice);
  };

  const handleSelectUserCategory = (key: string) => {
    const selectedCategory = BYI_USER_CATEGORIES.find(
      (category) => category.key === key
    );

    if (selectedCategory) {
      setSelectedUserCategory(selectedCategory);

      setPerTeamMemberPrice(Math.round(selectedCategory.price / teamSize));
    }
  };

  const userCategoryContainer = BYI_USER_CATEGORIES.map(({ label, key }) => (
    <Button
      key={key}
      className={`md:px-4 md:py-2 px-2 py-1 md:w-fit border-lightGray rounded-full transition-all ${
        selectedUserCategory.key === key
          ? 'bg-primary text-white'
          : 'bg-white text-primary'
      }`}
      text={label}
      variant='GHOST'
      onClick={() => handleSelectUserCategory(key)}
    />
  ));

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
              animate={{ opacity: 1, y: 0 }}
              className='flex flex-col flex-1 gap-4'
              initial={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.8 }}
            >
              <FlexContainer className='gap-2' direction='col'>
                <Text
                  className='heading-1 text-contentDark leading-tight md:text-left text-center'
                  level='h1'
                >
                  Crack Interviews while Building Real Life Projects
                </Text>
                <Text
                  className='text-contentDark md:text-left text-center'
                  level='p'
                >
                  Join our cohort and build your idea with a team of up to 4
                  friends. Get mentorship from industry experts and learn to
                  implement Gen AI in your projects.
                </Text>
              </FlexContainer>
              <FlexContainer
                className='sm:flex-row gap-2 justify-center lg:justify-start'
                direction='col'
              >
                <LinkButton
                  buttonProps={{
                    text: 'Apply Now',
                    variant: 'PRIMARY',
                    className: 'w-full sm:w-auto',
                  }}
                  className='w-full sm:w-auto'
                  href={LINKS.applyBYICohort}
                  target='_blank'
                />
                <LinkButton
                  buttonProps={{
                    text: 'Book Free Call',
                    variant: 'GHOST',
                    className: 'w-full sm:w-auto',
                  }}
                  className='w-full sm:w-auto'
                  href={LINKS.bookProjectSession}
                  target='_blank'
                />
              </FlexContainer>
            </motion.div>
            <motion.div
              animate={{ opacity: 1, x: 0 }}
              className='relative flex-1 w-full'
              initial={{ opacity: 0, x: 100 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Image
                alt='Team collaboration'
                className='rounded-2xl shadow-2xl w-full object-cover'
                src='https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&h=600&q=80'
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

      <SessionDetailsSection />

      <Section className='bg-white py-8'>
        <FlexContainer
          className='justify-center gap-8 flex-wrap'
          direction='col'
        >
          <Text className='heading-4' level='h4' textCenter>
            Where Are You in Your Tech Journey?
          </Text>
          <FlexContainer className='justify-center gap-2 flex-wrap'>
            {userCategoryContainer}
          </FlexContainer>
          <SectionHeaderContainer
            focusText={`in Cohort | ${selectedUserCategory.duration}`}
            heading='Your Roadmap'
            headingLevel={5}
          />
          <CohortJourneyContainer weeks={selectedUserCategory.data} />
        </FlexContainer>
      </Section>

      <InterviewPrepSection />

      <Section>
        <FlexContainer className='md:gap-6 gap-3' direction='col'>
          <SectionHeaderContainer
            focusText='Us'
            heading='Why Choose'
            headingLevel={3}
          />
          <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4'>
            {whyUs.map((item, index) => (
              <IconCard key={index} {...item} />
            ))}
          </div>
        </FlexContainer>
      </Section>

      <Section className='py-6 md:py-20 px-2'>
        <FlexContainer className='md:gap-8 gap-4' direction='col'>
          <FlexContainer className='' direction='col'>
            <SectionHeaderContainer
              focusText='Your Career'
              heading='Invest in'
            />
          </FlexContainer>
          <FlexContainer className='' direction='col'>
            <FlexContainer className='gap-4' direction='col'>
              <FlexContainer className='gap-4 flex-wrap' direction='col'>
                <FlexContainer className='gap-2 flex-wrap'>
                  {userCategoryContainer}
                </FlexContainer>
                <FlexContainer className='gap-2'>
                  <Text className='label' level='label'>
                    Number of Members
                  </Text>
                  <input
                    className='w-full accent-primary'
                    max={4}
                    min={1}
                    type='range'
                    value={teamSize}
                    onChange={handleTeamSizeChange}
                  />
                  <Text className='heading-5 text-primary' level='h5'>
                    {teamSize}
                  </Text>
                </FlexContainer>
              </FlexContainer>
              <FlexContainer className='gap-4' direction='col'>
                <FlexContainer className='gap-1' direction='col'>
                  <FlexContainer className='gap-1 items-end' itemCenter={false}>
                    <Text className='heading-3 text-primary' level='h3'>
                      ₹ {perTeamMemberPrice}
                    </Text>
                    <Text className='pre-title text-greyDark' level='span'>
                      / Member
                    </Text>
                  </FlexContainer>
                </FlexContainer>
                <FlexContainer className='gap-2' direction='col'>
                  <FlexContainer className='gap-2'>
                    <Text
                      className='heading-5 line-through text-gray-400'
                      level='h5'
                    >
                      ₹ {selectedUserCategory.slashedPrice}
                    </Text>
                    <Text className='heading-5 text-primary' level='h5'>
                      ₹ {selectedUserCategory.price}
                    </Text>
                    <Text className='pre-title text-greyDark' level='span'>
                      Total
                    </Text>
                  </FlexContainer>
                  <Pill
                    text={`${selectedUserCategory.discount}% OFF`}
                    variant='PRIMARY'
                  />
                </FlexContainer>
              </FlexContainer>
            </FlexContainer>
            <ul className='space-y-2 md:space-y-4 my-4'>
              {selectedUserCategory.features.map((feature, index) => (
                <FlexContainer
                  key={index}
                  className='gap-2 justify-left'
                  justifyCenter={false}
                >
                  <CheckCircleIcon className='w-5 h-5 text-primary' />
                  <Text className='span' level='span'>
                    {feature}
                  </Text>
                </FlexContainer>
              ))}
            </ul>

            <LinkButton
              buttonProps={{
                text: 'Register Now',
                variant: 'PRIMARY',
                animationClasses: 'w-full sm:w-auto',
                className: 'm-auto',
              }}
              href={LINKS.applyBYICohort}
              target='_blank'
            />
          </FlexContainer>
        </FlexContainer>
      </Section>

      <PrevCohortProjects />

      <Banner
        buttonLink={LINKS.applyBYICohort}
        buttonText='Register Now'
        description='Complete the program and get 50% cashback on your investment.'
        imageSrc={`${STATIC_FILE_PATH.svg}/community.svg`}
        title='Take Back 50% Cashback on Project Completion'
        variant='VARIANT_A'
      />

      <Banner
        buttonLink={LINKS.applyBYICohort}
        buttonText='Register Now'
        description='If you are not satisfied with the program, we will refund your money within 7 days. No questions asked.'
        imageSrc={`${STATIC_FILE_PATH.svg}/webinar-hero.svg`}
        title='We Offer 7 Days Money Back Guarantee'
        variant='VARIANT_B'
      />

      <Section className='py-12 md:py-20 bg-gray-50'>
        <FlexContainer className='md:gap-6 gap-3' direction='col'>
          <SectionHeaderContainer
            focusText='Alumni Say'
            heading='What Our'
            headingLevel={3}
          />
          <Carousel
            items={TESTIMONIALS}
            renderItem={(item: TestimonialCardProps) => {
              const { title, content, image, work } = item;

              return (
                <div className='md:px-10 md:py-8 py-4 px-2 w-fit bg-white mx-auto rounded-lg'>
                  <div className='flex flex-col md:flex-row items-center gap-6'>
                    <Image
                      alt={title}
                      className='w-24 h-24 rounded-full object-cover'
                      fullHeight={false}
                      fullWidth={false}
                      src={image}
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
        </FlexContainer>
      </Section>

      <FAQSection />
    </Fragment>
  );
};

export const getStaticProps = async () => ({
  ...(await getPreFetchProps({ slug: routes.cohort.bringYourIdea })),
});

export default BrinYourIdeaLandingPage;
