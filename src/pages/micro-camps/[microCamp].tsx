import React from 'react';
import {
  Skills,
  MicroCampLandingHeader,
  InThisCohortContainer,
  Testimonials,
  NotAnotherTechCourse,
  ContextBasedLearning,
  MicrocampPricing,
  WhatWeDoForYou,
  WeTaughtAt,
  SEO,
  MicrocampInstructor,
  MicrocampOpportunities,
} from '@/components';
import { PageProps } from '@/interfaces';
import { getMicrocampPageData, getPreFetchProps } from '@/utils';

const MicroCampLanding = ({ slug, seoMeta }: PageProps) => {
  const microcampData = getMicrocampPageData(slug);
  if (!microcampData) return;

  const {
    header,
    instructor,
    inThisCohort,
    opportunities,
    offerings,
    pricing,
    skills,
  } = microcampData;

  return (
    <React.Fragment>
      <SEO seoMeta={seoMeta} />
      <MicroCampLandingHeader {...header} />
      <InThisCohortContainer {...inThisCohort} />
      <MicrocampInstructor {...instructor} />
      <Skills skills={skills} />
      {opportunities && <MicrocampOpportunities {...opportunities} />}
      <WhatWeDoForYou offerings={offerings} />
      <NotAnotherTechCourse />
      <ContextBasedLearning />
      <MicrocampPricing {...pricing} />
      <WeTaughtAt />
      <Testimonials />
    </React.Fragment>
  );
};

export const getServerSideProps = getPreFetchProps;

export default MicroCampLanding;
