import { Fragment } from 'react';

import { Section, SEO, Text } from '@/components';
import { routes } from '@/constant';
import type { PageProps } from '@/interfaces';
import { getPreFetchProps } from '@/utils';

const TERMS_CONDITION_CONTENT = [
  {
    id: 1,
    description:
      'Welcome, if you continue to browse and use this website you are agreeing to comply with and be bound by the following terms and conditions of use, which together with our privacy policy govern with you in relation to this website.',
  },
  {
    id: 2,
    description:
      'The use of this website is subject to the following terms of use:',
    points: [
      {
        id: 1,
        description:
          'The content of the pages of this website is for your general information and use only. It is subject to change without notice.',
      },
      {
        id: 2,
        description:
          'Neither we nor any third parties provide any warranty or guarantee as to the accuracy, timeliness, performance, completeness or suitability of the information and materials found or offered on this website for any particular purpose.',
      },
      {
        id: 3,
        description:
          'You acknowledge that such information and materials may contain inaccuracies or errors and we expressly exclude liability for any such inaccuracies or errors to the fullest extent permitted by law.',
      },
      {
        id: 4,
        description:
          'Your use of any information or materials on this website is entirely at your own risk, for which we shall not be liable.',
      },
    ],
  },
];

const TermsAndCondition = ({ seoMeta }: PageProps) => (
    <Fragment>
      <SEO seoMeta={seoMeta} />

      <Section>
        <Text
          level='h1'
          className='mx-auto mb-8 w-full text-4xl font-bold text-primary md:mb-12 md:text-5xl'
          textCenter
        >
          Terms & Conditions
        </Text>

        <Text
          level='p'
          className='mx-auto text-lg font-medium text-foreground/70'
          textCenter
        >
          Last Updated At: <span className='text-primary'>June 2, 2025</span>
        </Text>

        <br />

        {TERMS_CONDITION_CONTENT.map((item) => (
          <Section key={item.id} className='mb-6 mx-auto max-w-3xl'>
            <Text
              level='p'
              className='mb-2 text-lg font-medium text-foreground/80'
            >
              {item.description}
            </Text>

            {item.points?.map((point) => (
              <Text
                key={point.id}
                level='p'
                className='ml-4 mt-2 text-base text-foreground/70'
              >
                {point.id}. {point.description}
              </Text>
            ))}
          </Section>
        ))}
      </Section>
    </Fragment>
  );

export const getStaticProps = async () => ({
    ...(await getPreFetchProps({ slug: routes.termsAndConditions })),
  });

export default TermsAndCondition;
