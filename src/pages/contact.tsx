import { ContactCard, SEO } from '@/components';
import { getSEOMeta, routes } from '@/constant';
import { getPreFetchProps } from '@/utils';
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

export const getStaticProps = async () => {
  return {
    ...(await getPreFetchProps({ slug: routes.contactUs }))
  };
};

export default Contact;
