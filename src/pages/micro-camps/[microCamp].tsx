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
  WeAlreadyTaughtAt,
  SEO,
  MicrocampInstructor,
  MicrocampOpportunities,
  ChooseTechCohort,
} from '@/components';
import { CohortNameType, PageProps } from '@/interfaces';
import { getMicrocampPageData, getPreFetchProps } from '@/utils';
// routes.internals.workshops;
const MicroCampLanding = ({ slug, seoMeta }: PageProps) => {
  const microcampData = getMicrocampPageData(slug);
  if (!microcampData) return;

  const {
    name,
    header,
    chooseCohortHeaderTitle,
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
      <ChooseTechCohort
        preSelectedCohortName={name as CohortNameType}
        headerTitle={chooseCohortHeaderTitle}
        id={header.cta.primary}
      />
      <InThisCohortContainer {...inThisCohort} />
      <MicrocampInstructor {...instructor} />
      <Skills skills={skills} />
      {opportunities && <MicrocampOpportunities {...opportunities} />}
      <WhatWeDoForYou offerings={offerings} />
      <NotAnotherTechCourse />
      <ContextBasedLearning />
      <MicrocampPricing {...pricing} />
      <WeAlreadyTaughtAt />
      <Testimonials />
    </React.Fragment>
  );
};

export const getServerSideProps = getPreFetchProps;

export default MicroCampLanding;
