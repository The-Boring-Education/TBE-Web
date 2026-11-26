import { cn } from "@tbe/utils";
import {
  Binary,
  BookOpen,
  Code2,
  Cpu,
  Database,
  Globe,
  Layers,
  Network,
  Server,
  Terminal,
} from "lucide-react";
import React, { useMemo, useState } from "react";

export interface InterviewSheetCoverProps {
  sheet?: {
    name?: string;
    title?: string;
    slug?: string;
    roadmap?: string;
    coverImageURL?: string;
    coverImageUrl?: string;
    image?: string;
    thumbnail?: string;
  };
  badgeRoadmap?: string;
  statusBadge?: React.ReactNode;
  aspectRatio?: string;
  className?: string;
  /** Force the crisp vector cover even if a legacy or custom coverImageURL exists */
  forceVectorCover?: boolean;
}

interface TechBranding {
  title: string;
  subtitle: string;
  logoUrl?: string;
  fallbackIcon: React.ElementType;
  brandColor: string;
  accentGradient: string;
  ambientGlow: string;
  codeSnippet: string;
  watermark: string;
  tagline?: string;
}

type TechKey =
  | "java"
  | "cpp"
  | "javascript"
  | "typescript"
  | "python"
  | "database"
  | "react"
  | "nodejs"
  | "dsa"
  | "os"
  | "networks"
  | "systemDesign";

const TECH_BRANDING_MAP: Record<TechKey, TechBranding> = {
  java: {
    title: "Java",
    subtitle: "Interview Questions",
    logoUrl:
      "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg",
    fallbackIcon: Code2,
    brandColor: "#F89820",
    accentGradient: "from-amber-500 via-orange-500 to-amber-600",
    ambientGlow:
      "radial-gradient(circle, rgba(248,152,32,0.22) 0%, rgba(231,111,0,0.06) 60%, transparent 100%)",
    codeSnippet: "public class Solution { ... }",
    watermark: "JAVA",
    tagline: "Core, JVM, Multithreading & OOP",
  },
  cpp: {
    title: "C++",
    subtitle: "Interview Questions",
    logoUrl:
      "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg",
    fallbackIcon: Cpu,
    brandColor: "#00599C",
    accentGradient: "from-blue-500 via-cyan-500 to-sky-600",
    ambientGlow:
      "radial-gradient(circle, rgba(0,89,156,0.28) 0%, rgba(101,154,210,0.08) 60%, transparent 100%)",
    codeSnippet: "#include <iostream>\nusing namespace std;",
    watermark: "C++",
    tagline: "Pointers, STL, OOP & Memory",
  },
  javascript: {
    title: "JavaScript",
    subtitle: "Interview Questions",
    logoUrl:
      "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg",
    fallbackIcon: Terminal,
    brandColor: "#F7DF1E",
    accentGradient: "from-yellow-400 via-amber-400 to-yellow-500",
    ambientGlow:
      "radial-gradient(circle, rgba(247,223,30,0.22) 0%, rgba(229,160,13,0.06) 60%, transparent 100%)",
    codeSnippet: "const solve = async () => {};",
    watermark: "JS",
    tagline: "ES6+, Closures, Async & Event Loop",
  },
  typescript: {
    title: "TypeScript",
    subtitle: "Interview Questions",
    logoUrl:
      "https://raw.githubusercontent.com/devicons/devicon/master/icons/typescript/typescript-original.svg",
    fallbackIcon: Terminal,
    brandColor: "#3178C6",
    accentGradient: "from-blue-400 via-sky-500 to-indigo-600",
    ambientGlow:
      "radial-gradient(circle, rgba(49,120,198,0.25) 0%, rgba(35,85,140,0.08) 60%, transparent 100%)",
    codeSnippet: "type Result<T> = T | Error;",
    watermark: "TS",
    tagline: "Generics, Utility Types & Interfaces",
  },
  python: {
    title: "Python",
    subtitle: "Interview Questions",
    logoUrl:
      "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
    fallbackIcon: Terminal,
    brandColor: "#3776AB",
    accentGradient: "from-sky-500 via-amber-400 to-blue-500",
    ambientGlow:
      "radial-gradient(circle, rgba(55,118,171,0.26) 0%, rgba(255,212,59,0.08) 60%, transparent 100%)",
    codeSnippet: "def two_sum(nums, target):",
    watermark: "PYTHON",
    tagline: "OOP, GIL, Generators & Data Structures",
  },
  database: {
    title: "Database & SQL",
    subtitle: "Interview Questions",
    logoUrl:
      "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg",
    fallbackIcon: Database,
    brandColor: "#336791",
    accentGradient: "from-blue-500 via-teal-500 to-cyan-600",
    ambientGlow:
      "radial-gradient(circle, rgba(51,103,145,0.28) 0%, rgba(0,117,143,0.08) 60%, transparent 100%)",
    codeSnippet: "SELECT * FROM schema.table;",
    watermark: "SQL",
    tagline: "Queries, Indexes, ACID & Normalization",
  },
  react: {
    title: "React.js",
    subtitle: "Interview Questions",
    logoUrl:
      "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
    fallbackIcon: Layers,
    brandColor: "#61DAFB",
    accentGradient: "from-cyan-400 via-sky-400 to-blue-500",
    ambientGlow:
      "radial-gradient(circle, rgba(97,218,251,0.25) 0%, rgba(0,136,204,0.08) 60%, transparent 100%)",
    codeSnippet: "useEffect(() => {}, []);",
    watermark: "REACT",
    tagline: "Hooks, Virtual DOM, State & Performance",
  },
  nodejs: {
    title: "Node.js & Express",
    subtitle: "Interview Questions",
    logoUrl:
      "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg",
    fallbackIcon: Server,
    brandColor: "#339933",
    accentGradient: "from-emerald-400 via-green-500 to-teal-600",
    ambientGlow:
      "radial-gradient(circle, rgba(51,153,51,0.28) 0%, rgba(33,87,50,0.08) 60%, transparent 100%)",
    codeSnippet: "app.use(express.json());",
    watermark: "NODE",
    tagline: "Event Loop, Streams, Middlewares & REST",
  },
  dsa: {
    title: "DSA Prep",
    subtitle: "Data Structures & Algorithms",
    logoUrl:
      "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg",
    fallbackIcon: Binary,
    brandColor: "#FF4D4D",
    accentGradient: "from-rose-500 via-red-500 to-pink-600",
    ambientGlow:
      "radial-gradient(circle, rgba(255,77,77,0.25) 0%, rgba(220,38,38,0.08) 60%, transparent 100%)",
    codeSnippet: "left = 0, right = n - 1;",
    watermark: "DSA",
    tagline: "Trees, Graphs, DP & Algorithmic Patterns",
  },
  os: {
    title: "Operating Systems",
    subtitle: "Interview Questions",
    fallbackIcon: Cpu,
    brandColor: "#8B5CF6",
    accentGradient: "from-violet-500 via-purple-500 to-indigo-600",
    ambientGlow:
      "radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 100%)",
    codeSnippet: "fork(); wait(NULL);",
    watermark: "OS",
    tagline: "Processes, Threads, Semaphores & Paging",
  },
  networks: {
    title: "Computer Networks",
    subtitle: "Interview Questions",
    fallbackIcon: Network,
    brandColor: "#06B6D4",
    accentGradient: "from-cyan-500 via-teal-500 to-blue-600",
    ambientGlow:
      "radial-gradient(circle, rgba(6,182,212,0.25) 0%, transparent 100%)",
    codeSnippet: "TCP SYN -> SYN-ACK -> ACK",
    watermark: "CN",
    tagline: "OSI Model, TCP/IP, DNS & HTTP/HTTPS",
  },
  systemDesign: {
    title: "System Design",
    subtitle: "Interview Questions",
    fallbackIcon: Globe,
    brandColor: "#10B981",
    accentGradient: "from-emerald-500 via-teal-500 to-cyan-600",
    ambientGlow:
      "radial-gradient(circle, rgba(16,185,129,0.25) 0%, transparent 100%)",
    codeSnippet: "Load Balancer -> Sharded DB",
    watermark: "HLD",
    tagline: "Scalability, Caching, Sharding & Queues",
  },
};

/**
 * Detects legacy raster cards that contain cropped/blurry baked text.
 * These are replaced with the ultra-crisp vector branding.
 */
const isLegacyTextCard = (url?: string): boolean => {
  if (!url) return true;
  const lower = url.toLowerCase();
  return (
    lower.includes("card_minimal") ||
    lower.includes("interview-questions.svg") ||
    lower.includes("java-interview-questions") ||
    lower.includes("javascript-interview-questions") ||
    lower.includes("react-interview-questions") ||
    lower.includes("node-interview-questions") ||
    lower.includes("database-interview-questions") ||
    lower.includes("python-interview-questions") ||
    lower.includes("dsa-interview-questions")
  );
};

export const resolveTechBranding = (
  sheetSlug?: string,
  sheetName?: string,
): TechBranding => {
  const text = `${sheetSlug || ""} ${sheetName || ""}`.toLowerCase();

  // Check specific frontend & backend frameworks first to avoid greedy substring matching
  if (text.includes("react")) {
    return TECH_BRANDING_MAP.react;
  }
  if (text.includes("node") || text.includes("express")) {
    return TECH_BRANDING_MAP.nodejs;
  }
  if (text.includes("typescript") || /\bts\b/.test(text)) {
    return TECH_BRANDING_MAP.typescript;
  }
  if (text.includes("javascript") || /\bjs\b/.test(text)) {
    return TECH_BRANDING_MAP.javascript;
  }
  if (text.includes("java") && !text.includes("script")) {
    return TECH_BRANDING_MAP.java;
  }
  if (text.includes("c++") || text.includes("cpp")) {
    return TECH_BRANDING_MAP.cpp;
  }
  if (text.includes("python") || /\bpy\b/.test(text)) {
    return TECH_BRANDING_MAP.python;
  }
  if (
    text.includes("database") ||
    text.includes("dbms") ||
    text.includes("sql") ||
    text.includes("postgresql") ||
    text.includes("mysql")
  ) {
    return TECH_BRANDING_MAP.database;
  }
  if (text.includes("dsa") || text.includes("algorithm")) {
    return TECH_BRANDING_MAP.dsa;
  }
  if (
    text.includes("operating system") ||
    text.includes("os ") ||
    text.endsWith("os")
  ) {
    return TECH_BRANDING_MAP.os;
  }
  if (
    text.includes("network") ||
    text.includes("computer networks") ||
    text.includes("cn ")
  ) {
    return TECH_BRANDING_MAP.networks;
  }
  if (text.includes("system design") || text.includes("hld")) {
    return TECH_BRANDING_MAP.systemDesign;
  }

  // Generic fallback: clean title from name
  const rawTitle = sheetName || sheetSlug || "Tech Interview";
  const cleanTitle = rawTitle
    .replace(/interview\s*questions?/i, "")
    .replace(/sheet/i, "")
    .trim();

  return {
    title: cleanTitle || "Technical Prep",
    subtitle: "Interview Questions",
    fallbackIcon: BookOpen,
    brandColor: "#FF4D4D",
    accentGradient: "from-[#FF4D4D] via-red-500 to-rose-600",
    ambientGlow:
      "radial-gradient(circle, rgba(255,77,77,0.2) 0%, transparent 100%)",
    codeSnippet: "// Curated Interview Prep",
    watermark: "CODE",
    tagline: "Essential questions & core concepts",
  };
};

export const InterviewSheetCover: React.FC<InterviewSheetCoverProps> = ({
  sheet,
  badgeRoadmap,
  statusBadge,
  aspectRatio = "aspect-[16/9]",
  className,
  forceVectorCover = false,
}) => {
  const [logoLoadError, setLogoLoadError] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);

  const rawCoverUrl =
    sheet?.coverImageURL ||
    sheet?.coverImageUrl ||
    sheet?.image ||
    sheet?.thumbnail;

  const branding = useMemo(
    () => resolveTechBranding(sheet?.slug, sheet?.name || sheet?.title),
    [sheet?.slug, sheet?.name, sheet?.title],
  );

  const shouldRenderCustomImage =
    !forceVectorCover &&
    Boolean(rawCoverUrl) &&
    !isLegacyTextCard(rawCoverUrl) &&
    !imageLoadError;

  const FallbackIcon = branding.fallbackIcon;

  // Render external custom artwork if provided and not a legacy blurry text card
  if (shouldRenderCustomImage) {
    return (
      <div
        className={cn(
          "relative w-full overflow-hidden bg-slate-900 select-none group/cover",
          aspectRatio,
          className,
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={rawCoverUrl}
          alt={sheet?.name || sheet?.title || "Sheet cover"}
          onError={() => setImageLoadError(true)}
          className="w-full h-full object-cover group-hover/cover:scale-105 transition-transform duration-300"
        />
        {/* Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-black/60 text-white backdrop-blur-xs">
          {badgeRoadmap || sheet?.roadmap || "SHEET"}
        </div>
        {statusBadge ? (
          <div className="absolute top-2.5 right-2.5">{statusBadge}</div>
        ) : null}
      </div>
    );
  }

  // Ultra-crisp, high-contrast, scalable vector cover
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden bg-[#0A0B10] dark:bg-[#0A0B10] border-b border-slate-800/80 select-none group/cover flex flex-col justify-between",
        aspectRatio,
        className,
      )}
    >
      {/* Ambient Tech Glow Background */}
      <div
        className="absolute -right-6 -top-6 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-40 transition-opacity duration-300 group-hover/cover:opacity-65"
        style={{ background: branding.ambientGlow }}
      />
      <div
        className="absolute -left-10 -bottom-10 w-40 h-40 rounded-full blur-3xl pointer-events-none opacity-20"
        style={{ background: branding.ambientGlow }}
      />

      {/* Subtle Dot Grid Accent */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, #FFFFFF 1px, transparent 0)",
          backgroundSize: "14px 14px",
        }}
      />

      {/* Left Vertical Gradient Accent Strip */}
      <div
        className={cn(
          "absolute left-0 top-0 bottom-0 w-1.5 sm:w-2 bg-gradient-to-b transition-all duration-300",
          branding.accentGradient,
        )}
      />

      {/* Faint Background Monospace Watermark */}
      <div className="absolute right-3 bottom-2 font-mono font-black text-4xl sm:text-5xl text-white/[0.04] pointer-events-none select-none tracking-tighter leading-none">
        {branding.watermark}
      </div>

      {/* Top Header: Roadmap Category & Status Badges */}
      <div className="relative z-10 flex items-center justify-between px-3.5 pt-2.5 sm:px-4 sm:pt-3">
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-black/60 text-white/95 border border-white/10 backdrop-blur-xs tracking-wider">
          {badgeRoadmap || sheet?.roadmap || "SHEET"}
        </span>

        {statusBadge ? <div className="shrink-0">{statusBadge}</div> : null}
      </div>

      {/* Center Body: Official Tech Logo + Crisp HTML Typography */}
      <div className="relative z-10 flex items-center gap-3 sm:gap-3.5 px-4 sm:px-5 py-2 my-auto">
        {/* Tech Icon / Logo Container */}
        <div className="relative flex items-center justify-center shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white/[0.07] border border-white/15 p-2 shadow-inner group-hover/cover:scale-105 transition-transform duration-300">
          {branding.logoUrl && !logoLoadError ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={branding.logoUrl}
              alt={`${branding.title} logo`}
              onError={() => setLogoLoadError(true)}
              className="w-full h-full object-contain filter drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]"
              loading="lazy"
            />
          ) : (
            <FallbackIcon
              className="w-6 h-6 text-white"
              style={{ color: branding.brandColor }}
            />
          )}
        </div>

        {/* Text Block: Title + Subtitle */}
        <div className="min-w-0 flex-1">
          <h4 className="text-base sm:text-lg lg:text-xl font-black text-white tracking-tight leading-tight truncate drop-shadow-xs">
            {branding.title}
          </h4>
          <p className="text-[11px] sm:text-xs font-semibold text-slate-300/90 tracking-wide mt-0.5 truncate">
            {branding.subtitle}
          </p>
        </div>
      </div>

      {/* Bottom Footer: Code Snippet & Tagline */}
      <div className="relative z-10 flex items-center justify-between px-4 sm:px-5 pb-2.5">
        <span className="font-mono text-[10px] text-slate-400/90 bg-white/[0.05] border border-white/10 rounded-md px-2 py-0.5 max-w-[210px] sm:max-w-[260px] truncate">
          {branding.codeSnippet}
        </span>
        {branding.tagline ? (
          <span className="hidden sm:inline-block text-[10px] text-slate-500 font-medium truncate max-w-[140px]">
            {branding.tagline}
          </span>
        ) : null}
      </div>
    </div>
  );
};

export default InterviewSheetCover;
