import { LoginCardNew, SEO } from '@tbe/components';
import { routes } from '@tbe/constants';
import type { PageProps } from '@tbe/interface';
import { getPreFetchProps } from '@tbe/utils';
import { Fragment } from 'react';

const Login = ({ seoMeta }: PageProps) => (
  <Fragment>
    <SEO seoMeta={seoMeta} />
    <LoginCardNew variant='platform' />
  </Fragment>
);

export const getStaticProps = async () => ({
  ...(await getPreFetchProps({ slug: routes.login })),
});

export default Login;
