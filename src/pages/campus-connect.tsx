import { Fragment, useState } from 'react';
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

const HeroSection = ({ setShowForm }: { setShowForm: (show: boolean) => void }) => (
  <Section className='relative overflow-hidden px-4 md:px-8 py-12 md:py-20 gradient-bg'>
    <div className='absolute inset-0 pointer-events-none'>
      <div className='absolute -top-24 -right-24 w-72 h-72 md:w-[28rem] md:h-[28rem] rounded-full bg-gradient-to-br from-indigo-500/30 to-fuchsia-500/20 blur-3xl' />
      <div className='absolute -bottom-24 -left-24 w-72 h-72 md:w-[28rem] md:h-[28rem] rounded-full bg-gradient-to-br from-amber-500/20 to-lime-400/20 blur-3xl' />
    </div>

    <div className='max-w-6xl mx-auto relative z-10'>
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center'>
        <div className='text-center lg:text-left'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Text level='h1' className='heading-1 text-white text-3xl md:text-4xl lg:text-5xl leading-tight'>
              Be the Face of Tech in Your College 🚀
            </Text>
            <Text level='p' className='paragraph mt-4 md:mt-6 text-base md:text-lg text-gray-200 leading-relaxed max-w-2xl mx-auto lg:mx-0'>
              Join The Boring Education's Campus Connect & DevRel Program — Build,
              Lead, and Learn.
            </Text>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <FlexContainer className='gap-3 mt-6 md:mt-8 flex-col sm:flex-row' justifyCenter={false}>
              <Link
                href={LINKS.joinDevRelAdvocate}
                target='_blank'
                className='bg-[#ff5757] hover:bg-[#ff6b6b] text-white px-6 py-3 rounded-xl shadow-lg shadow-[#ff5757]/25 text-base font-semibold w-full sm:w-auto transition-all duration-300 hover:scale-105 inline-flex items-center justify-center'
              >
                Apply Now
              </Link>
              <Link
                href={LINKS.viewSessionDetails}
                target='_blank'
                className='button-text underline text-white text-center hover:text-gray-200 transition-colors duration-300'
              >
                View Program Details
              </Link>
            </FlexContainer>
            
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className='mt-6 flex items-center justify-center lg:justify-start gap-4 text-gray-300 text-sm'
            >
              <span className='flex items-center gap-2'>
                <span className='w-2 h-2 bg-green-400 rounded-full'></span>
                Open across colleges in India
              </span>
              <span className='opacity-40 hidden sm:block'>•</span>
              <span className='flex items-center gap-2'>
                <span className='w-2 h-2 bg-yellow-400 rounded-full'></span>
                Limited Seats
              </span>
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
          className='relative order-first lg:order-last'
        >
          <div className='rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl p-4 md:p-6 shadow-xl shadow-black/20'>
            <Image
              alt='Campus tech vibes'
              className='rounded-xl w-full h-auto'
              src='/images/coding_bg.png'
            />
            <div className='absolute -bottom-3 -right-3 bg-[#ff5757] text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg'>
              🎯 Join Now
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  </Section>
);

const AboutSection = () => (
  <Section className='px-4 md:px-8 py-16 md:py-20'>
    <div className='max-w-6xl mx-auto'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <SectionHeaderContainer
          heading='About the Program'
          focusText='We are hiring DevRels across colleges in India'
        />
      </motion.div>
      
      <div className='mt-8 lg:mt-12'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className='text-center lg:text-left mb-8 lg:mb-12'
        >
          <Text level='p' className='paragraph text-gray-700 text-base leading-relaxed max-w-3xl mx-auto lg:mx-0'>
            As a Campus DevRel, you will build a tech and learning community on
            your campus, host events and workshops, collaborate on hackathons, and
            learn directly from our mentors. Become a leader who drives innovation
            and community building at your college.
          </Text>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <GridContainer className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 lg:gap-6'>
            {[
              {
                title: 'Build Community',
                desc: 'Lead a tech-first community at your campus',
                icon: '👥',
              },
              { 
                title: 'Host Events', 
                desc: 'Workshops, meetups, hackathons',
                icon: '🎪',
              },
              {
                title: 'Learn from Mentors',
                desc: 'Industry guidance and feedback',
                icon: '🎓',
              },
              {
                title: 'Grow Your Brand',
                desc: 'Certificates, badges, and visibility',
                icon: '⭐',
              },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                viewport={{ once: true }}
                className='rounded-xl border border-gray-200 p-4 lg:p-5 bg-white shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group'
              >
                <div className='text-2xl mb-3 group-hover:scale-110 transition-transform duration-300'>
                  {item.icon}
                </div>
                <Text level='h4' className='heading-6 text-gray-900 mb-2 font-semibold'>
                  {item.title}
                </Text>
                <Text level='p' className='text-sm text-gray-600 leading-relaxed'>
                  {item.desc}
                </Text>
              </motion.div>
            ))}
          </GridContainer>
        </motion.div>
      </div>
    </div>
  </Section>
);

const HiringProcess = () => (
  <Section className='px-4 md:px-8 py-16 md:py-20 bg-gradient-to-b from-white to-gray-50'>
    <div className='max-w-6xl mx-auto'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <SectionHeaderContainer
          heading='Hiring Process'
          focusText='A simple and fast selection process'
        />
      </motion.div>
      
      <div className='mt-12 lg:mt-16'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4'>
          {[
            {
              step: '01',
              title: 'Apply Online',
              desc: 'Submit your application form with portfolio',
              icon: '📝',
            },
            {
              step: '02',
              title: 'Short Interview',
              desc: 'Quick conversation with our team',
              icon: '🎯',
            },
            {
              step: '03',
              title: 'Onboarding & Training',
              desc: 'Kickstart with resources and guidance',
              icon: '🚀',
            },
            {
              step: '04',
              title: 'Start Building',
              desc: 'Lead your campus community',
              icon: '🏗️',
            },
          ].map((s, idx) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              viewport={{ once: true }}
              className='relative text-center'
            >
              {/* Arrow connector - hidden on mobile, shown on md+ */}
              {idx < 3 && (
                <div className='hidden md:block absolute top-6 left-full w-full h-0.5 bg-gradient-to-r from-indigo-500 to-pink-500 transform -translate-y-1/2 z-0' />
              )}
              
              <div className='relative z-10'>
                <div className='w-16 h-16 rounded-full bg-white border-4 border-indigo-500 flex items-center justify-center font-bold text-indigo-600 shadow-lg text-lg mx-auto mb-4'>
                  {s.step}
                </div>
                
                <div className='text-xl mb-3'>{s.icon}</div>
                <Text level='h3' className='heading-6 text-gray-900 font-bold mb-2'>
                  {s.title}
                </Text>
                <Text level='p' className='text-sm text-gray-600 leading-relaxed'>
                  {s.desc}
                </Text>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Mobile arrow indicators */}
        <div className='md:hidden mt-6 flex justify-center'>
          <div className='flex items-center gap-2 text-gray-400'>
            <span>↓</span>
            <span>↓</span>
            <span>↓</span>
          </div>
        </div>
      </div>
    </div>
  </Section>
);

const LearningJourney = () => (
  <Section className='px-4 md:px-8 py-16 md:py-20'>
    <div className='max-w-6xl mx-auto'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <SectionHeaderContainer
          heading='Learning Journey'
          focusText='Grow from fundamentals to leadership'
        />
      </motion.div>
      
      <GridContainer className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-3 mt-8 lg:mt-12'>
        {[
          {
            title: 'DevRel Fundamentals',
            icon: '🎯',
            color: 'from-blue-500 to-indigo-600',
          },
          {
            title: 'Event Planning & Community Building',
            icon: '🏗️',
            color: 'from-indigo-500 to-purple-600',
          },
          {
            title: 'Hands-on Projects with TBE',
            icon: '⚡',
            color: 'from-purple-500 to-pink-600',
          },
          {
            title: 'Networking & Leadership Growth',
            icon: '🌟',
            color: 'from-pink-500 to-red-600',
          },
          {
            title: 'Graduation & Certification',
            icon: '🎓',
            color: 'from-red-500 to-orange-600',
          },
        ].map((item, idx) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            viewport={{ once: true }}
            className='rounded-xl border border-gray-200 bg-white p-3 lg:p-4 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group cursor-pointer min-w-0'
          >
            <div className='text-center'>
              <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center text-lg lg:text-xl text-white mb-3 mx-auto group-hover:scale-110 transition-transform duration-300`}>
                {item.icon}
              </div>
              <div className='text-xs text-gray-500 mb-2 font-medium'>Stage {idx + 1}</div>
              <Text level='h4' className='heading-6 text-gray-900 font-semibold leading-tight text-xs lg:text-sm'>
                {item.title}
              </Text>
              <div className='mt-2 h-1.5 rounded-full bg-gray-100 overflow-hidden'>
                <div className={`h-1.5 rounded-full bg-gradient-to-r ${item.color} transition-all duration-1000 ease-out`} style={{ width: `${(idx + 1) * 20}%` }} />
              </div>
            </div>
          </motion.div>
        ))}
      </GridContainer>
    </div>
  </Section>
);

const PerksSection = () => (
  <Section className='px-4 md:px-8 py-16 md:py-20 bg-gradient-to-b from-gray-50 to-white'>
    <div className='max-w-6xl mx-auto'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <SectionHeaderContainer
          heading='Perks & Rewards'
          focusText='Grow faster with exclusive benefits'
        />
      </motion.div>
      
      <GridContainer className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mt-8 lg:mt-12'>
        {[
          {
            perk: 'Free mentorship from industry experts',
            icon: '👨‍🏫',
            color: 'from-blue-500 to-indigo-600',
          },
          {
            perk: 'TBE Swag & Merchandise',
            icon: '🎁',
            color: 'from-indigo-500 to-purple-600',
          },
          {
            perk: 'Certificates & LinkedIn Badges',
            icon: '🏆',
            color: 'from-purple-500 to-pink-600',
          },
          {
            perk: 'Priority Access to TBE Internships',
            icon: '💼',
            color: 'from-pink-500 to-red-600',
          },
          {
            perk: 'Event hosting budget',
            icon: '💰',
            color: 'from-red-500 to-orange-600',
          },
          {
            perk: 'Networking with top founders & engineers',
            icon: '🤝',
            color: 'from-orange-500 to-yellow-600',
          },
        ].map((item, index) => (
          <motion.div
            key={item.perk}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
            className='rounded-xl border border-gray-200 bg-white p-4 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group cursor-pointer'
          >
            <div className='flex items-start gap-3'>
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center text-lg text-white flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                {item.icon}
              </div>
              <div className='flex-1'>
                <Text level='p' className='text-gray-800 text-base leading-relaxed font-medium'>
                  {item.perk}
                </Text>
              </div>
            </div>
          </motion.div>
        ))}
      </GridContainer>
    </div>
  </Section>
);

const TestimonialsPlaceholder = () => (
  <Section className='px-4 md:px-8 py-16'>
    <div className='max-w-6xl mx-auto'>
      <SectionHeaderContainer
        heading='Stories from our DevRels'
        focusText='Coming soon — real experiences from ambassadors'
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

const CallToAction = ({ setShowForm }: { setShowForm: (show: boolean) => void }) => (
  <Section className='px-4 md:px-8 py-20 md:py-28 bg-gradient-to-br from-[#ff5757] to-[#ff6b6b] relative overflow-hidden'>
    <div className='absolute inset-0 pointer-events-none'>
      <div className='absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl' />
      <div className='absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl' />
    </div>
    
    <div className='max-w-6xl mx-auto relative z-10 text-center'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <Text level='h2' className='heading-2 text-white mb-6'>
          Ready to Lead Your Campus Tech Community? 🚀
        </Text>
        <Text level='p' className='text-xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed'>
          Join hundreds of students who are already building the future of tech education. 
          Don't miss this opportunity to grow, learn, and make a difference.
        </Text>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className='flex flex-col sm:flex-row gap-4 justify-center items-center'
        >
          <Link
            href={LINKS.joinDevRelAdvocate}
            target='_blank'
            className='bg-white text-[#ff5757] hover:bg-gray-100 px-8 py-4 rounded-2xl shadow-xl text-lg font-semibold w-full sm:w-auto transition-all duration-300 hover:scale-105 inline-flex items-center justify-center'
          >
            Apply Now - Limited Time!
          </Link>
          <Link
            href={LINKS.viewSessionDetails}
            target='_blank'
            className='text-white underline hover:text-gray-200 transition-colors duration-300 text-lg'
          >
            Learn More About the Program
          </Link>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className='mt-8 flex items-center justify-center gap-6 text-white/80 text-sm'
        >
          <span className='flex items-center gap-2'>
            <span className='w-2 h-2 bg-green-400 rounded-full'></span>
            Applications Open
          </span>
          <span className='opacity-40'>•</span>
          <span className='flex items-center gap-2'>
            <span className='w-2 h-2 bg-yellow-400 rounded-full'></span>
            Rolling Admissions
          </span>
          <span className='opacity-40'>•</span>
          <span className='flex items-center gap-2'>
            <span className='w-2 h-2 bg-blue-400 rounded-full'></span>
            Start Anytime
          </span>
        </motion.div>
      </motion.div>
    </div>
  </Section>
);

const CampusConnectPage = ({ seoMeta }: PageProps) => {
  const [showForm, setShowForm] = useState(false);

  return (
    <Fragment>
      <SEO seoMeta={seoMeta} />
      <HeroSection setShowForm={setShowForm} />
      <AboutSection />
      <HiringProcess />
      <LearningJourney />
      <PerksSection />
      {/* <TestimonialsPlaceholder /> */}
      <CallToAction setShowForm={setShowForm} />
    </Fragment>
  );
};

export const getStaticProps = async () => ({
  ...(await getPreFetchProps({ slug: routes.campusConnect })),
});

export default CampusConnectPage;
