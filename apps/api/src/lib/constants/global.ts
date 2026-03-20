import type { ComponentPropsWithoutRef } from "react";

import type { UserRoleType } from "@/lib/interfaces";

import { JOB_DOMAIN_NORMALIZER } from "./api";
import { envConfig } from "./envConfig";

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

const IN_DEV_PAGES = ["/unskilled"];
const projectGroupWhatsapp = "https://chat.whatsapp.com/D1ko12SykD1LfvJwmNQ48A";

const SCREEN_BREAKPOINTS = {
  SM: "(max-width: 800px)",
  MD: "(max-width: 1024px)",
  LG: "(min-width: 1025px)",
};

const PAGINATION_LIMITS = {
  DEFAULT: 50,
  DSA_SHEET: 1000,
  APTITUDE_ROADMAP: 1000,
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

const USER_ROLE_OPTIONS: { label: string; value: UserRoleType }[] = [
  { label: "Tech Student", value: "TECH_STUDENT" },
  { label: "Non-Tech Student", value: "NON_TECH_STUDENT" },
  { label: "Working Professional", value: "WORKING_PROFESSIONAL" },
  { label: "DevRel Advocate", value: "DEVREL_ADVOCATE" },
  { label: "DevRel Lead", value: "DEVREL_LEAD" },
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

const JOB_DOMAINS = JOB_DOMAIN_NORMALIZER.map(({ value }) => ({
  label: value,
  value,
})).splice(0, 10);

const JOB_EXPERIENCE_LEVEL: {
  label: string;
  value: string;
  min: number;
  max: number;
}[] = [
  { label: "Fresher (0 yrs)", value: "FRESHER", min: 0, max: 1 },
  { label: "Early Career (1–2 yrs)", value: "EARLY_CAREER", min: 1, max: 2 },
  { label: "Mid-Level (2–4 yrs)", value: "MID_LEVEL", min: 2, max: 4 },
  { label: "Senior (4–7 yrs)", value: "SENIOR", min: 4, max: 7 },
  { label: "Staff Engineer (7–10 yrs)", value: "STAFF", min: 7, max: 10 },
  {
    label: "Principal Engineer (10+ yrs)",
    value: "PRINCIPAL",
    min: 10,
    max: 100,
  },
];

const PAGE_REFRESH_TIMEOUT = {
  short: 10, // 10 seconds
  medium: 60 * 60 * 24, // 1 day in seconds
  long: 60 * 60 * 24 * 5, // 5 days in seconds
  veryLong: 60 * 60 * 24 * 15, // 15 days in seconds
};

const isProductionEnv = envConfig.NODE_ENV === "production";
const isDevelopmentEnv = envConfig.NODE_ENV === "development";

export {
  apiStatusCodes,
  COUNTRY_CODES,
  favicons,
  googleAnalyticsScript,
  gtag,
  imageMeta,
  IN_DEV_PAGES,
  isDevelopmentEnv,
  isProductionEnv,
  JOB_DOMAINS,
  JOB_EXPERIENCE_LEVEL,
  LINKS,
  localStorageKeys,
  PAGE_REFRESH_TIMEOUT,
  PAGINATION_LIMITS,
  PORTFOLIO_CARDS,
  projectGroupWhatsapp,
  SCREEN_BREAKPOINTS,
  STATIC_FILE_PATH,
  USER_ROLE_OPTIONS,
};
