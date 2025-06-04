import { Fragment } from 'react';
import { LoginCard, SEO } from '@/components';
import { getPreFetchProps } from '@/utils';
import { PageProps } from '@/interfaces';
import { routes } from '@/constant';

const Login = ({ seoMeta }: PageProps) => {
  return (
    <Fragment>
      <SEO seoMeta={seoMeta} />
      <LoginCard />
    </Fragment>
  );
};

export const getStaticProps = async () => {
  return {
    ...(await getPreFetchProps({ slug: routes.login })),
  };
};

export default Login;
