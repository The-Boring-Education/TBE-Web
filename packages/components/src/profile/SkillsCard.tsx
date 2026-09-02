import type { UserProfile } from "@tbe/interface";
import React from "react";
import { LuPencil } from "react-icons/lu";

import TechBrandIcon from "./TechBrandIcon";

interface SkillsCardProps {
  userProfile?: UserProfile | null;
  currentUser?: any;
  onEditClick?: () => void;
  isDark?: boolean;
}

export const SkillsCard: React.FC<SkillsCardProps> = ({
  userProfile,
  currentUser,
  onEditClick,
  isDark = false,
}) => {
  const userSkills =
    userProfile?.userSkills && userProfile.userSkills.length > 0
      ? userProfile.userSkills
      : [];

  return (
    <div
      className={`w-full ${
        isDark
          ? "bg-[#0a0a0a] border-neutral-800/90 text-white"
          : "bg-white border-slate-200/80 text-slate-900"
      } rounded-2xl border shadow-xs p-5 sm:p-6`}
    >
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <h3
            className={`text-sm sm:text-base font-bold ${
              isDark ? "text-white" : "text-slate-900"
            } tracking-tight`}
          >
            Technical Skills
          </h3>
          {userSkills.length > 0 && (
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                isDark
                  ? "bg-neutral-900 text-neutral-300 border border-neutral-800"
                  : "bg-slate-100 text-slate-600 border border-slate-200/60"
              }`}
            >
              {userSkills.length}
            </span>
          )}
        </div>
        {onEditClick && (
          <button
            type="button"
            onClick={onEditClick}
            className={`flex items-center gap-1.5 text-xs font-semibold ${
              isDark
                ? "text-neutral-400 hover:text-[#FF5757] hover:bg-neutral-900"
                : "text-slate-500 hover:text-[#FF5757] hover:bg-[#FF5757]/10"
            } px-2.5 py-1 rounded-lg transition cursor-pointer`}
            title="Edit skills"
          >
            <LuPencil className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Edit</span>
          </button>
        )}
      </div>

      {userSkills.length > 0 ? (
        <div className="flex flex-wrap gap-2 sm:gap-2.5">
          {userSkills.map((skill) => (
            <div
              key={skill}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border bg-transparent ${
                isDark
                  ? "border-neutral-800 text-neutral-200 hover:border-neutral-600 hover:bg-neutral-900/30"
                  : "border-slate-200/80 text-slate-800 hover:border-slate-300 hover:bg-slate-50/50"
              } transition text-xs font-semibold shadow-2xs`}
            >
              <TechBrandIcon name={skill} size={16} />
              <span>{skill}</span>
            </div>
          ))}
        </div>
      ) : (
        <div
          className={`flex flex-col sm:flex-row items-center justify-between gap-3 py-3 px-4 rounded-xl ${
            isDark
              ? "bg-neutral-900/40 border border-dashed border-neutral-800"
              : "bg-slate-50/70 border border-dashed border-slate-200"
          } text-center sm:text-left`}
        >
          <div>
            <p
              className={`text-xs font-semibold ${
                isDark ? "text-neutral-200" : "text-slate-700"
              }`}
            >
              No technical skills added yet
            </p>
            <p className="text-[11px] text-neutral-400 font-normal">
              Add programming languages, frameworks, and tools to complete your
              profile.
            </p>
          </div>
          {onEditClick && (
            <button
              type="button"
              onClick={onEditClick}
              className="shrink-0 px-3 py-1.5 rounded-lg bg-[#FF5757] text-white text-xs font-semibold hover:bg-[#e04343] transition shadow-xs"
            >
              + Add Skills
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default SkillsCard;
