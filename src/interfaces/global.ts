import {
  FooterLinksContainerProps,
  MicroCampFeatureCardProps,
  MicroCampPricingCardProps,
  MicrocampInstructorProps,
} from '.';

export interface SkillProps {
  id?: string;
  name: string;
  image: string;
  imageAltText: string;
}

export interface SkillsProps {
  id: string;
  title: string;
  details: SkillProps[];
}

export interface FooterNavigationDataProps extends FooterLinksContainerProps {
  id: string;
  isShow: boolean;
}

export interface MicroCampFeatureCardContentProps
  extends MicroCampFeatureCardProps {
  id: string;
}

export type PageSlug =
  | '/'
  | '/404'
  | '/contact'
  | '/junior-in-web-engineering'
  | '/be-frontend-master'
  | '/be-backend-master'
  | '/the-boring-workshops'
  | '/2-hour-design'
  | '/getting-started-with-typescript'
  | '/the-next-wave'
  | '/head-to-tailwind'
  | '/api-dev-with-postman'
  | '/getting-started-with-github'
  | '/intro-to-web3'
  | '/admin';

export type GetSEOMetaResponseType = {
  title: string;
  siteName: string;
  description: string;
  url: string;
  type: string;
  robots: string;
  image: string;
};

export type ProgramLabelType =
  | 'Be Front-end Master'
  | 'Be Backend Master'
  | 'Junior in Web Engineering'
  | 'The Boring Workshops'
  | '2 Hour Design'
  | 'Getting Started with Typescript'
  | 'The Next Wave'
  | 'Head to Tailwind'
  | 'API Dev with Postman'
  | 'Getting started with GitHub'
  | 'Intro to Web3';

export interface ProgramsDataProps {
  beFrontendMaster: {
    label: ProgramLabelType;
    slug: PageSlug;
    description: string;
  };
  beBackendMaster: {
    label: ProgramLabelType;
    slug: PageSlug;
    description: string;
  };
  juniorInWebEngineering: {
    label: ProgramLabelType;
    slug: PageSlug;
    description: string;
  };
  theBoringWorkshops: {
    label: ProgramLabelType;
    slug: PageSlug;
    description: string;
  };
  twoHourDesign: {
    label: ProgramLabelType;
    slug: PageSlug;
    description: string;
  };
  gettingStartedWithTypescipt: {
    label: ProgramLabelType;
    slug: PageSlug;
    description: string;
  };
  theNextWave: {
    label: ProgramLabelType;
    slug: PageSlug;
    description: string;
  };
  headToTailwind: {
    label: ProgramLabelType;
    slug: PageSlug;
    description: string;
  };
  apiDevWithPostman: {
    label: ProgramLabelType;
    slug: PageSlug;
    description: string;
  };
  gettingStartedWithGithub: {
    label: ProgramLabelType;
    slug: PageSlug;
    description: string;
  };
  introToWeb3: {
    label: ProgramLabelType;
    slug: PageSlug;
    description: string;
  };
}

export interface MicrocampHeaderProps {
  heading: {
    primary: string;
    secondary: string;
  };
  subheading: string;
  cta: {
    primary: string;
  };
}

export interface MicrocampInThisCohortSectionProps {
  label: string;
  features: MicroCampFeatureCardContentProps[];
}

export interface MicrocampOfferingsProps {
  id: string;
  title: string;
  content: string;
  image: string;
  imageAltText: string;
}

export interface MicrocampPricingProps {
  basePrice: number;
  sellingPrice: number;
  valueProvided: MicroCampPricingCardProps[];
}

export interface MicrocampDataProps {
  slug: PageSlug;
  name: ProgramLabelType;
  header: MicrocampHeaderProps;
  chooseCohortHeaderTitle: string;
  instructor: MicrocampInstructorProps;
  inThisCohort: MicrocampInThisCohortSectionProps;
  opportunities?: MicrocampOpportunitiesProps;
  skills: SkillsProps[];
  offerings: MicrocampOfferingsProps[];
  pricing: MicrocampPricingProps;
}

export interface TopNavbarLinkProps {
  id: string;
  name: string;
  href: string;
  description?: string;
}

export interface TopNavbarContainerProps {
  cohorts: TopNavbarLinkProps[];
  links: TopNavbarLinkProps[];
}

export interface MicrocampOpportunitiesCardProps {
  label: string;
  value: string;
  subtitle: string;
}
export interface MicrocampOpportunitiesProps {
  heading: string;
  cards: MicrocampOpportunitiesCardProps[];
}

export type CohortLeadStatus =
  | 'Pending'
  | 'Connected'
  | 'Interested'
  | 'Callback'
  | 'Not Interested';

export type CohortNameType =
  | 'Be Front-end Master'
  | 'Be Backend Master'
  | 'Junior In Web Engineering'
  | 'Placement Camp';

export type AuthUserType = 'USER' | 'ADMIN';

export interface NextAuthUserType {
  name: string;
  email: string;
  image: string;
}
export interface AuthUserInLocalStorageType {
  user: NextAuthUserType;
  type: AuthUserType;
}

export interface UserInLocalStorage {
  user: NextAuthUserType;
  type: AuthUserType;
}
