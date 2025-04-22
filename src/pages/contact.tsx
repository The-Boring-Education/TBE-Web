import { ContactCard, SEO } from '@/components';
import { getPreFetchProps } from '@/utils';
import { getSEOMeta, routes } from '@/constant';
import { Fragment } from 'react';

const Contact = () => {
  const seoMeta = getSEOMeta(routes.contactUs);

  return (
    <Fragment>
      <SEO seoMeta={seoMeta} />
      <ContactCard />
    </Fragment>
  );
};

export const getServerSideProps = getPreFetchProps;

export default Contact;
