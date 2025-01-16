import React from 'react';
import { ContactCard, SEO } from '@/components';
import { getPreFetchProps } from '@/utils';
import { getSEOMeta, routes } from '@/constant';

const Contact = () => {
  const seoMeta = getSEOMeta(routes.contactUs);

  return (
    <React.Fragment>
      <SEO seoMeta={seoMeta} />
      <ContactCard />
    </React.Fragment>
  );
};

export const getServerSideProps = getPreFetchProps;

export default Contact;
