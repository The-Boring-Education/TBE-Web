import { generateSectionPath, routes } from "@tbe/constants";
import { motion } from "framer-motion";
import Link from "next/link";
import React from "react";

import { Terminal } from "../../../ui/terminal";

// --- Devicon Official SVG Logos ---
const DEVICONS = {
  javascript:
    "https://raw.githubusercontent.com/devicons/devicon/master/icons/javascript/javascript-original.svg",
  typescript:
    "https://raw.githubusercontent.com/devicons/devicon/master/icons/typescript/typescript-original.svg",
  python:
    "https://raw.githubusercontent.com/devicons/devicon/master/icons/python/python-original.svg",
  cplusplus:
    "https://raw.githubusercontent.com/devicons/devicon/master/icons/cplusplus/cplusplus-original.svg",
  java: "https://raw.githubusercontent.com/devicons/devicon/master/icons/java/java-original.svg",
  postgresql:
    "https://raw.githubusercontent.com/devicons/devicon/master/icons/postgresql/postgresql-original.svg",
  react:
    "https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original.svg",
  nodejs:
    "https://raw.githubusercontent.com/devicons/devicon/master/icons/nodejs/nodejs-original.svg",
  go: "https://raw.githubusercontent.com/devicons/devicon/master/icons/go/go-original.svg",
};

// --- SVG Icons for Feature Cards ---
const ReactCardIcon = () => (
  <img
    src={DEVICONS.react}
    alt="React"
    className="w-4 h-4 sm:w-5 sm:h-5 object-contain"
  />
);

const CodeBracketIcon = () => (
  <svg
    className="w-4 h-4 sm:w-5 sm:h-5 text-[#9333EA]"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);

const GraduationCapIcon = () => (
  <svg
    className="w-4 h-4 sm:w-5 sm:h-5 text-[#16A34A]"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c0 2 3 3 6 3s6-1 6-3v-5" />
  </svg>
);

const PlayVideoIcon = () => (
  <svg
    className="w-4 h-4 sm:w-5 sm:h-5 text-[#EA580C]"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <rect
      x="2"
      y="4"
      width="20"
      height="16"
      rx="4"
      className="fill-[#FFEDD5] stroke-[#EA580C]"
      strokeWidth="2"
    />
    <polygon points="10,8 16,12 10,16" fill="#EA580C" />
  </svg>
);

const RoadmapIcon = () => (
  <svg
    className="w-4 h-4 sm:w-5 sm:h-5 text-[#2563EB]"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="6" cy="6" r="2.5" />
    <circle cx="18" cy="18" r="2.5" />
    <path d="M8.5 6h4a4 4 0 014 4v4" />
  </svg>
);

const GlobeIcon = () => (
  <svg
    className="w-4 h-4 sm:w-5 sm:h-5 text-[#4F46E5]"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const FolderIcon = () => (
  <svg
    className="w-4 h-4 sm:w-5 sm:h-5 text-[#D97706]"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z" />
  </svg>
);

const SheetIcon = () => (
  <svg
    className="w-4 h-4 sm:w-5 sm:h-5 text-[#16A34A]"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="4" y="3" width="16" height="18" rx="2" />
    <path d="M9 7h6M9 12h6M9 17h4" />
  </svg>
);

// --- Devicon Floating Logo Tile (Responsive Sizing) ---
interface DevIconTileProps {
  src: string;
  alt: string;
  className?: string;
}

const DevIconTile: React.FC<DevIconTileProps> = ({
  src,
  alt,
  className = "",
}) => (
  <div
    className={`w-6 h-6 sm:w-12 sm:h-12 lg:w-16 lg:h-16 flex items-center justify-center p-0.5 hover:scale-110 transition-transform duration-300 ${className}`}
  >
    <img
      src={src}
      alt={alt}
      className="w-full h-full object-contain filter drop-shadow-sm"
    />
  </div>
);

const CodeTagBadge = () => (
  <div className="w-6 h-6 sm:w-12 sm:h-12 lg:w-16 lg:h-16 flex items-center justify-center p-0.5">
    <svg
      className="w-4 h-4 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-[#EF4444] filter drop-shadow-sm"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  </div>
);

// --- Responsive Feature Card Component ---
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  href: string;
  iconBg?: string;
  rotateClass?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  subtitle,
  href,
  iconBg = "bg-slate-50",
  rotateClass = "",
}) => {
  const isExternal = href.startsWith("http");

  return (
    <Link
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className="group block w-full"
    >
      <motion.div
        whileHover={{ y: -4, scale: 1.03, rotate: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className={`bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-[0_8px_25px_-8px_rgba(0,0,0,0.06)] hover:shadow-xl hover:shadow-red-500/10 border border-slate-100/90 dark:border-zinc-700/90 transition-all duration-300 w-full lg:w-[235px] xl:w-[250px] transform ${rotateClass}`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl ${iconBg} flex items-center justify-center shrink-0 border border-slate-100 group-hover:scale-110 group-hover:bg-red-50/50 transition-all duration-200`}
          >
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-contentDark leading-tight group-hover:text-[#FF4D4D] transition-colors duration-200 truncate">
              {title}
            </h4>
            <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 leading-tight line-clamp-2 font-normal">
              {subtitle}
            </p>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

// --- Main Hero Component ---
export interface PlatformLandingHeroProps {
  onStartClick?: () => void;
  ctaText?: string;
  ctaHref?: string;
}

export const PlatformLandingHero: React.FC<PlatformLandingHeroProps> = ({
  ctaText = "Start Learning Now →",
  ctaHref,
}) => {
  const defaultCtaHref =
    ctaHref ||
    generateSectionPath({
      basePath: "",
      sectionID: routes.internals.landing.products,
    });

  return (
    <section className="relative w-full overflow-hidden bg-[#FAFAFC] dark:bg-dark py-6 sm:py-12 md:py-16 lg:py-24">
      {/* --- Responsive Ambient Background Lights & Orbit Rings --- */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        {/* Soft Red Glow Center */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] sm:w-[600px] lg:w-[850px] h-[350px] sm:h-[450px] lg:h-[580px] bg-red-500/10 rounded-full blur-[100px] sm:blur-[140px] lg:blur-[160px]" />

        {/* Concentric Responsive Dashed Orbit SVG lines (Hidden on Mobile) */}
        <svg
          className="hidden sm:block absolute inset-0 w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1000 700"
          preserveAspectRatio="xMidYMid slice"
        >
          <ellipse
            cx="500"
            cy="320"
            rx="460"
            ry="270"
            fill="none"
            stroke="#E2E8F0"
            strokeWidth="1.5"
            strokeDasharray="6 6"
          />
          <ellipse
            cx="500"
            cy="320"
            rx="320"
            ry="190"
            fill="none"
            stroke="#CBD5E1"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          {/* Accent Dots on Orbit */}
          <circle cx="500" cy="50" r="4" fill="#FF5757" />
          <circle cx="820" cy="200" r="4" fill="#F97316" />
          <circle cx="180" cy="450" r="3.5" fill="#3B82F6" />
          <circle cx="860" cy="510" r="4" fill="#8B5CF6" />
        </svg>
      </div>

      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* --- Main Content Grid Layout --- */}
        <div className="relative flex flex-col items-center min-h-0 sm:min-h-[520px] lg:min-h-[640px]">
          {/* --- Responsive Language Badges (Orbiting around title on mobile & outer desktop) --- */}
          <div className="w-full">
            {/* Top Center Badge */}
            <motion.div
              animate={{ y: [0, -5, 0], rotate: [0, -3, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-[-14px] sm:top-[-16px] left-1/2 lg:left-[32%] -translate-x-1/2 z-10"
            >
              <CodeTagBadge />
            </motion.div>

            {/* JS Badge */}
            <motion.div
              animate={{ y: [0, -7, 0], rotate: [-4, 2, -4] }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5,
              }}
              className="absolute top-0 -left-1 sm:top-4 sm:left-4 lg:left-[-10px] xl:left-2 z-10"
            >
              <DevIconTile src={DEVICONS.javascript} alt="JavaScript" />
            </motion.div>

            {/* C++ Badge */}
            <motion.div
              animate={{ y: [0, 7, 0], rotate: [3, -3, 3] }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
              className="absolute top-[25%] -left-2 sm:left-2 lg:left-[-16px] xl:left-[-4px] z-10"
            >
              <DevIconTile src={DEVICONS.cplusplus} alt="C++" />
            </motion.div>

            {/* Java Badge */}
            <motion.div
              animate={{ y: [0, -6, 0], rotate: [-2, 4, -2] }}
              transition={{
                duration: 4.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1.5,
              }}
              className="absolute top-[54%] -left-1 sm:left-4 lg:left-[-22px] xl:left-[-8px] z-10"
            >
              <DevIconTile src={DEVICONS.java} alt="Java" />
            </motion.div>

            {/* Go Badge */}
            <motion.div
              animate={{ y: [0, 6, 0], rotate: [2, -2, 2] }}
              transition={{
                duration: 5.2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1.9,
              }}
              className="absolute bottom-2 sm:bottom-4 left-3 sm:left-8 lg:left-[15px] xl:left-10 z-10 hidden sm:block"
            >
              <DevIconTile src={DEVICONS.go} alt="Go" />
            </motion.div>

            {/* TS Badge */}
            <motion.div
              animate={{ y: [0, -7, 0], rotate: [4, -2, 4] }}
              transition={{
                duration: 5.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.8,
              }}
              className="absolute top-0 -right-1 sm:top-4 sm:right-4 lg:right-[-10px] xl:right-2 z-10"
            >
              <DevIconTile src={DEVICONS.typescript} alt="TypeScript" />
            </motion.div>

            {/* Python Badge */}
            <motion.div
              animate={{ y: [0, 7, 0], rotate: [-3, 3, -3] }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1.2,
              }}
              className="absolute top-[25%] -right-2 sm:right-2 lg:right-[-16px] xl:right-[-4px] z-10"
            >
              <DevIconTile src={DEVICONS.python} alt="Python" />
            </motion.div>

            {/* PostgreSQL Badge */}
            <motion.div
              animate={{ y: [0, -8, 0], rotate: [2, -4, 2] }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1.8,
              }}
              className="absolute top-[54%] -right-1 sm:right-4 lg:right-[-22px] xl:right-[-8px] z-10"
            >
              <DevIconTile src={DEVICONS.postgresql} alt="PostgreSQL" />
            </motion.div>

            {/* Node.js Badge */}
            <motion.div
              animate={{ y: [0, 6, 0], rotate: [-3, 3, -3] }}
              transition={{
                duration: 5.6,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2.1,
              }}
              className="absolute bottom-2 sm:bottom-4 right-3 sm:right-8 lg:right-[15px] xl:right-10 z-10 hidden sm:block"
            >
              <DevIconTile src={DEVICONS.nodejs} alt="Node.js" />
            </motion.div>
          </div>

          {/* --- Floating Tilted Feature Cards (Desktop Layout) --- */}
          <div className="hidden lg:block pointer-events-none absolute inset-0 z-20">
            {/* Left Column Floating Cards */}
            <div className="pointer-events-auto">
              {/* Card 1: React Interview Questions */}
              <motion.div
                animate={{ y: [0, -6, 0], rotate: [-4, -2, -4] }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute top-4 right-[calc(50%+290px)] xl:right-[calc(50%+330px)]"
              >
                <FeatureCard
                  icon={<ReactCardIcon />}
                  title="React Interview Questions"
                  subtitle="Top React interview questions & answers"
                  href={routes.allInterviewSheets.reactInterviewSheet}
                  rotateClass="-rotate-3"
                />
              </motion.div>

              {/* Card 3: Core Subjects */}
              <motion.div
                animate={{ y: [0, 7, 0], rotate: [-6, -4, -6] }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.7,
                }}
                className="absolute top-[160px] right-[calc(50%+315px)] xl:right-[calc(50%+355px)]"
              >
                <FeatureCard
                  icon={<GraduationCapIcon />}
                  title="Core Subjects"
                  subtitle="CS, OS, CN, DBMS & system design"
                  href="https://oncampus.theboringeducation.com/"
                  rotateClass="-rotate-5"
                />
              </motion.div>

              {/* Card 5: Roadmaps */}
              <motion.div
                animate={{ y: [0, -7, 0], rotate: [3, 5, 3] }}
                transition={{
                  duration: 5.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1.4,
                }}
                className="absolute top-[320px] right-[calc(50%+295px)] xl:right-[calc(50%+335px)]"
              >
                <FeatureCard
                  icon={<RoadmapIcon />}
                  title="Roadmaps"
                  subtitle="Step by step developer guides"
                  href="https://resources.theboringeducation.com/"
                  rotateClass="rotate-4"
                />
              </motion.div>

              {/* Card 7: Projects */}
              <motion.div
                animate={{ y: [0, 6, 0], rotate: [-3, -1, -3] }}
                transition={{
                  duration: 6.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 2.1,
                }}
                className="absolute top-[475px] right-[calc(50%+270px)] xl:right-[calc(50%+305px)]"
              >
                <FeatureCard
                  icon={<FolderIcon />}
                  title="Projects"
                  subtitle="Hands-on fullstack projects"
                  href={routes.projects}
                  rotateClass="-rotate-2"
                />
              </motion.div>
            </div>

            {/* Right Column Floating Cards */}
            <div className="pointer-events-auto">
              {/* Card 2: DSA Questions */}
              <motion.div
                animate={{ y: [0, -7, 0], rotate: [5, 3, 5] }}
                transition={{
                  duration: 5.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.3,
                }}
                className="absolute top-4 left-[calc(50%+290px)] xl:left-[calc(50%+330px)]"
              >
                <FeatureCard
                  icon={<CodeBracketIcon />}
                  title="DSA Questions"
                  subtitle="Data structures & algorithms prep"
                  href={routes.dsayatra.baseUrl}
                  rotateClass="rotate-4"
                />
              </motion.div>

              {/* Card 4: Bite Size Courses */}
              <motion.div
                animate={{ y: [0, 8, 0], rotate: [-4, -2, -4] }}
                transition={{
                  duration: 5.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1.1,
                }}
                className="absolute top-[160px] left-[calc(50%+315px)] xl:left-[calc(50%+355px)]"
              >
                <FeatureCard
                  icon={<PlayVideoIcon />}
                  title="Bite Size Courses"
                  subtitle="Short interactive courses to learn fast"
                  href={routes.shiksha}
                  rotateClass="-rotate-3"
                />
              </motion.div>

              {/* Card 6: Real World Q&A */}
              <motion.div
                animate={{ y: [0, -6, 0], rotate: [5, 7, 5] }}
                transition={{
                  duration: 6.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1.7,
                }}
                className="absolute top-[320px] left-[calc(50%+265px)] xl:left-[calc(50%+295px)]"
              >
                <FeatureCard
                  icon={<GlobeIcon />}
                  title="Real World Q&A"
                  subtitle="Real world production scenarios"
                  href="https://dsayatra.theboringeducation.com/"
                  rotateClass="rotate-5"
                />
              </motion.div>

              {/* Card 8: Interview Sheets */}
              <motion.div
                animate={{ y: [0, 7, 0], rotate: [-5, -3, -5] }}
                transition={{
                  duration: 5.7,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 2.3,
                }}
                className="absolute top-[475px] left-[calc(50%+270px)] xl:left-[calc(50%+305px)]"
              >
                <FeatureCard
                  icon={<SheetIcon />}
                  title="Interview Sheets"
                  subtitle="Curated sheets for tech companies"
                  href={routes.interviewPrep}
                  rotateClass="-rotate-4"
                />
              </motion.div>
            </div>
          </div>

          {/* --- Center Hero Section (Title, Subtitle, CTA) --- */}
          <div className="relative z-30 flex flex-col items-center text-center max-w-xl lg:max-w-2xl px-3 sm:px-4 mt-6 sm:mt-4 mb-6 sm:mb-8">
            {/* Main Headline */}
            <motion.h1
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-contentDark tracking-tight leading-[1.15] sm:leading-[1.12]"
            >
              Everything You Need <br className="hidden sm:inline" />
              to Learn. <span className="text-[#FF4D4D]">Practice.</span>{" "}
              <br className="hidden sm:inline" />
              <span className="text-[#FF4D4D]">Master.</span> All in One Place.
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-slate-600 dark:text-zinc-200 font-medium text-sm sm:text-base lg:text-lg mt-3 sm:mt-4 max-w-md sm:max-w-lg leading-relaxed"
            >
              From core subjects to real world questions,{" "}
              <br className="hidden sm:inline" />
              from roadmaps to interview prep —{" "}
              <br className="hidden sm:inline" />
              your complete learning companion.
            </motion.p>

            {/* CTA Button */}
            <motion.div
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-4 sm:mt-6 w-auto flex justify-center"
            >
              <Link
                href={defaultCtaHref}
                className="inline-flex items-center justify-center gap-1.5 bg-[#FF4D4D] hover:bg-[#EE3B3B] text-white font-bold text-xs sm:text-base px-5 sm:px-8 py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl shadow-md sm:shadow-lg shadow-red-500/25 hover:shadow-red-500/35 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                {ctaText}
              </Link>
            </motion.div>
          </div>

          {/* --- Bottom Interactive Animated Terminal (Fully Responsive) --- */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="hidden sm:block relative z-30 w-full max-w-[340px] sm:max-w-[580px] md:max-w-[760px] lg:max-w-[930px] mt-1 sm:mt-2 mb-6 px-2 sm:px-4"
          >
            <Terminal
              windowTitle="the-boring-education.sh"
              typingSpeed={45}
              delayBetweenCommands={1000}
              commands={[
                "tbe learn --track fullstack-developer",
                "tbe practice --dsa-sheet top-150-interview",
                "tbe master --interview-prep",
              ]}
              outputs={{
                0: [
                  "✔ Preflight checks passed.",
                  "✔ Initialized 50+ Bite-sized Courses.",
                  "✔ Loaded 20+ Real-world Projects.",
                ],
                1: [
                  "✔ Synced 850+ Curated DSA Questions.",
                  "✔ Progress linked with DSAYatra.",
                ],
                2: [
                  "✔ Core Subjects (CS, OS, CN, DBMS) Loaded.",
                  "✔ Curated sheets for top tech companies ready.",
                  "🚀 Ready to crack your dream Tech Job!",
                ],
              }}
            />
          </motion.div>

          {/* --- Tablet Responsive Cards Grid (Hidden on Mobile < 640px) --- */}
          <div className="hidden sm:grid lg:hidden w-full max-w-xl grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-6 sm:mt-8 px-1 sm:px-2 z-30">
            <FeatureCard
              icon={<ReactCardIcon />}
              title="React Interview Questions"
              subtitle="Top React interview questions & answers"
              href={routes.allInterviewSheets.reactInterviewSheet}
            />
            <FeatureCard
              icon={<CodeBracketIcon />}
              title="DSA Questions"
              subtitle="Data structures & algorithms prep"
              href={routes.dsayatra.baseUrl}
            />
            <FeatureCard
              icon={<GraduationCapIcon />}
              title="Core Subjects"
              subtitle="CS, OS, CN, DBMS & system design"
              href="https://oncampus.theboringeducation.com/"
            />
            <FeatureCard
              icon={<PlayVideoIcon />}
              title="Bite Size Courses"
              subtitle="Short interactive courses to learn fast"
              href={routes.shiksha}
            />
            <FeatureCard
              icon={<RoadmapIcon />}
              title="Roadmaps"
              subtitle="Step by step developer guides"
              href="https://resources.theboringeducation.com/"
            />
            <FeatureCard
              icon={<GlobeIcon />}
              title="Real World Q&A"
              subtitle="Real world production scenarios"
              href="https://dsayatra.theboringeducation.com/"
            />
            <FeatureCard
              icon={<FolderIcon />}
              title="Projects"
              subtitle="Hands-on fullstack projects"
              href={routes.projects}
            />
            <FeatureCard
              icon={<SheetIcon />}
              title="Interview Sheets"
              subtitle="Curated sheets for tech companies"
              href={routes.interviewPrep}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default PlatformLandingHero;
