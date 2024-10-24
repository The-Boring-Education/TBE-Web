import React from 'react';
import { LandingPageHero, CardContainerA, SEO, LinkButton } from '@/components';
import { PageProps } from '@/interfaces';
import { getPreFetchProps } from '@/utils';
import { STATIC_FILE_PATH, INTERVIEW_FEATURES, routes } from '@/constant';

const InterviewPrepHome = ({ seoMeta }: PageProps) => {
  return (
    <React.Fragment>
      <SEO seoMeta={seoMeta} />
      
      {/* Hero Section */}
      <LandingPageHero
        sectionHeaderProps={{
          heading: '"Crack Any',
          focusText: 'Tech Interview"',
          
        }}
        heroText='Prepare for Upcoming Tech Interviews with the Most Asked Questions in Real Interviews.'
        
        primaryButton={
          <LinkButton
            href={routes.interview}
            className='w-full sm:w-fit'
            buttonProps={{
              variant: 'PRIMARY',
              text: 'Explore Sheets',
              className: 'w-full',
            }}
          />
        }
        backgroundImageUrl={`${STATIC_FILE_PATH.svg}/hero-image.svg`}  
      />

      {/* Feature Section */}
      <CardContainerA
        heading='Why We Are'
        focusText='Building?'
        cards={INTERVIEW_FEATURES} 
        borderColour={4}
      />
    </React.Fragment>
  );
};

export const getServerSideProps = getPreFetchProps;

export default InterviewPrepHome;
