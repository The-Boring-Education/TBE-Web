import { PortfolioTemplateProps, ProductDataProps } from '@/interfaces';
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
    label: 'Projects',
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
    description: 'Prepare for Tech Interviews with Real Questions',
  },
  webinar: {
    label: 'Webinar',
    slug: routes.webinar,
    description: 'Attend Free Webinars on Latest Technologies',
  },
  os: {
    label: 'Open Source',
    slug: 'https://theboringeducation.notion.site/Contribute-The-Boring-Education-8171f19257fd4ef99b7287555eb5062b',
    description: 'Learn and Contribute with Open Source',
  },
  portfolio: {
    label: 'Portfolio',
    slug: routes.portfolio,
    description: 'Create Your Personal Portfolio Website',
  },
};

// Global links
const LINKS = {
  bookTechConsultation: 'https://topmate.io/imsks',
  whatsappCommunity: 'https://chat.whatsapp.com/EeB7LrPRg2p3RyMOicyIAC',
  instagram: 'https://www.instagram.com/theboringeducation',
  youtube: 'https://www.youtube.com/@TheBoringEducation',
  submitPortfolio:
    'https://docs.google.com/forms/d/e/1FAIpQLSd6_B3RPRCC1clar-Kq9QdDNp_shebXj6jSyW90JPNuaRn4AA/viewform?usp=dialog',
  joinCampusAmbassador:
    'https://docs.google.com/forms/d/e/1FAIpQLSfYHF6BlVfzcela42McNzHZo3WFfjgEV_e0EBrlsxNUdmK_KA/viewform?usp=dialog',
  sachinLinkedIn: 'https://www.linkedin.com/in/imsks/',
  officialLinkedIn: 'https://www.linkedin.com/company/theboringeducation',
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

const PORTFOLIO_CARDS = [
  {
    id: 1,
    imageUrl: `${STATIC_FILE_PATH.svg}/the-boring-portfolio-card-resume.svg`,
    title: 'Resume is not Enough.',
    description: 'Showcase your skills with a personalized portfolio website.',
  },
  {
    id: 2,
    imageUrl: `${STATIC_FILE_PATH.svg}/the-boring-portfolio-card-standout.svg`,
    title: 'Stand Out.',
    description: 'Highlight your unique capabilities effectively and clearly.',
  },
  {
    id: 3,
    imageUrl: `${STATIC_FILE_PATH.svg}/the-boring-portfolio-card-brand.svg`,
    title: 'Control Your Brand.',
    description: 'Manage your personal brand and online presence efficiently.',
  },
  {
    id: 4,
    imageUrl: `${STATIC_FILE_PATH.svg}/the-boring-portfolio-card-professional.svg`,
    title: 'Professionalism.',
    description:
      'Show potential employers you are serious about your career growth.',
  },
  {
    id: 5,
    imageUrl: `${STATIC_FILE_PATH.svg}/the-boring-portfolio-card-networking.svg`,
    title: 'Networking.',
    description:
      'Easily share your work and connect with others in your field.',
  },
  {
    id: 6,
    imageUrl: `${STATIC_FILE_PATH.svg}/the-boring-portfolio-card-seo.svg`,
    title: 'SEO Benefits.',
    description:
      'Improve your visibility on search engines and attract opportunities.',
  },
];

const PORTFOLIO_TEMPLATES: PortfolioTemplateProps[] = [
  {
    id: 1,
    imageUrl: `${STATIC_FILE_PATH.svg}/portfolio-template-1.svg`,
    title: 'DevCanvas by Shaik',
    description: 'HTML, CSS, JavaScript, and GSAP.',
    previewLink: 'https://shaik-sharzil.netlify.app/',
    repo: 'https://github.com/shaiksharzil/portfolio',
    developer: {
      name: 'Shaik Sharzil',
      link: 'https://github.com/shaiksharzil',
    },
  },
  {
    id: 2,
    imageUrl: `${STATIC_FILE_PATH.svg}/portfolio-template-2.svg`,
    title: 'Build with Rahul',
    description: 'Responsive React portfolio.',
    previewLink: 'https://rahul-personal-portfolio-01.netlify.app/',
    repo: 'https://github.com/KumarRahul-01/my_Portfolio/tree/main',
    developer: {
      name: 'Rahul Kumar Baitha',
      link: 'https://github.com/KumarRahul-01',
    },
  },
  {
    id: 3,
    imageUrl: `${STATIC_FILE_PATH.svg}/portfolio-template-3.svg`,
    title: 'Making You Visible',
    description: 'Next.js, Tailwind CSS, and NextUI.',
    previewLink: '4n5hu.vercel.app',
    repo: 'https://github.com/anshu189/4n5hu',
    developer: {
      name: 'Anshu Saini',
      link: 'https://github.com/anshu189',
    },
  },
  {
    id: 4,
    imageUrl: `${STATIC_FILE_PATH.svg}/portfolio-template-4.svg`,
    title: 'Build with Aayush',
    description: 'React.js and Tailwind.',
    previewLink: 'https://aayushkakkar.netlify.app',
    repo: 'https://github.com/aayushkakkar26/AayushPortfolio',
    developer: {
      name: 'Aayush Kakkar',
      link: 'https://github.com/aayushkakkar26',
    },
  },
  {
    id: 5,
    imageUrl: `${STATIC_FILE_PATH.svg}/portfolio-template-5.svg`,
    title: 'Design to Deploy by Harsh',
    description: 'React.js and Tailwind.',
    previewLink: 'https://portfolio-harshrj1501.netlify.app',
    repo: 'https://github.com/Harshrj1502/Portfoliio-modern',
    developer: {
      name: 'Harsh Raj',
      link: 'https://github.com/Harshrj1502',
    },
  },
];

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
  PORTFOLIO_CARDS,
  PORTFOLIO_TEMPLATES,
};
