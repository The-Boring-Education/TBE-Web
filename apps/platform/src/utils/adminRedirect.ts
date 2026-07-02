import type { GetServerSideProps } from 'next';

export const getAdminRedirectProps: GetServerSideProps = async () => {
  const destination = process.env.ADMIN_BASE_URL || 'http://localhost:8080';

  return {
    redirect: {
      destination,
      permanent: false,
    },
  };
};
