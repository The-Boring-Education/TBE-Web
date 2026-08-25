import { USER_ROLE_OPTIONS } from "@tbe/constants";
import type { UserProfile } from "@tbe/interface";
import React from "react";
import {
  LuBriefcase,
  LuCalendar,
  LuGraduationCap,
  LuMail,
  LuMapPin,
  LuPencil,
  LuPhone,
} from "react-icons/lu";

interface ProfileSidebarCardProps {
  userProfile?: UserProfile | null;
  currentUser?: any;
  onEditClick: () => void;
  isDark?: boolean;
}

const formatJoinedDate = (dateString?: string): string => {
  if (!dateString) return "Recently";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "Recently";
    return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  } catch {
    return "Recently";
  }
};

const formatOccupation = (occupation?: string): string => {
  if (!occupation) return "Member";
  const found = USER_ROLE_OPTIONS.find((o) => o.value === occupation);
  if (found) return found.label;
  if (occupation === "TECH_STUDENT") return "Tech Student";
  if (occupation === "WORKING_PROFESSIONAL") return "Working Professional";
  if (occupation === "CAREER_SWITCHER") return "Career Switcher";
  if (occupation === "NON_TECH_STUDENT") return "Non-Tech Student";
  return occupation;
};

const resolveLocation = (userProfile?: UserProfile | null): string => {
  if (userProfile?.location && userProfile.location.trim()) {
    return userProfile.location.trim();
  }
  return "Not specified";
};

const resolveHeadline = (
  userProfile?: UserProfile | null,
  occupation?: string,
): string => {
  if (userProfile?.headline && userProfile.headline.trim()) {
    return userProfile.headline.trim();
  }
  if (userProfile?.aboutMe && userProfile.aboutMe.trim()) {
    return userProfile.aboutMe.trim();
  }
  const occ = formatOccupation(occupation);
  return `${occ} at The Boring Education`;
};

export const ProfileSidebarCard: React.FC<ProfileSidebarCardProps> = ({
  userProfile,
  currentUser,
  onEditClick,
  isDark = false,
}) => {
  const displayName =
    userProfile?.name || currentUser?.name || currentUser?.userName || "User";

  const resolvedUserName =
    userProfile?.userName ||
    currentUser?.userName ||
    (currentUser as any)?.username ||
    "user";

  const displayEmail = userProfile?.email || currentUser?.email || "";

  const displayImage = userProfile?.image || currentUser?.image;
  const occupation = userProfile?.occupation || currentUser?.occupation;
  const contactNo = userProfile?.contactNo || currentUser?.contactNo || "";
  const createdAt = userProfile?.createdAt || currentUser?.createdAt;
  const joinedDate = formatJoinedDate(createdAt);
  const location = resolveLocation(userProfile);
  const headline = resolveHeadline(userProfile, occupation);

  return (
    <div
      className={`w-full ${
        isDark
          ? "bg-[#0a0a0a] border-neutral-800/90 text-white"
          : "bg-white border-slate-200/80 text-slate-900"
      } rounded-2xl border shadow-xs overflow-hidden flex flex-col`}
    >
      {/* Scenic Mountain Cover Banner */}
      <div className="relative w-full h-36 sm:h-40 bg-gradient-to-r from-teal-800 via-emerald-800 to-slate-900 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80"
          alt="Profile Banner"
          className="w-full h-full object-cover opacity-85"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/30" />
      </div>

      {/* Avatar + Main Identity Info */}
      <div className="relative px-6 pt-0 pb-6 flex flex-col items-center">
        {/* Avatar Overlapping Header */}
        <div className="relative -mt-14 mb-3">
          <div
            className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full border-[4px] ${
              isDark
                ? "border-[#0a0a0a] bg-neutral-900"
                : "border-white bg-slate-100"
            } shadow-md overflow-hidden flex items-center justify-center`}
          >
            {displayImage ? (
              <img
                src={displayImage}
                alt={displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#FF5757] to-[#e63e3e] text-white text-2xl sm:text-3xl font-black">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          {/* Online/Active Green Badge Indicator */}
          <span
            className="absolute bottom-1 right-1.5 w-4 h-4 rounded-full bg-[#10b981] border-[2.5px] border-white shadow-xs"
            title="Active"
          />
        </div>

        {/* Name & Handle */}
        <h2
          className={`text-xl sm:text-2xl font-bold ${
            isDark ? "text-white" : "text-slate-900"
          } text-center tracking-tight leading-snug`}
        >
          {displayName}
        </h2>
        <p
          className={`text-xs sm:text-sm font-medium ${
            isDark ? "text-neutral-400" : "text-slate-500"
          } text-center mt-0.5`}
        >
          @{resolvedUserName}
        </p>

        {/* Bio / Headline */}
        <p
          className={`text-xs sm:text-sm ${
            isDark ? "text-neutral-300" : "text-slate-600"
          } text-center mt-3 leading-relaxed px-2 font-normal`}
        >
          {headline}
        </p>

        {/* Divider */}
        <div
          className={`w-full border-t ${
            isDark ? "border-neutral-900" : "border-slate-100"
          } my-5`}
        />

        {/* Info Rows */}
        <div className="w-full space-y-4 text-xs sm:text-sm">
          {/* Email */}
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-full ${
                isDark
                  ? "bg-neutral-900 border-neutral-800 text-neutral-300"
                  : "bg-slate-50 border-slate-100 text-slate-600"
              } border flex items-center justify-center shrink-0`}
            >
              <LuMail className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span
                className={`${
                  isDark ? "text-neutral-100" : "text-slate-900"
                } font-semibold text-xs sm:text-sm truncate`}
                title={displayEmail}
              >
                {displayEmail}
              </span>
              <span className="text-[11px] text-neutral-500 font-medium">
                Email
              </span>
            </div>
          </div>

          {/* Occupation */}
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-full ${
                isDark
                  ? "bg-neutral-900 border-neutral-800 text-neutral-300"
                  : "bg-slate-50 border-slate-100 text-slate-600"
              } border flex items-center justify-center shrink-0`}
            >
              {occupation?.toLowerCase().includes("student") ? (
                <LuGraduationCap className="w-4 h-4" />
              ) : (
                <LuBriefcase className="w-4 h-4" />
              )}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span
                className={`${
                  isDark ? "text-neutral-100" : "text-slate-900"
                } font-semibold text-xs sm:text-sm`}
              >
                {formatOccupation(occupation)}
              </span>
              <span className="text-[11px] text-neutral-500 font-medium">
                Occupation
              </span>
            </div>
          </div>

          {/* Contact Number */}
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-full ${
                isDark
                  ? "bg-neutral-900 border-neutral-800 text-neutral-300"
                  : "bg-slate-50 border-slate-100 text-slate-600"
              } border flex items-center justify-center shrink-0`}
            >
              <LuPhone className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span
                className={`${
                  isDark ? "text-neutral-100" : "text-slate-900"
                } font-semibold text-xs sm:text-sm`}
              >
                {contactNo || "Not added"}
              </span>
              <span className="text-[11px] text-neutral-500 font-medium">
                Contact Number
              </span>
            </div>
          </div>

          {/* Joined TBE */}
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-full ${
                isDark
                  ? "bg-neutral-900 border-neutral-800 text-neutral-300"
                  : "bg-slate-50 border-slate-100 text-slate-600"
              } border flex items-center justify-center shrink-0`}
            >
              <LuCalendar className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span
                className={`${
                  isDark ? "text-neutral-100" : "text-slate-900"
                } font-semibold text-xs sm:text-sm`}
              >
                {joinedDate}
              </span>
              <span className="text-[11px] text-neutral-500 font-medium">
                Joined TBE
              </span>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-full ${
                isDark
                  ? "bg-neutral-900 border-neutral-800 text-neutral-300"
                  : "bg-slate-50 border-slate-100 text-slate-600"
              } border flex items-center justify-center shrink-0`}
            >
              <LuMapPin className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span
                className={`${
                  isDark ? "text-neutral-100" : "text-slate-900"
                } font-semibold text-xs sm:text-sm`}
              >
                {location}
              </span>
              <span className="text-[11px] text-neutral-500 font-medium">
                Location
              </span>
            </div>
          </div>
        </div>

        {/* Edit Profile Button */}
        <button
          type="button"
          onClick={onEditClick}
          className="w-full mt-6 py-2.5 px-4 rounded-xl border border-[#FF5757]/40 text-[#FF5757] hover:bg-[#FF5757]/10 hover:border-[#FF5757] font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition active:scale-[0.98] cursor-pointer shadow-2xs"
        >
          <LuPencil className="w-3.5 h-3.5" />
          <span>Edit Profile</span>
        </button>
      </div>
    </div>
  );
};

export default ProfileSidebarCard;
