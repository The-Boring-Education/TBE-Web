import { GetSEOMetaResponseType, PageSlug } from './constants';

export interface PageProps {
  slug: PageSlug;
  seoMeta: GetSEOMetaResponseType;
}
