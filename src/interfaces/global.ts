import { FooterLinksContainerProps, WebinarModel } from '.';

export interface FooterNavigationDataProps extends FooterLinksContainerProps {
  id: string;
  isShow: boolean;
}

export type GetSEOMetaResponseType = {
  title: string;
  siteName: string;
  description: string;
  url: string;
  type: string;
  robots: string;
  image: string;
};

export type ProductLabelType =
  | 'Roadmaps'
  | 'Projects'
  | 'Shiksha'
  | 'Interview Prep'
  | 'Webinar'
  | 'Open Source'
  | 'Interview Prep'
  | 'Portfolio';

export interface ProductDataProps {
  [key: string]: {
    label: ProductLabelType;
    slug: string;
    description: string;
  };
}

export interface TopNavbarLinkProps {
  id: string;
  name: string;
  href: string;
  description?: string;
  target?: '_blank';
  isDevelopment?: boolean;
}

export interface TopNavbarContainerProps {
  user: TopNavbarLinkProps[];
  products: TopNavbarLinkProps[];
  links: TopNavbarLinkProps[];
}

export interface ServerSessionProp {
  user: {
    name: string;
    email: string;
    image: string;
  };
  expires: Date;
}

export interface WebinarPageProps extends WebinarModel {
  bannerImageUrl: string;
  seoMeta: GetSEOMetaResponseType;
  date: string;
  time: string;
  isWebinarStarted: boolean;
  webinarId: string;
}

export type CertificateType = 'WEBINAR' | 'SHIKSHA';

export type FormatDateType = {
  dateAndTime?: string;
  dateFormat?: Intl.DateTimeFormatOptions;
  timeFormat?: Intl.DateTimeFormatOptions;
};
