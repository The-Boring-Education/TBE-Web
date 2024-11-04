import { ProductDataProps } from '@/interfaces';
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

const products: ProductDataProps = {
  roadmaps: {
    label: 'Roadmaps',
    slug: '/roadmaps',
    description: 'Create Your Personalized Roadmap',
  },
  projects: {
    label: 'The Boring Projects',
    slug: '/projects',
    description: 'Build Real Life Projects with Peers',
  },
  shiksha: {
    label: 'Shiksha',
    slug: routes.shiksha,
    description: 'Learn Tech with Free Bite-sized Courses',
  },
  interviewPrep: {
    label: 'Interview Prep',
    slug: routes.interviewPrep,
    description:
      'Prepare for Upcoming Tech Interview with Most Asked Questions in Real Interviews.',
  },
  workshops: {
    label: 'The Boring Workshops',
    slug: `https://www.youtube.com/playlist?list=PLOPyGCrLiI_5JPAbIsv1T129b5LqdurTc`,
    description: 'Learn Skills with Hands-on Workshops',
  },
  os: {
    label: 'The Boring Open Source',
    slug: '/os',
    description: 'Learn and Contribute with Open Source',
  },
};

// Global links
const LINKS = {
  bookTechConsultation: 'https://topmate.io/imsks',
  whatsappCommunity: 'https://chat.whatsapp.com/EeB7LrPRg2p3RyMOicyIAC',
  instagram: 'https://www.instagram.com/theboringeducation',
  youtube: 'https://www.youtube.com/@TheBoringEducation',
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

const mentorshipPlans: { title: string; description: string; link: string }[] =
  [
    {
      title: 'Book Tech Guidance',
      description: 'Get mentored by working professionals',
      link: '',
    },
    {
      title: 'Book Resume Review',
      description:
        'Get a resume review to enhance your job application and stand out to employers.',
      link: '',
    },
    {
      title: 'Cracking Remote Jobs',
      description:
        'know the secret behind cracking remote jobs by industry experts.',
      link: '',
    },
  ];

const IN_DEV_PAGES = ['/projects'];
const projectGroupWhatsapp = 'https://chat.whatsapp.com/D1ko12SykD1LfvJwmNQ48A';

const SCREEN_BREAKPOINTS = {
  SM: '(max-width: 800px)',
  MD: '(max-width: 1024px)',
  LG: '(min-width: 1025px)',
};

export {
  imageMeta,
  products,
  LINKS,
  gtag,
  googleAnalyticsScript,
  STATIC_FILE_PATH,
  favicons,
  localStorageKeys,
  apiStatusCodes,
  IN_DEV_PAGES,
  projectGroupWhatsapp,
  mentorshipPlans,
  SCREEN_BREAKPOINTS,
};
