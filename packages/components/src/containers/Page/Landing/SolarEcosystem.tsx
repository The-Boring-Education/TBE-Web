import { SectionHeaderContainer } from "@tbe/components";
import { motion } from "framer-motion";
import {
  BookOpen,
  Briefcase,
  Code,
  FileCheck,
  GraduationCap,
  Layers,
  Library,
  Target,
  Tv,
  Video,
} from "lucide-react";
import React, { useEffect, useState } from "react";

export interface OrbitNode {
  id: string;
  name: string;
  tagline: string;
  icon: React.ElementType;
  href: string;
  target?: string;
  orbit: 1 | 2;
  angleDeg: number;
}

const SOLAR_NODES: OrbitNode[] = [
  // Inner Orbit
  {
    id: "shiksha",
    name: "Shiksha",
    tagline: "Free Tech Courses",
    icon: BookOpen,
    href: "/shiksha",
    orbit: 1,
    angleDeg: 0,
  },
  {
    id: "interview-prep",
    name: "Interview Prep",
    tagline: "Topic Sheets",
    icon: Target,
    href: "/interview-prep",
    orbit: 1,
    angleDeg: 72,
  },
  {
    id: "webinar",
    name: "Webinars",
    tagline: "Live Sessions",
    icon: Video,
    href: "/webinar",
    orbit: 1,
    angleDeg: 144,
  },
  {
    id: "youfocus",
    name: "YouFocus",
    tagline: "Focus Playlists",
    icon: Tv,
    href: "/youfocus",
    orbit: 1,
    angleDeg: 216,
  },
  {
    id: "projects",
    name: "Projects",
    tagline: "Real Apps",
    icon: Code,
    href: "/projects",
    orbit: 1,
    angleDeg: 288,
  },

  // Outer Orbit
  {
    id: "prep-yatra",
    name: "PrepYatra",
    tagline: "Job Search Tracker",
    icon: Briefcase,
    href: "https://prepyatra.theboringeducation.com",
    target: "_blank",
    orbit: 2,
    angleDeg: 36,
  },
  {
    id: "dsa-yatra",
    name: "DSA Yatra",
    tagline: "DSA Patterns",
    icon: Layers,
    href: "https://dsayatra.theboringeducation.com",
    target: "_blank",
    orbit: 2,
    angleDeg: 108,
  },
  {
    id: "resume-yatra",
    name: "ResumeYatra",
    tagline: "ATS Resume Builder",
    icon: FileCheck,
    href: "https://resumeyatra.theboringeducation.com",
    target: "_blank",
    orbit: 2,
    angleDeg: 180,
  },
  {
    id: "oncampus",
    name: "OnCampus",
    tagline: "Placement Hub",
    icon: GraduationCap,
    href: "https://oncampus.theboringeducation.com",
    target: "_blank",
    orbit: 2,
    angleDeg: 252,
  },
  {
    id: "resources",
    name: "Resources",
    tagline: "Tech Cheatsheets",
    icon: Library,
    href: "https://resources.theboringeducation.com",
    target: "_blank",
    orbit: 2,
    angleDeg: 324,
  },
];

export interface SolarEcosystemProps {
  theme?: "light" | "dark";
}

export function SolarEcosystem({ theme = "light" }: SolarEcosystemProps) {
  const [hoveredNode, setHoveredNode] = useState<OrbitNode | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Scale radii on mobile so all nodes fit without overlap
  const innerRadius = isMobile ? 80 : 105;
  const outerRadius = isMobile ? 136 : 175;
  // Node offset = half of node button size (h-6=24 → 12px mobile, h-10=40 → 20px desktop)
  const innerOffset = isMobile ? 12 : 21;
  const outerOffset = isMobile ? 12 : 22;

  return (
    <section
      id="ecosystem-solar"
      className="relative overflow-hidden pt-4 pb-2 md:pt-6 md:pb-4 bg-transparent select-none"
    >
      <div className="relative mx-auto max-w-5xl px-4 text-center z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mb-2"
        >
          <SectionHeaderContainer
            heading="One Ecosystem."
            focusText="Infinite Possibilities."
            headingLevel={3}
            subtext="Explore our interconnected universe of learning platforms, placement tools, and interview sheets."
            textCenter
          />
        </motion.div>

        {/* Orbit Arena */}
        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => {
            setIsPaused(false);
            setHoveredNode(null);
          }}
          className="relative mx-auto flex items-center justify-center"
          style={{
            height: isMobile ? "320px" : "400px",
            maxWidth: isMobile ? "320px" : "560px",
            width: "100%",
          }}
        >
          {/* Outer Orbit Track */}
          <div
            className="absolute rounded-full border border-dashed border-[#FF5757]/20"
            style={{
              height: outerRadius * 2,
              width: outerRadius * 2,
            }}
          />

          {/* Inner Orbit Track */}
          <div
            className="absolute rounded-full border border-dashed border-[#FF5757]/30"
            style={{
              height: innerRadius * 2,
              width: innerRadius * 2,
            }}
          />

          {/* Central TBE Logo */}
          <div className="relative z-20 flex flex-col items-center justify-center">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className={`flex items-center justify-center bg-transparent cursor-pointer ${isMobile ? "h-10 w-10" : "h-14 w-14 sm:h-16 sm:w-16"}`}
            >
              <img
                src="https://ik.imagekit.io/tbe/webapp/logo.svg"
                alt="TBE Logo"
                className="h-full w-full object-contain"
              />
            </motion.div>
            <span
              className={`mt-1 font-extrabold text-zinc-900 ${isMobile ? "text-[9px]" : "text-xs"}`}
            >
              The Boring Education
            </span>
          </div>

          {/* Inner Orbit Rotating Layer */}
          <motion.div
            animate={{ rotate: isPaused ? undefined : 360 }}
            transition={{
              rotate: { duration: 12, repeat: Infinity, ease: "linear" },
            }}
            className="absolute inset-0 z-10 pointer-events-none"
          >
            {SOLAR_NODES.filter((n) => n.orbit === 1).map((node) => {
              const angleRad = (node.angleDeg * Math.PI) / 180;
              return (
                <div
                  key={node.id}
                  style={{
                    position: "absolute",
                    left: `calc(50% + ${Math.cos(angleRad) * innerRadius}px - ${innerOffset}px)`,
                    top: `calc(50% + ${Math.sin(angleRad) * innerRadius}px - ${innerOffset}px)`,
                  }}
                  className="pointer-events-auto"
                >
                  <motion.div
                    animate={{ rotate: isPaused ? undefined : -360 }}
                    transition={{
                      rotate: {
                        duration: 12,
                        repeat: Infinity,
                        ease: "linear",
                      },
                    }}
                  >
                    <a
                      href={node.href}
                      target={node.target}
                      rel={
                        node.target === "_blank"
                          ? "noopener noreferrer"
                          : undefined
                      }
                      onMouseEnter={() => setHoveredNode(node)}
                      className={`group relative flex items-center justify-center rounded-full border border-zinc-200/90 bg-white/90 backdrop-blur-sm transition-all duration-200 hover:border-[#FF5757] hover:bg-[#FF5757] ${isMobile ? "h-6 w-6 p-1" : "h-10 w-10 sm:h-11 sm:w-11 p-2.5"}`}
                    >
                      <node.icon
                        className={`text-zinc-700 transition-colors group-hover:text-white ${isMobile ? "h-3.5 w-3.5" : "h-4.5 w-4.5 sm:h-5 sm:w-5"}`}
                      />
                      <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-zinc-900 border border-zinc-800 px-2 py-0.5 text-[10px] font-bold text-white opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none z-30">
                        {node.name}
                      </span>
                    </a>
                  </motion.div>
                </div>
              );
            })}
          </motion.div>

          {/* Outer Orbit Rotating Layer */}
          <motion.div
            animate={{ rotate: isPaused ? undefined : -360 }}
            transition={{
              rotate: { duration: 18, repeat: Infinity, ease: "linear" },
            }}
            className="absolute inset-0 z-10 pointer-events-none"
          >
            {SOLAR_NODES.filter((n) => n.orbit === 2).map((node) => {
              const angleRad = (node.angleDeg * Math.PI) / 180;
              return (
                <div
                  key={node.id}
                  style={{
                    position: "absolute",
                    left: `calc(50% + ${Math.cos(angleRad) * outerRadius}px - ${outerOffset}px)`,
                    top: `calc(50% + ${Math.sin(angleRad) * outerRadius}px - ${outerOffset}px)`,
                  }}
                  className="pointer-events-auto"
                >
                  <motion.div
                    animate={{ rotate: isPaused ? undefined : 360 }}
                    transition={{
                      rotate: {
                        duration: 18,
                        repeat: Infinity,
                        ease: "linear",
                      },
                    }}
                  >
                    <a
                      href={node.href}
                      target={node.target}
                      rel={
                        node.target === "_blank"
                          ? "noopener noreferrer"
                          : undefined
                      }
                      onMouseEnter={() => setHoveredNode(node)}
                      className={`group relative flex items-center justify-center rounded-full border border-zinc-200/90 bg-white/90 backdrop-blur-sm transition-all duration-200 hover:border-[#FF5757] hover:bg-[#FF5757] ${isMobile ? "h-6 w-6 p-1" : "h-11 w-11 sm:h-12 sm:w-12 p-2.5"}`}
                    >
                      <node.icon
                        className={`text-zinc-700 transition-colors group-hover:text-white ${isMobile ? "h-3.5 w-3.5" : "h-5 w-5"}`}
                      />
                      <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-zinc-900 border border-zinc-800 px-2 py-0.5 text-[10px] font-bold text-white opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none z-30">
                        {node.name}
                      </span>
                    </a>
                  </motion.div>
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default SolarEcosystem;
