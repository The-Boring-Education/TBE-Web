import { Fragment } from 'react';
import { FaPlay, FaClock, FaUsers, FaCertificate } from 'react-icons/fa';

import { CardContainerA, ModernLandingHero, LinkButton, SEO, Button } from '@/components';
import { routes, STATIC_FILE_PATH, TBSH_FEATURES, LINKS } from '@/constant';
import type { PageProps } from '@/interfaces';
import { getPreFetchProps } from '@/utils';

const Home = ({ seoMeta }: PageProps) => {
  const handlePreviewClick = () => {
    document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const stats = [
    {
      icon: <FaPlay />,
      text: '15+ Free Courses',
      color: 'text-green-400',
    },
    {
      icon: <FaClock />,
      text: 'Bite-sized Learning',
      color: 'text-yellow-400',
    },
    {
      icon: <FaUsers />,
      text: '10K+ Students',
      color: 'text-blue-400',
    },
    {
      icon: <FaCertificate />,
      text: 'Free Certificates',
      color: 'text-purple-400',
    },
  ];

  const previewContent = {
    title: 'Preview Our Courses',
    description: 'Get a quick overview of our bite-sized tech courses and start learning today',
    buttonText: 'Explore Features',
    onPreviewClick: handlePreviewClick,
  };

  return (
    <Fragment>
      <SEO seoMeta={seoMeta} />
      <ModernLandingHero
        heading='Learn Tech with'
        focusText='Mini Courses'
        heroText='Master complex tech topics through bite-sized, free courses designed for busy professionals and students.'
        gradientFrom='from-emerald-600'
        gradientTo='to-blue-700'
        stats={stats}
        previewContent={previewContent}
        primaryButton={
          <LinkButton
            buttonProps={{
              variant: 'PRIMARY',
              text: 'Explore Courses',
              className: 'bg-white text-emerald-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold w-full sm:w-auto',
            }}
            className='w-full sm:w-fit'
            href={routes.shikshaExplore}
          />
        }
        secondaryButton={
          <LinkButton
            buttonProps={{
              variant: 'OUTLINE',
              text: 'View Demo Course',
              className: 'border-white text-white hover:bg-white hover:text-emerald-600 px-8 py-3 text-lg font-semibold w-full sm:w-auto',
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
          cards={TBSH_FEATURES}
          focusText='Differently'
          heading='What We Do'
        />
      </div>
    </Fragment>
  );
};

export const getStaticProps = async () => ({
  ...(await getPreFetchProps({ slug: routes.shiksha })),
});

export default Home;
