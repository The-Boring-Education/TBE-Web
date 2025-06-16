import { Fragment } from 'react';

import { LoginCard, SEO } from '@/components';
import { routes } from '@/constant';
import type { PageProps } from '@/interfaces';
import { getPreFetchProps } from '@/utils';

const Login = ({ seoMeta }: PageProps) => (
    <Fragment>
      <SEO seoMeta={seoMeta} />
      <LoginCard />
    </Fragment>
  );

export const getStaticProps = async () => ({
    ...(await getPreFetchProps({ slug: routes.login })),
  });

export default Login;
