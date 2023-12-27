import { SEO, ShikshaLandingHero } from '@/components';
import { PageProps } from '@/interfaces';
import { getPreFetchProps } from '@/utils';
import React from 'react';

const ShikshaLanding = ({ seoMeta }: PageProps) => {
  return (
    <React.Fragment>
      <SEO seoMeta={seoMeta} />
      <ShikshaLandingHero />
    </React.Fragment>
  );
};

export const getServerSideProps = getPreFetchProps;

export default ShikshaLanding;
