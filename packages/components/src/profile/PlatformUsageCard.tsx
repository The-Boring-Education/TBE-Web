import type { UserProfile } from "@tbe/interface";
import React from "react";
import {
  LuBookOpen,
  LuBriefcase,
  LuClock,
  LuCode2,
  LuFlame,
  LuPencil,
  LuRocket,
  LuTarget,
  LuUsers,
} from "react-icons/lu";

interface PlatformUsageCardProps {
  userProfile?: UserProfile | null;
  currentUser?: any;
  onEditClick?: () => void;
  isDark?: boolean;
}

interface TrackBadge {
  id: string;
  label: string;
  category:
    "goal" | "timeline" | "experience" | "language" | "company" | "purpose";
  icon: React.ReactNode;
}

export const PlatformUsageCard: React.FC<PlatformUsageCardProps> = ({
  userProfile,
  currentUser,
  onEditClick,
  isDark = false,
}) => {
  const goal =
    userProfile?.prepYatra?.goal ||
    (userProfile as any)?.goal ||
    currentUser?.goal;

  const rawTimeline =
    userProfile?.dsaYatra?.timeline ||
    userProfile?.oncampus?.duration ||
    (userProfile as any)?.timeline;

  const rawExp =
    userProfile?.prepYatra?.experienceLevel ||
    userProfile?.dsaYatra?.experienceLevel ||
    userProfile?.oncampus?.experienceLevel ||
    (userProfile as any)?.experienceLevel;

  const targetCompanies =
    userProfile?.prepYatra?.targetCompanies ||
    (userProfile as any)?.targetCompanies ||
    [];

  const purposes =
    userProfile?.purpose ||
    userProfile?.prepYatra?.preferences?.focusAreas ||
    userProfile?.dsaYatra?.targetTopics ||
    currentUser?.purpose ||
    [];

  const badges: TrackBadge[] = [];

  // 1. Primary Goal
  if (goal) {
    let goalLabel = "Crack Placements";
    if (goal === "build_projects" || goal.includes("project"))
      goalLabel = "Build Production Projects";
    else if (goal === "job_skill" || goal.includes("skill"))
      goalLabel = "Upskill for Current Job";
    else if (
      goal === "fun_school" ||
      goal.includes("fun") ||
      goal.includes("exam")
    )
      goalLabel = "Learn for Fun & Exams";
    else if (
      goal === "crack_placements" ||
      goal.includes("crack") ||
      goal.includes("Job")
    )
      goalLabel = "Tech Placements & Jobs";

    badges.push({
      id: "goal",
      label: `Goal: ${goalLabel}`,
      category: "goal",
      icon: <LuTarget className="w-3.5 h-3.5 text-[#FF5757]" />,
    });
  }

  // 2. Timeline
  if (rawTimeline) {
    let timelineLabel = "4–6 Months Roadmap";
    if (
      rawTimeline === "3_months" ||
      rawTimeline === "3Months" ||
      rawTimeline === "1Month"
    ) {
      timelineLabel = "1–3 Months Sprint";
    } else if (rawTimeline === "1_year" || rawTimeline === "1Year") {
      timelineLabel = "6–12 Months Mastery";
    } else if (rawTimeline === "6_months" || rawTimeline === "6Months") {
      timelineLabel = "4–6 Months Roadmap";
    }

    badges.push({
      id: "timeline",
      label: `Timeline: ${timelineLabel}`,
      category: "timeline",
      icon: <LuClock className="w-3.5 h-3.5 text-[#FF5757]" />,
    });
  }

  // 3. Experience Level
  if (rawExp) {
    let expLabel = "Beginner (0–1 yr)";
    const lower = rawExp.toLowerCase();
    if (
      lower.includes("advanced") ||
      lower.includes("3+") ||
      lower.includes("experienced")
    ) {
      expLabel = "Advanced (3+ yrs)";
    } else if (lower.includes("intermediate") || lower.includes("1-3")) {
      expLabel = "Intermediate (1–3 yrs)";
    } else {
      expLabel = "Beginner (0–1 yr)";
    }

    badges.push({
      id: "experience",
      label: `Level: ${expLabel}`,
      category: "experience",
      icon: <LuFlame className="w-3.5 h-3.5 text-[#FF5757]" />,
    });
  }

  // 4. Target Companies
  if (Array.isArray(targetCompanies) && targetCompanies.length > 0) {
    targetCompanies.forEach((comp: string) => {
      let label = comp;
      if (comp.toLowerCase() === "startup") label = "Startups";
      else if (comp.toLowerCase() === "faang") label = "FAANG & Product";
      else if (comp.toLowerCase() === "mnc") label = "Top MNCs";
      else if (comp.toLowerCase() === "oncampus") label = "On-Campus";

      badges.push({
        id: `comp-${comp}`,
        label: `Target: ${label}`,
        category: "company",
        icon: <LuRocket className="w-3.5 h-3.5 text-[#FF5757]" />,
      });
    });
  }

  // 5. Platform Usage / Purpose fallbacks if few badges exist
  if (badges.length === 0) {
    // Default platform usage items
    badges.push(
      {
        id: "building-projects",
        label: "Building Projects",
        category: "purpose",
        icon: <LuCode2 className="w-3.5 h-3.5 text-[#FF5757]" />,
      },
      {
        id: "learning",
        label: "Learning Tech",
        category: "purpose",
        icon: <LuBookOpen className="w-3.5 h-3.5 text-[#FF5757]" />,
      },
      {
        id: "networking",
        label: "Networking",
        category: "purpose",
        icon: <LuUsers className="w-3.5 h-3.5 text-[#FF5757]" />,
      },
      {
        id: "job-search",
        label: "Job Search",
        category: "purpose",
        icon: <LuBriefcase className="w-3.5 h-3.5 text-[#FF5757]" />,
      },
    );
  }

  return (
    <div
      className={`w-full ${
        isDark
          ? "bg-[#0a0a0a] border-neutral-800/90 text-white"
          : "bg-white border-slate-200/80 text-slate-900"
      } rounded-2xl border shadow-xs p-5 sm:p-6`}
    >
      <div className="flex items-center justify-between mb-3.5">
        <h3
          className={`text-sm sm:text-base font-bold ${
            isDark ? "text-white" : "text-slate-900"
          } tracking-tight`}
        >
          Goals & Preparation Track
        </h3>
        {onEditClick && (
          <button
            type="button"
            onClick={onEditClick}
            className={`flex items-center gap-1.5 text-xs font-semibold ${
              isDark
                ? "text-neutral-400 hover:text-[#FF5757] hover:bg-neutral-900"
                : "text-slate-500 hover:text-[#FF5757] hover:bg-[#FF5757]/10"
            } px-2.5 py-1 rounded-lg transition cursor-pointer`}
            title="Edit goals and timeline"
          >
            <LuPencil className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Edit Goals</span>
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {badges.map((badge) => (
          <div
            key={badge.id}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${
              isDark
                ? "border-[#FF5757]/30 bg-[#FF5757]/10 text-[#FF7A7A]"
                : "border-[#FF5757]/20 bg-[#FF5757]/[0.03] text-[#FF5757]"
            } font-semibold text-xs transition shadow-2xs whitespace-nowrap`}
          >
            {badge.icon}
            <span>{badge.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlatformUsageCard;
