import { Fragment } from 'react';
import { motion } from 'framer-motion';

import {
  Button,
  FlexContainer,
  GridContainer,
  Image,
  Link,
  Section,
  SEO,
  SectionHeaderContainer,
  Text,
} from '@/components';
import { LINKS, routes } from '@/constant';
import type { PageProps } from '@/interfaces';
import { getPreFetchProps } from '@/utils';

const HeroSection = () => (
  <Section className='relative overflow-hidden px-4 md:px-8 py-16 md:py-24 gradient-bg'>
    <div className='absolute inset-0 pointer-events-none'>
      <div className='absolute -top-24 -right-24 w-72 h-72 md:w-[28rem] md:h-[28rem] rounded-full bg-gradient-to-br from-indigo-500/30 to-fuchsia-500/20 blur-3xl' />
      <div className='absolute -bottom-24 -left-24 w-72 h-72 md:w-[28rem] md:h-[28rem] rounded-full bg-gradient-to-br from-amber-500/20 to-lime-400/20 blur-3xl' />
    </div>

    <div className='max-w-6xl mx-auto relative z-10'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-10 items-center'>
        <div>
          <Text level='h1' className='heading-1 text-white'>
            Be the Face of Tech in Your College 🚀
          </Text>
          <Text level='p' className='paragraph mt-4 text-gray-200'>
            Join The Boring Education’s Campus Connect & DevRel Program — Build,
            Lead, and Learn.
          </Text>
          <FlexContainer className='gap-4 mt-8' justifyCenter={false}>
            <a href='#apply'>
              <Button className='button bg-[#ff5757] hover:bg-[#ff6b6b] text-white px-6 py-3 rounded-xl shadow-lg shadow-[#ff5757]/25'>
                Apply Now
              </Button>
            </a>
            <Link
              href={LINKS.viewSessionDetails}
              target='_blank'
              className='button-text underline text-white'
            >
              View Program Details
            </Link>
          </FlexContainer>
          <div className='mt-6 flex items-center gap-3 text-gray-300 text-sm'>
            <span>Open across colleges in India</span>
            <span className='opacity-40'>•</span>
            <span>Limited Seats</span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className='relative'
        >
          <div className='rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-4 md:p-6'>
            <Image
              alt='Campus tech vibes'
              className='rounded-xl'
              src='/images/coding_bg.png'
            />
          </div>
        </motion.div>
      </div>
    </div>
  </Section>
);

const AboutSection = () => (
  <Section className='px-4 md:px-8 py-16'>
    <div className='max-w-6xl mx-auto'>
      <SectionHeaderContainer
        title='About the Program'
        subtitle='We are hiring DevRels across colleges in India'
      />
      <div className='grid grid-cols-1 md:grid-cols-2 gap-10 mt-6'>
        <Text level='p' className='paragraph text-gray-700'>
          As a Campus DevRel, you will build a tech and learning community on
          your campus, host events and workshops, collaborate on hackathons, and
          learn directly from our mentors. Become a leader who drives innovation
          and community building at your college.
        </Text>
        <GridContainer className='grid grid-cols-2 gap-4'>
          {[
            {
              title: 'Build Community',
              desc: 'Lead a tech-first community at your campus',
            },
            { title: 'Host Events', desc: 'Workshops, meetups, hackathons' },
            {
              title: 'Learn from Mentors',
              desc: 'Industry guidance and feedback',
            },
            {
              title: 'Grow Your Brand',
              desc: 'Certificates, badges, and visibility',
            },
          ].map((item) => (
            <div
              key={item.title}
              className='rounded-xl border border-gray-200 p-4 bg-white shadow-sm'
            >
              <Text level='h4' className='heading-5 text-gray-900'>
                {item.title}
              </Text>
              <Text level='p' className='text-sm text-gray-600 mt-1'>
                {item.desc}
              </Text>
            </div>
          ))}
        </GridContainer>
      </div>
    </div>
  </Section>
);

const HiringProcess = () => (
  <Section className='px-4 md:px-8 py-16 bg-gradient-to-b from-white to-gray-50'>
    <div className='max-w-6xl mx-auto'>
      <SectionHeaderContainer
        title='Hiring Process'
        subtitle='A simple and fast selection process'
      />
      <div className='relative mt-8'>
        <div className='absolute left-4 md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 via-pink-500 to-amber-500 rounded-full md:-translate-x-1/2' />
        <div className='space-y-10 relative'>
          {[
            {
              step: '01',
              title: 'Apply Online',
              desc: 'Submit your application form',
            },
            {
              step: '02',
              title: 'Short Interview',
              desc: 'Quick conversation with our team',
            },
            {
              step: '03',
              title: 'Onboarding & Training',
              desc: 'Kickstart with resources and guidance',
            },
            {
              step: '04',
              title: 'Start Building',
              desc: 'Lead your campus community',
            },
          ].map((s, idx) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.05 }}
              viewport={{ once: true }}
              className='relative grid grid-cols-[auto_1fr] md:grid-cols-2 gap-4 md:gap-8 items-start'
            >
              <div className='md:hidden' />
              <div className='flex items-center gap-4'>
                <div className='z-10 w-10 h-10 rounded-full bg-white border-2 border-indigo-500 flex items-center justify-center font-semibold text-indigo-600 shadow-md'>
                  {s.step}
                </div>
                <div>
                  <Text level='h3' className='heading-4 text-gray-900'>
                    {s.title}
                  </Text>
                  <Text level='p' className='text-gray-600'>
                    {s.desc}
                  </Text>
                </div>
              </div>
              <div className='hidden md:block' />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  </Section>
);

const LearningJourney = () => (
  <Section className='px-4 md:px-8 py-16'>
    <div className='max-w-6xl mx-auto'>
      <SectionHeaderContainer
        title='Learning Journey'
        subtitle='Grow from fundamentals to leadership'
      />
      <GridContainer className='grid grid-cols-1 md:grid-cols-5 gap-4 mt-8'>
        {[
          'DevRel Fundamentals',
          'Event Planning & Community Building',
          'Hands-on Projects with TBE',
          'Networking & Leadership Growth',
          'Graduation & Certification',
        ].map((title, idx) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: idx * 0.05 }}
            viewport={{ once: true }}
            className='rounded-xl border border-gray-200 bg-white p-4 shadow-sm'
          >
            <div className='text-xs text-gray-500 mb-2'>Stage {idx + 1}</div>
            <Text level='h4' className='heading-5 text-gray-900'>
              {title}
            </Text>
            <div className='mt-2 h-1.5 rounded-full bg-gray-100'>
              <div className='h-1.5 rounded-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-amber-500 w-2/3' />
            </div>
          </motion.div>
        ))}
      </GridContainer>
    </div>
  </Section>
);

const PerksSection = () => (
  <Section className='px-4 md:px-8 py-16 bg-gradient-to-b from-gray-50 to-white'>
    <div className='max-w-6xl mx-auto'>
      <SectionHeaderContainer
        title='Perks & Rewards'
        subtitle='Grow faster with exclusive benefits'
      />
      <GridContainer className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-8'>
        {[
          'Free mentorship from industry experts',
          'TBE Swag & Merchandise',
          'Certificates & LinkedIn Badges',
          'Priority Access to TBE Internships',
          'Event hosting budget',
          'Networking with top founders & engineers',
        ].map((perk) => (
          <div
            key={perk}
            className='rounded-xl border border-gray-200 bg-white p-4 shadow-sm'
          >
            <Text level='p' className='text-gray-800'>
              • {perk}
            </Text>
          </div>
        ))}
      </GridContainer>
    </div>
  </Section>
);

const TestimonialsPlaceholder = () => (
  <Section className='px-4 md:px-8 py-16'>
    <div className='max-w-6xl mx-auto'>
      <SectionHeaderContainer
        title='Stories from our DevRels'
        subtitle='Coming soon — real experiences from ambassadors'
      />
      <div className='mt-6 grid grid-cols-1 md:grid-cols-3 gap-4'>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className='rounded-xl border border-dashed border-gray-300 p-6 text-center text-gray-500'
          >
            Placeholder
          </div>
        ))}
      </div>
    </div>
  </Section>
);

const ApplicationForm = () => (
  <Section
    className='px-4 md:px-8 py-16 bg-gradient-to-b from-white to-gray-50'
    id='apply'
  >
    <div className='max-w-3xl mx-auto'>
      <SectionHeaderContainer
        title='Apply to the Program'
        subtitle='Short form — we’ll reach out if selected'
      />
      <form
        className='mt-6 grid grid-cols-1 gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm'
        action={`mailto:hello@theboringeducation.com`}
        method='post'
        encType='text/plain'
      >
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <input
            name='name'
            placeholder='Full Name'
            className='w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500'
            required
          />
          <input
            name='email'
            placeholder='Email'
            type='email'
            className='w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500'
            required
          />
          <input
            name='phone'
            placeholder='Phone'
            className='w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500'
          />
          <input
            name='college'
            placeholder='College Name'
            className='w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500'
          />
          <input
            name='year'
            placeholder='Year (e.g., 2nd Year)'
            className='w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500'
          />
          <input
            name='profiles'
            placeholder='LinkedIn/GitHub URL'
            className='w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500'
          />
        </div>
        <textarea
          name='why'
          placeholder='Why do you want to be a DevRel?'
          className='min-h-[120px] w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500'
        />
        <div className='flex items-center gap-4'>
          <Button className='bg-[#ff5757] hover:bg-[#ff6b6b] text-white px-6 py-3 rounded-xl shadow-lg shadow-[#ff5757]/25'>
            Submit
          </Button>
          <Link
            href={LINKS.joinDevRelAdvocate}
            target='_blank'
            className='text-indigo-600 underline'
          >
            Use Google Form instead
          </Link>
        </div>
      </form>
    </div>
  </Section>
);

const CampusConnectPage = ({ seoMeta }: PageProps) => (
  <Fragment>
    <SEO seoMeta={seoMeta} />
    <HeroSection />
    <AboutSection />
    <HiringProcess />
    <LearningJourney />
    <PerksSection />
    <TestimonialsPlaceholder />
    <ApplicationForm />
  </Fragment>
);

export const getStaticProps = async () => ({
  ...(await getPreFetchProps({ slug: routes.campusConnect })),
});

export default CampusConnectPage;
