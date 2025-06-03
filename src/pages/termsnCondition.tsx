import { TermsAndConditionCard, SEO } from '@/components';
import { getSEOMeta, routes } from '@/constant';
import { Fragment } from 'react';

const RefundAndCancellationPage = () => {
  const seoMeta = getSEOMeta(routes.termsnCondition);

  return (
    <Fragment>
      <SEO seoMeta={seoMeta} />
      <TermsAndConditionCard />
    </Fragment>
  );
};

export default RefundAndCancellationPage;
