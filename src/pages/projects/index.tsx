import { Fragment } from 'react';
import { FaCode, FaClock, FaUsers, FaTrophy } from 'react-icons/fa';

import { CardContainerA, ModernLandingHero, LinkButton, SEO } from '@/components';
import { routes, STATIC_FILE_PATH, TBP_FEATURES, LINKS } from '@/constant';
import type { PageProps } from '@/interfaces';
import { getPreFetchProps } from '@/utils';

const Home = ({ seoMeta }: PageProps) => {
  const handlePreviewClick = () => {
    document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const stats = [
    {
      icon: <FaCode />,
      text: '25+ Real Projects',
      color: 'text-green-400',
    },
    {
      icon: <FaClock />,
      text: 'Self-paced Learning',
      color: 'text-yellow-400',
    },
    {
      icon: <FaUsers />,
      text: '5K+ Builders',
      color: 'text-blue-400',
    },
    {
      icon: <FaTrophy />,
      text: 'Portfolio Ready',
      color: 'text-purple-400',
    },
  ];

  const previewContent = {
    title: 'Preview Project Experience',
    description: 'See how our guided approach helps you build real-world projects without tutorials',
    buttonText: 'Explore Features',
    onPreviewClick: handlePreviewClick,
  };

  return (
    <Fragment>
      <SEO seoMeta={seoMeta} />
      <ModernLandingHero
        heading='Build Projects'
        focusText='without Tutorials'
        heroText='Escape tutorial hell and build meaningful projects that showcase your skills and land you your dream job.'
        gradientFrom='from-orange-600'
        gradientTo='to-purple-700'
        stats={stats}
        previewContent={previewContent}
        primaryButton={
          <LinkButton
            buttonProps={{
              variant: 'PRIMARY',
              text: 'Explore Projects',
              className: 'bg-black text-black hover:bg-gray-100 hover:text-black px-8 py-3 text-lg font-semibold w-full sm:w-auto',
            }}
            className='w-full sm:w-fit'
            href={routes.projectsExplore}
          />
        }
        secondaryButton={
          <LinkButton
            buttonProps={{
              variant: 'OUTLINE',
              text: 'Get Mentorship',
              className: 'border-white text-white hover:bg-white hover:text-orange-600 px-8 py-3 text-lg font-semibold w-full sm:w-auto',
            }}
            className='w-full sm:w-fit'
            href={LINKS.bookTechConsultation}
            target='_blank'
          />
        }
      />
      <div id='features-section'>
        <CardContainerA
          borderColour={4}
          cards={TBP_FEATURES}
          focusText='Differently'
          heading='What We Do'
        />
      </div>
    </Fragment>
  );
};

export const getStaticProps = async () => ({
  ...(await getPreFetchProps({ slug: routes.projects })),
});

export default Home;
