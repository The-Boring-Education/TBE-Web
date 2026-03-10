import type {
  CohortDataProps,
  LeaderboardType,
  MentorshipCardProps,
  PlatformUsageType,
  PortfolioTemplateProps,
  PrimaryCardWithCTAProps,
  ProductDataProps,
  RadioButtonOptionsProps,
  UserLevel,
  UserPointsActionType,
  UserRoleType,
} from "@tbe/types";
import type { ComponentPropsWithoutRef } from "react";

import { envConfig } from "./envConfig";
import { routes } from "./routes";

// Paths
const STATIC_FILE_PATH = {
  svg: "https://ik.imagekit.io/tbe/webapp",
  webp: "https://ik.imagekit.io/tbe/webapp",
  image: "https://ik.imagekit.io/tbe/webapp",
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
    label: "Roadmaps",
    slug: "/roadmaps",
    description: "Create Your Personalized Roadmap",
  },
  projects: {
    label: "Projects",
    slug: "/projects",
    description: "Build Real Life Projects with Peers",
  },
  shiksha: {
    label: "Shiksha",
    slug: routes.shiksha,
    description: "Learn Tech with Free Bite-sized Courses",
  },
  interviewPrep: {
    label: "Interview Prep",
    slug: routes.interviewPrep,
    description: "Prepare for Tech Interviews with Real Questions",
  },
  webinar: {
    label: "Webinar",
    slug: routes.webinar,
    description: "Attend Free Webinars on Latest Technologies",
  },
  os: {
    label: "Open Source",
    slug: routes.contribute,
    description: "Learn and Contribute with Open Source",
  },
  portfolio: {
    label: "Portfolio",
    slug: routes.portfolio,
    description: "Create Your Personal Portfolio Website",
  },
  youfocus: {
    label: "YouFocus",
    slug: routes.youfocus,
    description: "Learn Tech From YouTube with 0 Distractions",
  },
  unskilled: {
    label: "UnSkilled",
    slug: routes.unskilled,
    description: "Find Your Next Tech Job with Insights",
  },
  // PrepYatra - External Product
  prepYatra: {
    label: "Prep Yatra",
    slug: "https://prepyatra.theboringeducation.com",
    description: "Complete Interview Preparation Platform",
  },
  // Yatra Products - External Tools
  techYatra: {
    label: "Tech Yatra",
    slug: "https://techyatra.theboringeducation.com/",
    description: "Technology Learning Journey and Roadmaps",
  },
  dsaYatra: {
    label: "DSA Yatra",
    slug: "https://dsayatra.theboringeducation.com/",
    description: "Data Structures & Algorithms Practice Platform",
  },
  resumeYatra: {
    label: "Resume Yatra",
    slug: "https://resumeyatra.theboringeducation.com/",
    description: "Professional Resume Builder and Optimizer",
  },
};

const cohorts: CohortDataProps = {
  bringYourIdea: {
    label: "Bring Your Idea",
    slug: routes.cohort.bringYourIdea,
    description: "Build & Launch Your First Startup with Mentorship",
  },
};

// Global links
const LINKS = {
  bookTechConsultation: "https://topmate.io/imsks",
  followUsOnInstagram: "https://www.instagram.com/theboringeducation",
  whatsappCommunity: "https://chat.whatsapp.com/EeB7LrPRg2p3RyMOicyIAC",
  instagram: "https://www.instagram.com/theboringeducation",
  youtube: "https://www.youtube.com/@TheBoringEducation",
  submitPortfolio:
    "https://docs.google.com/forms/d/e/1FAIpQLSd6_B3RPRCC1clar-Kq9QdDNp_shebXj6jSyW90JPNuaRn4AA/viewform?usp=dialog",
  joinDevRelAdvocate:
    "https://docs.google.com/forms/d/e/1FAIpQLSfYHF6BlVfzcela42McNzHZo3WFfjgEV_e0EBrlsxNUdmK_KA/viewform?usp=dialog",
  sachinLinkedIn: "https://www.linkedin.com/in/imsks/",
  officialLinkedIn: "https://www.linkedin.com/company/theboringeducation",
  contributeOpenSource:
    "https://theboringeducation.notion.site/Contribute-The-Boring-Education-8171f19257fd4ef99b7287555eb5062b",
  applyBYICohort: "https://tally.so/r/wakbx9",
  bookProjectSession: "https://topmate.io/imsks/1527401",
  postmanDocs: "https://documenter.getpostman.com/view/10360102/2sAYdcsYK3",
  hostTBEAtYourCollege: "https://tally.so/r/mZkOby",
  viewSessionDetails:
    "https://www.canva.com/design/DAGVf1D9DGw/LbEBK9ux5s2xQN_l6WKyvA/view?utm_content=DAGVf1D9DGw&utm_campaign=designshare&utm_medium=link&utm_source=editor",
  createIssue: "https://github.com/The-Boring-Education/TBE-Web/issues/new",
  quizApp: "https://quiz.theboringeducation.com",
};

// Google analytics
const gtag = `https://www.googletagmanager.com/gtag/js?id=${envConfig.GA_TRACKING_ID}`;

const googleAnalyticsScript = `
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${envConfig.GA_TRACKING_ID}');
          `;

const favicons: Array<ComponentPropsWithoutRef<"link">> = [
  {
    rel: "apple-touch-icon",
    sizes: "180x180",
    href: "/favicon/apple-touch-icon.png",
  },
  {
    rel: "icon",
    type: "image/png",
    sizes: "32x32",
    href: "/favicon/favicon-32x32.png",
  },
  {
    rel: "icon",
    type: "image/png",
    sizes: "16x16",
    href: "/favicon/favicon-16x16.png",
  },
  { rel: "manifest", href: "/favicon/site.webmanifest" },
  {
    rel: "mask-icon",
    href: "/favicon/safari-pinned-tab.svg",
    color: "#00e887",
  },
  { rel: "shortcut icon", href: "/favicon/favicon.ico" },
];

// Local storage keys
const localStorageKeys = {
  USER: "USER",
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
  METHOD_NOT_ALLOWED: 405,
};

const MENTORSHIP_CARDS: MentorshipCardProps[] = [
  {
    heading: "Book Tech Guidance",
    description: "Get mentored by working professionals",
    link: "https://topmate.io/imsks/714265",
  },
  {
    heading: "Book Resume Review",
    description:
      "Get a resume review to enhance your job application and stand out to employers.",
    link: "https://topmate.io/imsks/714264",
  },
];

const MENTORSHIP_SERVICES_CARDS: PrimaryCardWithCTAProps[] = [
  {
    id: "1",
    image: `${STATIC_FILE_PATH.svg}/mentorship.svg`,
    imageAltText: "Mentorship icon for project idea service",
    title: "Find Your Project Idea",
    content: "Discover a project idea that fits you in 15 minutes",
    href: "https://topmate.io/imsks/",
    ctaText: "Book Now",
    borderColour: 1,
    target: "_blank",
    active: true,
    launchingOn: "Available Now",
  },
  {
    id: "2",
    image: `${STATIC_FILE_PATH.svg}/community.svg`,
    imageAltText: "Community icon for remote jobs roadmap service",
    title: "Personalised Roadmap for Remote Internships /Jobs",
    content: "Create a personalised plan to land remote roles",
    href: "https://topmate.io/imsks/",
    ctaText: "Book Now",
    borderColour: 2,
    target: "_blank",
    active: true,
    launchingOn: "Available Now",
  },
  {
    id: "3",
    image: `${STATIC_FILE_PATH.svg}/interview.svg`,
    imageAltText: "Interview icon for interview prep service",
    title: "Personal Interview Prep Plan",
    content: "Create a custom plan to crack tech interviews",
    href: "https://topmate.io/imsks/",
    ctaText: "Book Now",
    borderColour: 3,
    target: "_blank",
    active: true,
    launchingOn: "Available Now",
  },
  {
    id: "4",
    image: `${STATIC_FILE_PATH.svg}/projects.svg`,
    imageAltText: "Projects icon for resume review service",
    title: "Resume Review",
    content: "Fix your resume & make it internship/job ready",
    href: "https://topmate.io/imsks/",
    ctaText: "Book Now",
    borderColour: 4,
    target: "_blank",
    active: true,
    launchingOn: "Available Now",
  },
  {
    id: "5",
    image: `${STATIC_FILE_PATH.svg}/webinar-hero.svg`,
    imageAltText: "Webinar icon for tech guidance service",
    title: "Tech Guidance",
    content: "Plan your next step in tech together",
    href: "https://topmate.io/imsks/",
    ctaText: "Book Now",
    borderColour: 5,
    target: "_blank",
    active: true,
    launchingOn: "Available Now",
  },
];

const IN_DEV_PAGES = ["/unskilled"];
const projectGroupWhatsapp = "https://chat.whatsapp.com/D1ko12SykD1LfvJwmNQ48A";

const SCREEN_BREAKPOINTS = {
  SM: "(max-width: 800px)",
  MD: "(max-width: 1024px)",
  LG: "(min-width: 1025px)",
};

const PORTFOLIO_CARDS = [
  {
    id: 1,
    imageUrl: `${STATIC_FILE_PATH.svg}/the-boring-portfolio-card-resume.svg`,
    title: "Resume is not Enough.",
    description: "Showcase your skills with a personalized portfolio website.",
  },
  {
    id: 2,
    imageUrl: `${STATIC_FILE_PATH.svg}/the-boring-portfolio-card-standout.svg`,
    title: "Stand Out.",
    description: "Highlight your unique capabilities effectively and clearly.",
  },
  {
    id: 3,
    imageUrl: `${STATIC_FILE_PATH.svg}/the-boring-portfolio-card-brand.svg`,
    title: "Control Your Brand.",
    description: "Manage your personal brand and online presence efficiently.",
  },
  {
    id: 4,
    imageUrl: `${STATIC_FILE_PATH.svg}/the-boring-portfolio-card-professional.svg`,
    title: "Professionalism.",
    description:
      "Show potential employers you are serious about your career growth.",
  },
  {
    id: 5,
    imageUrl: `${STATIC_FILE_PATH.svg}/the-boring-portfolio-card-networking.svg`,
    title: "Networking.",
    description:
      "Easily share your work and connect with others in your field.",
  },
  {
    id: 6,
    imageUrl: `${STATIC_FILE_PATH.svg}/the-boring-portfolio-card-seo.svg`,
    title: "SEO Benefits.",
    description:
      "Improve your visibility on search engines and attract opportunities.",
  },
];

const PORTFOLIO_TEMPLATES: PortfolioTemplateProps[] = [
  {
    id: 1,
    imageUrl: `${STATIC_FILE_PATH.svg}/portfolio-template-1.svg`,
    title: "DevCanvas by Shaik",
    description: "HTML, CSS, JavaScript, and GSAP.",
    previewLink: "https://shaik-sharzil.netlify.app/",
    repo: "https://github.com/shaiksharzil/portfolio",
    developer: {
      name: "Shaik Sharzil",
      link: "https://github.com/shaiksharzil",
    },
  },
  {
    id: 2,
    imageUrl: `${STATIC_FILE_PATH.svg}/portfolio-template-2.svg`,
    title: "Build with Rahul",
    description: "Responsive React portfolio.",
    previewLink: "https://rahul-personal-portfolio-01.netlify.app/",
    repo: "https://github.com/KumarRahul-01/my_Portfolio/tree/main",
    developer: {
      name: "Rahul Kumar Baitha",
      link: "https://github.com/KumarRahul-01",
    },
  },
  {
    id: 3,
    imageUrl: `${STATIC_FILE_PATH.svg}/portfolio-template-3.svg`,
    title: "Making You Visible",
    description: "Next.js, Tailwind CSS, and NextUI.",
    previewLink: "4n5hu.vercel.app",
    repo: "https://github.com/anshu189/4n5hu",
    developer: {
      name: "Anshu Saini",
      link: "https://github.com/anshu189",
    },
  },
  {
    id: 4,
    imageUrl: `${STATIC_FILE_PATH.svg}/portfolio-template-4.svg`,
    title: "Build with Aayush",
    description: "React.js and Tailwind.",
    previewLink: "https://aayushkakkar.netlify.app",
    repo: "https://github.com/aayushkakkar26/AayushPortfolio",
    developer: {
      name: "Aayush Kakkar",
      link: "https://github.com/aayushkakkar26",
    },
  },
  {
    id: 5,
    imageUrl: `${STATIC_FILE_PATH.svg}/portfolio-template-5.svg`,
    title: "Design to Deploy by Harsh",
    description: "React.js and Tailwind.",
    previewLink: "https://portfolio-harshrj1501.netlify.app",
    repo: "https://github.com/Harshrj1502/Portfoliio-modern",
    developer: {
      name: "Harsh Raj",
      link: "https://github.com/Harshrj1502",
    },
  },
];

const YOUFOCUS_SKILL_PLAYLISTS: RadioButtonOptionsProps[] = [
  { label: "React.js", value: "reactjs" },
  { label: "Node.js", value: "nodejs" },
  { label: "HTML", value: "html" },
  { label: "CSS", value: "css" },
  { label: "C++", value: "cpp" },
  { label: "Java", value: "java" },
  { label: "Python", value: "python" },
  { label: "DSA", value: "dsa" },
];

const POINTS_RULES: Record<UserPointsActionType, number> = {
  ENROLL_COURSE: 50,
  ENROLL_SHEET: 50,
  ENROLL_PROJECT: 50,
  COMPLETE_COURSE_CHAPTER: 20,
  COMPLETE_PROJECT_CHAPTER: 30,
  COMPLETE_COURSE_CERTIFICATE: 50,
  COMPLETE_PROJECT: 100,
  COMPLETE_INTERVIEW_SHEET: 80,
  COMPLETE_QUESTION: 10,
  PROFILE_COMPLETION: 30,
  SOCIAL_SHARE: 15,
  FEEDBACK_SUBMIT: 10,
  VIDEO_WATCH_COMPLETE: 5,
  FIRST_LOGIN: 25,
  DAILY_VISIT: 5,
  STREAK: 3,
  REFER: 20,
  WEBINAR_ATTEND: 40,
  DOWNLOAD_CERTIFICATE: 20,
  HELP_COMMUNITY: 15,
  RECRUITER_ADDED: 25,
  PREPLOG_CREATED: 15,
  PREPLOG_STREAK_3: 25,
  PREPLOG_STREAK_7: 50,
  PREPLOG_STREAK_15: 100,
  PREPLOG_STREAK_30: 200,
  COMPLETE_QUIZ: 30,
  QUIZ_PERFECT_SCORE: 50,
  QUIZ_STREAK: 20,
};

const USER_LEVELS: UserLevel[] = [
  { name: "Noob", value: "NOOB", minPoints: 0, level: 1 },
  { name: "Coder", value: "CODER", minPoints: 500, level: 2 },
  { name: "Debugger", value: "DEBUGGER", minPoints: 1000, level: 3 },
  { name: "Ninja", value: "NINJA", minPoints: 2000, level: 4 },
  { name: "Squasher", value: "SQUASHER", minPoints: 3000, level: 5 },
  { name: "Hacker", value: "HACKER", minPoints: 4500, level: 6 },
  { name: "Wizard", value: "WIZARD", minPoints: 6000, level: 7 },
  { name: "Guru", value: "GURU", minPoints: 7500, level: 8 },
  { name: "Architect", value: "ARCHITECT", minPoints: 9000, level: 9 },
  { name: "Legend", value: "LEGEND", minPoints: 10000, level: 10 },
];

const USER_ROLE_OPTIONS: { label: string; value: UserRoleType }[] = [
  { label: "Tech Student", value: "TECH_STUDENT" },
  { label: "Non-Tech Student", value: "NON_TECH_STUDENT" },
  { label: "Working Professional", value: "WORKING_PROFESSIONAL" },
  { label: "DevRel Advocate", value: "DEVREL_ADVOCATE" },
  { label: "DevRel Lead", value: "DEVREL_LEAD" },
];

const USER_USAGE_OPTIONS: { label: string; value: PlatformUsageType }[] = [
  { label: "Learning Tech", value: "LEARNING_TECH" },
  { label: "Building Projects", value: "BUILDING_PROJECTS" },
  { label: "Interview Prep", value: "INTERVIEW_PREP" },
  { label: "Job Search", value: "JOB_SEARCH" },
];

const COUNTRY_CODES = [
  { code: "+91", country: "INDIA" },
  { code: "+1", country: "UNITED STATES" },
  { code: "+44", country: "UNITED KINGDOM" },
  { code: "+81", country: "JAPAN" },
  { code: "+49", country: "GERMANY" },
  { code: "+33", country: "FRANCE" },
  { code: "+61", country: "AUSTRALIA" },
  { code: "+86", country: "CHINA" },
  { code: "+39", country: "ITALY" },
  { code: "+7", country: "RUSSIA" },
  { code: "+34", country: "SPAIN" },
  { code: "+82", country: "SOUTH KOREA" },
  { code: "+31", country: "NETHERLANDS" },
  { code: "+47", country: "NORWAY" },
  { code: "+46", country: "SWEDEN" },
];

const JOB_EXPERIENCE_LEVEL: {
  label: string;
  value: string;
  min: number;
  max: number;
}[] = [
  { label: "Fresher (0 yrs)", value: "Fresher (0 yrs)", min: 0, max: 1 },
  {
    label: "Early Career (1-2 yrs)",
    value: "Early Career (1-2 yrs)",
    min: 1,
    max: 2,
  },
  {
    label: "Mid-Level (2-4 yrs)",
    value: "Mid-Level (2-4 yrs)",
    min: 2,
    max: 4,
  },
  { label: "Senior (4-7 yrs)", value: "Senior (4-7 yrs)", min: 4, max: 7 },
  {
    label: "Staff Engineer (7-10 yrs)",
    value: "Staff Engineer (7-10 yrs)",
    min: 7,
    max: 10,
  },
  {
    label: "Principal Engineer (10+ yrs)",
    value: "Principal Engineer (10+ yrs)",
    min: 10,
    max: 100,
  },
];

const PAGE_REFRESH_TIMEOUT = {
  short: 10, // 10 seconds
  medium: 60 * 60 * 24, // 1 day in seconds
  long: 60 * 60 * 24 * 5, // 5 days in seconds
  veryLong: 60 * 60 * 24 * 15, // 15 days in seconds
  veryVeryLong: 60 * 60 * 24 * 90, // 90 days in seconds
};

const isProductionEnv = envConfig.NODE_ENV === "production";
const isDevelopmentEnv = envConfig.NODE_ENV === "development";

const LEADERBOARD_TABS: LeaderboardType[] = ["DAILY", "WEEKLY", "MONTHLY"];

export {
  apiStatusCodes,
  cohorts,
  COUNTRY_CODES,
  favicons,
  googleAnalyticsScript,
  gtag,
  imageMeta,
  IN_DEV_PAGES,
  isDevelopmentEnv,
  isProductionEnv,
  JOB_EXPERIENCE_LEVEL,
  LEADERBOARD_TABS,
  LINKS,
  localStorageKeys,
  MENTORSHIP_CARDS,
  MENTORSHIP_SERVICES_CARDS,
  PAGE_REFRESH_TIMEOUT,
  POINTS_RULES,
  PORTFOLIO_CARDS,
  PORTFOLIO_TEMPLATES,
  products,
  projectGroupWhatsapp,
  SCREEN_BREAKPOINTS,
  STATIC_FILE_PATH,
  USER_LEVELS,
  USER_ROLE_OPTIONS,
  USER_USAGE_OPTIONS,
  YOUFOCUS_SKILL_PLAYLISTS,
};
