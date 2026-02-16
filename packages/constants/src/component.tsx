// @ts-nocheck
import {
  Award,
  BookOpen,
  Brain,
  Briefcase,
  FileText,
  Map,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react";
import type { ComponentType } from "react";
import React from "react";

interface NavbarDropdownLink {
  id: string;
  name: string;
  href: string;
  description: string;
  target?: "_blank";
  isDevelopment?: boolean;
}

const socialLinks = [
  {
    name: "Instagram",
    href: "https://www.instagram.com/theboringeducation",
    icon: "instagram",
  },
  {
    name: "GitHub",
    href: "https://github.com/The-Boring-Education",
    icon: "github",
  },
  {
    name: "YouTube",
    href: "https://www.youtube.com/@TheBoringEducation",
    icon: "youtube",
  },
];

const productLinks = [
  {
    name: "The Boring Education",
    href: "https://www.theboringeducation.com/",
  },
];

const CONFETTI_COLORS = [
  "#facc15", // yellow-400
  "#38bdf8", // sky-400
  "#4ade80", // green-400
  "#f472b6", // pink-400
  "#fff", // white
  "#f59e42", // custom orange
  "#818cf8", // indigo-400
];

const links: NavbarDropdownLink[] = [
  {
    id: "explore-courses",
    name: "Explore Courses",
    href: "https://www.theboringeducation.com/shiksha",
    description: "Learn Tech with Courses",
  },
  {
    id: "tech-yatra",
    name: "Tech Yatra",
    href: "https://techyatra.theboringeducation.com/",
    description: "Start Tech Journey",
  },
  {
    id: "resume-yatra",
    name: "Resume Yatra",
    href: "https://resumeyatra.theboringeducation.com/",
    description: "Fix Your Resume",
  },
  {
    id: "dsa-yatra",
    name: "DSA Yatra",
    href: "https://dsayatra.theboringeducation.com/",
    description: "Start DSA Journey",
  },
];

interface NavbarVariantConfig {
  branding?: React.ReactNode;
  productName?: string;
  subText?: string;
  dashboardRoute: string;
  borderClass?: string;
  requiresAuth?: boolean;
  showGamification?: boolean;
  showCohorts?: boolean; // If false, hides Cohorts section
  showLearn?: boolean; // If false, hides Learn section
  showNotifications?: boolean; // If false, hides Notification section
}

const getNavbarVariantConfig = (
  Logo: ComponentType<any>
): Record<string, NavbarVariantConfig> => ({
  default: {
    branding: <Logo />,
    dashboardRoute: "/user/dashboard",
    borderClass: "border",
    requiresAuth: true,
  },
  transparent: {
    branding: <Logo />,
    dashboardRoute: "/user/dashboard",
    borderClass: "border",
    requiresAuth: true,
  },
  prepyatra: {
    productName: "PrepYatra",
    subText: "By The Boring Education",
    dashboardRoute: "/dashboard",
    borderClass: "border-b border-greyLight",
    requiresAuth: true,
  },
  quizes: {
    productName: "The Boring Quizes",
    subText: "By The Boring Education",
    dashboardRoute: "/dashboard",
    borderClass: "border",
    requiresAuth: true,
    showNotifications: false,
  },
  techyatra: {
    productName: "TechYatra",
    subText: "By The Boring Education",
    dashboardRoute: "/",
    borderClass: "border-b border-greyLight",
    requiresAuth: false, // Non-auth app
  },
  dsayatra: {
    productName: "DSA Yatra",
    subText: "By The Boring Education",
    dashboardRoute: "/dashboard",
    borderClass: "border-b border-greyLight",
    requiresAuth: true,
  },
  "resume-yatra": {
    productName: "ResumeYatra",
    subText: "By The Boring Education",
    dashboardRoute: "/builder",
    borderClass: "border",
    requiresAuth: true,
    showGamification: false,
  },
  oncampus: {
    productName: "OnCampus",
    subText: "By The Boring Education",
    dashboardRoute: "/dashboard",
    borderClass: "border-0 dark:border-0",
    requiresAuth: true, // Non-auth app
    showGamification: false,
    showCohorts: false, // Hide Cohorts section
    showLearn: false, // Hide Learn section
  },
  learning: {
    branding: <Logo />,
    dashboardRoute: "/user/dashboard",
    borderClass: "border",
    requiresAuth: true,
    showGamification: false,
    showCohorts: false,
    showLearn: false,
  },
});

// Footer Variant Configuration Interface
export interface FooterVariantConfig {
  branding: React.ReactNode;
  subtitle: string;
}

// Get Footer Variant Configuration
export const getFooterVariantConfig = (
  Logo: ComponentType<any>
): Record<string, FooterVariantConfig> => ({
  default: {
    branding: <Logo />,
    subtitle:
      "Making tech education accessible for everyone. Learn, build, and grow with our comprehensive platform designed for students and professionals.",
  },
  prepyatra: {
    branding: (
      <div className="flex flex-col gap-0">
        <span className="text-2xl font-bold text-primary leading-tight">
          PrepYatra
        </span>
        <span className="text-[10px] text-greyDark -mt-0.5">
          By The Boring Education
        </span>
      </div>
    ),
    subtitle:
      "Your Interview Prep Companion. Ace your tech interviews with curated resources, practice problems, and expert guidance.",
  },
  quizes: {
    branding: (
      <div className="flex flex-col gap-0">
        <span className="text-2xl font-bold text-primary leading-tight">
          The Boring Quizes
        </span>
        <span className="text-[10px] text-greyDark -mt-0.5">
          By The Boring Education
        </span>
      </div>
    ),
    subtitle:
      "Test your knowledge with interactive quizzes designed to reinforce your learning and track your progress.",
  },
  techyatra: {
    branding: (
      <div className="flex flex-col gap-0">
        <span className="text-2xl font-bold text-primary leading-tight">
          TechYatra
        </span>
        <span className="text-[10px] text-greyDark -mt-0.5">
          By The Boring Education
        </span>
      </div>
    ),
    subtitle:
      "Navigate your tech career journey with curated roadmaps, resources, and industry insights.",
  },
  dsayatra: {
    branding: (
      <div className="flex flex-col gap-0">
        <span className="text-2xl font-bold text-primary leading-tight">
          DSAYatra
        </span>
        <span className="text-[10px] text-greyDark -mt-0.5">
          By The Boring Education
        </span>
      </div>
    ),
    subtitle:
      "Master Data Structures and Algorithms with structured practice and comprehensive explanations.",
  },
  resumeyatra: {
    branding: (
      <div className="flex flex-col gap-0">
        <span className="text-2xl font-bold text-primary leading-tight">
          ResumeYatra
        </span>
        <span className="text-[10px] text-greyDark -mt-0.5">
          By The Boring Education
        </span>
      </div>
    ),
    subtitle:
      "Build professional resumes that stand out. Create, customize, and download your perfect resume in minutes.",
  },
  platform: {
    branding: <Logo />,
    subtitle:
      "Your complete tech education platform. Access courses, projects, webinars, and career resources all in one place.",
  },
});

// LoginCard Feature Interface
export interface LoginCardFeature {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

// LoginCard Variant Configuration Interface
export interface LoginCardVariantConfig {
  title: string;
  subtitle: string;
  rightSectionTitle?: string;
  features: LoginCardFeature[];
  redirectPath?: string;
  termsHref?: string;
  privacyHref?: string;
}

// Get LoginCard Variant Configuration
export const getLoginCardVariantConfig = (): Record<
  string,
  LoginCardVariantConfig
> => ({
  default: {
    title: "Welcome Back!",
    subtitle: "Sign in to continue your tech learning journey",
    rightSectionTitle: "Why TBE?",
    features: [
      {
        icon: Map,
        title: "Personalized Roadmaps",
        description: "Get customized learning paths based on your goals",
      },
      {
        icon: BookOpen,
        title: "Curated Resources",
        description: "Access handpicked tutorials and guides",
      },
      {
        icon: TrendingUp,
        title: "Track Progress",
        description: "Monitor your learning journey and achievements",
      },
    ],
    redirectPath: "/",
    termsHref: "/terms-and-conditions",
    privacyHref: "/privacy",
  },
  platform: {
    title: "Welcome Back!",
    subtitle: "Sign in to continue your tech learning journey",
    rightSectionTitle: "Why TBE?",
    features: [
      {
        icon: Map,
        title: "Personalized Roadmaps",
        description: "Get customized learning paths based on your goals",
      },
      {
        icon: BookOpen,
        title: "Curated Resources",
        description: "Access handpicked tutorials and guides",
      },
      {
        icon: TrendingUp,
        title: "Track Progress",
        description: "Monitor your learning journey and achievements",
      },
    ],
    redirectPath: "/",
    termsHref: "/terms-and-conditions",
    privacyHref: "/privacy",
  },
  prepyatra: {
    title: "Welcome Back!",
    subtitle: "Sign in to continue your interview preparation journey",
    rightSectionTitle: "Why PrepYatra?",
    features: [
      {
        icon: Briefcase,
        title: "Track Applications",
        description: "Manage all your job applications in one place",
      },
      {
        icon: Target,
        title: "Interview Prep",
        description: "Prepare for interviews with curated resources",
      },
      {
        icon: TrendingUp,
        title: "Progress Tracking",
        description: "Monitor your interview preparation progress",
      },
    ],
    redirectPath: "/dashboard",
    termsHref: "/terms-and-conditions",
    privacyHref: "/privacy",
  },
  quizes: {
    title: "Welcome Back!",
    subtitle: "Sign in to continue your quiz journey",
    rightSectionTitle: "Why TBE Quizes?",
    features: [
      {
        icon: Brain,
        title: "Smart Learning",
        description: "AI-powered questions tailored to your skill level",
      },
      {
        icon: Trophy,
        title: "Track Progress",
        description: "Monitor your improvement with detailed analytics",
      },
      {
        icon: Users,
        title: "Compete",
        description: "Challenge yourself on the global leaderboard",
      },
      {
        icon: Sparkles,
        title: "Expert Content",
        description: "Curated by industry professionals",
      },
    ],
    redirectPath: "/dashboard",
    termsHref: "/terms-and-conditions",
    privacyHref: "/privacy",
  },
  "resume-yatra": {
    title: "Welcome to Resume Yatra",
    subtitle: "Sign in to save your progress and build your perfect resume",
    rightSectionTitle: "Why Resume Yatra?",
    features: [
      {
        icon: FileText,
        title: "Build Resumes",
        description: "Create professional resumes with ease",
      },
      {
        icon: Award,
        title: "Track Score",
        description: "Get your resume score and improve it",
      },
      {
        icon: TrendingUp,
        title: "Save Progress",
        description: "Auto-save your work and access from anywhere",
      },
    ],
    redirectPath: "/builder",
    termsHref: "/terms-and-conditions",
    privacyHref: "/privacy",
  },
  oncampus: {
    title: "Welcome to OnCampus",
    subtitle: "Sign in to continue your oncampus learning journey",
    rightSectionTitle: "Why OnCampus?",
    features: [
      {
        icon: Map,
        title: "Personalized Roadmaps",
        description: "Get customized learning paths based on your goals",
      },
      {
        icon: BookOpen,
        title: "Curated Resources",
        description: "Access handpicked tutorials and guides",
      },
    ],
    redirectPath: "/dashboard",
    termsHref: "/",
    privacyHref: "/",
  },
  dsayatra: {
    title: "Welcome to DSA Yatra",
    subtitle: "Sign in to master Data Structures & Algorithms",
    rightSectionTitle: "Why DSA Yatra?",
    features: [
      {
        icon: TrendingUp,
        title: "Structured Path",
        description: "Follow a curated roadmap for DSA mastery",
      },
      {
        icon: Brain,
        title: "Practice Problems",
        description: "Solve hand-picked problems with detailed solutions",
      },
      {
        icon: Target,
        title: "Track Progress",
        description: "Monitor your consistency and improvement",
      },
    ],
    redirectPath: "/dashboard",
    termsHref: "/terms-and-conditions",
    privacyHref: "/privacy",
  },
});

export {
  CONFETTI_COLORS,
  getNavbarVariantConfig,
  links,
  productLinks,
  socialLinks,
};
