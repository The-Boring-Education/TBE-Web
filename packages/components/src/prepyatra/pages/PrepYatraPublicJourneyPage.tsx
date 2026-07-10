import type { PrepLog, UserProfile } from "@tbe/interface";
import {
  formatGoalTimelineLabel,
  getTimeOfDay,
  withProtocol,
} from "@tbe/utils";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { PublicPageSpinner } from "../../common/publicJourney";
import Text from "../../common/Typography/Text";
import NotFound from "../../containers/Cards/NotFound";
import FlexContainer from "../../containers/Page/common/FlexContainer";
import Footer from "../../layout/Footer";
import Navbar from "../../layout/Navbar";
import Section from "../../layout/Section";

// Custom SVG Icons matching Dashboard
const CalendarIcon = () => (
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
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const ClockIcon = () => (
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
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const UserIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: "block" }}
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const LinkedInIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
);

const GitHubIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"
    />
  </svg>
);

const LeetCodeIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M13.483 0a1.374 1.374 0 0 0-.961.414l-9.777 9.778a3.73 3.73 0 0 0 0 5.284l2.15 2.15a3.73 3.73 0 0 0 5.284 0l9.778-9.777a1.375 1.375 0 0 0-.961-2.35h-3.66a.375.375 0 0 1-.375-.375v-3.66a1.375 1.375 0 0 0-1.478-1.464zm.414 1.414h3.66c.206 0 .375.169.375.375v3.66c0 .206-.169.375-.375.375h-3.66a1.375 1.375 0 0 0-1.375 1.375v3.66c0 .206-.169.375-.375.375h-3.66a.375.375 0 0 1-.375-.375v-3.66c0-.206.169-.375.375-.375h3.66a1.375 1.375 0 0 0 1.375-1.375v-3.66c0-.206.169-.375.375-.375z" />
  </svg>
);

/**
 * Public shareable profile + prep logs for a username (`/journey/[username]`).
 */
const PrepYatraPublicJourneyPage = () => {
  const router = useRouter();
  const { username } = router.query;
  const [prepLogs, setPrepLogs] = useState<PrepLog[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const formatDateLocal = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTimeSpentLocal = (hours: number) => {
    if (hours < 1) {
      return `${Math.round(hours * 60)} minutes`;
    }
    return `${hours} hour${hours !== 1 ? "s" : ""}`;
  };

  const getInitials = (n: string) => {
    if (!n) return "?";
    const parts = n.trim().split(/\s+/);
    const first = parts[0] ? parts[0].charAt(0) : "";
    const second = parts[1] ? parts[1].charAt(0) : "";
    if (first && second) {
      return `${first}${second}`.toUpperCase();
    }
    return first ? first.toUpperCase() : "?";
  };

  const getCompanyLabel = (c: string) => {
    switch (c) {
      case "STARTUP":
        return "Startups 🚀";
      case "MID_SIZE":
        return "Mid-size 🏢";
      case "MNC":
        return "MNCs 🌍";
      case "FAANG":
        return "FAANG / Top Tier ⭐";
      default:
        return c;
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case "MNC":
        return "MNC Prep 🏢";
      case "MERN":
        return "MERN Stack ⚛️";
      case "CollegePlacement":
        return "Placement 🎓";
      case "DSA":
        return "DSA Focus 🧠";
      case "SystemDesign":
        return "System Design 🏗️";
      case "GeneralTech":
        return "General Tech 💻";
      default:
        return cat.replace("_", " ");
    }
  };

  const getExperienceLabel = (exp: string) => {
    switch (exp) {
      case "fresher":
        return "0-1 years (Fresher) 🌱";
      case "junior":
        return "1-3 years (Junior) 💼";
      case "mid":
        return "3-5 years (Mid-level) 🚀";
      case "senior":
        return "5+ years (Senior) 👔";
      default:
        return exp.replace("_", " ");
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (!username) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const profileResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/user?username=${username}`,
        );

        if (!profileResponse.ok) {
          throw new Error("User not found");
        }

        const profileData = await profileResponse.json();
        if (profileData.status && profileData.data) {
          setProfile(profileData.data);
        } else {
          setProfile(profileData);
        }

        if (profileData.data?._id || profileData._id) {
          const userId = profileData.data?._id || profileData._id;
          const logsResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/prepyatra/prep-log?userId=${userId}`,
          );

          if (logsResponse.ok) {
            const logsData = await logsResponse.json();
            if (logsData.status && logsData.data) {
              setPrepLogs(logsData.data || []);
            } else {
              setPrepLogs(logsData || []);
            }
          }
        }
      } catch (err) {
        setError("Failed to load user profile");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  if (loading) {
    return <PublicPageSpinner />;
  }

  if (error || !profile) {
    return <NotFound />;
  }

  const handleGetStarted = () => {
    router.push("/");
  };

  const targetCompanies = profile.prepYatra?.targetCompanies || [];
  const interviewCategories =
    profile.prepYatra?.preferences?.interviewCategories ||
    profile.purpose ||
    [];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#fafafa" }}>
      <Navbar variant="prepyatra" />

      <Section className="container mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-12 mt-6">
        {/* HERO HEADER */}
        <FlexContainer direction="col" className="text-center mb-8 sm:mb-12">
          <Text
            level="h1"
            className="text-2xl sm:text-4xl font-bold tracking-tight text-[#111111] mb-2 sm:mb-3"
          >
            {getTimeOfDay()}! Meet{" "}
            <span style={{ color: "#e8372c" }}>{profile.name}</span>
          </Text>
          <Text
            level="p"
            className="text-sm sm:text-base text-[#8a8a8a] max-w-xl mx-auto"
          >
            Following their professional interview preparation journey on
            PrepYatra
          </Text>
        </FlexContainer>

        {/* CANDIDATE INFO PROFILE CARD */}
        <div
          className="max-w-2xl mx-auto mb-8 sm:mb-12"
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e8e8e8",
            borderRadius: "20px",
            padding: "28px 24px",
          }}
        >
          {/* Avatar and Info Header */}
          <div className="flex flex-col items-center text-center pb-6 border-b border-[#e8e8e8]">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold overflow-hidden mb-3.5"
              style={{
                backgroundColor: "#e8372c",
                border: "2px solid #e8372c",
              }}
            >
              {profile.image ? (
                <img
                  src={profile.image}
                  alt={profile.name || ""}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <span>{getInitials(profile.name || "")}</span>
              )}
            </div>
            <h2 className="text-lg font-bold text-[#111111] leading-tight">
              {profile.name}
            </h2>
            <p className="text-xs text-[#8a8a8a] font-semibold mt-0.5">
              @{profile.userName}
            </p>

            {/* Social icons */}
            {(profile.linkedInUrl ||
              profile.githubUrl ||
              profile.leetCodeUrl) && (
              <div className="flex justify-center items-center gap-2 mt-4">
                {profile.linkedInUrl && (
                  <a
                    href={withProtocol(profile.linkedInUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg flex items-center justify-center border border-[#e8e8e8] bg-white hover:bg-slate-50 transition-colors text-slate-650"
                  >
                    <LinkedInIcon />
                  </a>
                )}
                {profile.githubUrl && (
                  <a
                    href={withProtocol(profile.githubUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg flex items-center justify-center border border-[#e8e8e8] bg-white hover:bg-slate-50 transition-colors text-slate-650"
                  >
                    <GitHubIcon />
                  </a>
                )}
                {profile.leetCodeUrl && (
                  <a
                    href={withProtocol(profile.leetCodeUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg flex items-center justify-center border border-[#e8e8e8] bg-white hover:bg-slate-50 transition-colors text-slate-650"
                  >
                    <LeetCodeIcon />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Stats Parameters Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 text-center">
            <div className="p-3 bg-[#fafafa] rounded-xl border border-[#e8e8e8]/50">
              <span className="text-[10px] font-bold text-[#8a8a8a] uppercase tracking-wider block mb-1">
                Joined PrepYatra
              </span>
              <span className="text-[13px] font-bold text-[#111111]">
                {formatDateLocal(profile.createdAt)}
              </span>
            </div>
            <div className="p-3 bg-[#fafafa] rounded-xl border border-[#e8e8e8]/50">
              <span className="text-[10px] font-bold text-[#8a8a8a] uppercase tracking-wider block mb-1">
                Prep Timeline
              </span>
              <span className="text-[13px] font-bold text-[#111111]">
                {formatGoalTimelineLabel(profile.prepYatra?.goal) ||
                  "Not specified"}
              </span>
            </div>
            <div className="p-3 bg-[#fafafa] rounded-xl border border-[#e8e8e8]/50">
              <span className="text-[10px] font-bold text-[#8a8a8a] uppercase tracking-wider block mb-1">
                Experience Level
              </span>
              <span className="text-[13px] font-bold text-[#111111]">
                {getExperienceLabel(
                  profile.prepYatra?.experienceLevel || "fresher",
                )}
              </span>
            </div>
          </div>

          {/* Additional details (Occupation, Targets) */}
          <div className="mt-6 space-y-4 pt-4 border-t border-[#e8e8e8]">
            {profile.occupation && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4">
                <span className="text-xs font-bold text-[#8a8a8a] uppercase tracking-wider w-28 shrink-0">
                  Occupation:
                </span>
                <span className="text-xs font-semibold text-[#111111] bg-slate-100 px-2.5 py-1 rounded-md">
                  {profile.occupation.replace("_", " ")}
                </span>
              </div>
            )}

            {targetCompanies.length > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-start gap-1.5 sm:gap-4">
                <span className="text-xs font-bold text-[#8a8a8a] uppercase tracking-wider w-28 shrink-0 mt-1">
                  Target Companies:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {targetCompanies.map((c) => (
                    <span
                      key={c}
                      className="text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-[#e8372c]/10 text-[#e8372c] bg-[#fff0ef]"
                    >
                      {getCompanyLabel(c)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {interviewCategories.length > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-start gap-1.5 sm:gap-4">
                <span className="text-xs font-bold text-[#8a8a8a] uppercase tracking-wider w-28 shrink-0 mt-1">
                  Focus Areas:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {interviewCategories.map((cat) => (
                    <span
                      key={cat}
                      className="text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-slate-200 text-slate-700 bg-white"
                    >
                      {getCategoryLabel(cat)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* TECH STACK */}
        {profile.userSkills && profile.userSkills.length > 0 && (
          <div
            className="max-w-2xl mx-auto mb-8 sm:mb-12"
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e8e8e8",
              borderRadius: "20px",
              padding: "24px",
            }}
          >
            <h3 className="text-center font-bold text-sm text-[#111111] uppercase tracking-wider mb-4">
              Developer Tech Stack
            </h3>
            <div className="flex flex-wrap justify-center gap-1.5">
              {profile.userSkills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-lg text-[12px] bg-slate-50 border border-[#e8e8e8] text-[#111111] font-semibold"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* RECENT PREP LOGS */}
        <div className="max-w-2xl mx-auto mb-8 sm:mb-12">
          <h3 className="text-base font-bold text-[#111111] mb-4 text-center sm:text-left">
            Recent Preparation Sessions
          </h3>

          {prepLogs.length === 0 ? (
            <div
              className="text-center py-10"
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e8e8e8",
                borderRadius: "20px",
              }}
            >
              <p className="text-[#8a8a8a] text-xs italic">
                No preparation sessions logged yet. Check back later!
              </p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {prepLogs.slice(0, 10).map((log) => (
                <div
                  key={log._id}
                  className="p-5 flex flex-col gap-3 transition-colors duration-200"
                  style={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e8e8e8",
                    borderRadius: "20px",
                  }}
                >
                  {/* Log Header */}
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-[#111111] leading-tight">
                        {log.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#8a8a8a] font-medium mt-1.5">
                        <div className="flex items-center gap-1">
                          <CalendarIcon />
                          <span>{formatDateLocal(log.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ClockIcon />
                          <span>{formatTimeSpentLocal(log.timeSpent)}</span>
                        </div>
                      </div>
                    </div>
                    {/* Hours spent badge */}
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full text-[#e8372c] bg-[#fff0ef] border border-[#e8372c]/10">
                      {formatTimeSpentLocal(log.timeSpent)}
                    </span>
                  </div>

                  {/* Log Description */}
                  {log.description && (
                    <p className="text-xs text-[#8a8a8a] leading-relaxed whitespace-pre-wrap">
                      {log.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* BOTTOM CTA CARD */}
        <div className="max-w-2xl mx-auto mt-12 text-center">
          <div
            className="p-8 sm:p-10"
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e8e8e8",
              borderRadius: "20px",
            }}
          >
            <h3 className="text-lg font-bold text-[#111111] mb-2">
              Start Your Own PrepYatra Journey
            </h3>
            <p className="text-xs text-[#8a8a8a] mb-6 max-w-md mx-auto leading-relaxed">
              Track your interview preparation, build your recruiter network,
              and showcase your consistent daily progress!
            </p>
            <div className="flex justify-center">
              <button
                onClick={handleGetStarted}
                className="px-6 py-2.5 font-medium text-white transition-all duration-200 rounded-xl text-xs hover:scale-105 active:scale-[0.98]"
                style={{
                  backgroundColor: "#e8372c",
                  boxShadow: "0 4px 12px rgba(232,55,44,0.2)",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#d42e23")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#e8372c")
                }
              >
                Get Started for Free
              </button>
            </div>
          </div>
        </div>
      </Section>

      <Footer />
    </div>
  );
};

export default PrepYatraPublicJourneyPage;
