import React from 'react';
import {
  WorkshopHeader,
  SEO,
  AboutWorkshopContainer,
  AboutTheBoringEducation,
  AboutWorkshopInstructorContainer,
  Testimonials,
} from '@/components';
import { PageProps } from '@/interfaces';
import { getPreFetchProps, getWorkshopPageData } from '@/utils';

const WorkshopLanding = ({ seoMeta, slug }: PageProps) => {
  const workshop = getWorkshopPageData(slug);
  if (!workshop) return;

  const { meta, aboutWorkshop } = workshop;

  return (
    <React.Fragment>
      <SEO seoMeta={seoMeta} />
      <WorkshopHeader {...meta} />
      <AboutWorkshopContainer {...aboutWorkshop} {...meta} />
      <AboutWorkshopInstructorContainer {...meta} />
      <Testimonials />
      <AboutTheBoringEducation />
    </React.Fragment>
  );
};

export const getServerSideProps = getPreFetchProps;

export default WorkshopLanding;
