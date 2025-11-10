  import { ContactCard, SEO } from '@tbe/components';
import { getSEOMeta, routes } from '@tbe/constants';
import { getPreFetchProps } from '@tbe/utils';
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

export const getStaticProps = async () => ({
  ...(await getPreFetchProps({ slug: routes.contactUs })),
});

export default Contact;
