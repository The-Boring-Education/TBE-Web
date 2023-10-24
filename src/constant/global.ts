import { ProgramsDataProps, AuthHOCConfigType } from '@/interfaces';
import { routes } from './routes';

// Paths
const STATIC_FILE_PATH = {
  svg: 'https://ik.imagekit.io/tbe/webapp',
  webp: 'https://ik.imagekit.io/tbe/webapp',
  image: 'https://ik.imagekit.io/tbe/webapp',
};

const imageMeta = {
  logo: {
    light: `${STATIC_FILE_PATH.svg}/logo.svg`,
    dark: `${STATIC_FILE_PATH.svg}/logo-dark.svg`,
    alt: `${STATIC_FILE_PATH.svg}/the-boring-education-logo`,
  },
};

const programs: ProgramsDataProps = {
  beFrontendMaster: {
    label: 'Be Front-end Master',
    slug: '/be-frontend-master',
    description:
      'Learn Core of Front-end Engineering with Placement Assistance in 8 Weeks.',
  },
  beBackendMaster: {
    label: 'Be Backend Master',
    slug: '/be-backend-master',
    description:
      'Learn Core of Backend Engineering with Placement Assistance in 8 Weeks.',
  },
  juniorInWebEngineering: {
    label: 'Junior in Web Engineering',
    slug: '/junior-in-web-engineering',
    description:
      'Learn Fundamentals of Web dev with industry experts in live sessions.',
  },
  theBoringWorkshops: {
    label: 'The Boring Workshops',
    slug: '/the-boring-workshops',
    description:
      'Learn to build In-Demand Tech & Design skills over a weekend, that stays for life!',
  },
  twoHourDesign: {
    label: '2 Hour Design',
    slug: '/2-hour-design',
    description: 'Learn to Design Tech Products in just 2 Hours.',
  },
  gettingStartedWithTypescipt: {
    label: 'Getting Started with Typescript',
    slug: '/getting-started-with-typescript',
    description: 'Typescript Zero to One in 90 min',
  },
  theNextWave: {
    label: 'The Next Wave',
    slug: '/the-next-wave',
    description: 'The next big thing after React.js in 2 Hours',
  },
  headToTailwind: {
    label: 'Head to Tailwind',
    slug: '/head-to-tailwind',
    description: 'Tailwind CSS for Everyone in 90 Min',
  },
  apiDevWithPostman: {
    label: 'API Dev with Postman',
    slug: '/api-dev-with-postman',
    description: 'Develop & Scale APIs like a Pro with Postman',
  },
  gettingStartedWithGithub: {
    label: 'Getting started with GitHub',
    slug: '/getting-started-with-github',
    description: 'Learn Version Control with GitHub in 90 Min',
  },
  introToWeb3: {
    label: 'Intro to Web3',
    slug: '/intro-to-web3',
    description: 'Roadmap to transition from Web2 to Web3',
  },
};

// Global links
const LINKS = {
  juniorInWebEngineeringRegistrationLink:
    'https://docs.google.com/forms/d/e/1FAIpQLSejDBJvhWMWeKZFkWY2PxuUa_LZYsstDvJljrn0Tbm2_2Kd7Q/viewform',
  freeTechConsultation:
    'https://calendly.com/theboringeducation/tech-consultation',
  bootcamp:
    'https://docs.google.com/forms/d/e/1FAIpQLSf40vUjRclTXIivifbahZ-L0EtnFhQw32BzQj3GWgBzeVfnXQ/viewform',
  workshopRegistration:
    'https://docs.google.com/forms/d/e/1FAIpQLSfPBZwDNAdhPWlJrdqJITBy9MEcR4OguNaz0H3TEpkh8irbNQ/viewform?usp=sf_link',
};

// Google analytics
const gtag = `https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}`;

const googleAnalyticsScript = `
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}');
          `;

const favicons: Array<React.ComponentPropsWithoutRef<'link'>> = [
  {
    rel: 'apple-touch-icon',
    sizes: '180x180',
    href: '/favicon/apple-touch-icon.png',
  },
  {
    rel: 'icon',
    type: 'image/png',
    sizes: '32x32',
    href: '/favicon/favicon-32x32.png',
  },
  {
    rel: 'icon',
    type: 'image/png',
    sizes: '16x16',
    href: '/favicon/favicon-16x16.png',
  },
  { rel: 'manifest', href: '/favicon/site.webmanifest' },
  {
    rel: 'mask-icon',
    href: '/favicon/safari-pinned-tab.svg',
    color: '#00e887',
  },
  { rel: 'shortcut icon', href: '/favicon/favicon.ico' },
];

// Local storage keys
const localStorageKeys = {
  USER: 'USER',
};

const authHOCConfig: AuthHOCConfigType = {
  admin: {
    userType: 'ADMIN',
    loginUrl: routes.admin.base,
  },
  adminLogin: {
    userType: 'ADMIN',
    redirectTo: routes.admin.dashboard,
  },
};

const apiUrls = {
  validateAdminByEmail: (email: string) => `/admin?email=${email}`,
  leadCohort: '/leads/cohort',
};

const apiStatusCodes = {
  OKAY: 200,
  RESOURCE_CREATED: 201,
  SUCCESSFUL_WITHOUT_RESPONSE: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

export {
  imageMeta,
  programs,
  LINKS,
  gtag,
  googleAnalyticsScript,
  STATIC_FILE_PATH,
  favicons,
  localStorageKeys,
  authHOCConfig,
  apiStatusCodes,
  apiUrls,
};
