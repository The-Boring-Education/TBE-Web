import { useAuth } from "@tbe/auth";
import { routes } from "@tbe/constants";
import { useGamification } from "@tbe/gamification";
import { quizApi } from "@tbe/services";
import { sendRequest } from "@tbe/utils";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useMemo, useState } from "react";
import {
  FiArrowRight,
  FiArrowUpRight,
  FiBarChart2,
  FiBookOpen,
  FiCheckCircle,
  FiChevronsLeft,
  FiChevronsRight,
  FiCode,
  FiCompass,
  FiExternalLink,
  FiFileText,
  FiGrid,
  FiHelpCircle,
  FiLayers,
  FiLogOut,
  FiMoon,
  FiPlayCircle,
  FiSearch,
  FiSun,
  FiTarget,
  FiUser,
  FiZap,
} from "react-icons/fi";

import { CourseLearningSpace, prefetchCourseData } from "./CourseLearningSpace";
import type { PersonalizationQuizData } from "./PersonalizationQuiz";
import { PersonalizationQuiz } from "./PersonalizationQuiz";
import { prefetchQuizData, QuizCatalogSpace } from "./QuizCatalogSpace";
import { QuizPlaySpace } from "./QuizPlaySpace";
import { prefetchSheetData, SheetLearningSpace } from "./SheetLearningSpace";

export interface LearnDashboardContainerProps {
  user: any;
  initialPersonalization?: any;
}

const TBE_ECOSYSTEM_APPS = [
  {
    name: "DSAYatra",
    badge: "DSA & PATTERNS",
    badgeStyle: "bg-orange-50 text-orange-700 border-orange-200/80",
    desc: "Master Data Structures & Algorithms with curated sheets, pattern quizzes & interview problems.",
    url: "https://dsayatra.theboringeducation.com",
    isExternal: true,
    image: "/images/dsayatra.png",
    fallback: "/images/dsayatra.png",
    bentoSpan: "md:col-span-6 md:row-span-2",
    shapeType: "hero-square",
  },
  {
    name: "Oncampus",
    badge: "APTITUDE & MOCKS",
    badgeStyle: "bg-purple-50 text-purple-700 border-purple-200/80",
    desc: "Comprehensive company placement prep, mock tests & technical interview questions.",
    url: "https://oncampus.theboringeducation.com",
    isExternal: true,
    image: "/images/oncampus.png",
    fallback: "/images/oncampus.png",
    bentoSpan: "md:col-span-6 md:row-span-2",
    shapeType: "hero-purple",
  },
  {
    name: "PrepYatra",
    badge: "INTERVIEW PREP",
    badgeStyle: "bg-blue-50 text-blue-700 border-blue-200/80",
    desc: "Track recruiter contacts, interview logs, resources & personalized goal roadmaps.",
    url: "https://prepyatra.theboringeducation.com",
    isExternal: true,
    image: "/images/prepyatra.png",
    fallback: "/images/target.png",
    bentoSpan: "md:col-span-6 md:row-span-1",
    shapeType: "wide-blue",
  },
  {
    name: "ResumeYatra",
    badge: "AI RESUME BUILDER",
    badgeStyle: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    desc: "Build ATS-optimized tech resumes & portfolios that stand out to top recruiters.",
    url: "https://resumeyatra.theboringeducation.com",
    isExternal: true,
    image: "/images/resumeyatra.png",
    fallback: "/images/note.png",
    bentoSpan: "md:col-span-6 md:row-span-1",
    shapeType: "wide-emerald",
  },
  {
    name: "Quizes App",
    badge: "DAILY BATTLES",
    badgeStyle: "bg-red-50 text-red-700 border-red-200/80",
    desc: "Test your coding knowledge with gamified quick quizzes and real-time leaderboards.",
    url: "/quizzes",
    isExternal: false,
    image: "/images/quiz.png",
    fallback: "/images/bulb.png",
    bentoSpan: "md:col-span-4 md:row-span-1",
    shapeType: "circular-ring",
  },
  {
    name: "TechYatra",
    badge: "CAREER ROADMAPS",
    badgeStyle: "bg-amber-50 text-amber-700 border-amber-200/80",
    desc: "Step-by-step developer career paths from beginner to production-ready engineer.",
    url: "https://techyatra.theboringeducation.com",
    isExternal: true,
    image: "/images/techyatra.png",
    fallback: "/images/laptop.png",
    bentoSpan: "md:col-span-4 md:row-span-1",
    shapeType: "hexagon-accent",
  },
  {
    name: "Resources",
    badge: "DEV RESOURCES",
    badgeStyle: "bg-indigo-50 text-indigo-700 border-indigo-200/80",
    desc: "Free developer resources, cheat sheets, interview guides & open-source tools.",
    url: "https://resources.theboringeducation.com",
    isExternal: true,
    image: "/images/resources.png",
    fallback: "/images/coding_bg.png",
    bentoSpan: "md:col-span-4 md:row-span-1",
    shapeType: "full-banner",
  },
];

export interface RecommendedItem {
  id: string;
  type: "sheet" | "core-subject" | "resource" | "course";
  title: string;
  desc: string;
  slug?: string;
  url: string;
  isExternal?: boolean;
  category: string;
  categoryStyle?: string;
  logoKey?: string;
  iconType?: "code" | "book" | "layer" | "file";
}

const SHIKSHA_COURSES = [
  {
    id: "course-logic",
    type: "course" as const,
    title: "Logic Building for Everyone",
    desc: "Build programming logic from scratch — no prior experience needed. Perfect for absolute beginners.",
    slug: "logic-building-for-everyone",
    url: "/shiksha/logic-building-for-everyone",
    category: "SHIKSHA COURSE",
    categoryStyle: "bg-[#FF3B30] text-white",
    logoKey: "logic",
  },
  {
    id: "course-js",
    type: "course" as const,
    title: "Basics of Programming with JS",
    desc: "Learn JavaScript fundamentals: variables, loops, functions, DOM manipulation and mini-projects.",
    slug: "basics-of-programming-with-js",
    url: "/shiksha/basics-of-programming-with-js",
    category: "SHIKSHA COURSE",
    categoryStyle: "bg-[#FF3B30] text-white",
    logoKey: "javascript",
  },
  {
    id: "course-frontend",
    type: "course" as const,
    title: "Zero to One Frontend Development",
    desc: "Master HTML, CSS, JavaScript, React and build production-ready frontend projects end to end.",
    slug: "zero-to-one-frontend-development",
    url: "/shiksha/zero-to-one-frontend-development",
    category: "SHIKSHA COURSE",
    categoryStyle: "bg-[#FF3B30] text-white",
    logoKey: "react",
  },
  {
    id: "course-backend",
    type: "course" as const,
    title: "Zero to One Backend Development",
    desc: "Learn Node.js, Express, MongoDB, REST APIs, authentication and deploy full-stack applications.",
    slug: "zero-to-one-backend-development",
    url: "/shiksha/zero-to-one-backend-development",
    category: "SHIKSHA COURSE",
    categoryStyle: "bg-[#FF3B30] text-white",
    logoKey: "nodejs",
  },
];

const RECOMMENDED_DISCOVERY_ITEMS: RecommendedItem[] = [
  // Alternated: Sheet → Core → Resource → Course (no two same types side by side)

  // 1
  {
    id: "java-sheet",
    type: "sheet",
    title: "Java Interview Questions",
    desc: "Top core Java, OOPs, Collections, Multi-threading & JVM interview questions.",
    slug: "java-interview-questions",
    url: "/interview-prep/java-interview-questions",
    category: "INTERVIEW SHEET",
    logoKey: "java",
  },
  // 2 — Course
  ...SHIKSHA_COURSES.slice(0, 1),
  // 3
  {
    id: "os-core",
    type: "core-subject",
    title: "Operating Systems Vault",
    desc: "Process synchronization, deadlocks, memory management, paging & CPU scheduling.",
    url: "https://oncampus.theboringeducation.com/coresubjects/operating-systems",
    isExternal: true,
    category: "CORE CS",
    categoryStyle: "bg-blue-50 text-blue-700 border-blue-200",
  },
  // 3
  {
    id: "res-agentic-ai",
    type: "resource",
    title: "Agentic AI Engineer Roadmap 2026",
    desc: "LLMs, AI agents, RAG systems, workflows, tool calling, memory & multi-agent architectures.",
    url: "https://resources.theboringeducation.com/resources/agentic-ai-engineer-roadmap",
    isExternal: true,
    category: "AI ROADMAP",
    categoryStyle: "bg-purple-50 text-purple-700 border-purple-200",
    iconType: "code",
  },
  // 4
  {
    id: "javascript-sheet",
    type: "sheet",
    title: "JavaScript Interview Questions",
    desc: "Closures, Event Loop, Promises, Prototypes, async/await and ES6+ fundamentals.",
    slug: "javascript-interview-questions",
    url: "/interview-prep/javascript-interview-questions",
    category: "INTERVIEW SHEET",
    logoKey: "javascript",
  },
  // 5
  {
    id: "dbms-core",
    type: "core-subject",
    title: "DBMS & SQL Architecture",
    desc: "ACID properties, indexing, B-Trees, normalization, transactions & query optimization.",
    url: "https://oncampus.theboringeducation.com/coresubjects/dbms",
    isExternal: true,
    category: "CORE CS",
    categoryStyle: "bg-blue-50 text-blue-700 border-blue-200",
  },
  // 6
  {
    id: "res-placement",
    type: "resource",
    title: "Placement Preparation Roadmap 2026",
    desc: "Phase-by-phase plan covering DSA, projects, core CS subjects, resume & interview rounds.",
    url: "https://resources.theboringeducation.com/resources/placement-preparation-roadmap",
    isExternal: true,
    category: "CAREER ROADMAP",
    categoryStyle: "bg-rose-50 text-rose-700 border-rose-200",
    iconType: "book",
  },
  // 7
  {
    id: "react-sheet",
    type: "sheet",
    title: "React.js Interview Questions",
    desc: "Hooks, Virtual DOM, state management, reconciliation & Next.js SSR concepts.",
    slug: "react-interview-questions",
    url: "/interview-prep/react-interview-questions",
    category: "FRONTEND SHEET",
    logoKey: "react",
  },
  // 8 — Course
  ...SHIKSHA_COURSES.slice(1, 2),
  // 9
  {
    id: "cn-core",
    type: "core-subject",
    title: "Computer Networks & Protocols",
    desc: "OSI Model, TCP/IP handshake, HTTP/HTTPS, DNS resolution, sockets & subnetting.",
    url: "https://oncampus.theboringeducation.com/coresubjects/computer-networks",
    isExternal: true,
    category: "CORE CS",
    categoryStyle: "bg-blue-50 text-blue-700 border-blue-200",
  },
  // 9
  {
    id: "res-dsa-escape",
    type: "resource",
    title: "DSA Escape Plan 2026",
    desc: "Structured 90-day plan, daily problem-solving strategy & pattern recognition techniques.",
    url: "https://resources.theboringeducation.com/resources/dsa-escape-plan-2026",
    isExternal: true,
    category: "DSA GUIDE",
    categoryStyle: "bg-amber-50 text-amber-800 border-amber-200",
    iconType: "code",
  },
  // 10
  {
    id: "node-sheet",
    type: "sheet",
    title: "Node.js Interview Questions",
    desc: "Event loop, libuv, streams, Express middleware, authentication & microservices.",
    slug: "node-js-express-interview-questions",
    url: "/interview-prep/node-js-express-interview-questions",
    category: "BACKEND SHEET",
    logoKey: "nodejs",
  },
  // 11 — Course
  ...SHIKSHA_COURSES.slice(2, 3),
  // 12
  {
    id: "oops-core",
    type: "core-subject",
    title: "OOPs & Design Patterns",
    desc: "Encapsulation, Polymorphism, SOLID principles, Factory, Singleton & Observer.",
    url: "https://oncampus.theboringeducation.com/coresubjects/oops",
    isExternal: true,
    category: "CORE CS",
    categoryStyle: "bg-blue-50 text-blue-700 border-blue-200",
  },
  // 12
  {
    id: "res-backend",
    type: "resource",
    title: "Backend Engineer Roadmap 2026",
    desc: "Languages, databases, APIs, system design, authentication and DevOps automation.",
    url: "https://resources.theboringeducation.com/resources/backend-engineer-roadmap",
    isExternal: true,
    category: "BACKEND ROADMAP",
    categoryStyle: "bg-emerald-50 text-emerald-700 border-emerald-200",
    iconType: "code",
  },
  // 13
  {
    id: "db-sheet",
    type: "sheet",
    title: "Database Interview Questions",
    desc: "Relational vs NoSQL, joins, indexes, normalization, schema design & query tuning.",
    slug: "database-interview-questions",
    url: "/interview-prep/database-interview-questions",
    category: "DATABASE SHEET",
    logoKey: "postgresql",
  },
  // 14 — Course
  ...SHIKSHA_COURSES.slice(3, 4),
  // 15
  {
    id: "res-frontend",
    type: "resource",
    title: "Frontend Developer Roadmap 2026",
    desc: "HTML, CSS, JavaScript, React, Next.js, responsive layouts & modern CSS frameworks.",
    url: "https://resources.theboringeducation.com/resources/frontend-engineer-roadmap",
    isExternal: true,
    category: "FRONTEND ROADMAP",
    categoryStyle: "bg-cyan-50 text-cyan-800 border-cyan-200",
    iconType: "code",
  },
  // 15
  {
    id: "python-sheet",
    type: "sheet",
    title: "Python Interview Questions",
    desc: "Memory management, decorators, generators, GIL, data structures & OOP in Python.",
    slug: "python-interview-questions",
    url: "/interview-prep/python-interview-questions",
    category: "INTERVIEW SHEET",
    logoKey: "python",
  },
  // 16
  {
    id: "res-aiml",
    type: "resource",
    title: "AI/ML Engineer Roadmap 2026",
    desc: "Mathematics, machine learning algorithms, deep learning, model deployment & applications.",
    url: "https://resources.theboringeducation.com/resources/aiml-engineer-roadmap",
    isExternal: true,
    category: "AI/ML ROADMAP",
    categoryStyle: "bg-purple-50 text-purple-700 border-purple-200",
    iconType: "code",
  },
  // 17
  {
    id: "res-genai",
    type: "resource",
    title: "Generative AI Engineer Roadmap 2026",
    desc: "Prompt engineering, fine-tuning, vector databases, and building real-world GenAI apps.",
    url: "https://resources.theboringeducation.com/resources/genai-engineer-roadmap",
    isExternal: true,
    category: "GENAI ROADMAP",
    categoryStyle: "bg-indigo-50 text-indigo-700 border-indigo-200",
    iconType: "code",
  },
  // 18
  {
    id: "res-devops",
    type: "resource",
    title: "DevOps Engineer Roadmap 2026",
    desc: "Linux, CI/CD, cloud platforms, Docker, Kubernetes, infrastructure as code & monitoring.",
    url: "https://resources.theboringeducation.com/resources/devops-engineer-roadmap",
    isExternal: true,
    category: "DEVOPS ROADMAP",
    categoryStyle: "bg-orange-50 text-orange-700 border-orange-200",
    iconType: "code",
  },
  // 19
  {
    id: "res-cloud",
    type: "resource",
    title: "Cloud Engineer Roadmap 2026",
    desc: "Cloud computing fundamentals, AWS, Azure, Google Cloud, networking & security.",
    url: "https://resources.theboringeducation.com/resources/cloud-engineer-roadmap",
    isExternal: true,
    category: "CLOUD ROADMAP",
    categoryStyle: "bg-blue-50 text-blue-700 border-blue-200",
    iconType: "layer",
  },
  // 20
  {
    id: "res-git",
    type: "resource",
    title: "Git & GitHub Contributor's Playbook",
    desc: "Every essential Git command explained and practical guide to getting open source PRs merged.",
    url: "https://resources.theboringeducation.com/resources/git-github-contributor-playbook",
    isExternal: true,
    category: "GIT PLAYBOOK",
    categoryStyle: "bg-slate-100 text-slate-800 border-slate-200",
    iconType: "code",
  },
  // 21
  {
    id: "res-cold-email",
    type: "resource",
    title: "Cold Mail Masterclass 2026",
    desc: "Subject lines, body formulas, and follow-up tricks that hiring managers actually respond to.",
    url: "https://resources.theboringeducation.com/resources/cold-email-guide",
    isExternal: true,
    category: "JOB GUIDE",
    categoryStyle: "bg-teal-50 text-teal-800 border-teal-200",
    iconType: "file",
  },
  // 22
  {
    id: "res-freelance",
    type: "resource",
    title: "Freelance Developer Guide 2026",
    desc: "Client acquisition, personal branding, portfolio building, pricing, contracts & scaling.",
    url: "https://resources.theboringeducation.com/resources/freelance-developer-guide",
    isExternal: true,
    category: "FREELANCE GUIDE",
    categoryStyle: "bg-emerald-50 text-emerald-700 border-emerald-200",
    iconType: "book",
  },
  // 23
  {
    id: "res-cybersecurity",
    type: "resource",
    title: "Cyber Security Engineer Roadmap 2026",
    desc: "Networking, Linux, ethical hacking, security tools, cloud security & incident response.",
    url: "https://resources.theboringeducation.com/resources/cyber-security-engineer-roadmap",
    isExternal: true,
    category: "SECURITY ROADMAP",
    categoryStyle: "bg-red-50 text-red-700 border-red-200",
    iconType: "file",
  },
  // 24
  {
    id: "res-mobile",
    type: "resource",
    title: "Mobile App Developer Roadmap 2026",
    desc: "Android, iOS, Flutter, React Native, architecture, APIs, and performance optimization.",
    url: "https://resources.theboringeducation.com/resources/mobile-app-developer-roadmap",
    isExternal: true,
    category: "MOBILE ROADMAP",
    categoryStyle: "bg-violet-50 text-violet-700 border-violet-200",
    iconType: "code",
  },
  // 25
  {
    id: "res-blockchain",
    type: "resource",
    title: "Blockchain Engineer Roadmap 2026",
    desc: "Web3, Ethereum, Smart Contracts, Solidity, DeFi protocols and DApps development.",
    url: "https://resources.theboringeducation.com/resources/blockchain-engineer-roadmap",
    isExternal: true,
    category: "WEB3 ROADMAP",
    categoryStyle: "bg-indigo-50 text-indigo-700 border-indigo-200",
    iconType: "code",
  },
  // 26
  {
    id: "res-hr",
    type: "resource",
    title: "30 HR Interview Questions Answered",
    desc: "Exact questions HR and hiring managers ask in real interviews and answer frameworks.",
    url: "https://resources.theboringeducation.com/resources/hr-interview-questions",
    isExternal: true,
    category: "HR INTERVIEW",
    categoryStyle: "bg-amber-50 text-amber-800 border-amber-200",
    iconType: "file",
  },
  // 27
  {
    id: "res-ethical-hacking",
    type: "resource",
    title: "Ethical Hacking Roadmap 2026",
    desc: "Networking fundamentals to penetration testing and bug bounty — skill order security teams and CTF players actually build in.",
    url: "https://resources.theboringeducation.com/resources/ethical-hacking-roadmap",
    isExternal: true,
    category: "SECURITY ROADMAP",
    categoryStyle: "bg-red-50 text-red-700 border-red-200",
    iconType: "file",
  },
  // 28
  {
    id: "res-system-design",
    type: "resource",
    title: "System Design Engineer Roadmap 2026",
    desc: "Scalability, databases, caching, distributed systems, HLD and LLD — from URL basics to billion-request architectures.",
    url: "https://resources.theboringeducation.com/resources/system-design-roadmap",
    isExternal: true,
    category: "SYSTEM DESIGN",
    categoryStyle: "bg-sky-50 text-sky-800 border-sky-200",
    iconType: "layer",
  },
];

const LANGUAGE_LOGOS: Record<string, string> = {
  logic:
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='none' stroke='%23FF3B30' stroke-width='8' stroke-linecap='round' stroke-linejoin='round'><path d='M20 25 H80 M35 25 L65 50 L35 75 M20 75 H80'/></svg>",
  javascript:
    "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg",
  js: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg",
  typescript:
    "https://raw.githubusercontent.com/devicons/devicon/master/icons/typescript/typescript-original.svg",
  python:
    "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
  java: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg",
  react:
    "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
  nodejs:
    "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg",
  node: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg",
  express:
    "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg",
  backend:
    "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg",
  frontend:
    "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
  cplusplus:
    "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg",
  cpp: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg",
  c: "https://raw.githubusercontent.com/devicons/devicon/master/icons/c/c-original.svg",
  go: "https://raw.githubusercontent.com/devicons/devicon/master/icons/go/go-original.svg",
  golang:
    "https://raw.githubusercontent.com/devicons/devicon/master/icons/go/go-original.svg",
  postgresql:
    "https://raw.githubusercontent.com/devicons/devicon/master/icons/postgresql/postgresql-original.svg",
  postgres:
    "https://raw.githubusercontent.com/devicons/devicon/master/icons/postgresql/postgresql-original.svg",
  sql: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg",
  mysql:
    "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg",
  dbms: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg",
  db: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg",
  database:
    "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg",
  mongodb:
    "https://raw.githubusercontent.com/devicons/devicon/master/icons/mongodb/mongodb-original.svg",
  dsa: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg",
  html: "https://raw.githubusercontent.com/devicons/devicon/master/icons/html5/html5-original.svg",
  css: "https://raw.githubusercontent.com/devicons/devicon/master/icons/css3/css3-original.svg",
};

const getSheetLogo = (sheet: any) => {
  const title = (sheet?.title || sheet?.name || "").toLowerCase();
  const slug = (sheet?.slug || "").toLowerCase();

  if (sheet?.logoKey && LANGUAGE_LOGOS[sheet.logoKey]) {
    return LANGUAGE_LOGOS[sheet.logoKey];
  }

  // 1. Check specific frameworks / environments first to prevent false 'js' matches
  if (
    slug.includes("node") ||
    title.includes("node") ||
    slug.includes("backend") ||
    title.includes("backend")
  ) {
    return LANGUAGE_LOGOS["nodejs"];
  }
  if (
    slug.includes("react") ||
    title.includes("react") ||
    slug.includes("frontend") ||
    title.includes("frontend")
  ) {
    return LANGUAGE_LOGOS["react"];
  }
  if (slug.includes("next") || title.includes("next")) {
    return (
      LANGUAGE_LOGOS["nextjs"] ||
      "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nextjs/nextjs-original.svg"
    );
  }
  if (slug.includes("logic") || title.includes("logic")) {
    return LANGUAGE_LOGOS["logic"];
  }

  // 2. Pure JavaScript matches (excludes nodejs, reactjs, etc.)
  if (
    slug.includes("javascript") ||
    title.includes("javascript") ||
    slug === "js" ||
    slug.startsWith("js-") ||
    slug.endsWith("-js") ||
    /\bjs\b/.test(title) ||
    title.includes("with js")
  ) {
    return LANGUAGE_LOGOS["javascript"];
  }

  const orderedKeys = [
    "typescript",
    "postgresql",
    "postgres",
    "nodejs",
    "cplusplus",
    "mongodb",
    "database",
    "golang",
    "python",
    "react",
    "mysql",
    "dbms",
    "html",
    "java",
    "node",
    "sql",
    "cpp",
    "dsa",
    "css",
    "db",
    "go",
    "c",
    "javascript",
  ];

  for (const key of orderedKeys) {
    if (slug.includes(key) || title.includes(key)) {
      return LANGUAGE_LOGOS[key];
    }
  }

  return sheet?.coverImageURL || sheet?.thumbnail || sheet?.image || null;
};

const CARD_THEMES = [
  {
    name: "blue",
    badgeBg: "bg-blue-50 text-blue-700 border-blue-200",
    hoverBorder: "hover:border-blue-300",
    accentText: "group-hover:text-blue-600",
    linkColor: "text-blue-600",
    btnStyle: "text-blue-700 hover:bg-blue-50",
    progressBar: "bg-blue-600",
    logoBg: "bg-blue-50/60 text-blue-600 border-blue-100",
  },
  {
    name: "emerald",
    badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
    hoverBorder: "hover:border-emerald-300",
    accentText: "group-hover:text-emerald-600",
    linkColor: "text-emerald-600",
    btnStyle: "text-emerald-700 hover:bg-emerald-50",
    progressBar: "bg-emerald-600",
    logoBg: "bg-emerald-50/60 text-emerald-600 border-emerald-100",
  },
  {
    name: "purple",
    badgeBg: "bg-purple-50 text-purple-700 border-purple-200",
    hoverBorder: "hover:border-purple-300",
    accentText: "group-hover:text-purple-600",
    linkColor: "text-purple-600",
    btnStyle: "text-purple-700 hover:bg-purple-50",
    progressBar: "bg-purple-600",
    logoBg: "bg-purple-50/60 text-purple-600 border-purple-100",
  },
  {
    name: "amber",
    badgeBg: "bg-amber-50 text-amber-800 border-amber-200",
    hoverBorder: "hover:border-amber-300",
    accentText: "group-hover:text-amber-600",
    linkColor: "text-amber-700",
    btnStyle: "text-amber-800 hover:bg-amber-50",
    progressBar: "bg-amber-500",
    logoBg: "bg-amber-50/60 text-amber-700 border-amber-100",
  },
  {
    name: "rose",
    badgeBg: "bg-rose-50 text-rose-700 border-rose-200",
    hoverBorder: "hover:border-rose-300",
    accentText: "group-hover:text-rose-600",
    linkColor: "text-rose-600",
    btnStyle: "text-rose-700 hover:bg-rose-50",
    progressBar: "bg-rose-500",
    logoBg: "bg-rose-50/60 text-rose-600 border-rose-100",
  },
  {
    name: "indigo",
    badgeBg: "bg-indigo-50 text-indigo-700 border-indigo-200",
    hoverBorder: "hover:border-indigo-300",
    accentText: "group-hover:text-indigo-600",
    linkColor: "text-indigo-600",
    btnStyle: "text-indigo-700 hover:bg-indigo-50",
    progressBar: "bg-indigo-600",
    logoBg: "bg-indigo-50/60 text-indigo-600 border-indigo-100",
  },
  {
    name: "cyan",
    badgeBg: "bg-cyan-50 text-cyan-800 border-cyan-200",
    hoverBorder: "hover:border-cyan-300",
    accentText: "group-hover:text-cyan-700",
    linkColor: "text-cyan-700",
    btnStyle: "text-cyan-800 hover:bg-cyan-50",
    progressBar: "bg-cyan-600",
    logoBg: "bg-cyan-50/60 text-cyan-700 border-cyan-100",
  },
  {
    name: "orange",
    badgeBg: "bg-orange-50 text-orange-700 border-orange-200",
    hoverBorder: "hover:border-orange-300",
    accentText: "group-hover:text-orange-600",
    linkColor: "text-orange-600",
    btnStyle: "text-orange-700 hover:bg-orange-50",
    progressBar: "bg-orange-500",
    logoBg: "bg-orange-50/60 text-orange-600 border-orange-100",
  },
  {
    name: "teal",
    badgeBg: "bg-teal-50 text-teal-800 border-teal-200",
    hoverBorder: "hover:border-teal-300",
    accentText: "group-hover:text-teal-700",
    linkColor: "text-teal-700",
    btnStyle: "text-teal-800 hover:bg-teal-50",
    progressBar: "bg-teal-600",
    logoBg: "bg-teal-50/60 text-teal-700 border-teal-100",
  },
  {
    name: "violet",
    badgeBg: "bg-violet-50 text-violet-700 border-violet-200",
    hoverBorder: "hover:border-violet-300",
    accentText: "group-hover:text-violet-600",
    linkColor: "text-violet-600",
    btnStyle: "text-violet-700 hover:bg-violet-50",
    progressBar: "bg-violet-600",
    logoBg: "bg-violet-50/60 text-violet-600 border-violet-100",
  },
];

export const LearnDashboardContainer: React.FC<
  LearnDashboardContainerProps
> = ({ user, initialPersonalization }) => {
  const router = useRouter();
  const { user: authUser, signOut } = useAuth();
  const effectiveUser = user || authUser;
  const userId = effectiveUser?.id || effectiveUser?._id;
  const { points: gamificationPoints } = useGamification(userId);
  const userPoints =
    effectiveUser?.points ??
    effectiveUser?.gamificationPoints ??
    gamificationPoints ??
    0;

  const displayName =
    effectiveUser?.name || effectiveUser?.userName || "Learner";
  const displayEmail = effectiveUser?.email || "";
  const avatarUrl = effectiveUser?.image || effectiveUser?.picture;
  const avatarInitial = (displayName.charAt(0) || "U").toUpperCase();

  const [activeTab, setActiveTab] = useState<
    | "dashboard"
    | "explore"
    | "ecosystem"
    | "mylearning"
    | "shiksha"
    | "interview-prep"
    | "quizzes"
  >("dashboard");
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  useEffect(() => {
    try {
      const storedTheme =
        localStorage.getItem("tbe-theme") || localStorage.getItem("theme");
      // Keep light mode by default all the way unless explicitly saved as "dark" in localStorage
      const isDark = storedTheme === "dark";
      setIsDarkMode(isDark);
      if (typeof document !== "undefined") {
        if (isDark) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
    } catch {
      // Ignore if localStorage unavailable
    }
  }, []);

  const handleToggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      try {
        if (typeof document !== "undefined") {
          if (next) {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }
        }
        if (typeof window !== "undefined") {
          localStorage.setItem("tbe-theme", next ? "dark" : "light");
          localStorage.setItem("theme", next ? "dark" : "light");
        }
      } catch {
        // Ignore
      }
      return next;
    });
  };

  const [activeLearningItem, setActiveLearningItem] = useState<{
    type: "course" | "sheet";
    slug: string;
    title: string;
    currentItemName?: string;
  } | null>(null);

  const [quizCategories, setQuizCategories] = useState<any[]>([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState<boolean>(false);
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);
  const [activeQuizName, setActiveQuizName] = useState<string>("");

  const [coursesList, setCoursesList] = useState<any[]>([]);
  const [sheetsList, setSheetsList] = useState<any[]>([]);
  const [loadingCatalogData, setLoadingCatalogData] = useState<boolean>(false);

  const [shikshaCategory, setShikshaCategory] = useState<string>("all");
  const [shikshaSearchQuery, setShikshaSearchQuery] = useState<string>("");

  const [sheetCategory, setSheetCategory] = useState<string>("all");
  const [sheetSearchQuery, setSheetSearchQuery] = useState<string>("");

  const [exploreCategory, setExploreCategory] = useState<
    "all" | "courses" | "sheets" | "core" | "resources"
  >("all");
  const [exploreSearchQuery, setExploreSearchQuery] = useState<string>("");
  const [personalization, setPersonalization] = useState<any>(
    initialPersonalization || null,
  );
  const [showQuiz, setShowQuiz] = useState<boolean>(false);
  const [isSavingQuiz, setIsSavingQuiz] = useState<boolean>(false);
  const [isCookingQuiz, setIsCookingQuiz] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setIsSidebarCollapsed(true);
    }
  }, []);

  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [enrolledSheets, setEnrolledSheets] = useState<any[]>([]);
  const [loadingLearning, setLoadingLearning] = useState<boolean>(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const activeSheetsWithProgress = enrolledSheets.filter(
    (sheet) =>
      (sheet.progress?.completed ?? 0) > 0 ||
      (sheet.progress?.percentage ?? 0) > 0,
  );

  // Helper navigation methods with shallow routing so URL changes without lag
  const navigateToTab = (
    tab: "dashboard" | "shiksha" | "interview-prep" | "ecosystem" | "quizzes",
  ) => {
    setActiveTab(tab);
    setActiveLearningItem(null);
    setActiveQuizId(null);
    const targetUrl = tab === "dashboard" ? "/learn" : `/learn/${tab}`;
    if (router.asPath !== targetUrl) {
      router.push(targetUrl, undefined, { shallow: true });
    }
  };

  const navigateToCourse = (slug: string, name?: string) => {
    setActiveTab("shiksha");
    setActiveLearningItem({
      type: "course",
      slug,
      title: name || "Course",
    });
    const targetUrl = `/learn/shiksha/${slug}`;
    if (router.asPath !== targetUrl) {
      router.push(targetUrl, undefined, { shallow: true });
    }
  };

  const navigateToSheet = (slug: string, title?: string) => {
    setActiveTab("interview-prep");
    setActiveLearningItem({
      type: "sheet",
      slug,
      title: title || "Interview Sheet",
    });
    const targetUrl = `/learn/interview-prep/${slug}`;
    if (router.asPath !== targetUrl) {
      router.push(targetUrl, undefined, { shallow: true });
    }
  };

  const navigateToQuiz = (quizId: string, name?: string) => {
    setActiveTab("quizzes");
    setActiveQuizId(quizId);
    setActiveQuizName(name || "Quiz");
    setActiveLearningItem(null);
    const targetUrl = `/learn/quizzes/${quizId}`;
    if (router.asPath !== targetUrl) {
      router.push(targetUrl, undefined, { shallow: true });
    }
  };

  // Sync with router URL paths: /learn, /learn/shiksha, /learn/shiksha/:slug, /learn/interview-prep/:slug, /learn/quizzes/:id, etc.
  useEffect(() => {
    if (!router?.isReady) return;

    const pathWithoutQuery = (router.asPath || "").split("?")[0] || "";
    const pathParts = pathWithoutQuery
      .replace(/^\/learn\/?/, "")
      .split("/")
      .filter(Boolean);

    const [firstSegment, secondSegment] = pathParts;

    if (firstSegment === "shiksha") {
      setActiveTab("shiksha");
      if (secondSegment) {
        const found = coursesList.find((c) => c.slug === secondSegment);
        setActiveLearningItem({
          type: "course",
          slug: secondSegment,
          title: found?.name || "Course",
        });
      } else {
        setActiveLearningItem(null);
      }
      setActiveQuizId(null);
    } else if (firstSegment === "interview-prep") {
      setActiveTab("interview-prep");
      if (secondSegment) {
        const found = sheetsList.find((s) => s.slug === secondSegment);
        setActiveLearningItem({
          type: "sheet",
          slug: secondSegment,
          title: found?.name || found?.title || "Interview Sheet",
        });
      } else {
        setActiveLearningItem(null);
      }
      setActiveQuizId(null);
    } else if (firstSegment === "quizzes") {
      setActiveTab("quizzes");
      if (secondSegment) {
        setActiveQuizId(secondSegment);
        const found = quizCategories.find((q) => q._id === secondSegment);
        if (found?.categoryName) setActiveQuizName(found.categoryName);
      } else {
        setActiveQuizId(null);
      }
      setActiveLearningItem(null);
    } else if (firstSegment === "ecosystem") {
      setActiveTab("ecosystem");
      setActiveLearningItem(null);
      setActiveQuizId(null);
    } else if (!firstSegment || firstSegment === "dashboard") {
      setActiveTab("dashboard");
      setActiveLearningItem(null);
      setActiveQuizId(null);
    }
  }, [
    router?.isReady,
    router?.asPath,
    coursesList,
    sheetsList,
    quizCategories,
  ]);

  // Fetch published courses, interview sheets, and quizzes dynamically and pre-warm cache
  const fetchAllCatalog = async () => {
    setLoadingCatalogData(true);
    setLoadingQuizzes(true);
    try {
      const [coursesRes, sheetsRes, quizzesRes] = await Promise.all([
        sendRequest({ method: "GET", url: routes.api.shiksha }),
        sendRequest({ method: "GET", url: routes.api.interviewPrep }),
        quizApi.getCategories().catch(() => null),
      ]);

      if (coursesRes?.data && Array.isArray(coursesRes.data)) {
        const publishedCourses = coursesRes.data.filter(
          (c: any) =>
            c.status === "PUBLISHED" ||
            (!c.status && c.status !== "DRAFT" && c.status !== "ARCHIVED"),
        );
        setCoursesList(publishedCourses);
        // Pre-warm / prefetch courses in background so opening any course has ZERO lag!
        publishedCourses.forEach((c: any) => {
          if (c.slug) prefetchCourseData(c.slug, user?.id || user?._id);
        });
      }

      if (sheetsRes?.data && Array.isArray(sheetsRes.data)) {
        setSheetsList(sheetsRes.data);
        // Pre-warm / prefetch sheets in background so opening any sheet has ZERO lag!
        sheetsRes.data.forEach((s: any) => {
          if (s.slug) prefetchSheetData(s.slug, user?.id || user?._id);
        });
      }

      if (quizzesRes?.data && Array.isArray(quizzesRes.data)) {
        setQuizCategories(quizzesRes.data);
        // Pre-warm quiz data
        quizzesRes.data.forEach((q: any) => {
          if (q._id) prefetchQuizData(q._id);
        });
      }
    } catch (err) {
      console.error("Failed to fetch catalog courses/sheets/quizzes", err);
    } finally {
      setLoadingCatalogData(false);
      setLoadingQuizzes(false);
    }
  };

  useEffect(() => {
    fetchAllCatalog();
  }, []);

  // Compute live progress and enrollment for courses dynamically
  const getCourseEnrollmentInfo = (courseItem: any) => {
    const slug = courseItem.slug;
    const enrolled = enrolledCourses.find(
      (c) =>
        c.slug === slug ||
        c._id === courseItem._id ||
        c.title?.toLowerCase() === courseItem.name?.toLowerCase(),
    );

    const isEnrolled = Boolean(enrolled || courseItem.isEnrolled);
    const completedChapters = enrolled?.progress?.completed ?? 0;
    const totalChapters =
      enrolled?.progress?.total ?? (courseItem.chapters?.length || 0);
    const progressPct =
      totalChapters > 0
        ? Math.round((completedChapters / totalChapters) * 100)
        : (enrolled?.progress?.percentage ?? 0);
    const isInProgress = completedChapters > 0 || progressPct > 0;

    return {
      isEnrolled,
      isInProgress,
      completedChapters,
      totalChapters,
      progressPct,
    };
  };

  // Compute live progress and enrollment for sheets dynamically
  const getSheetEnrollmentInfo = (sheetItem: any) => {
    const slug = sheetItem.slug;
    const enrolled = enrolledSheets.find(
      (s) =>
        s.slug === slug ||
        s._id === sheetItem._id ||
        s.title?.toLowerCase() === sheetItem.name?.toLowerCase() ||
        s.title?.toLowerCase() === sheetItem.title?.toLowerCase(),
    );

    const isEnrolled = Boolean(enrolled || sheetItem.isEnrolled);
    const completedQuestions =
      enrolled?.progress?.completed ??
      (Array.isArray(sheetItem.questions)
        ? sheetItem.questions.filter((q: any) => q.isCompleted).length
        : 0);
    const totalQuestions =
      enrolled?.progress?.total ??
      (Array.isArray(sheetItem.questions)
        ? sheetItem.questions.length
        : sheetItem.totalQuestions || 0);
    const progressPct =
      totalQuestions > 0
        ? Math.round((completedQuestions / totalQuestions) * 100)
        : (enrolled?.progress?.percentage ?? 0);
    const isInProgress = completedQuestions > 0 || progressPct > 0;

    return {
      isEnrolled,
      isInProgress,
      completedQuestions,
      totalQuestions,
      progressPct,
    };
  };

  useEffect(() => {
    const userId = user?.id || user?._id;
    if (userId) {
      fetchPersonalization();
      fetchMyLearningData();
    }
  }, [user?.id, user?._id]);

  const fetchMyLearningData = async () => {
    const userId = user?.id || user?._id;
    if (!userId) return;

    setLoadingLearning(true);
    try {
      const [coursesRes, sheetsRes] = await Promise.all([
        sendRequest({
          method: "GET",
          url: `${routes.api.myCourses}?userId=${userId}`,
        }),
        sendRequest({
          method: "GET",
          url: `${routes.api.mySheets}?userId=${userId}`,
        }),
      ]);

      if (coursesRes && coursesRes.data) {
        setEnrolledCourses(
          Array.isArray(coursesRes.data) ? coursesRes.data : [],
        );
      }

      if (sheetsRes && sheetsRes.data) {
        setEnrolledSheets(Array.isArray(sheetsRes.data) ? sheetsRes.data : []);
      }
    } catch (err) {
      console.error("Failed to fetch my learning data", err);
    } finally {
      setLoadingLearning(false);
    }
  };

  const fetchPersonalization = () => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(`tbe_personalization_${user.id}`);
        if (stored) {
          setPersonalization(JSON.parse(stored));
        } else if (initialPersonalization) {
          setPersonalization(initialPersonalization);
        }
      } catch (err) {
        console.error("Failed to read personalization from localStorage", err);
      }
    }
  };

  const handleQuizSubmit = async (data: PersonalizationQuizData) => {
    setIsSavingQuiz(true);
    try {
      // Simulate network save delay so the loader overlay is shown beautifully
      await new Promise((resolve) => setTimeout(resolve, 800));

      const personalizationData = {
        isCompleted: true,
        interests: data.interests,
        experienceLevel: data.experienceLevel,
        weeklyCommitment: data.weeklyCommitment || "regular",
        skipped: data.skipped,
        updatedAt: new Date().toISOString(),
      };

      if (typeof window !== "undefined") {
        localStorage.setItem(
          `tbe_personalization_${user.id}`,
          JSON.stringify(personalizationData),
        );
      }
      setPersonalization(personalizationData);
      setShowQuiz(false);
      setIsCookingQuiz(false);
    } catch (err) {
      console.error("Error saving personalization quiz locally", err);
      setShowQuiz(false);
      setIsCookingQuiz(false);
    } finally {
      setIsSavingQuiz(false);
    }
  };

  const filteredShikshaCourses = useMemo(() => {
    return coursesList.filter((c: any) => {
      const info = getCourseEnrollmentInfo(c);
      if (
        shikshaCategory === "enrolled" &&
        !info.isEnrolled &&
        !info.isInProgress
      )
        return false;
      if (shikshaCategory === "beginner") {
        const diff = (c.difficultyLevel || "").toLowerCase();
        if (!diff.includes("beginner") && !diff.includes("easy")) return false;
      }
      if (shikshaCategory === "intermediate") {
        const diff = (c.difficultyLevel || "").toLowerCase();
        if (
          !diff.includes("intermediate") &&
          !diff.includes("advanced") &&
          !diff.includes("hard")
        )
          return false;
      }

      if (shikshaSearchQuery.trim()) {
        const q = shikshaSearchQuery.toLowerCase();
        const matchName = (c.name || "").toLowerCase().includes(q);
        const matchDesc = (c.description || "").toLowerCase().includes(q);
        const matchRoadmap = (c.roadmap || "").toLowerCase().includes(q);
        return matchName || matchDesc || matchRoadmap;
      }
      return true;
    });
  }, [coursesList, enrolledCourses, shikshaCategory, shikshaSearchQuery]);

  const filteredInterviewSheets = useMemo(() => {
    return sheetsList.filter((s: any) => {
      const info = getSheetEnrollmentInfo(s);
      if (
        sheetCategory === "enrolled" &&
        !info.isEnrolled &&
        !info.isInProgress
      )
        return false;
      const titleLower = (s.name || s.title || "").toLowerCase();
      const roadmapLower = (s.roadmap || "").toLowerCase();

      if (sheetCategory === "frontend") {
        if (
          !titleLower.includes("javascript") &&
          !titleLower.includes("react") &&
          !titleLower.includes("frontend") &&
          !roadmapLower.includes("frontend")
        )
          return false;
      }
      if (sheetCategory === "backend") {
        if (
          !titleLower.includes("node") &&
          !titleLower.includes("db") &&
          !titleLower.includes("python") &&
          !titleLower.includes("java") &&
          !titleLower.includes("backend") &&
          !roadmapLower.includes("backend")
        )
          return false;
      }
      if (sheetCategory === "core") {
        if (
          !titleLower.includes("os") &&
          !titleLower.includes("dbms") &&
          !titleLower.includes("network") &&
          !titleLower.includes("oops") &&
          !roadmapLower.includes("core")
        )
          return false;
      }

      if (sheetSearchQuery.trim()) {
        const q = sheetSearchQuery.toLowerCase();
        const matchName = titleLower.includes(q);
        const matchDesc = (s.description || "").toLowerCase().includes(q);
        const matchRoadmap = roadmapLower.includes(q);
        return matchName || matchDesc || matchRoadmap;
      }
      return true;
    });
  }, [sheetsList, enrolledSheets, sheetCategory, sheetSearchQuery]);

  const handleOpenQuiz = () => {
    setShowQuiz(true);
    setIsCookingQuiz(false);
    setIsSavingQuiz(false);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  };

  return (
    <div className="w-full h-screen h-[100dvh] max-h-[100dvh] bg-[#F1F5F9] dark:bg-[#0E0E11] flex relative font-sans overflow-hidden p-0.5 sm:p-1 gap-1">
      <div
        className={`w-full h-full flex gap-1 ${
          !showQuiz || isCookingQuiz || isSavingQuiz ? "flex" : "hidden"
        }`}
      >
        {/* Left Column: Navigation Sidebar in a Curved Rectangle */}
        <aside
          className={`${
            isSidebarCollapsed
              ? "w-11 sm:w-[54px] px-0.5 sm:px-1"
              : "w-[180px] sm:w-[215px] px-1 sm:px-2"
          } bg-white dark:bg-[#131316] rounded-2xl border border-slate-200/90 dark:border-[#24242A] shadow-2xs h-full flex flex-col justify-between py-1.5 sm:py-2 shrink-0 transition-[width,padding] duration-300 ease-in-out select-none z-30 relative`}
        >
          <div className="space-y-1 flex-1 overflow-y-auto overflow-x-hidden scrollbar-none sm:[&::-webkit-scrollbar]:w-1 sm:[&::-webkit-scrollbar-thumb]:bg-slate-200 dark:sm:[&::-webkit-scrollbar-thumb]:bg-[#26262D] sm:[&::-webkit-scrollbar-thumb]:rounded-full">
            {/* Top Bar: Theme Mode Button in Top Left Corner + Collapse Toggle */}
            <div
              className={`flex items-center ${
                isSidebarCollapsed
                  ? "flex-col gap-1 justify-center"
                  : "justify-between px-0.5"
              } pb-0.5`}
            >
              <button
                type="button"
                onClick={handleToggleDarkMode}
                title={
                  isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"
                }
                aria-label={
                  isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"
                }
                className="w-5.5 h-5.5 rounded-md hover:bg-slate-100 dark:hover:bg-[#202026] flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors cursor-pointer shrink-0"
              >
                {isDarkMode ? (
                  <FiSun className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <FiMoon className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="w-5.5 h-5.5 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#202026] transition-colors cursor-pointer shrink-0"
                title={
                  isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
                }
              >
                {isSidebarCollapsed ? (
                  <FiChevronsRight className="w-3.5 h-3.5" />
                ) : (
                  <FiChevronsLeft className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            <nav className="space-y-0.5">
              {/* Dashboard Tab */}
              <div>
                <button
                  onClick={() => navigateToTab("dashboard")}
                  title={isSidebarCollapsed ? "Dashboard" : undefined}
                  className={`w-full relative flex items-center ${
                    isSidebarCollapsed ? "justify-center px-0" : "px-2 gap-2"
                  } py-1 rounded-lg text-xs transition-colors duration-200 cursor-pointer overflow-hidden ${
                    activeTab === "dashboard"
                      ? "bg-red-50/70 dark:bg-red-950/40 text-[#FF4D4D] font-medium shadow-2xs"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 font-normal"
                  }`}
                >
                  {activeTab === "dashboard" && (
                    <span className="absolute left-0 top-1 bottom-1 w-[2.5px] bg-[#FF4D4D] rounded-r-full" />
                  )}
                  <div className="w-4 h-4 flex items-center justify-center shrink-0">
                    <FiGrid
                      className={`w-3.5 h-3.5 ${
                        activeTab === "dashboard"
                          ? "text-[#FF4D4D]"
                          : "text-slate-500"
                      }`}
                    />
                  </div>
                  <span
                    className={`whitespace-nowrap flex-1 text-left truncate transition-opacity duration-200 ${
                      isSidebarCollapsed ? "hidden" : "block"
                    }`}
                  >
                    Dashboard
                  </span>
                </button>
              </div>

              {/* LEARNING Section */}
              <div className="space-y-0.5 pt-0.5">
                <div
                  className={`px-2 text-[9px] font-extrabold text-slate-400 dark:text-slate-500 tracking-wider uppercase whitespace-nowrap overflow-hidden transition-all duration-200 ${
                    isSidebarCollapsed
                      ? "opacity-0 h-0 my-0"
                      : "opacity-100 py-0.5"
                  }`}
                >
                  Learning
                </div>
                <div className="space-y-0.5">
                  <button
                    onClick={() => setActiveTab("explore")}
                    title={isSidebarCollapsed ? "Catalog" : undefined}
                    className={`w-full relative flex items-center ${
                      isSidebarCollapsed ? "justify-center px-0" : "px-2 gap-2"
                    } py-1 rounded-lg text-xs transition-colors duration-200 cursor-pointer overflow-hidden ${
                      activeTab === "explore"
                        ? "bg-red-50/70 dark:bg-red-950/40 text-[#FF4D4D] font-medium shadow-2xs"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 font-normal"
                    }`}
                  >
                    {activeTab === "explore" && (
                      <span className="absolute left-0 top-1 bottom-1 w-[2.5px] bg-[#FF4D4D] rounded-r-full" />
                    )}
                    <div className="w-4 h-4 flex items-center justify-center shrink-0">
                      <FiCompass
                        className={`w-3.5 h-3.5 ${
                          activeTab === "explore"
                            ? "text-[#FF4D4D]"
                            : "text-slate-500 dark:text-slate-400"
                        }`}
                      />
                    </div>
                    <span
                      className={`whitespace-nowrap flex-1 text-left truncate transition-opacity duration-200 ${
                        isSidebarCollapsed ? "hidden" : "block"
                      }`}
                    >
                      Catalog
                    </span>
                  </button>

                  {/* Shiksha Tab */}
                  <button
                    onClick={() => navigateToTab("shiksha")}
                    title={isSidebarCollapsed ? "Shiksha" : undefined}
                    className={`w-full relative flex items-center ${
                      isSidebarCollapsed ? "justify-center px-0" : "px-2 gap-2"
                    } py-1 rounded-lg text-xs transition-colors duration-200 cursor-pointer overflow-hidden ${
                      activeTab === "shiksha"
                        ? "bg-red-50/70 dark:bg-red-950/40 text-[#FF4D4D] font-medium shadow-2xs"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 font-normal"
                    }`}
                  >
                    {activeTab === "shiksha" && (
                      <span className="absolute left-0 top-1 bottom-1 w-[2.5px] bg-[#FF4D4D] rounded-r-full" />
                    )}
                    <div className="w-4 h-4 flex items-center justify-center shrink-0">
                      <FiPlayCircle
                        className={`w-3.5 h-3.5 ${
                          activeTab === "shiksha"
                            ? "text-[#FF4D4D]"
                            : "text-slate-500 dark:text-slate-400"
                        }`}
                      />
                    </div>
                    <span
                      className={`whitespace-nowrap flex-1 text-left truncate transition-opacity duration-200 ${
                        isSidebarCollapsed ? "hidden" : "block"
                      }`}
                    >
                      Shiksha
                    </span>
                  </button>

                  {/* Interview Prep Tab */}
                  <button
                    onClick={() => navigateToTab("interview-prep")}
                    title={isSidebarCollapsed ? "Interview Prep" : undefined}
                    className={`w-full relative flex items-center ${
                      isSidebarCollapsed ? "justify-center px-0" : "px-2 gap-2"
                    } py-1 rounded-lg text-xs transition-colors duration-200 cursor-pointer overflow-hidden ${
                      activeTab === "interview-prep"
                        ? "bg-red-50/70 dark:bg-red-950/40 text-[#FF4D4D] font-medium shadow-2xs"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 font-normal"
                    }`}
                  >
                    {activeTab === "interview-prep" && (
                      <span className="absolute left-0 top-1 bottom-1 w-[2.5px] bg-[#FF4D4D] rounded-r-full" />
                    )}
                    <div className="w-4 h-4 flex items-center justify-center shrink-0">
                      <FiTarget
                        className={`w-3.5 h-3.5 ${
                          activeTab === "interview-prep"
                            ? "text-[#FF4D4D]"
                            : "text-slate-500 dark:text-slate-400"
                        }`}
                      />
                    </div>
                    <span
                      className={`whitespace-nowrap flex-1 text-left truncate transition-opacity duration-200 ${
                        isSidebarCollapsed ? "hidden" : "block"
                      }`}
                    >
                      Interview Prep
                    </span>
                  </button>

                  <button
                    onClick={() => navigateToTab("ecosystem")}
                    title={isSidebarCollapsed ? "Ecosystem" : undefined}
                    className={`w-full relative flex items-center ${
                      isSidebarCollapsed ? "justify-center px-0" : "px-2 gap-2"
                    } py-1 rounded-lg text-xs transition-colors duration-200 cursor-pointer overflow-hidden ${
                      activeTab === "ecosystem"
                        ? "bg-red-50/70 dark:bg-red-950/40 text-[#FF4D4D] font-medium shadow-2xs"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 font-normal"
                    }`}
                  >
                    {activeTab === "ecosystem" && (
                      <span className="absolute left-0 top-1 bottom-1 w-[2.5px] bg-[#FF4D4D] rounded-r-full" />
                    )}
                    <div className="w-4 h-4 flex items-center justify-center shrink-0">
                      <FiLayers
                        className={`w-3.5 h-3.5 ${
                          activeTab === "ecosystem"
                            ? "text-[#FF4D4D]"
                            : "text-slate-500 dark:text-slate-400"
                        }`}
                      />
                    </div>
                    <span
                      className={`whitespace-nowrap flex-1 text-left truncate transition-opacity duration-200 ${
                        isSidebarCollapsed ? "hidden" : "block"
                      }`}
                    >
                      Ecosystem
                    </span>
                  </button>
                </div>
              </div>

              {/* Separator */}
              <div className="border-b border-[#E8ECF2] dark:border-slate-800 my-0.5" />

              {/* PRACTICE Section */}
              <div className="space-y-0.5 pt-0.5">
                <div
                  className={`px-2 text-[9px] font-extrabold text-slate-400 dark:text-slate-500 tracking-wider uppercase whitespace-nowrap overflow-hidden transition-all duration-200 ${
                    isSidebarCollapsed
                      ? "opacity-0 h-0 my-0"
                      : "opacity-100 py-0.5"
                  }`}
                >
                  Practice
                </div>
                <div className="space-y-0.5">
                  {/* Quizzes Tab */}
                  <button
                    type="button"
                    onClick={() => navigateToTab("quizzes")}
                    title={isSidebarCollapsed ? "Quizzes" : undefined}
                    className={`w-full flex items-center relative ${
                      isSidebarCollapsed ? "justify-center px-0" : "px-2 gap-2"
                    } py-1 rounded-lg text-xs transition-colors overflow-hidden cursor-pointer ${
                      activeTab === "quizzes"
                        ? "bg-red-50 dark:bg-red-950/40 text-[#FF4D4D] font-medium"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 font-normal"
                    }`}
                  >
                    {activeTab === "quizzes" && (
                      <span className="absolute left-0 top-1 bottom-1 w-[2.5px] bg-[#FF4D4D] rounded-r-full" />
                    )}
                    <div className="w-4 h-4 flex items-center justify-center shrink-0">
                      <FiHelpCircle
                        className={`w-3.5 h-3.5 ${
                          activeTab === "quizzes"
                            ? "text-[#FF4D4D]"
                            : "text-slate-500 dark:text-slate-400"
                        }`}
                      />
                    </div>
                    <span
                      className={`whitespace-nowrap flex-1 text-left truncate transition-opacity duration-200 ${
                        isSidebarCollapsed ? "hidden" : "block"
                      }`}
                    >
                      Quizzes
                    </span>
                    {!isSidebarCollapsed && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-red-100 dark:bg-red-950/60 text-[#FF3B30]">
                        New
                      </span>
                    )}
                  </button>

                  <a
                    href="https://dsayatra.theboringeducation.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    title={isSidebarCollapsed ? "DSA Practice" : undefined}
                    className={`w-full flex items-center ${
                      isSidebarCollapsed ? "justify-center px-0" : "px-2 gap-2"
                    } py-1 rounded-lg text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 font-normal transition-colors overflow-hidden`}
                  >
                    <div className="w-4 h-4 flex items-center justify-center shrink-0">
                      <FiCode className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                    </div>
                    <span
                      className={`whitespace-nowrap flex-1 text-left truncate transition-opacity duration-200 ${
                        isSidebarCollapsed ? "hidden" : "block"
                      }`}
                    >
                      DSA Practice
                    </span>
                  </a>

                  <a
                    href="https://oncampus.theboringeducation.com/aptitude"
                    target="_blank"
                    rel="noopener noreferrer"
                    title={isSidebarCollapsed ? "Aptitude Practice" : undefined}
                    className={`w-full flex items-center ${
                      isSidebarCollapsed ? "justify-center px-0" : "px-2 gap-2"
                    } py-1 rounded-lg text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 font-normal transition-colors overflow-hidden`}
                  >
                    <div className="w-4 h-4 flex items-center justify-center shrink-0">
                      <FiBarChart2 className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                    </div>
                    <span
                      className={`whitespace-nowrap flex-1 text-left truncate transition-opacity duration-200 ${
                        isSidebarCollapsed ? "hidden" : "block"
                      }`}
                    >
                      Aptitude Practice
                    </span>
                  </a>
                </div>
              </div>

              {/* Separator */}
              <div className="border-b border-[#E8ECF2] dark:border-slate-800 my-0.5" />

              {/* COMMUNITY Section */}
              <div className="space-y-0.5 pt-0.5">
                <div
                  className={`px-2 text-[9px] font-extrabold text-slate-400 dark:text-slate-500 tracking-wider uppercase whitespace-nowrap overflow-hidden transition-all duration-200 ${
                    isSidebarCollapsed
                      ? "opacity-0 h-0 my-0"
                      : "opacity-100 py-0.5"
                  }`}
                >
                  Community
                </div>
                <div className="space-y-0.5">
                  <a
                    href="https://resources.theboringeducation.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    title={isSidebarCollapsed ? "Resources" : undefined}
                    className={`w-full flex items-center ${
                      isSidebarCollapsed ? "justify-center px-0" : "px-2 gap-2"
                    } py-1 rounded-lg text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 font-normal transition-colors overflow-hidden`}
                  >
                    <div className="w-4 h-4 flex items-center justify-center shrink-0">
                      <FiFileText className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                    </div>
                    <span
                      className={`whitespace-nowrap flex-1 text-left truncate transition-opacity duration-200 ${
                        isSidebarCollapsed ? "hidden" : "block"
                      }`}
                    >
                      Resources
                    </span>
                  </a>
                </div>
              </div>
            </nav>
          </div>

          {/* Bottom User Profile Section with Hover Menu & XP Count */}
          {isSidebarCollapsed ? (
            /* Collapsed State */
            <div className="pt-1 border-t border-slate-100 dark:border-[#24242A] mt-auto relative group flex justify-center shrink-0">
              {/* Floating Popover on Hover (positioned to the right) */}
              <div className="absolute left-full bottom-0 ml-2 w-44 p-1.5 bg-white dark:bg-[#18181D] rounded-xl border border-slate-200/90 dark:border-[#2C2C36] shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 ease-out z-50">
                <div className="flex items-center justify-between gap-1.5 pb-1.5 mb-1 border-b border-slate-100 dark:border-[#24242A]">
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-bold text-slate-900 dark:text-white truncate">
                      {displayName}
                    </div>
                    {displayEmail && (
                      <div className="text-[9px] text-slate-400 dark:text-slate-500 truncate">
                        {displayEmail}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-0.5 px-1 py-0.5 rounded-md bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
                    <FiZap className="w-2.5 h-2.5 text-amber-500 fill-amber-500/30 shrink-0" />
                    <span className="text-[10px] font-black">
                      {userPoints} XP
                    </span>
                  </div>
                </div>

                <div className="space-y-0.5">
                  <Link
                    href="/profile"
                    className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#23232B] hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    <FiUser className="w-3 h-3 text-slate-500" />
                    <span>Profile</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() =>
                      signOut
                        ? signOut("/login")
                        : (window.location.href = "/login")
                    }
                    className="w-full flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer text-left"
                  >
                    <FiLogOut className="w-3 h-3" />
                    <span>Log out</span>
                  </button>
                </div>
              </div>

              {/* Collapsed Avatar with XP dot */}
              <div className="relative cursor-pointer p-0.5">
                <div className="w-6 h-6 rounded-full overflow-hidden bg-gradient-to-tr from-[#FF3B30] to-orange-400 text-white font-bold text-[10px] flex items-center justify-center border border-slate-200/80 dark:border-white/10 shadow-2xs">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <span>{avatarInitial}</span>
                  )}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xs">
                  <FiZap className="w-1.5 h-1.5 fill-white text-white" />
                </div>
              </div>
            </div>
          ) : (
            /* Expanded State */
            <div className="pt-1 border-t border-slate-100 dark:border-[#24242A] mt-auto relative group shrink-0">
              {/* Hover Dropdown Menu (Appears above the user bar) */}
              <div className="absolute bottom-full left-0 right-0 mb-1.5 p-1 bg-white dark:bg-[#18181D] rounded-xl border border-slate-200/90 dark:border-[#2C2C36] shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 ease-out -translate-y-1 group-hover:translate-y-0 z-50">
                <div className="px-2 py-1 mb-1 border-b border-slate-100 dark:border-[#24242A]">
                  <div className="text-[11px] font-bold text-slate-900 dark:text-white truncate">
                    {displayName}
                  </div>
                  {displayEmail && (
                    <div className="text-[9px] text-slate-400 dark:text-slate-500 truncate">
                      {displayEmail}
                    </div>
                  )}
                </div>

                <Link
                  href="/profile"
                  className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#23232B] hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <FiUser className="w-3 h-3 text-slate-500" />
                  <span>Profile</span>
                </Link>

                <button
                  type="button"
                  onClick={() =>
                    signOut
                      ? signOut("/login")
                      : (window.location.href = "/login")
                  }
                  className="w-full flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer text-left"
                >
                  <FiLogOut className="w-3 h-3" />
                  <span>Log out</span>
                </button>
              </div>

              {/* User Bar: Image + Name on Left, XP Count on Right */}
              <div className="flex items-center justify-between gap-1 p-0.5 rounded-lg hover:bg-slate-50 dark:hover:bg-[#1C1C22] transition-colors cursor-pointer">
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  <div className="w-6 h-6 rounded-full overflow-hidden bg-gradient-to-tr from-[#FF3B30] to-orange-400 text-white font-bold text-[10px] flex items-center justify-center shrink-0 border border-slate-200/80 dark:border-white/10 shadow-2xs">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={displayName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display =
                            "none";
                        }}
                      />
                    ) : (
                      <span>{avatarInitial}</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-bold text-slate-900 dark:text-white truncate leading-tight">
                      {displayName}
                    </div>
                    <div className="text-[9px] text-slate-400 dark:text-slate-500 truncate leading-tight">
                      {displayEmail ? "Learner" : "Signed in"}
                    </div>
                  </div>
                </div>

                {/* Right: XP Count */}
                <div
                  title={`${userPoints} Total XP`}
                  className="flex items-center gap-0.5 px-1 py-0.5 rounded-md bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0"
                >
                  <FiZap className="w-2.5 h-2.5 text-amber-500 fill-amber-500/30 shrink-0" />
                  <span className="text-[10px] font-black">{userPoints}</span>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* Right Column: Main Content Area in a Matching Curved Rectangle */}
        <main className="flex-1 min-w-0 bg-white dark:bg-[#131316] rounded-2xl border border-slate-200/90 dark:border-[#24242A] shadow-2xs h-full p-2 sm:p-2.5 md:p-3 space-y-2 sm:space-y-2.5 overflow-y-auto overflow-x-hidden">
          {activeTab === "shiksha" ? (
            activeLearningItem?.type === "course" ? (
              <CourseLearningSpace
                courseSlug={activeLearningItem.slug}
                initialCourse={coursesList.find(
                  (c) => c.slug === activeLearningItem.slug,
                )}
                user={user}
                onBack={() => navigateToTab("shiksha")}
                onNavigateToDashboard={() => navigateToTab("dashboard")}
                onChapterChange={(chName) =>
                  setActiveLearningItem((prev) =>
                    prev ? { ...prev, currentItemName: chName } : null,
                  )
                }
              />
            ) : (
              /* Shiksha Courses Space Catalog */
              <div className="space-y-2.5 sm:space-y-3">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 flex-wrap px-0.5">
                  <button
                    type="button"
                    onClick={() => navigateToTab("dashboard")}
                    className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                  >
                    Learn
                  </button>
                  <span className="text-slate-300 dark:text-slate-600">›</span>
                  <span className="font-bold text-[#FF4D4D]">
                    Shiksha Courses
                  </span>
                </nav>

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 bg-white dark:bg-[#17171B] p-3 sm:p-3.5 rounded-2xl border border-slate-200/80 dark:border-[#26262C] shadow-2xs">
                  <div className="space-y-0.5 sm:space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-red-50 dark:bg-red-950/40 text-[#FF3B30] border border-red-200/80 dark:border-red-900/60">
                        Shiksha Space
                      </span>
                      <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
                        {coursesList.length} Courses Available
                      </span>
                    </div>
                    <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                      Learn With Shiksha
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium max-w-xl">
                      Structured developer courses designed to take you from
                      foundational logic to production-ready engineering.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-3 py-1 rounded-xl bg-slate-50 dark:bg-[#222228] border border-slate-200 dark:border-[#2C2C34] text-xs font-bold text-slate-700 dark:text-slate-200">
                      {enrolledCourses.length} Enrolled
                    </span>
                  </div>
                </div>

                {/* Filter Pills & Search */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-2.5 bg-white dark:bg-[#17171B] p-2 sm:p-2.5 rounded-2xl border border-slate-200/80 dark:border-[#26262C] shadow-2xs">
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none flex-nowrap">
                    {[
                      { id: "all", label: "All Courses" },
                      { id: "enrolled", label: "My Enrolled" },
                      { id: "beginner", label: "Beginner" },
                      { id: "intermediate", label: "Intermediate" },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setShikshaCategory(tab.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                          shikshaCategory === tab.id
                            ? "bg-[#FF3B30] text-white shadow-xs"
                            : "bg-slate-50 dark:bg-[#222228] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#2A2A32] hover:text-slate-900 dark:hover:text-white"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <div className="relative w-full sm:w-64 shrink-0">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-3.5 h-3.5 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search course title..."
                      value={shikshaSearchQuery}
                      onChange={(e) => setShikshaSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-[#222228] border border-slate-200 dark:border-[#2C2C34] rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:bg-white dark:focus:bg-[#1F1F25] focus:border-[#FF3B30] transition-all"
                    />
                  </div>
                </div>

                {/* Courses Grid */}
                {loadingCatalogData ? (
                  <div className="py-16 text-center text-xs font-bold text-slate-400">
                    Loading Shiksha courses...
                  </div>
                ) : filteredShikshaCourses.length === 0 ? (
                  <div className="py-16 bg-white dark:bg-[#17171B] border border-slate-200/80 dark:border-[#26262C] rounded-2xl text-center p-6 space-y-2">
                    <FiPlayCircle className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">
                      No courses found
                    </h3>
                    <p className="text-xs text-slate-400">
                      Try adjusting your search query or filter.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    {filteredShikshaCourses.map((c: any) => {
                      const info = getCourseEnrollmentInfo(c);
                      const logoUrl = getSheetLogo(c);
                      const totalChapters = c.chapters?.length || 0;

                      return (
                        <div
                          key={c._id || c.slug}
                          onMouseEnter={() =>
                            prefetchCourseData(c.slug, user?.id || user?._id)
                          }
                          className="bg-white dark:bg-[#17171B] border border-slate-200/80 dark:border-[#26262C] hover:border-slate-300 dark:hover:border-[#383842] rounded-xl p-2.5 sm:p-3 flex flex-col justify-between shadow-2xs hover:shadow-xs transition-all group"
                        >
                          <div>
                            {/* Header: Logo box + Title */}
                            <div className="flex items-center gap-2 sm:gap-2.5">
                              <div className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center shrink-0">
                                {logoUrl ? (
                                  <img
                                    src={logoUrl}
                                    alt={c.name}
                                    className="w-5 h-5 sm:w-6 sm:h-6 object-contain"
                                  />
                                ) : (
                                  <FiPlayCircle className="w-5 h-5 text-[#FF3B30]" />
                                )}
                              </div>
                              <h3 className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-white group-hover:text-[#FF3B30] transition-colors leading-snug line-clamp-1">
                                {c.name}
                              </h3>
                            </div>

                            {/* Description */}
                            <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mt-1.5 mb-2 font-normal">
                              {c.description ||
                                "Comprehensive hands-on coding course covering essential concepts and real-world projects."}
                            </p>
                          </div>

                          {/* Footer: Actual Chapter Count + Explore Button */}
                          <div className="flex items-center justify-between gap-1.5 mt-2 pt-2 border-t border-slate-100 dark:border-[#222228]">
                            <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-medium text-slate-600 dark:text-slate-300">
                              <FiBookOpen className="w-3 h-3 text-[#FF3B30] shrink-0" />
                              <span>
                                {totalChapters}{" "}
                                {totalChapters === 1 ? "Chapter" : "Chapters"}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => navigateToCourse(c.slug, c.name)}
                              className="px-2.5 py-1 rounded-md text-[10px] sm:text-[11px] font-bold transition-all shadow-2xs flex items-center gap-1 cursor-pointer bg-[#FF3B30] hover:bg-[#EE3126] text-white group/btn"
                            >
                              <span>
                                {info.isInProgress ? "Resume" : "Start"}
                              </span>
                              <FiArrowRight className="w-2.5 h-2.5 group-hover/btn:translate-x-0.5 transition-transform" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )
          ) : activeTab === "interview-prep" ? (
            activeLearningItem?.type === "sheet" ? (
              <SheetLearningSpace
                sheetSlug={activeLearningItem.slug}
                initialSheet={sheetsList.find(
                  (s) => s.slug === activeLearningItem.slug,
                )}
                user={user}
                onBack={() => navigateToTab("interview-prep")}
                onNavigateToDashboard={() => navigateToTab("dashboard")}
                onQuestionChange={(qName) =>
                  setActiveLearningItem((prev) =>
                    prev ? { ...prev, currentItemName: qName } : null,
                  )
                }
              />
            ) : (
              /* Interview Prep Space Catalog */
              <div className="space-y-2.5 sm:space-y-3">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 flex-wrap px-0.5">
                  <button
                    type="button"
                    onClick={() => navigateToTab("dashboard")}
                    className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                  >
                    Learn
                  </button>
                  <span className="text-slate-300 dark:text-slate-600">›</span>
                  <span className="font-bold text-[#FF4D4D]">
                    Interview Sheets
                  </span>
                </nav>

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 bg-white dark:bg-[#17171B] p-3 sm:p-3.5 rounded-2xl border border-slate-200/80 dark:border-[#26262C] shadow-2xs">
                  <div className="space-y-0.5 sm:space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-red-50 dark:bg-red-950/40 text-[#FF4D4D] border border-red-200/80 dark:border-red-900/60">
                        Interview Prep Space
                      </span>
                      <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
                        {sheetsList.length} Sheets Available
                      </span>
                    </div>
                    <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                      Crack Tech Interviews
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium max-w-xl">
                      Curated topic-wise sheets with top interview questions,
                      code snippets and in-depth answers.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-3 py-1 rounded-xl bg-slate-50 dark:bg-[#222228] border border-slate-200 dark:border-[#2C2C34] text-xs font-bold text-slate-700 dark:text-slate-200">
                      {enrolledSheets.length} Enrolled
                    </span>
                  </div>
                </div>

                {/* Filter Pills & Search */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-2.5 bg-white dark:bg-[#17171B] p-2 sm:p-2.5 rounded-2xl border border-slate-200/80 dark:border-[#26262C] shadow-2xs">
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none flex-nowrap">
                    {[
                      { id: "all", label: "All Sheets" },
                      { id: "enrolled", label: "My Enrolled" },
                      { id: "frontend", label: "Frontend" },
                      { id: "backend", label: "Backend" },
                      { id: "core", label: "Core CS" },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setSheetCategory(tab.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                          sheetCategory === tab.id
                            ? "bg-[#FF4D4D] text-white shadow-xs"
                            : "bg-slate-50 dark:bg-[#222228] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#2A2A32] hover:text-slate-900 dark:hover:text-white"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <div className="relative w-full sm:w-64 shrink-0">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-3.5 h-3.5 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search sheet title..."
                      value={sheetSearchQuery}
                      onChange={(e) => setSheetSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-[#222228] border border-slate-200 dark:border-[#2C2C34] rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:bg-white dark:focus:bg-[#1F1F25] focus:border-[#FF4D4D] transition-all"
                    />
                  </div>
                </div>

                {/* Sheets Grid */}
                {loadingCatalogData ? (
                  <div className="py-16 text-center text-xs font-bold text-slate-400">
                    Loading Interview sheets...
                  </div>
                ) : filteredInterviewSheets.length === 0 ? (
                  <div className="py-16 bg-white dark:bg-[#17171B] border border-slate-200/80 dark:border-[#26262C] rounded-2xl text-center p-6 space-y-2">
                    <FiTarget className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">
                      No sheets found
                    </h3>
                    <p className="text-xs text-slate-400">
                      Try adjusting your search query or filter.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
                    {filteredInterviewSheets.map((s: any) => {
                      const info = getSheetEnrollmentInfo(s);
                      return (
                        <div
                          key={s._id || s.slug}
                          onMouseEnter={() =>
                            prefetchSheetData(s.slug, user?.id || user?._id)
                          }
                          className="bg-white dark:bg-[#17171B] border border-slate-200/80 dark:border-[#26262C] hover:border-slate-300 dark:hover:border-[#383842] rounded-2xl overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-md transition-all group"
                        >
                          <div>
                            {/* Image or Banner */}
                            {s.coverImageURL ? (
                              <div className="relative w-full aspect-[16/9] overflow-hidden bg-slate-100 dark:bg-[#222228]">
                                <img
                                  src={s.coverImageURL}
                                  alt={s.name || s.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-black/60 text-white backdrop-blur-xs">
                                  {s.roadmap || "SHEET"}
                                </div>
                                {info.isInProgress ? (
                                  <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#FF4D4D] text-white shadow-xs">
                                    In Progress
                                  </div>
                                ) : info.isEnrolled ? (
                                  <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-600 text-white shadow-xs">
                                    Enrolled
                                  </div>
                                ) : null}
                              </div>
                            ) : (
                              <div className="p-4 bg-gradient-to-r from-rose-50 to-red-50 dark:from-red-950/40 dark:to-rose-950/20 border-b border-rose-100 dark:border-red-950/60 flex items-center justify-between">
                                <span className="text-[10px] font-extrabold tracking-wider uppercase text-[#FF4D4D]">
                                  {s.roadmap || "INTERVIEW SHEET"}
                                </span>
                                {info.isInProgress ? (
                                  <span className="text-[10px] font-black uppercase text-[#FF4D4D] bg-white dark:bg-[#24242C] px-2 py-0.5 rounded-full shadow-2xs">
                                    In Progress
                                  </span>
                                ) : null}
                              </div>
                            )}

                            <div className="p-4 space-y-2">
                              <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#FF4D4D] transition-colors leading-snug">
                                {s.name || s.title}
                              </h3>
                              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                {s.description ||
                                  "Curated list of technical interview questions."}
                              </p>

                              {/* Progress info if enrolled */}
                              {info.isInProgress && (
                                <div className="pt-2 space-y-1">
                                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300">
                                    <span>{info.progressPct}% Solved</span>
                                    <span className="text-slate-400 font-medium text-[10px]">
                                      {info.completedQuestions}/
                                      {info.totalQuestions} Solved
                                    </span>
                                  </div>
                                  <div className="w-full bg-slate-100 dark:bg-[#26262C] rounded-full h-1.5 overflow-hidden">
                                    <div
                                      className="bg-[#FF4D4D] h-1.5 rounded-full transition-all"
                                      style={{ width: `${info.progressPct}%` }}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="p-4 pt-0 mt-auto">
                            <button
                              type="button"
                              onClick={() =>
                                navigateToSheet(s.slug, s.name || s.title)
                              }
                              className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer ${
                                info.isInProgress
                                  ? "bg-[#FF4D4D] hover:bg-[#EE3126] text-white"
                                  : info.isEnrolled
                                    ? "bg-slate-900 hover:bg-slate-800 dark:bg-[#2A2A32] dark:hover:bg-[#34343E] text-white"
                                    : "bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-950/60 text-[#FF4D4D] border border-red-200 dark:border-red-900/60"
                              }`}
                            >
                              {info.isInProgress
                                ? "Resume Sheet"
                                : info.isEnrolled
                                  ? "Start Sheet"
                                  : "Start Learning"}{" "}
                              <FiArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )
          ) : activeTab === "quizzes" ? (
            /* Quizzes Tab */
            activeQuizId ? (
              <QuizPlaySpace
                quizId={activeQuizId}
                quizName={activeQuizName}
                user={user}
                onBack={() => navigateToTab("quizzes")}
              />
            ) : (
              <div className="space-y-2.5 sm:space-y-3">
                <nav className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 flex-wrap px-0.5">
                  <button
                    type="button"
                    onClick={() => navigateToTab("dashboard")}
                    className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                  >
                    Learn
                  </button>
                  <span className="text-slate-300 dark:text-slate-600">›</span>
                  <span className="font-bold text-[#FF4D4D]">Quizzes</span>
                </nav>
                <QuizCatalogSpace
                  categories={quizCategories}
                  loading={loadingQuizzes}
                  onSelectQuiz={(id, name) => navigateToQuiz(id, name)}
                />
              </div>
            )
          ) : activeTab === "ecosystem" ? (
            /* Ecosystem Tab */
            <div className="space-y-4">
              <section className="space-y-3">
                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  Quick access to TBE Ecosystem
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {TBE_ECOSYSTEM_APPS.map((app, i) => (
                    <a
                      key={app.name}
                      href={app.url}
                      target={app.isExternal ? "_blank" : undefined}
                      rel={app.isExternal ? "noopener noreferrer" : undefined}
                      className={`group bg-white dark:bg-[#17171B] hover:bg-slate-50/80 dark:hover:bg-[#202026] border border-slate-200/80 dark:border-[#26262C] hover:border-[#FF3B30]/50 dark:hover:border-[#FF3B30]/50 transition-all hover:shadow-md rounded-2xl p-3.5 sm:p-4 flex min-w-0 overflow-hidden ${i % 2 === 0 ? "flex-col" : "flex-col-reverse"}`}
                    >
                      {/* Image */}
                      <div className="w-full h-32 sm:h-40 flex items-center justify-center py-2 sm:py-3">
                        <img
                          src={app.image}
                          alt={app.name}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = app.fallback;
                          }}
                          className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      {/* Text */}
                      <div
                        className={
                          i % 2 === 0
                            ? "mt-auto pt-2.5 border-t border-slate-100 dark:border-[#26262C]"
                            : "mb-auto pb-2.5 border-b border-slate-100 dark:border-[#26262C]"
                        }
                      >
                        <div className="flex items-center justify-between gap-1">
                          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-[#FF3B30] transition-colors leading-tight">
                            {app.name}
                          </h3>
                          <FiArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#FF3B30] shrink-0" />
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-snug mt-0.5">
                          {app.desc}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              </section>
            </div>
          ) : activeTab === "dashboard" ? (
            /* Dashboard Tab */
            <div className="space-y-3 sm:space-y-4">
              {/* Greeting Header */}
              <div className="space-y-0.5">
                <h1 className="text-base sm:text-lg md:text-xl font-extrabold text-[#10162F] dark:text-white tracking-tight">
                  {getGreeting()}, {user?.name?.split(" ")[0] || "Nitin"} 👋
                </h1>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-semibold">
                  Keep learning, keep growing!
                </p>
              </div>

              {/* Recommended for you */}
              <section className="space-y-2 sm:space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                      Recommended for you
                    </h2>
                  </div>
                  <button
                    onClick={() => setActiveTab("explore")}
                    className="text-xs font-bold text-[#FF3B30] hover:underline flex items-center gap-1 shrink-0 cursor-pointer self-start sm:self-auto"
                  >
                    Explore all courses &amp; sheets{" "}
                    <FiArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="relative group overflow-x-clip">
                  <div
                    id="recommended-scroll-container"
                    className="flex items-stretch gap-3 sm:gap-3.5 overflow-x-auto snap-x pb-2 pt-1 flex-nowrap scroll-smooth [&::-webkit-scrollbar]:h-[3px] [&::-webkit-scrollbar-track]:bg-slate-100 dark:[&::-webkit-scrollbar-track]:bg-[#1A1A1E] [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300 dark:[&::-webkit-scrollbar-thumb]:bg-[#2C2C34] [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400"
                  >
                    {/* Bulb Card */}
                    <div className="w-52 sm:w-60 md:w-64 shrink-0 bg-white dark:bg-[#17171B] border border-slate-200/80 dark:border-[#26262C] rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between text-center shadow-xs hover:border-slate-300 dark:hover:border-[#383842] transition-all snap-start">
                      <div>
                        <div className="w-full flex items-center justify-center py-1 mb-2">
                          <img
                            src="/images/bulb.png"
                            alt="Explore courses & sheets"
                            className="h-20 sm:h-24 md:h-28 object-contain mx-auto"
                          />
                        </div>
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
                          Explore courses & sheets
                        </h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 leading-snug">
                          Browse all interview sheets, core CS subjects & free
                          roadmaps.
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveTab("explore")}
                        className="mt-3 w-full py-2 bg-[#FF3B30] hover:bg-[#EE3126] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        Explore Catalog <FiArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Mixed Recommendation Cards */}
                    {RECOMMENDED_DISCOVERY_ITEMS.map((item) => {
                      const enrolledMatch = item.slug
                        ? item.type === "course"
                          ? enrolledCourses.find(
                              (c) =>
                                c.slug === item.slug ||
                                c.title?.toLowerCase() ===
                                  item.title.toLowerCase(),
                            )
                          : enrolledSheets.find(
                              (s) =>
                                s.slug === item.slug ||
                                s.title?.toLowerCase() ===
                                  item.title.toLowerCase(),
                            )
                        : null;

                      const isInProgress =
                        enrolledMatch &&
                        ((enrolledMatch.progress?.completed ?? 0) > 0 ||
                          (enrolledMatch.progress?.percentage ?? 0) > 0);

                      const progressPercentage =
                        enrolledMatch?.progress?.percentage ?? 0;

                      let badgeText = item.category;
                      let badgeStyle =
                        item.categoryStyle ||
                        "bg-[#E0F2FE] dark:bg-sky-950/40 text-[#0369A1] dark:text-sky-300 border border-sky-200/60 dark:border-sky-800/60";

                      if (
                        (item.type === "sheet" || item.type === "course") &&
                        isInProgress
                      ) {
                        badgeText = "IN PROGRESS";
                        badgeStyle = "bg-[#FF3B30] text-white font-extrabold";
                      }

                      const linkHref =
                        item.type === "sheet" && enrolledMatch?.slug
                          ? `/interview-prep/${enrolledMatch.slug}`
                          : item.url;

                      return (
                        <div
                          key={item.id}
                          className="w-52 sm:w-60 md:w-64 shrink-0 bg-white dark:bg-[#17171B] border border-slate-200/80 dark:border-[#26262C] rounded-2xl overflow-hidden flex flex-col justify-between shadow-xs hover:border-slate-300 dark:hover:border-[#383842] transition-all snap-start group"
                        >
                          <div>
                            <div
                              className={`px-3 sm:px-3.5 py-1.5 text-[10px] font-extrabold tracking-wider uppercase ${badgeStyle}`}
                            >
                              {badgeText}
                            </div>
                            <div className="p-3 sm:p-3.5 space-y-1.5 sm:space-y-2">
                              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-snug group-hover:text-[#FF3B30] transition-colors">
                                {item.title}
                              </h3>
                              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug line-clamp-3">
                                {item.desc}
                              </p>
                              {isInProgress && (
                                <div className="pt-1.5 space-y-1">
                                  <div className="w-full bg-slate-100 dark:bg-[#26262C] rounded-full h-1.5">
                                    <div
                                      className="bg-[#FF3B30] h-1.5 rounded-full"
                                      style={{
                                        width: `${progressPercentage}%`,
                                      }}
                                    />
                                  </div>
                                  <div className="text-right text-[10px] font-bold text-slate-700 dark:text-slate-300">
                                    {progressPercentage}% Completed
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="px-3 sm:px-3.5 py-2 sm:py-2.5 border-t border-slate-100 dark:border-[#26262C] flex items-center justify-between text-[10px] font-medium text-slate-400">
                            <span>
                              {item.type === "core-subject"
                                ? "OnCampus"
                                : item.type === "resource"
                                  ? "Resources"
                                  : item.type === "course"
                                    ? "Shiksha"
                                    : "Interview Prep"}
                            </span>
                            {item.isExternal ? (
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-bold text-[#FF3B30] group-hover:underline flex items-center gap-0.5"
                              >
                                Explore <FiArrowRight className="w-3 h-3" />
                              </a>
                            ) : (
                              <Link
                                href={linkHref}
                                className="font-bold text-[#FF3B30] group-hover:underline flex items-center gap-0.5"
                              >
                                {isInProgress ? "Resume" : "Explore"}{" "}
                                <FiArrowRight className="w-3 h-3" />
                              </Link>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>

              {/* My learning section */}
              <section className="space-y-2.5 sm:space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 border-b border-slate-100 dark:border-[#26262C] pb-2">
                  <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                    My learning
                  </h2>
                  <Link
                    href={routes.interviewPrep}
                    className="text-xs font-bold text-[#FF3B30] hover:underline flex items-center gap-1 shrink-0 self-start sm:self-auto"
                  >
                    View all sheets <FiArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                <div className="flex items-stretch gap-3 sm:gap-4 overflow-x-auto snap-x pb-3 pt-1 flex-nowrap scroll-smooth [&::-webkit-scrollbar]:h-[3px] [&::-webkit-scrollbar-track]:bg-slate-100 dark:[&::-webkit-scrollbar-track]:bg-[#1A1A1E] [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300 dark:[&::-webkit-scrollbar-thumb]:bg-[#2C2C34] [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400">
                  {loadingLearning ? (
                    <div className="w-full py-8 flex items-center justify-center text-xs font-bold text-slate-400">
                      Loading your learning sheets...
                    </div>
                  ) : activeSheetsWithProgress &&
                    activeSheetsWithProgress.length > 0 ? (
                    activeSheetsWithProgress.map((sheet, index) => {
                      const isDsa =
                        sheet.title?.toLowerCase().includes("dsa") ||
                        sheet.title?.toLowerCase().includes("data structures");
                      const isSystemDesign =
                        sheet.title?.toLowerCase().includes("system design") ||
                        sheet.title?.toLowerCase().includes("architecture");

                      let badgeLabel = "INTERVIEW SHEET";
                      let badgeStyle =
                        "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-100 dark:border-purple-900/60";
                      let btnStyle =
                        "bg-purple-50/50 dark:bg-purple-950/40 hover:bg-purple-50 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 border-purple-100 dark:border-purple-800/60";
                      let progressColor = "bg-purple-600";

                      if (sheet.isCourse) {
                        badgeLabel = "SHIKSHA COURSE";
                        badgeStyle =
                          "bg-rose-50 dark:bg-red-950/40 text-rose-700 dark:text-rose-300 border-rose-100 dark:border-red-900/60";
                        btnStyle =
                          "bg-rose-50/50 dark:bg-red-950/40 hover:bg-rose-50 dark:hover:bg-red-900/50 text-rose-700 dark:text-rose-300 border-rose-100 dark:border-red-800/60";
                        progressColor = "bg-[#FF3B30]";
                      } else if (isSystemDesign) {
                        badgeLabel = "SYSTEM DESIGN";
                        badgeStyle =
                          "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-100 dark:border-indigo-900/60";
                        btnStyle =
                          "bg-indigo-50/50 dark:bg-indigo-950/40 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border-indigo-100 dark:border-indigo-800/60";
                        progressColor = "bg-indigo-600";
                      } else if (!isDsa) {
                        const themeIndex = index % 2;
                        if (themeIndex === 0) {
                          badgeStyle =
                            "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-900/60";
                          btnStyle =
                            "bg-blue-50/50 dark:bg-blue-950/40 hover:bg-blue-50 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-800/60";
                          progressColor = "bg-blue-600";
                        } else {
                          badgeStyle =
                            "bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-900/60";
                          btnStyle =
                            "bg-amber-50/50 dark:bg-amber-950/40 hover:bg-amber-50 dark:hover:bg-amber-900/50 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/60";
                          progressColor = "bg-amber-500";
                        }
                      }

                      const progressPercentage =
                        sheet.progress?.percentage ?? 0;
                      const completedCount = sheet.progress?.completed ?? 0;
                      const totalCount = sheet.progress?.total ?? 0;

                      const sheetLogo = getSheetLogo(sheet);

                      return (
                        <div
                          key={sheet.slug || sheet._id || index}
                          className="w-[260px] sm:w-[290px] md:w-[320px] shrink-0 bg-white dark:bg-[#17171B] border border-slate-200/80 dark:border-[#26262C] hover:border-slate-300 dark:hover:border-[#383842] hover:shadow-md transition-all rounded-2xl overflow-hidden flex flex-col justify-between group snap-start"
                        >
                          {/* Top border badge strip */}
                          <div
                            className={`px-3 sm:px-3.5 py-1.5 text-[10px] font-extrabold tracking-wider uppercase ${badgeStyle}`}
                          >
                            {badgeLabel}
                          </div>

                          <div className="p-3.5 sm:p-4 md:p-5 flex flex-col justify-between flex-1">
                            <div>
                              <div className="flex items-center justify-between gap-2.5 sm:gap-3">
                                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                                  {sheetLogo ? (
                                    <img
                                      src={sheetLogo}
                                      alt={sheet.title}
                                      className="w-7 h-7 sm:w-8 h-8 sm:w-9 sm:h-9 object-contain shrink-0"
                                    />
                                  ) : (
                                    <FiFileText className="w-7 h-7 sm:w-8 h-8 text-[#FF3B30] shrink-0" />
                                  )}
                                  <div className="min-w-0">
                                    <h3 className="text-xs sm:text-sm md:text-[15px] font-extrabold text-slate-900 dark:text-white leading-snug truncate group-hover:text-[#FF3B30] transition-colors">
                                      {sheet.title}
                                    </h3>
                                  </div>
                                </div>
                                <div className="shrink-0 text-right">
                                  <span className="text-xs font-black text-slate-900 dark:text-white">
                                    {progressPercentage}%
                                  </span>
                                  <div className="text-[9px] font-bold text-slate-400">
                                    Solved
                                  </div>
                                </div>
                              </div>

                              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium line-clamp-2 mt-2 sm:mt-3">
                                {sheet.description ||
                                  "Curated list of topic-wise interview preparation problems."}
                              </p>
                            </div>

                            <div className="mt-3.5 sm:mt-4 pt-3 sm:pt-3.5 border-t border-slate-100 dark:border-[#26262C] space-y-2.5 sm:space-y-3">
                              <div className="space-y-1.5">
                                <div className="w-full bg-slate-100 dark:bg-[#26262C] rounded-full h-1.5 overflow-hidden">
                                  <div
                                    className={`${progressColor} h-1.5 rounded-full`}
                                    style={{ width: `${progressPercentage}%` }}
                                  />
                                </div>
                                <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400 font-semibold">
                                  <span>
                                    {completedCount} / {totalCount} Problems
                                    Solved
                                  </span>
                                  {progressPercentage > 0 && (
                                    <span className="text-[#FF3B30] font-bold">
                                      In Progress
                                    </span>
                                  )}
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  if (sheet.isCourse) {
                                    setActiveLearningItem({
                                      type: "course",
                                      slug: sheet.slug,
                                      title: sheet.title,
                                    });
                                    setActiveTab("shiksha");
                                  } else {
                                    setActiveLearningItem({
                                      type: "sheet",
                                      slug: sheet.slug,
                                      title: sheet.title,
                                    });
                                    setActiveTab("interview-prep");
                                  }
                                }}
                                className={`w-full py-2 sm:py-2.5 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 sm:gap-2 shadow-2xs hover:shadow-xs transition-all cursor-pointer ${btnStyle}`}
                              >
                                {sheet.isCourse
                                  ? "Continue Course"
                                  : "Resume Sheet"}{" "}
                                <FiArrowRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="w-full py-8 bg-white dark:bg-[#17171B] border border-slate-200/80 dark:border-[#26262C] rounded-2xl flex flex-col items-center justify-center text-center space-y-2 p-4 sm:p-6">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-[#222228] border border-slate-100 dark:border-[#2C2C34] flex items-center justify-center text-slate-400">
                        <FiBookOpen className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                        No active sheets in progress yet
                      </span>
                      <p className="text-[11px] text-slate-400 max-w-sm">
                        Start solving questions in any interview sheet to see
                        your progress here.
                      </p>
                      <Link
                        href={routes.interviewPrep}
                        className="px-3.5 py-1.5 bg-[#FF3B30] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#EE3126] transition-all"
                      >
                        Explore Interview Sheets
                      </Link>
                    </div>
                  )}
                </div>
              </section>

              {/* More features to explore */}
              <section className="space-y-2.5">
                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  More features to explore
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => navigateToTab("quizzes")}
                    className="bg-white dark:bg-[#17171B] border border-slate-200/80 dark:border-[#26262C] rounded-xl p-3 sm:p-3.5 flex items-center justify-between hover:border-slate-300 dark:hover:border-[#383842] dark:hover:bg-[#202026] transition-all cursor-pointer group text-left w-full"
                  >
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                      <div className="w-7 h-7 sm:w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <FiHelpCircle className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#FF3B30] transition-colors truncate">
                          Tech Quizzes
                        </h4>
                        <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                          Topic-wise quizzes &amp; skill assessments.
                        </p>
                      </div>
                    </div>
                    <FiArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:text-slate-500 shrink-0 ml-2 group-hover:translate-x-0.5 transition-transform" />
                  </button>

                  <a
                    href="https://oncampus.theboringeducation.com/aptitude"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white dark:bg-[#17171B] border border-slate-200/80 dark:border-[#26262C] rounded-xl p-3 sm:p-3.5 flex items-center justify-between hover:border-slate-300 dark:hover:border-[#383842] dark:hover:bg-[#202026] transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                      <div className="w-7 h-7 sm:w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <FiBarChart2 className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#FF3B30] transition-colors truncate">
                          Aptitude Practice
                        </h4>
                        <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                          Company mock tests &amp; placement questions.
                        </p>
                      </div>
                    </div>
                    <FiExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:text-slate-500 shrink-0 ml-2" />
                  </a>

                  <a
                    href="https://oncampus.theboringeducation.com/coresubjects"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white dark:bg-[#17171B] border border-slate-200/80 dark:border-[#26262C] rounded-xl p-3 sm:p-3.5 flex items-center justify-between hover:border-slate-300 dark:hover:border-[#383842] dark:hover:bg-[#202026] transition-all cursor-pointer group sm:col-span-2 lg:col-span-1"
                  >
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                      <div className="w-7 h-7 sm:w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <FiBookOpen className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#FF3B30] transition-colors truncate">
                          Core Subjects
                        </h4>
                        <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                          Master OS, DBMS, CN &amp; OOPs for interviews.
                        </p>
                      </div>
                    </div>
                    <FiExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:text-slate-500 shrink-0 ml-2" />
                  </a>
                </div>
              </section>
            </div>
          ) : activeTab === "explore" ? (
            /* Explore Catalog Tab */
            <div className="space-y-5 sm:space-y-6">
              {/* Header */}
              <div className="space-y-0.5 sm:space-y-1">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Explore Courses, Sheets &amp; Resources
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
                  Master interview questions, college core subjects &amp; full
                  stack engineering.
                </p>
              </div>

              {/* Filters & Search Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 bg-white dark:bg-[#17171B] p-2.5 sm:p-3.5 rounded-2xl border border-slate-200/80 dark:border-[#26262C] shadow-2xs">
                {/* Category Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none flex-nowrap">
                  {[
                    { id: "all", label: "All Catalog" },
                    { id: "courses", label: "Shiksha Courses" },
                    { id: "sheets", label: "Interview Sheets" },
                    { id: "core", label: "Core CS Subjects" },
                    { id: "resources", label: "Free Resources" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setExploreCategory(tab.id as any)}
                      className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all shrink-0 cursor-pointer ${
                        exploreCategory === tab.id
                          ? "bg-[#FF3B30] text-white shadow-xs"
                          : "bg-slate-50 dark:bg-[#222228] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#2A2A32] hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Search Input */}
                <div className="relative w-full sm:w-56 md:w-64 shrink-0">
                  <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-3.5 h-3.5 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search topics, languages..."
                    value={exploreSearchQuery}
                    onChange={(e) => setExploreSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-[#222228] border border-slate-200 dark:border-[#2C2C34] rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:bg-white dark:focus:bg-[#1F1F25] focus:border-[#FF3B30] transition-all"
                  />
                </div>
              </div>

              {/* Cards Grid with Fixed Uniform Shape */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {RECOMMENDED_DISCOVERY_ITEMS.filter((item) => {
                  if (exploreCategory === "courses" && item.type !== "course")
                    return false;
                  if (exploreCategory === "sheets" && item.type !== "sheet")
                    return false;
                  if (
                    exploreCategory === "core" &&
                    item.type !== "core-subject"
                  )
                    return false;
                  if (
                    exploreCategory === "resources" &&
                    item.type !== "resource"
                  )
                    return false;

                  if (exploreSearchQuery.trim()) {
                    const q = exploreSearchQuery.toLowerCase();
                    const matchTitle = item.title.toLowerCase().includes(q);
                    const matchDesc = item.desc.toLowerCase().includes(q);
                    const matchCat = item.category.toLowerCase().includes(q);
                    return matchTitle || matchDesc || matchCat;
                  }
                  return true;
                }).map((item, index) => {
                  const theme = CARD_THEMES[index % CARD_THEMES.length]!;
                  const logoUrl = item.logoKey
                    ? LANGUAGE_LOGOS[item.logoKey]
                    : null;

                  const enrolledMatch = item.slug
                    ? item.type === "course"
                      ? enrolledCourses.find(
                          (c) =>
                            c.slug === item.slug ||
                            c.title?.toLowerCase() === item.title.toLowerCase(),
                        )
                      : enrolledSheets.find(
                          (s) =>
                            s.slug === item.slug ||
                            s.title?.toLowerCase() === item.title.toLowerCase(),
                        )
                    : null;

                  const isInProgress =
                    enrolledMatch &&
                    ((enrolledMatch.progress?.completed ?? 0) > 0 ||
                      (enrolledMatch.progress?.percentage ?? 0) > 0);

                  const progressPercentage =
                    enrolledMatch?.progress?.percentage ?? 0;
                  const completedCount =
                    enrolledMatch?.progress?.completed ?? 0;
                  const totalCount = enrolledMatch?.progress?.total ?? 0;

                  let badgeText = item.category;
                  let badgeStyle = theme.badgeBg;

                  if (
                    (item.type === "sheet" || item.type === "course") &&
                    isInProgress
                  ) {
                    badgeText = "IN PROGRESS";
                    badgeStyle = "bg-[#FF3B30] text-white font-extrabold";
                  }

                  const linkHref =
                    item.type === "sheet" && enrolledMatch?.slug
                      ? `/interview-prep/${enrolledMatch.slug}`
                      : item.url;

                  return (
                    <div
                      key={item.id}
                      className={`bg-white dark:bg-[#17171B] border rounded-2xl flex flex-col shadow-xs hover:shadow-md transition-all group overflow-hidden ${
                        isInProgress
                          ? "border-slate-200 dark:border-[#26262C]"
                          : "border-slate-200/80 dark:border-[#26262C] hover:border-slate-300 dark:hover:border-[#383842]"
                      }`}
                    >
                      {/* Full-width top badge strip */}
                      <div
                        className={`px-3 sm:px-3.5 py-1.5 text-[10px] font-extrabold tracking-wider uppercase ${badgeStyle}`}
                      >
                        {badgeText}
                      </div>

                      {/* Language logo — interview sheets & shiksha courses */}
                      {(item.type === "sheet" || item.type === "course") &&
                        logoUrl && (
                          <div className="px-3.5 sm:px-5 pt-3 sm:pt-4 flex justify-end">
                            <img
                              src={logoUrl}
                              alt={item.title}
                              className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                            />
                          </div>
                        )}

                      {/* Title + Description */}
                      <div className="px-3.5 sm:px-5 pt-2 pb-3.5 sm:pb-4 flex-1 flex flex-col gap-1.5 sm:gap-2">
                        <h3
                          className="text-sm sm:text-[15px] font-bold text-slate-900 dark:text-white leading-snug"
                          title={item.title}
                        >
                          {item.title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3 sm:line-clamp-none">
                          {item.desc}
                        </p>

                        {/* Progress / Status */}
                        <div className="mt-2.5 sm:mt-3">
                          {isInProgress ? (
                            <div className="space-y-1.5">
                              {/* Thin colored bar */}
                              <div className="w-full bg-slate-100 dark:bg-[#26262C] rounded-full h-1 overflow-hidden">
                                <div
                                  className="h-1 rounded-full bg-[#FF3B30]"
                                  style={{ width: `${progressPercentage}%` }}
                                />
                              </div>
                              <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400">
                                <span className="font-bold text-slate-700 dark:text-slate-200">
                                  {progressPercentage}% Solved
                                </span>
                                <span>
                                  {completedCount} / {totalCount || 450}
                                </span>
                              </div>
                            </div>
                          ) : (
                            /* Gray pill */
                            <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-slate-50 dark:bg-[#222228] border border-slate-200 dark:border-[#2C2C34] rounded-lg text-[10px] sm:text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                              <FiCheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                              {item.type === "core-subject"
                                ? "Core CS Subject"
                                : item.type === "resource"
                                  ? "Developer Guide • 100% Free"
                                  : item.type === "course"
                                    ? "Shiksha Course • 100% Free"
                                    : "Comprehensive Practice Sheet"}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="px-3.5 sm:px-5 py-2.5 sm:py-3 border-t border-slate-100 dark:border-[#26262C] flex items-center justify-between text-[11px]">
                        <span className="flex items-center gap-1.5 text-slate-400 font-medium">
                          {item.type === "course" ? (
                            <FiPlayCircle className="w-3.5 h-3.5" />
                          ) : (
                            <FiFileText className="w-3.5 h-3.5" />
                          )}
                          {item.type === "core-subject"
                            ? "OnCampus Vault"
                            : item.type === "resource"
                              ? "Resource App"
                              : item.type === "course"
                                ? "Shiksha Course"
                                : "Interview Sheet"}
                        </span>
                        {item.isExternal ? (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`font-bold text-xs flex items-center gap-1 ${theme.linkColor} hover:underline shrink-0`}
                          >
                            Explore <FiArrowRight className="w-3.5 h-3.5" />
                          </a>
                        ) : (
                          <Link
                            href={linkHref}
                            className={`font-bold text-xs flex items-center gap-1 shrink-0 hover:underline ${
                              isInProgress ? "text-[#FF3B30]" : theme.linkColor
                            }`}
                          >
                            {isInProgress ? "Resume" : "Explore"}{" "}
                            <FiArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* My Learning Tab */
            <div className="space-y-4 sm:space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 border-b border-slate-100 dark:border-[#26262C] pb-2.5">
                <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                  My Active Learning
                </h2>
                <Link
                  href={routes.interviewPrep}
                  className="text-xs font-bold text-[#FF3B30] hover:underline flex items-center gap-1 self-start sm:self-auto"
                >
                  Explore all sheets <FiArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {loadingLearning ? (
                  <div className="col-span-full py-12 flex items-center justify-center text-xs font-bold text-slate-400 dark:text-slate-500">
                    Loading your enrolled sheets...
                  </div>
                ) : activeSheetsWithProgress &&
                  activeSheetsWithProgress.length > 0 ? (
                  activeSheetsWithProgress.map((sheet, index) => {
                    const isDsa =
                      sheet.title?.toLowerCase().includes("dsa") ||
                      sheet.title?.toLowerCase().includes("data structures");
                    const isSystemDesign =
                      sheet.title?.toLowerCase().includes("system design") ||
                      sheet.title?.toLowerCase().includes("architecture");

                    let badgeLabel = "INTERVIEW SHEET";
                    let badgeStyle =
                      "bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/40";
                    let btnStyle =
                      "bg-purple-50/50 hover:bg-purple-50 text-purple-700 border-purple-100 dark:bg-[#1E1E24] dark:border-[#2C2C34] dark:text-purple-300 dark:hover:bg-[#282830]";
                    let progressColor = "bg-purple-600";

                    if (sheet.isCourse) {
                      badgeLabel = "SHIKSHA COURSE";
                      badgeStyle =
                        "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/40";
                      btnStyle =
                        "bg-rose-50/50 hover:bg-rose-50 text-rose-700 border-rose-100 dark:bg-[#1E1E24] dark:border-[#2C2C34] dark:text-rose-300 dark:hover:bg-[#282830]";
                      progressColor = "bg-[#FF3B30]";
                    } else if (isSystemDesign) {
                      badgeLabel = "SYSTEM DESIGN";
                      badgeStyle =
                        "bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/40";
                      btnStyle =
                        "bg-indigo-50/50 hover:bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-[#1E1E24] dark:border-[#2C2C34] dark:text-indigo-300 dark:hover:bg-[#282830]";
                      progressColor = "bg-indigo-600";
                    } else if (!isDsa) {
                      const themeIndex = index % 2;
                      if (themeIndex === 0) {
                        badgeStyle =
                          "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/40";
                        btnStyle =
                          "bg-blue-50/50 hover:bg-blue-50 text-blue-700 border-blue-100 dark:bg-[#1E1E24] dark:border-[#2C2C34] dark:text-blue-300 dark:hover:bg-[#282830]";
                        progressColor = "bg-blue-600";
                      } else {
                        badgeStyle =
                          "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/40";
                        btnStyle =
                          "bg-amber-50/50 hover:bg-amber-50 text-amber-800 border-amber-200 dark:bg-[#1E1E24] dark:border-[#2C2C34] dark:text-amber-300 dark:hover:bg-[#282830]";
                        progressColor = "bg-amber-500";
                      }
                    }

                    const progressPercentage = sheet.progress?.percentage ?? 0;
                    const completedCount = sheet.progress?.completed ?? 0;
                    const totalCount = sheet.progress?.total ?? 0;

                    const sheetLogo = getSheetLogo(sheet);

                    return (
                      <div
                        key={sheet.slug || sheet._id || index}
                        className="bg-white dark:bg-[#17171B] border border-slate-200/80 dark:border-[#26262C] hover:border-slate-300 dark:hover:border-[#383842] hover:shadow-md transition-all rounded-2xl overflow-hidden flex flex-col justify-between group"
                      >
                        {/* Top border badge strip */}
                        <div
                          className={`px-3 sm:px-3.5 py-1.5 text-[10px] font-extrabold tracking-wider uppercase ${badgeStyle}`}
                        >
                          {badgeLabel}
                        </div>

                        <div className="p-3.5 sm:p-4 md:p-5 flex flex-col justify-between flex-1">
                          <div>
                            <div className="flex items-center justify-between gap-2.5 sm:gap-3">
                              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                                {sheetLogo ? (
                                  <img
                                    src={sheetLogo}
                                    alt={sheet.title}
                                    className="w-7 h-7 sm:w-8 h-8 sm:w-9 sm:h-9 object-contain shrink-0"
                                  />
                                ) : (
                                  <FiFileText className="w-7 h-7 sm:w-8 h-8 text-[#FF3B30] shrink-0" />
                                )}
                                <div className="min-w-0">
                                  <h3 className="text-xs sm:text-sm md:text-[15px] font-extrabold text-slate-900 dark:text-white leading-snug truncate group-hover:text-[#FF3B30] transition-colors">
                                    {sheet.title}
                                  </h3>
                                </div>
                              </div>
                              <div className="shrink-0 text-right">
                                <span className="text-xs font-black text-slate-900 dark:text-white">
                                  {progressPercentage}%
                                </span>
                                <div className="text-[9px] font-bold text-slate-400 dark:text-slate-500">
                                  Solved
                                </div>
                              </div>
                            </div>

                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium line-clamp-2 mt-2 sm:mt-3">
                              {sheet.description ||
                                "Curated list of topic-wise interview preparation problems."}
                            </p>
                          </div>

                          <div className="mt-3.5 sm:mt-4 pt-3 sm:pt-3.5 border-t border-slate-100 dark:border-[#26262C] space-y-2.5 sm:space-y-3">
                            <div className="space-y-1.5">
                              <div className="w-full bg-slate-100 dark:bg-[#24242C] rounded-full h-1.5 overflow-hidden">
                                <div
                                  className={`${progressColor} h-1.5 rounded-full`}
                                  style={{ width: `${progressPercentage}%` }}
                                />
                              </div>
                              <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-400 font-semibold">
                                <span>
                                  {completedCount} / {totalCount} Problems
                                  Solved
                                </span>
                                {progressPercentage > 0 && (
                                  <span className="text-[#FF3B30] font-bold">
                                    In Progress
                                  </span>
                                )}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                if (sheet.isCourse) {
                                  navigateToCourse(sheet.slug, sheet.title);
                                } else {
                                  navigateToSheet(sheet.slug, sheet.title);
                                }
                              }}
                              className={`w-full py-2 sm:py-2.5 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 sm:gap-2 shadow-2xs hover:shadow-xs transition-all cursor-pointer ${btnStyle}`}
                            >
                              {sheet.isCourse
                                ? "Continue Course"
                                : "Resume Sheet"}{" "}
                              <FiArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : null}

                {/* Enrolled Shiksha Courses */}
                {enrolledCourses &&
                  enrolledCourses.length > 0 &&
                  enrolledCourses.map((course: any, index: number) => {
                    const courseDef = SHIKSHA_COURSES.find(
                      (c) =>
                        c.slug === course.slug ||
                        c.title?.toLowerCase() === course.title?.toLowerCase(),
                    );
                    const logoUrl = courseDef?.logoKey
                      ? LANGUAGE_LOGOS[courseDef.logoKey]
                      : null;
                    const progressPct = course.progress?.percentage ?? 0;
                    const completedChapters = course.progress?.completed ?? 0;
                    const totalChapters = course.progress?.total ?? 0;
                    return (
                      <div
                        key={course.slug || course._id || index}
                        className="bg-white dark:bg-[#17171B] border border-slate-200/80 dark:border-[#26262C] hover:border-[#FF3B30]/30 hover:shadow-md transition-all rounded-2xl overflow-hidden flex flex-col justify-between group"
                      >
                        <div className="px-3 sm:px-3.5 py-1.5 text-[10px] font-extrabold tracking-wider uppercase bg-[#FF3B30] text-white">
                          SHIKSHA COURSE
                        </div>
                        <div className="p-3.5 sm:p-4 md:p-5 flex flex-col justify-between flex-1">
                          <div>
                            <div className="flex items-center justify-between gap-2.5 sm:gap-3">
                              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                                {logoUrl ? (
                                  <img
                                    src={logoUrl}
                                    alt={course.title}
                                    className="w-7 h-7 sm:w-8 h-8 sm:w-9 sm:h-9 object-contain shrink-0"
                                  />
                                ) : (
                                  <FiPlayCircle className="w-7 h-7 sm:w-8 h-8 text-[#FF3B30] shrink-0" />
                                )}
                                <h3 className="text-xs sm:text-sm md:text-[15px] font-extrabold text-slate-900 dark:text-white leading-snug truncate group-hover:text-[#FF3B30] transition-colors">
                                  {course.title}
                                </h3>
                              </div>
                              <div className="shrink-0 text-right">
                                <span className="text-xs font-black text-slate-900 dark:text-white">
                                  {progressPct}%
                                </span>
                                <div className="text-[9px] font-bold text-slate-400 dark:text-slate-500">
                                  Done
                                </div>
                              </div>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium line-clamp-2 mt-2 sm:mt-3">
                              {course.description ||
                                courseDef?.desc ||
                                "Full-stack course on Shiksha."}
                            </p>
                          </div>
                          <div className="mt-3.5 sm:mt-4 pt-3 sm:pt-3.5 border-t border-slate-100 dark:border-[#26262C] space-y-2.5 sm:space-y-3">
                            <div className="space-y-1.5">
                              <div className="w-full bg-slate-100 dark:bg-[#24242C] rounded-full h-1.5 overflow-hidden">
                                <div
                                  className="bg-[#FF3B30] h-1.5 rounded-full"
                                  style={{ width: `${progressPct}%` }}
                                />
                              </div>
                              <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-400 font-semibold">
                                <span>
                                  {completedChapters} / {totalChapters} Chapters
                                  Done
                                </span>
                                {progressPct > 0 && (
                                  <span className="text-[#FF3B30] font-bold">
                                    In Progress
                                  </span>
                                )}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                navigateToCourse(course.slug, course.title);
                              }}
                              className="w-full py-2 sm:py-2.5 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 sm:gap-2 shadow-2xs hover:shadow-xs transition-all bg-red-50/50 hover:bg-red-50 text-[#FF3B30] border border-red-100 dark:bg-[#1E1E24] dark:border-[#2C2C34] dark:text-[#FF4D4D] dark:hover:bg-[#282830] cursor-pointer"
                            >
                              Continue Course{" "}
                              <FiArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                {!loadingLearning &&
                  (!activeSheetsWithProgress ||
                    activeSheetsWithProgress.length === 0) &&
                  (!enrolledCourses || enrolledCourses.length === 0) && (
                    <div className="col-span-full py-8 bg-white dark:bg-[#17171B] border border-slate-200/80 dark:border-[#26262C] rounded-2xl flex flex-col items-center justify-center text-center space-y-2 p-4 sm:p-6">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-[#1E1E24] border border-slate-100 dark:border-[#2C2C34] flex items-center justify-center text-slate-400 dark:text-slate-300">
                        <FiBookOpen className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-slate-700 dark:text-white">
                        No active learning in progress yet
                      </span>
                      <p className="text-[11px] text-slate-400 dark:text-slate-400 max-w-sm">
                        Start solving questions in any interview sheet or course
                        to track your progress here.
                      </p>
                      <Link
                        href={routes.interviewPrep}
                        className="px-3.5 py-1.5 bg-[#FF3B30] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#EE3126] transition-all"
                      >
                        Explore Interview Sheets
                      </Link>
                    </div>
                  )}
              </div>
            </div>
          )}
        </main>
      </div>

      {showQuiz && (
        <div className="w-full pt-2">
          <PersonalizationQuiz
            initialData={personalization}
            onSubmit={handleQuizSubmit}
            onClose={() => {
              setShowQuiz(false);
              setIsCookingQuiz(false);
            }}
            isSaving={isSavingQuiz}
            onCooking={setIsCookingQuiz}
          />
        </div>
      )}
    </div>
  );
};
