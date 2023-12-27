import { getSEOMeta } from '@/constant';
import { GetPreFetchProps, PageSlug } from '@/interfaces';

export const getPreFetchProps = async ({
  query,
  resolvedUrl = '/',
}: GetPreFetchProps) => {
  const { workshop, microCamp } = query;

  let slug = resolvedUrl;

  if (microCamp) slug = '/' + microCamp;
  else if (workshop) slug = workshop;

  const seoMeta = getSEOMeta(slug as PageSlug);

  const redirect = !seoMeta && {
    destination: '/404',
  };

  return {
    props: { slug, seoMeta },
    redirect,
  };
};
