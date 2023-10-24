import { GetSEOMetaResponseType, NextAuthUserType, PageSlug } from './global';

export interface PageProps {
  slug: PageSlug;
  seoMeta: GetSEOMetaResponseType;
  user?: NextAuthUserType;
}
