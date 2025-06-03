import { SEO, TermsAndConditionsCard } from '@/components';
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

export default TermsAndConditionPage;
