import React from 'react';
import { ContactCard, SEO } from '@/components';
import { getPreFetchProps } from '@/utils';
import { PageSlug } from '@/interfaces';
import { getSEOMeta } from '@/constant';

const Contact = () => {
  const slug: PageSlug = '/contact';

  const seoMeta = getSEOMeta(slug as PageSlug);

  return (
    <React.Fragment>
      <SEO seoMeta={seoMeta} />
      <ContactCard />
    </React.Fragment>
  );
};

export const getServerSideProps = getPreFetchProps;

export default Contact;
