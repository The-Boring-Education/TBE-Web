import { routes } from "@tbe/constants";
import { sendRequest } from "@tbe/utils";
import Link from "next/link";
import React, { useEffect, useState } from "react";
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
  FiPlayCircle,
  FiSearch,
  FiSettings,
  FiTarget,
} from "react-icons/fi";

import type { PersonalizationQuizData } from "./PersonalizationQuiz";
import { PersonalizationQuiz } from "./PersonalizationQuiz";

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
    url: "https://quiz.theboringeducation.com",
    isExternal: true,
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
    categoryStyle:
      "bg-slate-100 dark:bg-muted text-slate-800 border-slate-200 dark:border-border",
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
];

const LANGUAGE_LOGOS: Record<string, string> = {
  logic:
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='none' stroke='%23FF3B30' stroke-width='8' stroke-linecap='round' stroke-linejoin='round'><path d='M20 25 H80 M35 25 L65 50 L35 75 M20 75 H80'/></svg>",
  javascript:
    "https://raw.githubusercontent.com/devicons/devicon/master/icons/javascript/javascript-original.svg",
  typescript:
    "https://raw.githubusercontent.com/devicons/devicon/master/icons/typescript/typescript-original.svg",
  python:
    "https://raw.githubusercontent.com/devicons/devicon/master/icons/python/python-original.svg",
  java: "https://raw.githubusercontent.com/devicons/devicon/master/icons/java/java-original.svg",
  react:
    "https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original.svg",
  nodejs:
    "https://raw.githubusercontent.com/devicons/devicon/master/icons/nodejs/nodejs-original.svg",
  node: "https://raw.githubusercontent.com/devicons/devicon/master/icons/nodejs/nodejs-original.svg",
  cplusplus:
    "https://raw.githubusercontent.com/devicons/devicon/master/icons/cplusplus/cplusplus-original.svg",
  cpp: "https://raw.githubusercontent.com/devicons/devicon/master/icons/cplusplus/cplusplus-original.svg",
  c: "https://raw.githubusercontent.com/devicons/devicon/master/icons/c/c-original.svg",
  go: "https://raw.githubusercontent.com/devicons/devicon/master/icons/go/go-original.svg",
  golang:
    "https://raw.githubusercontent.com/devicons/devicon/master/icons/go/go-original.svg",
  postgresql:
    "https://raw.githubusercontent.com/devicons/devicon/master/icons/postgresql/postgresql-original.svg",
  postgres:
    "https://raw.githubusercontent.com/devicons/devicon/master/icons/postgresql/postgresql-original.svg",
  sql: "https://raw.githubusercontent.com/devicons/devicon/master/icons/postgresql/postgresql-original.svg",
  dbms: "https://raw.githubusercontent.com/devicons/devicon/master/icons/postgresql/postgresql-original.svg",
  db: "https://raw.githubusercontent.com/devicons/devicon/master/icons/postgresql/postgresql-original.svg",
  database:
    "https://raw.githubusercontent.com/devicons/devicon/master/icons/postgresql/postgresql-original.svg",
  mongodb:
    "https://raw.githubusercontent.com/devicons/devicon/master/icons/mongodb/mongodb-original.svg",
  dsa: "https://raw.githubusercontent.com/devicons/devicon/master/icons/cplusplus/cplusplus-original.svg",
  html: "https://raw.githubusercontent.com/devicons/devicon/master/icons/html5/html5-original.svg",
  css: "https://raw.githubusercontent.com/devicons/devicon/master/icons/css3/css3-original.svg",
};

const getSheetLogo = (sheet: any) => {
  const title = (sheet?.title || sheet?.name || "").toLowerCase();
  const slug = (sheet?.slug || "").toLowerCase();

  const orderedKeys = [
    "javascript",
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
  ];

  for (const key of orderedKeys) {
    if (slug.includes(key) || title.includes(key)) {
      return LANGUAGE_LOGOS[key];
    }
  }

  return sheet?.thumbnail || sheet?.image || null;
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
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "explore" | "ecosystem" | "mylearning"
  >("dashboard");
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

  const handleOpenQuiz = () => {
    setShowQuiz(true);
    setIsCookingQuiz(false);
    setIsSavingQuiz(false);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] dark:bg-background flex relative font-sans">
      <div
        className={`w-full flex ${
          !showQuiz || isCookingQuiz || isSavingQuiz ? "flex" : "hidden"
        }`}
      >
        {/* Left Column: Fixed Navigation Sidebar */}
        <aside
          className={`${
            isSidebarCollapsed
              ? "w-[56px] sm:w-[64px] px-1 sm:px-1.5"
              : "w-[220px] sm:w-[240px] px-2 sm:px-2.5"
          } border-r border-[#E8ECF2] dark:border-border bg-white dark:bg-card min-h-screen sticky top-0 flex flex-col justify-between py-3 shrink-0 transition-[width,padding] duration-300 ease-in-out select-none z-30 overflow-hidden`}
        >
          <div className="space-y-2">
            {/* Top Collapse Toggle Button */}
            <div
              className={`flex items-center ${
                isSidebarCollapsed ? "justify-center" : "justify-end"
              } pb-0.5`}
            >
              <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="w-6 h-6 rounded-md flex items-center justify-center text-slate-400 dark:text-muted-foreground hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-muted dark:bg-muted transition-colors cursor-pointer shrink-0"
                title={
                  isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
                }
              >
                {isSidebarCollapsed ? (
                  <FiChevronsRight className="w-3 h-3" />
                ) : (
                  <FiChevronsLeft className="w-3 h-3" />
                )}
              </button>
            </div>

            <nav className="space-y-1.5">
              {/* Dashboard Tab */}
              <div>
                <button
                  onClick={() => setActiveTab("dashboard")}
                  title={isSidebarCollapsed ? "Dashboard" : undefined}
                  className={`w-full relative flex items-center ${
                    isSidebarCollapsed ? "justify-center px-0" : "px-2 gap-2.5"
                  } py-1.5 rounded-lg text-[13px] transition-colors duration-200 cursor-pointer overflow-hidden ${
                    activeTab === "dashboard"
                      ? "bg-red-50/70 text-[#FF4D4D] font-medium shadow-2xs"
                      : "text-slate-600 dark:text-muted-foreground hover:bg-slate-50 dark:hover:bg-muted dark:bg-muted hover:text-slate-900 dark:text-foreground font-normal"
                  }`}
                >
                  {activeTab === "dashboard" && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-[#FF4D4D] rounded-r-full" />
                  )}
                  <div className="w-5 h-5 flex items-center justify-center shrink-0">
                    <FiGrid
                      className={`w-[17px] h-[17px] ${
                        activeTab === "dashboard"
                          ? "text-[#FF4D4D]"
                          : "text-slate-500 dark:text-muted-foreground"
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
                  {!isSidebarCollapsed && activeTab === "dashboard" && (
                    <svg
                      className="w-3.5 h-3.5 text-[#FF4D4D] shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  )}
                </button>
              </div>

              {/* LEARNING Section */}
              <div className="space-y-0.5">
                <div
                  className={`px-2 text-[10px] font-bold text-slate-400 dark:text-muted-foreground tracking-wider uppercase whitespace-nowrap overflow-hidden transition-all duration-200 ${
                    isSidebarCollapsed
                      ? "opacity-0 h-0 my-0"
                      : "opacity-100 py-0.5"
                  }`}
                >
                  Learning
                </div>
                <div className="space-y-0.5">
                  <button
                    onClick={() => setActiveTab("mylearning")}
                    title={isSidebarCollapsed ? "My Learning" : undefined}
                    className={`w-full relative flex items-center ${
                      isSidebarCollapsed
                        ? "justify-center px-0"
                        : "px-2 gap-2.5"
                    } py-1.5 rounded-lg text-[13px] transition-colors duration-200 cursor-pointer overflow-hidden ${
                      activeTab === "mylearning"
                        ? "bg-red-50/70 text-[#FF4D4D] font-medium shadow-2xs"
                        : "text-slate-600 dark:text-muted-foreground hover:bg-slate-50 dark:hover:bg-muted dark:bg-muted hover:text-slate-900 dark:text-foreground font-normal"
                    }`}
                  >
                    {activeTab === "mylearning" && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-[#FF4D4D] rounded-r-full" />
                    )}
                    <div className="w-5 h-5 flex items-center justify-center shrink-0">
                      <FiBookOpen
                        className={`w-[17px] h-[17px] ${
                          activeTab === "mylearning"
                            ? "text-[#FF4D4D]"
                            : "text-slate-500 dark:text-muted-foreground"
                        }`}
                      />
                    </div>
                    <span
                      className={`whitespace-nowrap flex-1 text-left truncate transition-opacity duration-200 ${
                        isSidebarCollapsed ? "hidden" : "block"
                      }`}
                    >
                      My Learning
                    </span>
                    {!isSidebarCollapsed && activeTab === "mylearning" && (
                      <svg
                        className="w-3.5 h-3.5 text-[#FF4D4D] shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    )}
                  </button>

                  <button
                    onClick={() => setActiveTab("explore")}
                    title={isSidebarCollapsed ? "Catalog" : undefined}
                    className={`w-full relative flex items-center ${
                      isSidebarCollapsed
                        ? "justify-center px-0"
                        : "px-2 gap-2.5"
                    } py-1.5 rounded-lg text-[13px] transition-colors duration-200 cursor-pointer overflow-hidden ${
                      activeTab === "explore"
                        ? "bg-red-50/70 text-[#FF4D4D] font-medium shadow-2xs"
                        : "text-slate-600 dark:text-muted-foreground hover:bg-slate-50 dark:hover:bg-muted dark:bg-muted hover:text-slate-900 dark:text-foreground font-normal"
                    }`}
                  >
                    {activeTab === "explore" && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-[#FF4D4D] rounded-r-full" />
                    )}
                    <div className="w-5 h-5 flex items-center justify-center shrink-0">
                      <FiCompass
                        className={`w-[17px] h-[17px] ${
                          activeTab === "explore"
                            ? "text-[#FF4D4D]"
                            : "text-slate-500 dark:text-muted-foreground"
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
                    {!isSidebarCollapsed && activeTab === "explore" && (
                      <svg
                        className="w-3.5 h-3.5 text-[#FF4D4D] shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    )}
                  </button>

                  <a
                    href={routes.shiksha}
                    title={isSidebarCollapsed ? "Shiksha" : undefined}
                    className={`w-full flex items-center ${
                      isSidebarCollapsed
                        ? "justify-center px-0"
                        : "px-2 gap-2.5"
                    } py-1.5 rounded-lg text-[13px] text-slate-600 dark:text-muted-foreground hover:bg-slate-50 dark:hover:bg-muted dark:bg-muted hover:text-slate-900 dark:text-foreground font-normal transition-colors overflow-hidden`}
                  >
                    <div className="w-5 h-5 flex items-center justify-center shrink-0">
                      <FiPlayCircle className="w-[17px] h-[17px] text-slate-500 dark:text-muted-foreground" />
                    </div>
                    <span
                      className={`whitespace-nowrap flex-1 text-left truncate transition-opacity duration-200 ${
                        isSidebarCollapsed ? "hidden" : "block"
                      }`}
                    >
                      Shiksha
                    </span>
                  </a>

                  <button
                    onClick={() => setActiveTab("ecosystem")}
                    title={isSidebarCollapsed ? "Ecosystem" : undefined}
                    className={`w-full relative flex items-center ${
                      isSidebarCollapsed
                        ? "justify-center px-0"
                        : "px-2 gap-2.5"
                    } py-1.5 rounded-lg text-[13px] transition-colors duration-200 cursor-pointer overflow-hidden ${
                      activeTab === "ecosystem"
                        ? "bg-red-50/70 text-[#FF4D4D] font-medium shadow-2xs"
                        : "text-slate-600 dark:text-muted-foreground hover:bg-slate-50 dark:hover:bg-muted dark:bg-muted hover:text-slate-900 dark:text-foreground font-normal"
                    }`}
                  >
                    {activeTab === "ecosystem" && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-[#FF4D4D] rounded-r-full" />
                    )}
                    <div className="w-5 h-5 flex items-center justify-center shrink-0">
                      <FiLayers
                        className={`w-[17px] h-[17px] ${
                          activeTab === "ecosystem"
                            ? "text-[#FF4D4D]"
                            : "text-slate-500 dark:text-muted-foreground"
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
                    {!isSidebarCollapsed && activeTab === "ecosystem" && (
                      <svg
                        className="w-3.5 h-3.5 text-[#FF4D4D] shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Separator */}
              <div className="border-b border-[#E8ECF2] my-1" />

              {/* PRACTICE Section */}
              <div className="space-y-0.5">
                <div
                  className={`px-2 text-[10px] font-bold text-slate-400 dark:text-muted-foreground tracking-wider uppercase whitespace-nowrap overflow-hidden transition-all duration-200 ${
                    isSidebarCollapsed
                      ? "opacity-0 h-0 my-0"
                      : "opacity-100 py-0.5"
                  }`}
                >
                  Practice
                </div>
                <div className="space-y-0.5">
                  <a
                    href="https://dsayatra.theboringeducation.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    title={isSidebarCollapsed ? "DSA Practice" : undefined}
                    className={`w-full flex items-center ${
                      isSidebarCollapsed
                        ? "justify-center px-0"
                        : "px-2 gap-2.5"
                    } py-1.5 rounded-lg text-[13px] text-slate-600 dark:text-muted-foreground hover:bg-slate-50 dark:hover:bg-muted dark:bg-muted hover:text-slate-900 dark:text-foreground font-normal transition-colors overflow-hidden`}
                  >
                    <div className="w-5 h-5 flex items-center justify-center shrink-0">
                      <FiCode className="w-[17px] h-[17px] text-slate-500 dark:text-muted-foreground" />
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
                    href={routes.interviewPrep}
                    title={isSidebarCollapsed ? "Interview Prep" : undefined}
                    className={`w-full flex items-center ${
                      isSidebarCollapsed
                        ? "justify-center px-0"
                        : "px-2 gap-2.5"
                    } py-1.5 rounded-lg text-[13px] text-slate-600 dark:text-muted-foreground hover:bg-slate-50 dark:hover:bg-muted dark:bg-muted hover:text-slate-900 dark:text-foreground font-normal transition-colors overflow-hidden`}
                  >
                    <div className="w-5 h-5 flex items-center justify-center shrink-0">
                      <FiTarget className="w-[17px] h-[17px] text-slate-500 dark:text-muted-foreground" />
                    </div>
                    <span
                      className={`whitespace-nowrap flex-1 text-left truncate transition-opacity duration-200 ${
                        isSidebarCollapsed ? "hidden" : "block"
                      }`}
                    >
                      Interview Prep
                    </span>
                  </a>

                  <a
                    href="https://oncampus.theboringeducation.com/aptitude"
                    target="_blank"
                    rel="noopener noreferrer"
                    title={isSidebarCollapsed ? "Aptitude Practice" : undefined}
                    className={`w-full flex items-center ${
                      isSidebarCollapsed
                        ? "justify-center px-0"
                        : "px-2 gap-2.5"
                    } py-1.5 rounded-lg text-[13px] text-slate-600 dark:text-muted-foreground hover:bg-slate-50 dark:hover:bg-muted dark:bg-muted hover:text-slate-900 dark:text-foreground font-normal transition-colors overflow-hidden`}
                  >
                    <div className="w-5 h-5 flex items-center justify-center shrink-0">
                      <FiBarChart2 className="w-[17px] h-[17px] text-slate-500 dark:text-muted-foreground" />
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
              <div className="border-b border-[#E8ECF2] my-1" />

              {/* COMMUNITY Section */}
              <div className="space-y-0.5">
                <div
                  className={`px-2 text-[10px] font-bold text-slate-400 dark:text-muted-foreground tracking-wider uppercase whitespace-nowrap overflow-hidden transition-all duration-200 ${
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
                      isSidebarCollapsed
                        ? "justify-center px-0"
                        : "px-2 gap-2.5"
                    } py-1.5 rounded-lg text-[13px] text-slate-600 dark:text-muted-foreground hover:bg-slate-50 dark:hover:bg-muted dark:bg-muted hover:text-slate-900 dark:text-foreground font-normal transition-colors overflow-hidden`}
                  >
                    <div className="w-5 h-5 flex items-center justify-center shrink-0">
                      <FiFileText className="w-[17px] h-[17px] text-slate-500 dark:text-muted-foreground" />
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

          {/* Bottom Anchored Settings Area */}
          <div className="pt-2 border-t border-[#E8ECF2] mt-auto">
            <Link
              href="/user/profile"
              title="Settings"
              className={`w-full bg-slate-50 dark:bg-muted/70 hover:bg-slate-100 dark:hover:bg-muted dark:bg-muted text-slate-600 dark:text-muted-foreground hover:text-slate-900 dark:text-foreground rounded-lg ${
                isSidebarCollapsed ? "justify-center px-0" : "px-2 gap-2.5"
              } py-1.5 text-[13px] font-normal flex items-center border border-[#E8ECF2] transition-colors cursor-pointer overflow-hidden`}
            >
              <div className="w-5 h-5 flex items-center justify-center shrink-0">
                <FiSettings className="w-[17px] h-[17px] text-slate-500 dark:text-muted-foreground" />
              </div>
              <span
                className={`whitespace-nowrap flex-1 text-left truncate transition-opacity duration-200 ${
                  isSidebarCollapsed ? "hidden" : "block"
                }`}
              >
                Settings
              </span>
              {!isSidebarCollapsed && (
                <svg
                  className="w-3.5 h-3.5 text-slate-400 dark:text-muted-foreground shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              )}
            </Link>
          </div>
        </aside>

        {/* Right Column: Main Content Area */}
        <main className="flex-1 min-w-0 p-3 sm:p-5 md:p-6 lg:p-8 space-y-5 sm:space-y-7 overflow-y-auto overflow-x-hidden">
          {activeTab === "ecosystem" ? (
            /* Ecosystem Tab */
            <div className="space-y-4">
              <section className="space-y-3">
                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-foreground">
                  Quick access to TBE Ecosystem
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {TBE_ECOSYSTEM_APPS.map((app, i) => (
                    <a
                      key={app.name}
                      href={app.url}
                      target={app.isExternal ? "_blank" : undefined}
                      rel={app.isExternal ? "noopener noreferrer" : undefined}
                      className={`group bg-white dark:bg-card hover:bg-slate-50 dark:hover:bg-muted dark:bg-muted/80 border border-slate-200/80 dark:border-border hover:border-[#FF3B30]/50 transition-all hover:shadow-md rounded-2xl p-3.5 sm:p-4 flex min-w-0 overflow-hidden ${i % 2 === 0 ? "flex-col" : "flex-col-reverse"}`}
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
                            ? "mt-auto pt-2.5 border-t border-slate-100"
                            : "mb-auto pb-2.5 border-b border-slate-100"
                        }
                      >
                        <div className="flex items-center justify-between gap-1">
                          <h3 className="text-sm font-extrabold text-slate-900 dark:text-foreground group-hover:text-[#FF3B30] transition-colors leading-tight">
                            {app.name}
                          </h3>
                          <FiArrowUpRight className="w-3.5 h-3.5 text-slate-400 dark:text-muted-foreground group-hover:text-[#FF3B30] shrink-0" />
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-muted-foreground font-medium leading-snug mt-0.5">
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
            <div className="space-y-5 sm:space-y-6">
              {/* Greeting Header */}
              <div className="space-y-0.5">
                <h1 className="text-lg sm:text-xl md:text-2xl font-extrabold text-[#10162F] tracking-tight">
                  {getGreeting()}, {user?.name?.split(" ")[0] || "Nitin"} 👋
                </h1>
                <p className="text-xs text-slate-500 dark:text-muted-foreground font-semibold">
                  Keep learning, keep growing!
                </p>
              </div>

              {/* Recommended for you */}
              <section className="space-y-2.5 sm:space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-foreground">
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
                    className="flex items-stretch gap-3 sm:gap-3.5 overflow-x-auto snap-x pb-2 pt-1 flex-nowrap scroll-smooth [&::-webkit-scrollbar]:h-[3px] [&::-webkit-scrollbar-track]:bg-slate-100 dark:bg-muted [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400"
                  >
                    {/* Bulb Card */}
                    <div className="w-52 sm:w-60 md:w-64 shrink-0 bg-white dark:bg-card border border-slate-200/80 dark:border-border rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between text-center shadow-xs hover:border-slate-300 transition-all snap-start">
                      <div>
                        <div className="w-full flex items-center justify-center py-1 mb-2">
                          <img
                            src="/images/bulb.png"
                            alt="Explore courses & sheets"
                            className="h-20 sm:h-24 md:h-28 object-contain mx-auto"
                          />
                        </div>
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-foreground leading-tight">
                          Explore courses & sheets
                        </h3>
                        <p className="text-[11px] text-slate-500 dark:text-muted-foreground mt-1.5 leading-snug">
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
                        item.categoryStyle || "bg-[#E0F2FE] text-[#0369A1]";

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
                          className="w-52 sm:w-60 md:w-64 shrink-0 bg-white dark:bg-card border border-slate-200/80 dark:border-border rounded-2xl overflow-hidden flex flex-col justify-between shadow-xs hover:border-slate-300 transition-all snap-start group"
                        >
                          <div>
                            <div
                              className={`px-3 sm:px-3.5 py-1.5 text-[10px] font-extrabold tracking-wider uppercase ${badgeStyle}`}
                            >
                              {badgeText}
                            </div>
                            <div className="p-3 sm:p-3.5 space-y-1.5 sm:space-y-2">
                              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-foreground leading-snug group-hover:text-[#FF3B30] transition-colors">
                                {item.title}
                              </h3>
                              <p className="text-[11px] text-slate-600 dark:text-muted-foreground leading-snug line-clamp-3">
                                {item.desc}
                              </p>
                              {isInProgress && (
                                <div className="pt-1.5 space-y-1">
                                  <div className="w-full bg-slate-100 dark:bg-muted rounded-full h-1.5">
                                    <div
                                      className="bg-[#FF3B30] h-1.5 rounded-full"
                                      style={{
                                        width: `${progressPercentage}%`,
                                      }}
                                    />
                                  </div>
                                  <div className="text-right text-[10px] font-bold text-slate-700">
                                    {progressPercentage}% Completed
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="px-3 sm:px-3.5 py-2 sm:py-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] font-medium text-slate-400 dark:text-muted-foreground">
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 border-b border-slate-100 pb-2">
                  <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-foreground tracking-tight">
                    My learning
                  </h2>
                  <Link
                    href={routes.interviewPrep}
                    className="text-xs font-bold text-[#FF3B30] hover:underline flex items-center gap-1 shrink-0 self-start sm:self-auto"
                  >
                    View all sheets <FiArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                <div className="flex items-stretch gap-3 sm:gap-4 overflow-x-auto snap-x pb-3 pt-1 flex-nowrap scroll-smooth [&::-webkit-scrollbar]:h-[3px] [&::-webkit-scrollbar-track]:bg-slate-100 dark:bg-muted [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400">
                  {loadingLearning ? (
                    <div className="w-full py-8 flex items-center justify-center text-xs font-bold text-slate-400 dark:text-muted-foreground">
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
                        "bg-purple-50 text-purple-700 border-purple-100";
                      let btnStyle =
                        "bg-purple-50/50 hover:bg-purple-50 text-purple-700 border-purple-100";
                      let progressColor = "bg-purple-600";

                      if (sheet.isCourse) {
                        badgeLabel = "SHIKSHA COURSE";
                        badgeStyle = "bg-rose-50 text-rose-700 border-rose-100";
                        btnStyle =
                          "bg-rose-50/50 hover:bg-rose-50 text-rose-700 border-rose-100";
                        progressColor = "bg-[#FF3B30]";
                      } else if (isSystemDesign) {
                        badgeLabel = "SYSTEM DESIGN";
                        badgeStyle =
                          "bg-indigo-50 text-indigo-700 border-indigo-100";
                        btnStyle =
                          "bg-indigo-50/50 hover:bg-indigo-50 text-indigo-700 border-indigo-100";
                        progressColor = "bg-indigo-600";
                      } else if (!isDsa) {
                        const themeIndex = index % 2;
                        if (themeIndex === 0) {
                          badgeStyle =
                            "bg-blue-50 text-blue-700 border-blue-100";
                          btnStyle =
                            "bg-blue-50/50 hover:bg-blue-50 text-blue-700 border-blue-100";
                          progressColor = "bg-blue-600";
                        } else {
                          badgeStyle =
                            "bg-amber-50 text-amber-800 border-amber-200";
                          btnStyle =
                            "bg-amber-50/50 hover:bg-amber-50 text-amber-800 border-amber-200";
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
                          className="w-[260px] sm:w-[290px] md:w-[320px] shrink-0 bg-white dark:bg-card border border-slate-200/80 dark:border-border hover:border-slate-300 hover:shadow-md transition-all rounded-2xl overflow-hidden flex flex-col justify-between group snap-start"
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
                                    <h3 className="text-xs sm:text-sm md:text-[15px] font-extrabold text-slate-900 dark:text-foreground leading-snug truncate group-hover:text-[#FF3B30] transition-colors">
                                      {sheet.title}
                                    </h3>
                                  </div>
                                </div>
                                <div className="shrink-0 text-right">
                                  <span className="text-xs font-black text-slate-900 dark:text-foreground">
                                    {progressPercentage}%
                                  </span>
                                  <div className="text-[9px] font-bold text-slate-400 dark:text-muted-foreground">
                                    Solved
                                  </div>
                                </div>
                              </div>

                              <p className="text-xs text-slate-500 dark:text-muted-foreground leading-relaxed font-medium line-clamp-2 mt-2 sm:mt-3">
                                {sheet.description ||
                                  "Curated list of topic-wise interview preparation problems."}
                              </p>
                            </div>

                            <div className="mt-3.5 sm:mt-4 pt-3 sm:pt-3.5 border-t border-slate-100 space-y-2.5 sm:space-y-3">
                              <div className="space-y-1.5">
                                <div className="w-full bg-slate-100 dark:bg-muted rounded-full h-1.5 overflow-hidden">
                                  <div
                                    className={`${progressColor} h-1.5 rounded-full`}
                                    style={{ width: `${progressPercentage}%` }}
                                  />
                                </div>
                                <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400 dark:text-muted-foreground font-semibold">
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
                              <Link
                                href={
                                  sheet.isCourse
                                    ? `/shiksha/${sheet.slug}`
                                    : `/interview-prep/${sheet.slug}`
                                }
                                className={`w-full py-2 sm:py-2.5 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 sm:gap-2 shadow-2xs hover:shadow-xs transition-all ${btnStyle}`}
                              >
                                {sheet.isCourse
                                  ? "Continue Course"
                                  : "Resume Sheet"}{" "}
                                <FiArrowRight className="w-3.5 h-3.5" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="w-full py-8 bg-white dark:bg-card border border-slate-200/80 dark:border-border rounded-2xl flex flex-col items-center justify-center text-center space-y-2 p-4 sm:p-6">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-muted border border-slate-100 flex items-center justify-center text-slate-400 dark:text-muted-foreground">
                        <FiBookOpen className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-slate-700">
                        No active sheets in progress yet
                      </span>
                      <p className="text-[11px] text-slate-400 dark:text-muted-foreground max-w-sm">
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
                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-foreground">
                  More features to explore
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
                  <a
                    href="https://quiz.theboringeducation.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white dark:bg-card border border-slate-200/80 dark:border-border rounded-xl p-3 sm:p-3.5 flex items-center justify-between hover:border-slate-300 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                      <div className="w-7 h-7 sm:w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <FiHelpCircle className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-foreground group-hover:text-[#FF3B30] transition-colors truncate">
                          Tech Quizzes
                        </h4>
                        <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-muted-foreground line-clamp-1">
                          Topic-wise quizzes &amp; skill assessments.
                        </p>
                      </div>
                    </div>
                    <FiExternalLink className="w-3.5 h-3.5 text-slate-400 dark:text-muted-foreground group-hover:text-slate-600 dark:text-muted-foreground shrink-0 ml-2" />
                  </a>

                  <a
                    href="https://oncampus.theboringeducation.com/aptitude"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white dark:bg-card border border-slate-200/80 dark:border-border rounded-xl p-3 sm:p-3.5 flex items-center justify-between hover:border-slate-300 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                      <div className="w-7 h-7 sm:w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <FiBarChart2 className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-foreground group-hover:text-[#FF3B30] transition-colors truncate">
                          Aptitude Practice
                        </h4>
                        <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-muted-foreground line-clamp-1">
                          Company mock tests &amp; placement questions.
                        </p>
                      </div>
                    </div>
                    <FiExternalLink className="w-3.5 h-3.5 text-slate-400 dark:text-muted-foreground group-hover:text-slate-600 dark:text-muted-foreground shrink-0 ml-2" />
                  </a>

                  <a
                    href="https://oncampus.theboringeducation.com/coresubjects"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white dark:bg-card border border-slate-200/80 dark:border-border rounded-xl p-3 sm:p-3.5 flex items-center justify-between hover:border-slate-300 transition-all cursor-pointer group sm:col-span-2 lg:col-span-1"
                  >
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                      <div className="w-7 h-7 sm:w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <FiBookOpen className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-foreground group-hover:text-[#FF3B30] transition-colors truncate">
                          Core Subjects
                        </h4>
                        <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-muted-foreground line-clamp-1">
                          Master OS, DBMS, CN &amp; OOPs for interviews.
                        </p>
                      </div>
                    </div>
                    <FiExternalLink className="w-3.5 h-3.5 text-slate-400 dark:text-muted-foreground group-hover:text-slate-600 dark:text-muted-foreground shrink-0 ml-2" />
                  </a>
                </div>
              </section>
            </div>
          ) : activeTab === "explore" ? (
            /* Explore Catalog Tab */
            <div className="space-y-5 sm:space-y-6">
              {/* Header */}
              <div className="space-y-0.5 sm:space-y-1">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 dark:text-foreground tracking-tight">
                  Explore Courses, Sheets &amp; Resources
                </h1>
                <p className="text-xs text-slate-500 dark:text-muted-foreground font-normal">
                  Master interview questions, college core subjects &amp; full
                  stack engineering.
                </p>
              </div>

              {/* Filters & Search Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 bg-white dark:bg-card p-2.5 sm:p-3.5 rounded-2xl border border-slate-200/80 dark:border-border shadow-2xs">
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
                          : "bg-slate-50 dark:bg-muted text-slate-600 dark:text-muted-foreground hover:bg-slate-100 dark:hover:bg-muted dark:bg-muted hover:text-slate-900 dark:text-foreground"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Search Input */}
                <div className="relative w-full sm:w-56 md:w-64 shrink-0">
                  <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-muted-foreground w-3.5 h-3.5 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search topics, languages..."
                    value={exploreSearchQuery}
                    onChange={(e) => setExploreSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-muted border border-slate-200 dark:border-border rounded-xl text-xs font-medium placeholder:text-slate-400 dark:text-muted-foreground focus:outline-none focus:bg-white dark:bg-card focus:border-[#FF3B30] transition-all"
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
                      className={`bg-white dark:bg-card border rounded-2xl flex flex-col shadow-xs hover:shadow-md transition-all group overflow-hidden ${
                        isInProgress
                          ? "border-slate-200 dark:border-border"
                          : "border-slate-200/80 dark:border-border hover:border-slate-300"
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
                          className="text-sm sm:text-[15px] font-bold text-slate-900 dark:text-foreground leading-snug"
                          title={item.title}
                        >
                          {item.title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-muted-foreground leading-relaxed line-clamp-3 sm:line-clamp-none">
                          {item.desc}
                        </p>

                        {/* Progress / Status */}
                        <div className="mt-2.5 sm:mt-3">
                          {isInProgress ? (
                            <div className="space-y-1.5">
                              {/* Thin colored bar */}
                              <div className="w-full bg-slate-100 dark:bg-muted rounded-full h-1 overflow-hidden">
                                <div
                                  className="h-1 rounded-full bg-[#FF3B30]"
                                  style={{ width: `${progressPercentage}%` }}
                                />
                              </div>
                              <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-slate-500 dark:text-muted-foreground">
                                <span className="font-bold text-slate-700">
                                  {progressPercentage}% Solved
                                </span>
                                <span>
                                  {completedCount} / {totalCount || 450}
                                </span>
                              </div>
                            </div>
                          ) : (
                            /* Gray pill */
                            <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-slate-50 dark:bg-muted border border-slate-200 dark:border-border rounded-lg text-[10px] sm:text-[11px] font-semibold text-slate-500 dark:text-muted-foreground">
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
                      <div className="px-3.5 sm:px-5 py-2.5 sm:py-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <span className="flex items-center gap-1.5 text-slate-400 dark:text-muted-foreground font-medium">
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 border-b border-slate-100 pb-2.5">
                <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-foreground tracking-tight">
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
                  <div className="col-span-full py-12 flex items-center justify-center text-xs font-bold text-slate-400 dark:text-muted-foreground">
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
                      "bg-purple-50 text-purple-700 border-purple-100";
                    let btnStyle =
                      "bg-purple-50/50 hover:bg-purple-50 text-purple-700 border-purple-100";
                    let progressColor = "bg-purple-600";

                    if (sheet.isCourse) {
                      badgeLabel = "SHIKSHA COURSE";
                      badgeStyle = "bg-rose-50 text-rose-700 border-rose-100";
                      btnStyle =
                        "bg-rose-50/50 hover:bg-rose-50 text-rose-700 border-rose-100";
                      progressColor = "bg-[#FF3B30]";
                    } else if (isSystemDesign) {
                      badgeLabel = "SYSTEM DESIGN";
                      badgeStyle =
                        "bg-indigo-50 text-indigo-700 border-indigo-100";
                      btnStyle =
                        "bg-indigo-50/50 hover:bg-indigo-50 text-indigo-700 border-indigo-100";
                      progressColor = "bg-indigo-600";
                    } else if (!isDsa) {
                      const themeIndex = index % 2;
                      if (themeIndex === 0) {
                        badgeStyle = "bg-blue-50 text-blue-700 border-blue-100";
                        btnStyle =
                          "bg-blue-50/50 hover:bg-blue-50 text-blue-700 border-blue-100";
                        progressColor = "bg-blue-600";
                      } else {
                        badgeStyle =
                          "bg-amber-50 text-amber-800 border-amber-200";
                        btnStyle =
                          "bg-amber-50/50 hover:bg-amber-50 text-amber-800 border-amber-200";
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
                        className="bg-white dark:bg-card border border-slate-200/80 dark:border-border hover:border-slate-300 hover:shadow-md transition-all rounded-2xl overflow-hidden flex flex-col justify-between group"
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
                                  <h3 className="text-xs sm:text-sm md:text-[15px] font-extrabold text-slate-900 dark:text-foreground leading-snug truncate group-hover:text-[#FF3B30] transition-colors">
                                    {sheet.title}
                                  </h3>
                                </div>
                              </div>
                              <div className="shrink-0 text-right">
                                <span className="text-xs font-black text-slate-900 dark:text-foreground">
                                  {progressPercentage}%
                                </span>
                                <div className="text-[9px] font-bold text-slate-400 dark:text-muted-foreground">
                                  Solved
                                </div>
                              </div>
                            </div>

                            <p className="text-xs text-slate-500 dark:text-muted-foreground leading-relaxed font-medium line-clamp-2 mt-2 sm:mt-3">
                              {sheet.description ||
                                "Curated list of topic-wise interview preparation problems."}
                            </p>
                          </div>

                          <div className="mt-3.5 sm:mt-4 pt-3 sm:pt-3.5 border-t border-slate-100 space-y-2.5 sm:space-y-3">
                            <div className="space-y-1.5">
                              <div className="w-full bg-slate-100 dark:bg-muted rounded-full h-1.5 overflow-hidden">
                                <div
                                  className={`${progressColor} h-1.5 rounded-full`}
                                  style={{ width: `${progressPercentage}%` }}
                                />
                              </div>
                              <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400 dark:text-muted-foreground font-semibold">
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
                            <Link
                              href={
                                sheet.isCourse
                                  ? `/shiksha/${sheet.slug}`
                                  : `/interview-prep/${sheet.slug}`
                              }
                              className={`w-full py-2 sm:py-2.5 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 sm:gap-2 shadow-2xs hover:shadow-xs transition-all ${btnStyle}`}
                            >
                              {sheet.isCourse
                                ? "Continue Course"
                                : "Resume Sheet"}{" "}
                              <FiArrowRight className="w-3.5 h-3.5" />
                            </Link>
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
                        className="bg-white dark:bg-card border border-slate-200/80 dark:border-border hover:border-[#FF3B30]/30 hover:shadow-md transition-all rounded-2xl overflow-hidden flex flex-col justify-between group"
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
                                <h3 className="text-xs sm:text-sm md:text-[15px] font-extrabold text-slate-900 dark:text-foreground leading-snug truncate group-hover:text-[#FF3B30] transition-colors">
                                  {course.title}
                                </h3>
                              </div>
                              <div className="shrink-0 text-right">
                                <span className="text-xs font-black text-slate-900 dark:text-foreground">
                                  {progressPct}%
                                </span>
                                <div className="text-[9px] font-bold text-slate-400 dark:text-muted-foreground">
                                  Done
                                </div>
                              </div>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-muted-foreground leading-relaxed font-medium line-clamp-2 mt-2 sm:mt-3">
                              {course.description ||
                                courseDef?.desc ||
                                "Full-stack course on Shiksha."}
                            </p>
                          </div>
                          <div className="mt-3.5 sm:mt-4 pt-3 sm:pt-3.5 border-t border-slate-100 space-y-2.5 sm:space-y-3">
                            <div className="space-y-1.5">
                              <div className="w-full bg-slate-100 dark:bg-muted rounded-full h-1.5 overflow-hidden">
                                <div
                                  className="bg-[#FF3B30] h-1.5 rounded-full"
                                  style={{ width: `${progressPct}%` }}
                                />
                              </div>
                              <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400 dark:text-muted-foreground font-semibold">
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
                            <Link
                              href={courseDef?.url || `/shiksha/${course.slug}`}
                              className="w-full py-2 sm:py-2.5 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 sm:gap-2 shadow-2xs hover:shadow-xs transition-all bg-red-50/50 hover:bg-red-50 text-[#FF3B30] border border-red-100"
                            >
                              Continue Course{" "}
                              <FiArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                {!loadingLearning &&
                  (!activeSheetsWithProgress ||
                    activeSheetsWithProgress.length === 0) &&
                  (!enrolledCourses || enrolledCourses.length === 0) && (
                    <div className="col-span-full py-8 bg-white dark:bg-card border border-slate-200/80 dark:border-border rounded-2xl flex flex-col items-center justify-center text-center space-y-2 p-4 sm:p-6">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-muted border border-slate-100 flex items-center justify-center text-slate-400 dark:text-muted-foreground">
                        <FiBookOpen className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-slate-700">
                        No active learning in progress yet
                      </span>
                      <p className="text-[11px] text-slate-400 dark:text-muted-foreground max-w-sm">
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
