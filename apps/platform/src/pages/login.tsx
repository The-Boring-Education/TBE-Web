import { Fragment } from 'react';

import { LoginCard, SEO } from '@tbe/components';
import { routes } from '@tbe/constants';
import type { PageProps } from '@tbe/interface';
import { getPreFetchProps } from '@tbe/utils';

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
