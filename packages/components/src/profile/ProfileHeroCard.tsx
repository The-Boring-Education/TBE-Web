import type { UserProfile } from "@tbe/interface";
import React from "react";

import ProfileVisualGraphic from "./ProfileVisualGraphic";

interface ProfileHeroCardProps {
  userProfile?: UserProfile | null;
  currentUser?: any;
  onEditClick?: () => void;
  isDark?: boolean;
}

const formatMemberSince = (dateString?: string): string => {
  if (!dateString) return "Joined recently";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "Joined recently";
    return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  } catch {
    return "Joined recently";
  }
};

export const ProfileHeroCard: React.FC<ProfileHeroCardProps> = ({
  userProfile,
  currentUser,
  onEditClick,
  isDark = false,
}) => {
  const rawName =
    userProfile?.name || currentUser?.name || currentUser?.userName || "";
  const firstName = rawName.trim().split(" ")[0] || "there";

  const memberSince = formatMemberSince(
    userProfile?.createdAt || currentUser?.createdAt,
  );

  const aboutMe = userProfile?.aboutMe?.trim();

  return (
    <div
      className={`w-full ${
        isDark
          ? "bg-[#0a0a0a] border-neutral-800/90 text-white"
          : "bg-white border-slate-200/80 text-slate-900"
      } rounded-2xl border shadow-xs p-5 sm:p-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 overflow-hidden relative`}
    >
      {/* Left Content */}
      <div className="flex-1 space-y-3 max-w-xl z-10">
        <h1
          className={`text-2xl sm:text-3xl font-extrabold ${
            isDark ? "text-white" : "text-slate-900"
          } tracking-tight flex items-center gap-2`}
        >
          Hey, I&apos;m {firstName}!{" "}
          <span className="inline-block animate-bounce">👋</span>
        </h1>

        {aboutMe ? (
          <p
            className={`text-xs sm:text-sm ${
              isDark ? "text-neutral-300" : "text-slate-600"
            } leading-relaxed font-normal`}
          >
            {aboutMe}
          </p>
        ) : (
          <div className="pt-0.5">
            {onEditClick ? (
              <button
                type="button"
                onClick={onEditClick}
                className={`text-xs ${
                  isDark
                    ? "text-neutral-400 hover:text-[#FF7A7A]"
                    : "text-slate-400 hover:text-[#FF5757]"
                } font-medium transition inline-flex items-center gap-1 cursor-pointer group`}
              >
                <span className="underline decoration-dotted underline-offset-2 group-hover:decoration-solid">
                  + Add a short bio to introduce yourself
                </span>
              </button>
            ) : (
              <p className="text-xs text-neutral-400 font-normal italic">
                No bio added yet.
              </p>
            )}
          </div>
        )}

        {/* Badges / Metadata */}
        <div className="flex items-center gap-1.5 pt-1 text-xs text-slate-500">
          <span className="text-neutral-400 text-[11px]">Member since</span>
          <span
            className={`font-semibold ${
              isDark ? "text-neutral-200" : "text-slate-700"
            } text-xs`}
          >
            {memberSince}
          </span>
        </div>
      </div>

      {/* Right 3D Visual Graphic */}
      <div className="shrink-0 self-center md:self-auto">
        <ProfileVisualGraphic />
      </div>
    </div>
  );
};

export default ProfileHeroCard;
