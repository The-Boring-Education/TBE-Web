import { SEO, TermsAndConditionCard } from '@/components';
import { getSEOMeta, routes } from '@/constant';
import { Fragment } from 'react';

const TermsAndCondition = () => {
  const seoMeta = getSEOMeta(routes.termsConditions);

  return (
    <Fragment>
      <SEO seoMeta={seoMeta} />
      <TermsAndConditionCard />
    </Fragment>
  );
};


export default TermsAndCondition;
