import React from 'react';
import { ContactCard, SEO } from '@/components';
import { getPreFetchProps } from '@/utils';
import { PageProps, PageSlug } from '@/interfaces';
import { getSEOMeta } from '@/constant';

const Contact = ({ seoMeta }: PageProps) => {
  return (
    <React.Fragment>
      <SEO seoMeta={seoMeta} />
      <ContactCard />
    </React.Fragment>
  );
};

export const getServerSideProps = getPreFetchProps;

export default Contact;
