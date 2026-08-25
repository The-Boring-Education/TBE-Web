import type { UserProfile } from "@tbe/interface";
import React from "react";
import { LuExternalLink, LuPencil } from "react-icons/lu";
import { SiCodeforces, SiGithub, SiLeetcode, SiLinkedin } from "react-icons/si";

interface CodingProfilesCardProps {
  userProfile?: UserProfile | null;
  currentUser?: any;
  onEditClick?: () => void;
  isDark?: boolean;
}

interface ProfileItem {
  id: string;
  name: string;
  url: string;
  displayUrl: string;
  icon: React.ReactNode;
}

const cleanDisplayUrl = (rawUrl: string, prefix: string): string => {
  if (!rawUrl) return prefix;
  let cleaned = rawUrl
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "");
  if (cleaned.endsWith("/")) cleaned = cleaned.slice(0, -1);
  return cleaned;
};

export const CodingProfilesCard: React.FC<CodingProfilesCardProps> = ({
  userProfile,
  currentUser,
  onEditClick,
  isDark = false,
}) => {
  const githubUrl =
    userProfile?.githubUrl?.trim() || currentUser?.githubUrl?.trim() || "";

  const leetCodeUrl =
    userProfile?.leetCodeUrl?.trim() || currentUser?.leetCodeUrl?.trim() || "";

  const linkedInUrl =
    userProfile?.linkedInUrl?.trim() || currentUser?.linkedInUrl?.trim() || "";

  const codeforcesUrl =
    (userProfile as any)?.codeforcesUrl?.trim() ||
    currentUser?.codeforcesUrl?.trim() ||
    "";

  const profiles: ProfileItem[] = [];

  if (githubUrl) {
    profiles.push({
      id: "github",
      name: "GitHub",
      url: githubUrl.startsWith("http") ? githubUrl : `https://${githubUrl}`,
      displayUrl: cleanDisplayUrl(githubUrl, "github.com"),
      icon: (
        <SiGithub
          className={`w-4 h-4 ${isDark ? "text-white" : "text-[#181717]"}`}
        />
      ),
    });
  }

  if (leetCodeUrl) {
    profiles.push({
      id: "leetcode",
      name: "LeetCode",
      url: leetCodeUrl.startsWith("http")
        ? leetCodeUrl
        : `https://${leetCodeUrl}`,
      displayUrl: cleanDisplayUrl(leetCodeUrl, "leetcode.com"),
      icon: <SiLeetcode className="w-4 h-4 text-[#FFA116]" />,
    });
  }

  if (linkedInUrl) {
    profiles.push({
      id: "linkedin",
      name: "LinkedIn",
      url: linkedInUrl.startsWith("http")
        ? linkedInUrl
        : `https://${linkedInUrl}`,
      displayUrl: cleanDisplayUrl(linkedInUrl, "linkedin.com"),
      icon: <SiLinkedin className="w-4 h-4 text-[#0A66C2]" />,
    });
  }

  if (codeforcesUrl) {
    profiles.push({
      id: "codeforces",
      name: "Codeforces",
      url: codeforcesUrl.startsWith("http")
        ? codeforcesUrl
        : `https://${codeforcesUrl}`,
      displayUrl: cleanDisplayUrl(codeforcesUrl, "codeforces.com"),
      icon: <SiCodeforces className="w-4 h-4 text-[#1F8ACB]" />,
    });
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
          Coding & Social Profiles
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
            title="Edit profiles"
          >
            <LuPencil className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Edit</span>
          </button>
        )}
      </div>

      <div className="space-y-2">
        {profiles.length > 0 ? (
          profiles.map((profile) => (
            <a
              key={profile.id}
              href={profile.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`group flex items-center justify-between p-2 rounded-xl ${
                isDark
                  ? "hover:bg-neutral-900/80 border-transparent hover:border-neutral-800"
                  : "hover:bg-slate-50 border-transparent hover:border-slate-100"
              } transition border cursor-pointer`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-8 h-8 rounded-lg ${
                    isDark
                      ? "bg-neutral-900 border-neutral-800 group-hover:bg-neutral-800"
                      : "bg-slate-50 border-slate-100 group-hover:bg-white"
                  } border flex items-center justify-center shrink-0 group-hover:shadow-2xs transition`}
                >
                  {profile.icon}
                </div>
                <div className="flex flex-col min-w-0">
                  <span
                    className={`text-xs font-bold ${
                      isDark
                        ? "text-neutral-100 group-hover:text-[#FF7A7A]"
                        : "text-slate-900 group-hover:text-[#FF5757]"
                    } transition`}
                  >
                    {profile.name}
                  </span>
                  <span
                    className={`text-[11px] ${
                      isDark ? "text-neutral-400" : "text-slate-500"
                    } font-normal truncate`}
                  >
                    {profile.displayUrl}
                  </span>
                </div>
              </div>

              <div
                className={`${
                  isDark
                    ? "text-neutral-500 group-hover:text-neutral-300"
                    : "text-slate-400 group-hover:text-slate-600"
                } transition pl-2`}
              >
                <LuExternalLink className="w-3.5 h-3.5" />
              </div>
            </a>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-5 text-center px-4">
            <p
              className={`text-xs ${
                isDark ? "text-neutral-400" : "text-slate-500"
              } font-medium`}
            >
              No coding or social profiles linked yet.
            </p>
            {onEditClick && (
              <button
                type="button"
                onClick={onEditClick}
                className="mt-2 text-xs font-semibold text-[#FF5757] hover:underline"
              >
                + Connect GitHub, LeetCode, or LinkedIn
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CodingProfilesCard;
