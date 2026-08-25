import React from "react";
import { LuCode2, LuNetwork } from "react-icons/lu";
import {
  SiAmazonaws,
  SiCplusplus,
  SiDocker,
  SiGit,
  SiJavascript,
  SiLinux,
  SiMongodb,
  SiNextdotjs,
  SiNodedotjs,
  SiOpenjdk,
  SiPostgresql,
  SiPython,
  SiReact,
  SiTailwindcss,
  SiTypescript,
} from "react-icons/si";

interface TechBrandIconProps {
  name: string;
  className?: string;
  size?: number;
}

export const TechBrandIcon: React.FC<TechBrandIconProps> = ({
  name,
  className = "w-4 h-4",
  size = 18,
}) => {
  const normalized = name.toLowerCase().trim();

  if (
    normalized.includes("c++") ||
    normalized.includes("c / c++") ||
    normalized === "c" ||
    normalized === "cpp"
  ) {
    return (
      <SiCplusplus
        size={size}
        className={className}
        style={{ color: "#00599C" }}
      />
    );
  }
  if (normalized.includes("python")) {
    return (
      <SiPython
        size={size}
        className={className}
        style={{ color: "#3776AB" }}
      />
    );
  }
  if (normalized.includes("javascript") || normalized === "js") {
    return (
      <SiJavascript
        size={size}
        className={className}
        style={{ color: "#EAB308" }}
      />
    );
  }
  if (normalized.includes("typescript") || normalized === "ts") {
    return (
      <SiTypescript
        size={size}
        className={className}
        style={{ color: "#3178C6" }}
      />
    );
  }
  if (normalized.includes("react")) {
    return (
      <SiReact size={size} className={className} style={{ color: "#0ea5e9" }} />
    );
  }
  if (normalized.includes("next")) {
    return (
      <SiNextdotjs
        size={size}
        className={className}
        style={{ color: "#0f172a" }}
      />
    );
  }
  if (normalized.includes("node")) {
    return (
      <SiNodedotjs
        size={size}
        className={className}
        style={{ color: "#22c55e" }}
      />
    );
  }
  if (normalized.includes("mongo")) {
    return (
      <SiMongodb
        size={size}
        className={className}
        style={{ color: "#16a34a" }}
      />
    );
  }
  if (
    normalized.includes("sql") ||
    normalized.includes("postgres") ||
    normalized.includes("mysql") ||
    normalized.includes("database")
  ) {
    return (
      <SiPostgresql
        size={size}
        className={className}
        style={{ color: "#3b82f6" }}
      />
    );
  }
  if (normalized.includes("git") || normalized.includes("github")) {
    return (
      <SiGit size={size} className={className} style={{ color: "#f97316" }} />
    );
  }
  if (
    normalized.includes("system design") ||
    normalized.includes("architecture")
  ) {
    return (
      <LuNetwork
        size={size}
        className={className}
        style={{ color: "#475569" }}
      />
    );
  }
  if (normalized.includes("linux") || normalized.includes("ubuntu")) {
    return (
      <SiLinux size={size} className={className} style={{ color: "#eab308" }} />
    );
  }
  if (
    normalized.includes("docker") ||
    normalized.includes("container") ||
    normalized.includes("kubernetes")
  ) {
    return (
      <SiDocker
        size={size}
        className={className}
        style={{ color: "#0284c7" }}
      />
    );
  }
  if (normalized.includes("java")) {
    return (
      <SiOpenjdk
        size={size}
        className={className}
        style={{ color: "#ea580c" }}
      />
    );
  }
  if (normalized.includes("aws") || normalized.includes("cloud")) {
    return (
      <SiAmazonaws
        size={size}
        className={className}
        style={{ color: "#f59e0b" }}
      />
    );
  }
  if (normalized.includes("tailwind")) {
    return (
      <SiTailwindcss
        size={size}
        className={className}
        style={{ color: "#06b6d4" }}
      />
    );
  }

  return (
    <LuCode2 size={size} className={className} style={{ color: "#64748b" }} />
  );
};

export default TechBrandIcon;
