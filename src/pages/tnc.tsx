import { SEO, TermsAndConditionsCard } from '@/components';
import { getPreFetchProps } from '@/utils';
import { getSEOMeta, routes } from '@/constant';
import { Fragment } from 'react';

const TermsAndConditionPage = () => {
  const seoMeta = getSEOMeta(routes.termsnCondition);

  return (
    <Fragment>
      <SEO seoMeta={seoMeta} />
      <TermsAndConditionsCard />
    </Fragment>
  );
};

export const getStaticProps = async () => {
  return {
    ...(await getPreFetchProps({ slug: routes.contactUs })),
    revalidate: 1000,
  };
};

export default TermsAndConditionPage;
