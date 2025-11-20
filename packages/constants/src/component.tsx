import React from "react";
import type { ComponentType } from 'react';


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


interface VariantConfig {
  branding: React.ReactNode;
  dashboardRoute: string;
  borderClass?: string;
  requiresAuth?: boolean; 
  showGamification?: boolean;
}

 const getNavbarVariantConfig = (
    Logo: ComponentType<any>
): Record<string, VariantConfig> => ({
    default: {
        branding: <Logo />,
        dashboardRoute: '/user/dashboard',
        borderClass: 'border',
        requiresAuth: true,
    },
    transparent: {
        branding: <Logo />,
        dashboardRoute: '/user/dashboard',
        borderClass: 'border',
        requiresAuth: true,
    },
    prepyatra: {
        branding: (
            <div className='flex flex-col gap-0'>
                <span className='text-2xl font-bold text-primary leading-tight'>
                    PrepYatra
                </span>
                <span className='text-[10px] text-greyDark -mt-0.5'>
                    By The Boring Education
                </span>
            </div>
        ),
        dashboardRoute: '/dashboard',
        borderClass: 'border-b border-greyLight',
        requiresAuth: true,
    },
    quizes: {
        branding: (
            <div className='flex flex-col gap-0'>
                <span className='text-2xl font-bold text-primary leading-tight'>
                    The Boring Quizes
                </span>
                <span className='text-[10px] text-greyDark -mt-0.5'>
                    By The Boring Education
                </span>
            </div>
        ),
        dashboardRoute: '/dashboard',
        borderClass: 'border',
        requiresAuth: true,
    },
    techyatra: {
        branding: (
            <div className='flex flex-col gap-0'>
                <span className='text-2xl font-bold text-primary leading-tight'>
                    TechYatra
                </span>
                <span className='text-[10px] text-greyDark -mt-0.5'>
                    By The Boring Education
                </span>
            </div>
        ),
        dashboardRoute: '/',
        borderClass: 'border',
        requiresAuth: false, // Non-auth app
    },
    dsayatra: {
        branding: (
            <div className='flex flex-col gap-0'>
                <span className='text-2xl font-bold text-primary leading-tight'>
                    DSAYatra
                </span>
                <span className='text-[10px] text-greyDark -mt-0.5'>
                    By The Boring Education
                </span>
            </div>
        ),
        dashboardRoute: '/',
        borderClass: 'border',
        requiresAuth: false, // Non-auth app
    },
    'resume-yatra': {
        branding: (
            <div className='flex flex-col gap-0'>
                <span className='text-2xl font-bold text-primary leading-tight'>
                    ResumeYatra
                </span>
                <span className='text-[10px] text-greyDark -mt-0.5'>
                    By The Boring Education
                </span>
            </div>
        ),
        dashboardRoute: '/builder',
        borderClass: 'border',
        requiresAuth: true,
        showGamification: false, 
    },
});
export { socialLinks, productLinks, CONFETTI_COLORS, links, getNavbarVariantConfig };
