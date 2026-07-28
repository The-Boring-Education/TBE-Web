import { formatGoalTimelineLabel } from "@tbe/utils";
import React from "react";
import { toast } from "sonner";

const getInitials = (name?: string): string => {
  if (!name) return "PY";
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

// Inline SVG icons matching exact design spec
const CopyIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="12"
    height="12"
    viewBox="0 0 24 24"
    style={{ display: "block", flexShrink: 0 }}
  >
    <g
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="4"
    >
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </g>
  </svg>
);

const PencilIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="12"
    height="12"
    viewBox="0 0 24 24"
    style={{ display: "block", flexShrink: 0 }}
  >
    <path
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="4"
      d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497zM15 5l4 4"
    />
  </svg>
);

const BriefcaseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    style={{ display: "block", flexShrink: 0 }}
  >
    <g
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="3.43"
    >
      <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      <rect width="20" height="14" x="2" y="6" rx="2" />
    </g>
  </svg>
);

const TargetIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    style={{ display: "block", flexShrink: 0 }}
  >
    <g
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="3.43"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </g>
  </svg>
);

const BuildingIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    style={{ display: "block", flexShrink: 0 }}
  >
    <g
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="3.43"
    >
      <path d="M10 12h4m-4-4h4m0 13v-3a2 2 0 0 0-4 0v3" />
      <path d="M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2" />
      <path d="M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16" />
    </g>
  </svg>
);

const CompassIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    style={{ display: "block", flexShrink: 0 }}
  >
    <g
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="3.43"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m16.24 7.76l-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z" />
    </g>
  </svg>
);

const CalendarIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    style={{ display: "block", flexShrink: 0 }}
  >
    <g
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="3.43"
    >
      <path d="M8 2v4m8-4v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
    </g>
  </svg>
);

interface Profile {
  _id?: string;
  name?: string;
  userName?: string;
  linkedInUrl?: string;
  githubUrl?: string;
  leetCodeUrl?: string;
  image?: string;
  userSkills?: string[];
  userSkillsLastUpdated?: string;
  prepYatra?: {
    experienceLevel?: string;
    goal?: string;
    skills?: string[];
    targetCompanies?: string[];
    preferences?: {
      focusAreas?: string[];
      interviewCategories?: string[];
    };
  };
  createdAt?: string;
  occupation?: string;
  purpose?: string[];
}

interface User {
  name?: string;
  picture?: string;
  id?: string;
}

interface ProfileSectionProps {
  user?: User;
  profile?: Profile;
  onEditClick?: () => void;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({
  user,
  profile,
  onEditClick,
}) => {
  const displayName = profile?.name || user?.name || "Prep Scholar";
  const displayUsername =
    profile?.userName ||
    user?.name?.toLowerCase().replace(/\s+/g, "") ||
    "username";
  const displayImage = profile?.image || user?.picture;

  const handleShare = async () => {
    if (typeof window === "undefined" || !profile?.userName) return;
    const url = `${window.location.origin}/journey/${profile.userName}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Journey URL copied!");
    } catch {
      toast.success("Journey URL copied!");
    }
  };

  const formatOccupation = (occ?: string) => {
    if (!occ) return undefined;
    const map: Record<string, string> = {
      TECH_STUDENT: "Tech Student",
      NON_TECH_STUDENT: "Non-Tech Student",
      WORKING_PROFESSIONAL: "Working Professional",
      STUDENT: "Student",
      FREELANCER: "Freelancer",
      JOB_SEEKER: "Job Seeker",
      ENTREPRENEUR: "Entrepreneur",
      OTHER: "Other",
    };
    if (map[occ]) return map[occ];
    return occ.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const formatPurpose = (purposes?: string[]) => {
    if (!purposes || purposes.length === 0) return undefined;
    const map: Record<string, string> = {
      LEARNING_TECH: "Learning Tech",
      BUILDING_PROJECTS: "Building Projects",
      INTERVIEW_PREP: "Interview Prep",
      JOB_SEARCH: "Job Search",
      LEARNING: "Learning",
      NETWORKING: "Networking",
    };
    return purposes
      .map(
        (p) =>
          map[p] ||
          String(p)
            .replace(/_/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase()),
      )
      .join(", ");
  };

  const infoRows = [
    {
      icon: <BriefcaseIcon />,
      label: "Experience",
      value: profile?.prepYatra?.experienceLevel || "Not set",
    },
    {
      icon: <TargetIcon />,
      label: "Goal",
      value: formatGoalTimelineLabel(profile?.prepYatra?.goal) || "Not set",
    },
    {
      icon: <BuildingIcon />,
      label: "Occupation",
      value: formatOccupation(profile?.occupation) || "Not set",
    },
    {
      icon: <CompassIcon />,
      label: "Purpose",
      value: formatPurpose(profile?.purpose) || "Not set",
    },
    {
      icon: <CalendarIcon />,
      label: "Joined",
      value: profile?.createdAt
        ? new Date(profile.createdAt).toLocaleDateString()
        : "Unknown",
    },
  ];

  return (
    <>
      {/* Avatar + name + action buttons */}
      <div className="px-6 pt-3 pb-3 flex flex-col items-center gap-2 border-b border-[#e8e8e8]">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold overflow-hidden flex-shrink-0"
          style={{ backgroundColor: "#e8372c" }}
        >
          {displayImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={displayImage}
              alt={displayName}
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <span>{getInitials(displayName)}</span>
          )}
        </div>

        <div className="text-center">
          <div
            className="font-semibold leading-tight"
            style={{ fontSize: "14px", color: "#111111" }}
          >
            {displayName}
          </div>
          <div
            className="mt-0.5"
            style={{ fontSize: "11px", color: "#8a8a8a" }}
          >
            @{displayUsername}
          </div>
        </div>

        {/* Social Links */}
        {(profile?.linkedInUrl ||
          profile?.githubUrl ||
          profile?.leetCodeUrl) && (
          <div className="flex gap-2.5 mt-1 mb-0.5 justify-center">
            {profile.linkedInUrl && (
              <a
                href={
                  profile.linkedInUrl.startsWith("http")
                    ? profile.linkedInUrl
                    : `https://${profile.linkedInUrl}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 rounded hover:bg-slate-100 transition-colors"
                style={{ color: "#e8372c" }}
                title="LinkedIn"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ display: "block" }}
                >
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
            )}
            {profile.githubUrl && (
              <a
                href={
                  profile.githubUrl.startsWith("http")
                    ? profile.githubUrl
                    : `https://${profile.githubUrl}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 rounded hover:bg-slate-100 transition-colors"
                style={{ color: "#e8372c" }}
                title="GitHub"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ display: "block" }}
                >
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                </svg>
              </a>
            )}
            {profile.leetCodeUrl && (
              <a
                href={
                  profile.leetCodeUrl.startsWith("http")
                    ? profile.leetCodeUrl
                    : `https://${profile.leetCodeUrl}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 rounded hover:bg-slate-100 transition-colors"
                style={{ color: "#e8372c" }}
                title="LeetCode"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ display: "block" }}
                >
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
            )}
          </div>
        )}

        <div className="flex gap-2 mt-1 flex-wrap justify-center">
          {profile?.userName && (
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 transition-colors hover:bg-[#f0f0f0]"
              style={{
                padding: "4px 10px",
                borderRadius: "8px",
                border: "1px solid #e8e8e8",
                fontSize: "11px",
                color: "#111111",
              }}
            >
              Share Journey
              <CopyIcon />
            </button>
          )}
          {onEditClick && (
            <button
              onClick={onEditClick}
              className="flex items-center gap-1.5 transition-colors hover:bg-[#f0f0f0]"
              style={{
                padding: "4px 10px",
                borderRadius: "8px",
                border: "1px solid #e8e8e8",
                fontSize: "11px",
                color: "#111111",
              }}
            >
              Edit Details
              <PencilIcon />
            </button>
          )}
        </div>
      </div>

      <div className="px-4 py-2 flex flex-col gap-0.5">
        {infoRows.map((row) => (
          <div
            key={row.label}
            className="flex items-start justify-between py-1.5 px-2 rounded-lg"
          >
            <div
              className="flex items-center gap-2.5 shrink-0 pt-0.5"
              style={{ color: "#8a8a8a" }}
            >
              {row.icon}
              <span style={{ fontSize: "13px" }}>{row.label}</span>
            </div>
            <div className="flex flex-wrap gap-1 justify-end max-w-[200px]">
              {typeof row.value === "string" && row.value.includes(",") ? (
                row.value.split(",").map((val) => (
                  <span
                    key={val}
                    className="rounded-md font-medium text-right"
                    style={{
                      fontSize: "11px",
                      padding: "2px 6px",
                      backgroundColor: "#f0f0f0",
                      color: "#111111",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {val.trim()}
                  </span>
                ))
              ) : (
                <span
                  className="rounded-md font-medium text-right"
                  style={{
                    fontSize: "11px",
                    padding: "3px 8px",
                    backgroundColor: "#f0f0f0",
                    color: "#111111",
                    whiteSpace: "normal",
                    wordBreak: "break-word",
                  }}
                >
                  {row.value}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default ProfileSection;
