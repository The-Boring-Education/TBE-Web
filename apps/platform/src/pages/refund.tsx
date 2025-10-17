import { Section, SEO, Text } from '@tbe/components';
import { routes } from '@tbe/constants';
import type { PageProps } from '@tbe/interface';
import { getPreFetchProps } from '@tbe/utils';
import { Fragment } from 'react';

const RefundAndCancellationPage = ({ seoMeta }: PageProps) => (
  <Fragment>
    <SEO seoMeta={seoMeta} />
    <Section>
      <Text
        textCenter
        className='mx-auto mb-8 w-full text-4xl font-bold text-primary md:mb-12 md:text-5xl'
        level='h1'
      >
        Refund/Cancellation Policy
      </Text>

      <div className='mx-auto max-w-3xl'>
        <Text className='text-lg font-medium text-foreground/80' level='p'>
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

export const getStaticProps = async () => ({
  ...(await getPreFetchProps({ slug: routes.refund })),
});

export default RefundAndCancellationPage;
