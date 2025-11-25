import { Link, NotFound, SEO } from '@tbe/components';
import { getSEOMeta } from '@tbe/constants';
import { RiAlarmWarningFill } from 'react-icons/ri';

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
