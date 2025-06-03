import { Section, SEO, Text } from '@/components';
import { getSEOMeta, routes } from '@/constant';
import { getPreFetchProps } from '@/utils';
import { Fragment } from 'react';

const RefundAndCancellationPage = () => {
  const seoMeta = getSEOMeta(routes.refund);

  return (
    <Fragment>
      <SEO seoMeta={seoMeta} />
      <Section>
        <Text
          level="h1"
          className="mx-auto mb-8 w-full text-4xl font-bold text-primary md:mb-12 md:text-5xl"
          textCenter
        >
          Refund/Cancellation Policy
        </Text>

        <div className="mx-auto max-w-3xl">
          <Text
            level="p"
            className="text-lg font-medium text-foreground/80"
          >
            You are entitled to a refund in the case of the purchased course not
            being assigned to you within the expiration date from your date of
            purchase or if you have paid twice for the same course. Under any
            other circumstance, we will not consider any requests for refund as
            this is a digital course purchase.
          </Text>
        </div>
      </Section>
    </Fragment>
  );
};

export const getStaticProps = async () => {
  return {
    ...(await getPreFetchProps({ slug: routes.refund })),
    revalidate: 1000,
  };
};

export default RefundAndCancellationPage;
