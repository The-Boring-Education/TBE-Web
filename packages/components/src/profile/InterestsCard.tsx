import type { UserProfile } from "@tbe/interface";
import React from "react";
import {
  LuBookOpen,
  LuBrain,
  LuCode2,
  LuGlobe,
  LuNetwork,
  LuPencil,
  LuPuzzle,
  LuRocket,
  LuShieldCheck,
} from "react-icons/lu";

interface InterestsCardProps {
  userProfile?: UserProfile | null;
  currentUser?: any;
  onEditClick?: () => void;
  isDark?: boolean;
}

interface InterestItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

export const InterestsCard: React.FC<InterestsCardProps> = ({
  userProfile,
  currentUser,
  onEditClick,
  isDark = false,
}) => {
  // Full catalog of available interest badges
  const allInterests: InterestItem[] = [
    {
      id: "web_dev",
      label: "Web Development",
      icon: <LuGlobe className="w-3.5 h-3.5 text-[#FF5757]" />,
    },
    {
      id: "system_design",
      label: "System Design",
      icon: <LuNetwork className="w-3.5 h-3.5 text-[#FF5757]" />,
    },
    {
      id: "ai_ml",
      label: "AI / ML",
      icon: <LuBrain className="w-3.5 h-3.5 text-[#FF5757]" />,
    },
    {
      id: "open_source",
      label: "Open Source",
      icon: <LuCode2 className="w-3.5 h-3.5 text-[#FF5757]" />,
    },
    {
      id: "cybersecurity",
      label: "Cybersecurity",
      icon: <LuShieldCheck className="w-3.5 h-3.5 text-[#FF5757]" />,
    },
    {
      id: "problem_solving",
      label: "Problem Solving",
      icon: <LuPuzzle className="w-3.5 h-3.5 text-[#FF5757]" />,
    },
    {
      id: "startups",
      label: "Startups",
      icon: <LuRocket className="w-3.5 h-3.5 text-[#FF5757]" />,
    },
    {
      id: "reading",
      label: "Reading",
      icon: <LuBookOpen className="w-3.5 h-3.5 text-[#FF5757]" />,
    },
  ];

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
          Interests
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
            title="Edit interests"
          >
            <LuPencil className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Edit</span>
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {allInterests.map((interest) => (
          <div
            key={interest.id}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${
              isDark
                ? "border-neutral-800 bg-neutral-900/80 hover:bg-neutral-900 hover:border-neutral-700 text-neutral-200"
                : "border-slate-100 bg-slate-50/80 hover:bg-slate-100 hover:border-slate-200 text-slate-700"
            } transition text-xs font-medium shadow-2xs whitespace-nowrap`}
          >
            <div className="shrink-0">{interest.icon}</div>
            <span>{interest.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InterestsCard;
