import { ContactUsPage, SEO } from '@/components';
import { getSEOMeta, routes } from '@/constant';
import { Fragment } from 'react';

const Contact = () => {
  const seoMeta = getSEOMeta(routes.contactUs);

  return (
    <Fragment>
      <SEO seoMeta={seoMeta} />
      <ContactUsPage />
    </Fragment>
  );
};

export default Contact;
