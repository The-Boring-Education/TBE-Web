import { NotFound, SEO } from '@tbe/components';
import { getSEOMeta } from '@tbe/constants';

const NotFoundPage = () => {
  const seoMeta = getSEOMeta('/404');

  return (
    <>
      <SEO seoMeta={seoMeta} />

  <NotFound />
    </>
  );
};

export default NotFoundPage;
