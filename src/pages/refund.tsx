import { RefundPolicyCard, SEO } from '@/components';
import { getPreFetchProps } from '@/utils';
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

export const getStaticProps = async () => {
  return {
    ...(await getPreFetchProps({ slug: routes.contactUs })),
    revalidate: 1000,
  };
};

export default RefundAndCancellationPage;
