import { SEO } from '@/components';
import { ShikshaLandingHero, ShikshaProgram } from '@/components/shiksha';
import { PageProps } from '@/interfaces';
import { getPreFetchProps } from '@/utils';
import React from 'react';

const ShikshaLanding = ({ seoMeta }: PageProps) => {
  return (
    <React.Fragment>
      <SEO seoMeta={seoMeta} />
      <ShikshaLandingHero />
      <ShikshaProgram />
    </React.Fragment>
  );
};

export const getServerSideProps = getPreFetchProps;

export default ShikshaLanding;
