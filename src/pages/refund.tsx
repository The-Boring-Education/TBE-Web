import { RefundPolicyCard, SEO } from '@/components';
import { getSEOMeta, routes } from '@/constant';
import { Fragment } from 'react';

const RefundAndCancellationPage = () => {
  const seoMeta = getSEOMeta(routes.refundPolicy);

  return (
    <Fragment>
      <SEO seoMeta={seoMeta} />
      <RefundPolicyCard />
    </Fragment>
  );
};

export default RefundAndCancellationPage;
