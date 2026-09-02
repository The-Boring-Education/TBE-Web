import type { UserProfile } from "@tbe/interface";
import React from "react";
import { LuPencil, LuStar, LuTarget, LuZap } from "react-icons/lu";

interface AboutMeCardProps {
  userProfile?: UserProfile | null;
  currentUser?: any;
  onEditClick?: () => void;
}

export const AboutMeCard: React.FC<AboutMeCardProps> = ({
  userProfile,
  currentUser,
  onEditClick,
}) => {
  const customAbout = userProfile?.aboutMe?.trim();

  const defaultAbout =
    "I'm a tech enthusiast who loves to code, build innovative projects and collaborate with amazing people. Currently exploring AI, System Design and DevOps.";

  const aboutText = customAbout || defaultAbout;

  return (
    <div className="w-full h-full bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
            About Me
          </h3>
          {onEditClick && (
            <button
              type="button"
              onClick={onEditClick}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#FF5757] hover:bg-[#FF5757]/10 px-2.5 py-1 rounded-lg transition"
              title="Edit about me"
            >
              <LuPencil className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Edit</span>
            </button>
          )}
        </div>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal mb-6">
          {aboutText}
        </p>
      </div>

      {/* Bullet Highlights */}
      <div className="space-y-3.5 pt-2 border-t border-slate-100">
        {/* Item 1 */}
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0 text-amber-500 shadow-2xs">
            <LuStar className="w-3.5 h-3.5 fill-amber-400" />
          </div>
          <span className="text-xs sm:text-xs font-semibold text-slate-700">
            Always curious to learn new things
          </span>
        </div>

        {/* Item 2 */}
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-sky-50 border border-sky-100 flex items-center justify-center shrink-0 text-sky-500 shadow-2xs">
            <LuTarget className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs sm:text-xs font-semibold text-slate-700">
            Love to solve real-world problems
          </span>
        </div>

        {/* Item 3 */}
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 text-emerald-500 shadow-2xs">
            <LuZap className="w-3.5 h-3.5 fill-emerald-400" />
          </div>
          <span className="text-xs sm:text-xs font-semibold text-slate-700">
            Believe in consistency & smart work
          </span>
        </div>
      </div>
    </div>
  );
};

export default AboutMeCard;
