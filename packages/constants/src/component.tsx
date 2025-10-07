import React from "react";

interface NavbarDropdownLink {
  id: string;
  name: string;
  href: string;
  description: string;
  target?: '_blank';
  isDevelopment?: boolean;
}

const socialLinks = [
    {
        name: "Instagram",
        href: "https://www.instagram.com/theboringeducation",
        icon: "instagram"
    },
    {
        name: "GitHub",
        href: "https://github.com/The-Boring-Education",
        icon: "github"
    },
    {
        name: "YouTube",
        href: "https://www.youtube.com/@TheBoringEducation",
        icon: "youtube"
    }
];

const productLinks = [
    {
        name: "The Boring Education",
        href: "https://www.theboringeducation.com/"
    }
];

const CONFETTI_COLORS = [
    "#facc15", // yellow-400
    "#38bdf8", // sky-400
    "#4ade80", // green-400
    "#f472b6", // pink-400
    "#fff", // white
    "#f59e42", // custom orange
    "#818cf8" // indigo-400
];

const links: NavbarDropdownLink[] = [
    {
        id: "explore-courses",
        name: "Explore Courses",
        href: "https://www.theboringeducation.com/shiksha",
        description: "Learn Tech with Courses"
    },
    {
        id: "tech-yatra",
        name: "Tech Yatra",
        href: "https://techyatra.netlify.app/",
        description: "Start Tech Journey"
    },
    {
        id: "resume-yatra",
        name: "Resume Yatra",
        href: "https://resumeyatra.netlify.app/",
        description: "Fix Your Resume"
    },
    {
        id: "dsa-yatra",
        name: "DSA Yatra",
        href: "https://dsa-yatra.lovable.app",
        description: "Start DSA Journey"
    }
];

export {socialLinks, productLinks, CONFETTI_COLORS, links};
