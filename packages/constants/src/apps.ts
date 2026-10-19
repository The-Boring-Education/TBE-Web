/**
 * App Configuration for TBE Platform
 *
 * Defines configuration for each app in the monorepo including:
 * - App identifier
 * - Domain/URL configuration
 * - SEO defaults
 * - App-specific metadata
 */

export type AppIdentifier =
  | "platform"
  | "prep-yatra"
  | "quizes"
  | "onboarding"
  | "techyatra"
  | "dsayatra"
  | "resume-yatra";

export interface AppConfig {
  identifier: AppIdentifier;
  name: string;
  domain: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultImage?: string;
}

/**
 * Social preview (Open Graph / Twitter) image shared by all apps.
 * Served from `apps/platform/public/images/og-image.png`. Must be an absolute
 * HTTPS URL to a raster image on the final (non-redirecting) host, otherwise
 * crawlers like WhatsApp, LinkedIn and Facebook will drop the preview image.
 */
export const DEFAULT_OG_IMAGE = {
  url: "https://www.theboringeducation.com/images/og-image.png",
  width: 1200,
  height: 630,
  type: "image/png",
  alt: "The Boring Education - Tech Education for Everyone",
};

export const APP_CONFIGS: Record<AppIdentifier, AppConfig> = {
  platform: {
    identifier: "platform",
    name: "The Boring Education",
    domain: "https://www.theboringeducation.com",
    defaultTitle: "The Boring Education | Tech Education for Everyone",
    defaultDescription:
      "The Boring Education offers tech education for everyone with online courses, interview prep, open source projects, and webinars.",
    defaultImage: DEFAULT_OG_IMAGE.url,
  },
  "prep-yatra": {
    identifier: "prep-yatra",
    name: "PrepYatra",
    domain: "https://prepyatra.theboringeducation.com",
    defaultTitle:
      "PrepYatra - Complete Interview Preparation Platform | The Boring Education",
    defaultDescription:
      "Master your interviews with PrepYatra. Get personalized questions, mock interviews, and expert guidance to land your dream job.",
    defaultImage: DEFAULT_OG_IMAGE.url,
  },
  quizes: {
    identifier: "quizes",
    name: "TBE Quizes",
    domain: "https://quiz.theboringeducation.com",
    defaultTitle: "TBE Quizes | Test Your Knowledge",
    defaultDescription:
      "Test your knowledge with interactive quizzes on various tech topics.",
    defaultImage: DEFAULT_OG_IMAGE.url,
  },
  onboarding: {
    identifier: "onboarding",
    name: "TBE Onboarding",
    domain: "https://onboarding.theboringeducation.com",
    defaultTitle: "Onboarding | The Boring Education",
    defaultDescription:
      "Complete your onboarding process and start your learning journey with The Boring Education.",
    defaultImage: DEFAULT_OG_IMAGE.url,
  },
  techyatra: {
    identifier: "techyatra",
    name: "TechYatra",
    domain: "https://techyatra.theboringeducation.com",
    defaultTitle: "TechYatra | Tech Learning Journey",
    defaultDescription: "Embark on your tech learning journey with TechYatra.",
    defaultImage: DEFAULT_OG_IMAGE.url,
  },
  dsayatra: {
    identifier: "dsayatra",
    name: "DSAYatra",
    domain: "https://dsayatra.theboringeducation.com",
    defaultTitle: "DSAYatra | Data Structures & Algorithms Practice",
    defaultDescription: "Master Data Structures and Algorithms with DSAYatra.",
    defaultImage: DEFAULT_OG_IMAGE.url,
  },
  "resume-yatra": {
    identifier: "resume-yatra",
    name: "ResumeYatra",
    domain: "https://resumeyatra.theboringeducation.com",
    defaultTitle: "ResumeYatra | Build Your Professional Resume",
    defaultDescription:
      "Create a professional resume that stands out with ResumeYatra.",
    defaultImage: DEFAULT_OG_IMAGE.url,
  },
};

/**
 * Get app configuration by identifier
 */
export const getAppConfig = (appId: AppIdentifier): AppConfig => {
  return APP_CONFIGS[appId] || APP_CONFIGS.platform;
};

/**
 * Get app identifier from domain or environment
 * This can be used to auto-detect the app context
 */
export const getAppIdentifierFromDomain = (domain?: string): AppIdentifier => {
  if (!domain) return "platform";

  const domainLower = domain.toLowerCase();

  if (domainLower.includes("prepyatra")) return "prep-yatra";
  if (domainLower.includes("quizes")) return "quizes";
  if (domainLower.includes("onboarding")) return "onboarding";
  if (domainLower.includes("techyatra")) return "techyatra";
  if (domainLower.includes("dsayatra")) return "dsayatra";
  if (domainLower.includes("resumeyatra")) return "resume-yatra";

  return "platform";
};
