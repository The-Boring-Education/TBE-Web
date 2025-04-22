import { Fragment, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { LoginCard, SEO } from '@/components';
import { getPreFetchProps } from '@/utils';
import { PageProps } from '@/interfaces';

const Login = ({ seoMeta }: PageProps) => {
  return (
    <Fragment>
      <SEO seoMeta={seoMeta} />
      <LoginCard />
    </Fragment>
  );
};

export const getServerSideProps = getPreFetchProps;

export default Login;
