import { routes } from "@tbe/constants";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import {
  FiArrowRight,
  FiArrowUpRight,
  FiBookOpen,
  FiExternalLink,
  FiGrid,
  FiLayers,
  FiPlayCircle,
  FiTarget,
  FiUser,
  FiUsers,
} from "react-icons/fi";

import type { PersonalizationQuizData } from "./PersonalizationQuiz";
import { PersonalizationQuiz } from "./PersonalizationQuiz";

export interface LearnDashboardContainerProps {
  user: any;
  initialPersonalization?: any;
}

const TBE_ECOSYSTEM_APPS = [
  {
    name: "DSAYatra",
    badge: "DSA & PATTERNS",
    badgeStyle: "bg-orange-50 text-orange-700 border-orange-200/80",
    desc: "Master Data Structures & Algorithms with curated sheets, pattern quizzes & interview problems.",
    url: "https://dsayatra.theboringeducation.com",
    isExternal: true,
    image: "/images/dsayatra.png",
    fallback: "/images/dsayatra.png",
    bentoSpan: "md:col-span-6 md:row-span-2",
    shapeType: "hero-square",
  },
  {
    name: "Oncampus",
    badge: "APTITUDE & MOCKS",
    badgeStyle: "bg-purple-50 text-purple-700 border-purple-200/80",
    desc: "Comprehensive company placement prep, mock tests & technical interview questions.",
    url: "https://oncampus.theboringeducation.com",
    isExternal: true,
    image: "/images/oncampus.png",
    fallback: "/images/oncampus.png",
    bentoSpan: "md:col-span-6 md:row-span-2",
    shapeType: "hero-purple",
  },
  {
    name: "PrepYatra",
    badge: "INTERVIEW PREP",
    badgeStyle: "bg-blue-50 text-blue-700 border-blue-200/80",
    desc: "Track recruiter contacts, interview logs, resources & personalized goal roadmaps.",
    url: "https://prepyatra.theboringeducation.com",
    isExternal: true,
    image: "/images/prepyatra.png",
    fallback: "/images/target.png",
    bentoSpan: "md:col-span-6 md:row-span-1",
    shapeType: "wide-blue",
  },
  {
    name: "ResumeYatra",
    badge: "AI RESUME BUILDER",
    badgeStyle: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    desc: "Build ATS-optimized tech resumes & portfolios that stand out to top recruiters.",
    url: "https://resumeyatra.theboringeducation.com",
    isExternal: true,
    image: "/images/resumeyatra.png",
    fallback: "/images/note.png",
    bentoSpan: "md:col-span-6 md:row-span-1",
    shapeType: "wide-emerald",
  },
  {
    name: "Quizes App",
    badge: "DAILY BATTLES",
    badgeStyle: "bg-red-50 text-red-700 border-red-200/80",
    desc: "Test your coding knowledge with gamified quick quizzes and real-time leaderboards.",
    url: "https://quiz.theboringeducation.com",
    isExternal: true,
    image: "/images/quiz.png",
    fallback: "/images/bulb.png",
    bentoSpan: "md:col-span-4 md:row-span-1",
    shapeType: "circular-ring",
  },
  {
    name: "TechYatra",
    badge: "CAREER ROADMAPS",
    badgeStyle: "bg-amber-50 text-amber-700 border-amber-200/80",
    desc: "Step-by-step developer career paths from beginner to production-ready engineer.",
    url: "https://techyatra.theboringeducation.com",
    isExternal: true,
    image: "/images/techyatra.png",
    fallback: "/images/laptop.png",
    bentoSpan: "md:col-span-4 md:row-span-1",
    shapeType: "hexagon-accent",
  },
  {
    name: "Resources",
    badge: "DEV RESOURCES",
    badgeStyle: "bg-indigo-50 text-indigo-700 border-indigo-200/80",
    desc: "Free developer resources, cheat sheets, interview guides & open-source tools.",
    url: "https://resources.theboringeducation.com",
    isExternal: true,
    image: "/images/resources.png",
    fallback: "/images/coding_bg.png",
    bentoSpan: "md:col-span-4 md:row-span-1",
    shapeType: "full-banner",
  },
];

const RECOMMENDED_COURSES = [
  {
    id: "fullstack",
    badge: "SKILL PATH",
    badgeBg: "bg-[#E0F2FE] text-[#0369A1]",
    title: "Full Stack Web Development",
    desc: "Master frontend, backend and databases by building real world projects.",
    coursesInfo: "6 Courses  |  Beginner Friendly",
    timeInfo: "25 hrs",
  },
  {
    id: "blockly",
    badge: "IN PROGRESS",
    badgeBg: "bg-[#FFCC00] text-slate-900 font-extrabold",
    title: "Learn to Code with Blockly",
    desc: "Want to learn how to get started with programming in an interactive way? Try our drag and drop code lessons!",
    progress: 11,
    coursesInfo: "4 Courses  |  Beginner Friendly",
    timeInfo: "10 hrs",
  },
  {
    id: "datascience",
    badge: "DATA SCIENCE",
    badgeBg: "bg-[#E0F2FE] text-[#0369A1]",
    title: "Data Science Fundamentals",
    desc: "Learn statistics, Python, data analysis and visualization from scratch.",
    coursesInfo: "5 Courses  |  Beginner Friendly",
    timeInfo: "18 hrs",
  },
  {
    id: "dsa",
    badge: "DSA",
    badgeBg: "bg-[#E0F2FE] text-[#0369A1]",
    title: "DSA Roadmap",
    desc: "Crack coding interviews with our structured DSA roadmap and practice sheets.",
    coursesInfo: "5 Courses  |  Beginner Friendly",
    timeInfo: "38 hrs",
  },
];

export const LearnDashboardContainer: React.FC<
  LearnDashboardContainerProps
> = ({ user, initialPersonalization }) => {
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "ecosystem" | "mylearning"
  >("dashboard");
  const [personalization, setPersonalization] = useState<any>(
    initialPersonalization || null,
  );
  const [showQuiz, setShowQuiz] = useState<boolean>(false);
  const [isSavingQuiz, setIsSavingQuiz] = useState<boolean>(false);
  const [isCookingQuiz, setIsCookingQuiz] = useState<boolean>(false);

  useEffect(() => {
    if (user?.id) {
      fetchPersonalization();
    }
  }, [user?.id]);

  const fetchPersonalization = () => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(`tbe_personalization_${user.id}`);
        if (stored) {
          setPersonalization(JSON.parse(stored));
        } else if (initialPersonalization) {
          setPersonalization(initialPersonalization);
        }
      } catch (err) {
        console.error("Failed to read personalization from localStorage", err);
      }
    }
  };

  const handleQuizSubmit = async (data: PersonalizationQuizData) => {
    setIsSavingQuiz(true);
    try {
      // Simulate network save delay so the loader overlay is shown beautifully
      await new Promise((resolve) => setTimeout(resolve, 800));

      const personalizationData = {
        isCompleted: true,
        interests: data.interests,
        experienceLevel: data.experienceLevel,
        weeklyCommitment: data.weeklyCommitment || "regular",
        skipped: data.skipped,
        updatedAt: new Date().toISOString(),
      };

      if (typeof window !== "undefined") {
        localStorage.setItem(
          `tbe_personalization_${user.id}`,
          JSON.stringify(personalizationData),
        );
      }
      setPersonalization(personalizationData);
      setShowQuiz(false);
      setIsCookingQuiz(false);
    } catch (err) {
      console.error("Error saving personalization quiz locally", err);
      setShowQuiz(false);
      setIsCookingQuiz(false);
    } finally {
      setIsSavingQuiz(false);
    }
  };

  const handleOpenQuiz = () => {
    setShowQuiz(true);
    setIsCookingQuiz(false);
    setIsSavingQuiz(false);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative">
      <div
        className={
          !showQuiz || isCookingQuiz || isSavingQuiz ? "block" : "hidden"
        }
      >
        {/* Main 2-Column Layout with Vertical Sidebar */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left Column: Transparent Navigation Sidebar */}
          <aside className="w-full lg:w-56 flex-shrink-0 lg:sticky lg:top-20">
            <nav className="bg-transparent space-y-1.5 p-0">
              {/* Dashboard */}
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`w-full flex items-center justify-between px-4 py-3 text-xs sm:text-sm transition-all rounded-none ${
                  activeTab === "dashboard"
                    ? "border-l-4 border-[#FF3B30] bg-red-50/70 text-[#FF3B30] font-extrabold shadow-2xs"
                    : "text-slate-700 hover:bg-slate-100/70 font-semibold"
                }`}
              >
                <div className="flex items-center gap-3">
                  <FiGrid
                    className={`w-4.5 h-4.5 ${activeTab === "dashboard" ? "text-[#FF3B30]" : "text-slate-600"}`}
                  />
                  <span>Dashboard</span>
                </div>
              </button>

              {/* Ecosystem */}
              <button
                onClick={() => setActiveTab("ecosystem")}
                className={`w-full flex items-center justify-between px-4 py-3 text-xs sm:text-sm transition-all rounded-none ${
                  activeTab === "ecosystem"
                    ? "border-l-4 border-[#FF3B30] bg-red-50/70 text-[#FF3B30] font-extrabold shadow-2xs"
                    : "text-slate-700 hover:bg-slate-100/70 font-semibold"
                }`}
              >
                <div className="flex items-center gap-3">
                  <FiLayers
                    className={`w-4.5 h-4.5 ${activeTab === "ecosystem" ? "text-[#FF3B30]" : "text-slate-600"}`}
                  />
                  <span>Ecosystem</span>
                </div>
              </button>

              {/* My Learning */}
              <button
                onClick={() => setActiveTab("mylearning")}
                className={`w-full flex items-center justify-between px-4 py-3 text-xs sm:text-sm transition-all rounded-none ${
                  activeTab === "mylearning"
                    ? "border-l-4 border-[#FF3B30] bg-red-50/70 text-[#FF3B30] font-extrabold shadow-2xs"
                    : "text-slate-700 hover:bg-slate-100/70 font-semibold"
                }`}
              >
                <div className="flex items-center gap-3">
                  <FiBookOpen
                    className={`w-4.5 h-4.5 ${activeTab === "mylearning" ? "text-[#FF3B30]" : "text-slate-600"}`}
                  />
                  <span>My learning</span>
                </div>
              </button>

              {/* Interview Prep */}
              <a
                href={routes.interviewPrep}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs sm:text-sm text-slate-700 hover:bg-slate-100/70 font-semibold transition-all group"
              >
                <div className="flex items-center gap-3">
                  <FiTarget className="w-4.5 h-4.5 text-slate-600 group-hover:text-[#FF3B30] transition-colors" />
                  <span>Interview Prep</span>
                </div>
              </a>

              {/* Shiksha */}
              <a
                href={routes.shiksha}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs sm:text-sm text-slate-700 hover:bg-slate-100/70 font-semibold transition-all group"
              >
                <div className="flex items-center gap-3">
                  <FiPlayCircle className="w-4.5 h-4.5 text-slate-600 group-hover:text-[#FF3B30] transition-colors" />
                  <span>Shiksha</span>
                </div>
              </a>
            </nav>
          </aside>

          {/* Right Column: Main Content Area */}
          <main className="flex-1 min-w-0 space-y-6">
            {activeTab === "ecosystem" ? (
              /* Ecosystem Tab */
              <div className="space-y-4">
                <section className="space-y-3">
                  <h2 className="text-sm font-bold text-slate-900">
                    Quick access to TBE Ecosystem
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {TBE_ECOSYSTEM_APPS.map((app, i) => (
                      <a
                        key={app.name}
                        href={app.url}
                        target={app.isExternal ? "_blank" : undefined}
                        rel={app.isExternal ? "noopener noreferrer" : undefined}
                        className={`group bg-white hover:bg-slate-50/80 border border-slate-200/80 hover:border-[#FF3B30]/50 transition-all hover:shadow-md rounded-2xl p-4 flex min-w-0 overflow-hidden ${i % 2 === 0 ? "flex-col" : "flex-col-reverse"}`}
                      >
                        {/* Image */}
                        <div className="w-full h-36 sm:h-44 flex items-center justify-center py-3">
                          <img
                            src={app.image}
                            alt={app.name}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = app.fallback;
                            }}
                            className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>

                        {/* Text */}
                        <div
                          className={
                            i % 2 === 0
                              ? "mt-auto pt-2.5 border-t border-slate-100"
                              : "mb-auto pb-2.5 border-b border-slate-100"
                          }
                        >
                          <div className="flex items-center justify-between gap-1">
                            <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-[#FF3B30] transition-colors leading-tight">
                              {app.name}
                            </h3>
                            <FiArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#FF3B30] shrink-0" />
                          </div>
                          <p className="text-[11px] text-slate-500 font-medium leading-snug mt-0.5">
                            {app.desc}
                          </p>
                        </div>
                      </a>
                    ))}
                  </div>
                </section>
              </div>
            ) : activeTab === "dashboard" ? (
              /* Dashboard Tab */
              <div className="space-y-6">
                {/* Continue Learning */}
                <section className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-slate-900">
                      Continue learning
                    </h2>
                    <Link
                      href={routes.shiksha}
                      className="text-[11px] font-bold text-[#FF3B30] hover:underline flex items-center gap-1"
                    >
                      View all courses <FiArrowRight className="w-3 h-3" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                    <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-xs relative">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-red-50 text-[#FF3B30] border border-red-100 flex items-center justify-center font-black text-xl shadow-xs shrink-0">
                          {"</>"}
                        </div>
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 bg-red-50 text-[#FF3B30] border border-red-100 rounded-full text-[11px] font-bold">
                              33% complete
                            </span>
                            <span className="text-xs text-slate-400 font-semibold">
                              • Logic Building
                            </span>
                          </div>
                          <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                            Learn to Code with Blockly
                          </h3>
                          <p className="text-xs text-slate-600 font-medium">
                            Module 1: Introduction to Learn to Code with Blockly
                          </p>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden mt-2">
                            <div className="bg-[#FF3B30] h-1.5 rounded-full w-1/3" />
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                        <div className="text-xs text-slate-500 font-medium hidden sm:block">
                          Next up:{" "}
                          <span className="font-bold text-slate-800">
                            Variables &amp; Logic Blocks
                          </span>
                        </div>
                        <Link
                          href={routes.allCourses.logicBuildingForEveryone}
                          className="w-full sm:w-auto px-5 py-2.5 bg-[#FF3B30] hover:bg-[#EE3126] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all shrink-0"
                        >
                          Resume Learning{" "}
                          <FiArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>

                    <div className="bg-white border border-slate-200/80 rounded-xl p-4 flex flex-col justify-between">
                      <div>
                        <h3 className="text-xs font-bold text-slate-900 mb-1">
                          Let&apos;s keep the momentum!
                        </h3>
                        <p className="text-[11px] text-slate-500 leading-tight">
                          Build a learning rhythm that fits your schedule.
                        </p>
                      </div>
                      <div className="mt-4 flex items-center gap-2">
                        <button className="flex-1 py-1.5 bg-[#FF3B30] text-white font-bold text-[11px] rounded-lg">
                          Make a plan
                        </button>
                        <button className="px-3 py-1.5 bg-slate-100 text-slate-600 font-bold text-[11px] rounded-lg">
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Your Progress */}
                <section className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-slate-900">
                      Your progress
                    </h2>
                    <button className="text-xs font-bold text-[#FF3B30] hover:underline flex items-center gap-1">
                      View achievements <FiArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                    <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-xl p-4 sm:p-5 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                            Subjects &amp; Languages
                          </h3>
                          <button className="text-xs font-bold text-[#FF3B30] hover:underline">
                            Edit
                          </button>
                        </div>
                        <div className="grid grid-cols-5 gap-2 text-center py-2">
                          {[
                            { name: "Web Dev", percent: 12 },
                            { name: "DSA", percent: 8 },
                            { name: "Python", percent: 0 },
                            { name: "AI/ML", percent: 0 },
                            { name: "DBMS", percent: 0 },
                          ].map((item) => (
                            <div
                              key={item.name}
                              className="flex flex-col items-center"
                            >
                              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-3 border-slate-100 border-t-[#FF3B30] flex items-center justify-center font-bold text-xs text-slate-900 mb-1.5">
                                {item.percent}%
                              </div>
                              <span className="text-[11px] font-semibold text-slate-700">
                                {item.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-100 text-center">
                        <p className="text-xs font-bold text-slate-800 flex items-center justify-center gap-1">
                          ☀️ Take action to stay motivated
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Move forward in your learning and watch your skills
                          grow.
                        </p>
                        <Link
                          href={routes.shiksha}
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#FF3B30] mt-1.5 hover:underline"
                        >
                          Continue learning <FiArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>

                    <div className="space-y-3 flex flex-col justify-between">
                      <div className="bg-white border border-slate-200/80 rounded-xl p-4 flex items-center justify-between">
                        <div className="space-y-1">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                            No weekly target set yet
                          </h4>
                          <p className="text-[11px] text-slate-500">
                            Set a weekly study target to stay consistent.
                          </p>
                          <button className="mt-2 px-3.5 py-1.5 bg-[#FF3B30] text-white text-xs font-bold rounded-lg shadow-xs">
                            Set target
                          </button>
                        </div>
                        <div className="w-14 h-14 rounded-full bg-red-50 text-[#FF3B30] flex items-center justify-center shrink-0">
                          <svg
                            className="w-8 h-8 text-[#FF3B30]"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >
                            <circle cx="12" cy="12" r="9" />
                            <circle cx="12" cy="12" r="5" />
                            <circle cx="12" cy="12" r="1" />
                            <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
                          </svg>
                        </div>
                      </div>
                      <div className="bg-white border border-slate-200/80 rounded-xl p-4 flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                              Your goal
                            </h4>
                            <button className="text-xs font-bold text-[#FF3B30] hover:underline">
                              Edit
                            </button>
                          </div>
                          <p className="text-xs font-bold text-slate-800 mt-2">
                            Grow in my existing role
                          </p>
                        </div>
                        <div className="w-12 h-12 flex items-center justify-center shrink-0 text-slate-400">
                          <svg
                            className="w-10 h-10"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            viewBox="0 0 24 24"
                          >
                            <path d="M4 20l8-14 8 14H4z" />
                            <path
                              d="M12 6v6"
                              stroke="#FF3B30"
                              strokeWidth="2"
                            />
                            <path
                              d="M12 6l3 2-3 2"
                              fill="#FF3B30"
                              stroke="#FF3B30"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Enrolled Courses & Interview Sheets */}
                <section className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm sm:text-base font-bold text-slate-900">
                        Enrolled Courses &amp; Interview Sheets
                      </h2>
                      <span className="px-2 py-0.5 bg-red-50 text-[#FF3B30] border border-red-100 rounded-full text-[10px] font-extrabold">
                        3 Active
                      </span>
                    </div>
                    <a
                      href={routes.interviewPrep}
                      className="text-xs font-bold text-[#FF3B30] hover:underline flex items-center gap-1 shrink-0"
                    >
                      View all sheets <FiArrowRight className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="flex items-stretch gap-3.5 overflow-x-auto snap-x pb-2 pt-1 flex-nowrap scroll-smooth [&::-webkit-scrollbar]:h-[3px] [&::-webkit-scrollbar-track]:bg-slate-100 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400">
                    {/* Card 1 */}
                    <div className="w-72 sm:w-80 shrink-0 bg-white border border-slate-200/90 rounded-2xl p-5 space-y-4 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between snap-start">
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-100 shrink-0">
                            INTERVIEW SHEET
                          </span>
                          <span className="text-xs font-extrabold text-[#FF3B30] shrink-0">
                            45% Solved
                          </span>
                        </div>
                        <div>
                          <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                            DSA 450 Interview Questions Sheet
                          </h3>
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                            Must-do Data Structures &amp; Algorithms coding
                            interview questions for top tech companies.
                          </p>
                        </div>
                      </div>
                      <div className="space-y-3 pt-3 border-t border-slate-100">
                        <div className="space-y-1.5">
                          <div className="w-full bg-slate-100 rounded-full h-2">
                            <div className="bg-[#FF3B30] h-2 rounded-full w-[45%]" />
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold pt-0.5">
                            <span>202 / 450 Problems Solved</span>
                            <span>🔥 15 Day Streak</span>
                          </div>
                        </div>
                        <div className="pt-1 flex items-center justify-between gap-3">
                          <span className="text-xs text-slate-500 font-medium">
                            Topic: Arrays &amp; Trees
                          </span>
                          <a
                            href={routes.interviewPrep}
                            className="px-4 py-2 bg-[#FF3B30] hover:bg-[#EE3126] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 shrink-0"
                          >
                            Resume Sheet{" "}
                            <FiArrowRight className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Card 2 */}
                    <div className="w-72 sm:w-80 shrink-0 bg-white border border-slate-200/90 rounded-2xl p-5 space-y-4 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between snap-start">
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 shrink-0">
                            SYSTEM DESIGN SHEET
                          </span>
                          <span className="text-xs font-extrabold text-[#FF3B30] shrink-0">
                            20% Solved
                          </span>
                        </div>
                        <div>
                          <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                            System Design &amp; Architecture Sheet
                          </h3>
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                            High Level &amp; Low Level Design interview
                            architecture guide with interactive diagrams.
                          </p>
                        </div>
                      </div>
                      <div className="space-y-3 pt-3 border-t border-slate-100">
                        <div className="space-y-1.5">
                          <div className="w-full bg-slate-100 rounded-full h-2">
                            <div className="bg-[#FF3B30] h-2 rounded-full w-[20%]" />
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold pt-0.5">
                            <span>8 / 40 Architecture Topics</span>
                            <span>HLD &amp; LLD</span>
                          </div>
                        </div>
                        <div className="pt-1 flex items-center justify-between gap-3">
                          <span className="text-xs text-slate-500 font-medium">
                            Topic: Microservices
                          </span>
                          <a
                            href={routes.interviewPrep}
                            className="px-4 py-2 bg-[#FF3B30] hover:bg-[#EE3126] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 shrink-0"
                          >
                            Resume Sheet{" "}
                            <FiArrowRight className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Card 3 */}
                    <div className="w-72 sm:w-80 shrink-0 bg-white border border-slate-200/90 rounded-2xl p-5 space-y-4 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between snap-start">
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
                            COURSE IN PROGRESS
                          </span>
                          <span className="text-xs font-extrabold text-[#FF3B30] shrink-0">
                            33% Completed
                          </span>
                        </div>
                        <div>
                          <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                            Learn to Code with Blockly
                          </h3>
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                            Interactive drag-and-drop programming fundamentals
                            and logic building.
                          </p>
                        </div>
                      </div>
                      <div className="space-y-3 pt-3 border-t border-slate-100">
                        <div className="space-y-1.5">
                          <div className="w-full bg-slate-100 rounded-full h-2">
                            <div className="bg-[#FF3B30] h-2 rounded-full w-[33%]" />
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold pt-0.5">
                            <span>Module 1 of 4</span>
                            <span>Beginner Friendly</span>
                          </div>
                        </div>
                        <div className="pt-1 flex items-center justify-between gap-3">
                          <span className="text-xs text-slate-500 font-medium">
                            Topic: Logic Building
                          </span>
                          <a
                            href={routes.shiksha}
                            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 shrink-0"
                          >
                            Resume Course{" "}
                            <FiArrowRight className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Recommended for you */}
                <section className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm sm:text-base font-bold text-slate-900">
                        Recommended for you
                      </h2>
                      <button
                        onClick={handleOpenQuiz}
                        className="text-xs font-bold text-[#FF3B30] hover:underline"
                      >
                        Edit interests
                      </button>
                    </div>
                    <div className="text-[11px] text-slate-500 space-x-1.5 hidden sm:block">
                      <span className="font-bold">Popular topics:</span>
                      <span className="text-[#FF3B30] hover:underline cursor-pointer">
                        Python
                      </span>
                      <span>|</span>
                      <span className="text-[#FF3B30] hover:underline cursor-pointer">
                        JavaScript
                      </span>
                      <span>|</span>
                      <span className="text-[#FF3B30] hover:underline cursor-pointer">
                        HTML &amp; CSS
                      </span>
                      <span>|</span>
                      <span className="text-[#FF3B30] hover:underline cursor-pointer">
                        DSA
                      </span>
                    </div>
                  </div>

                  <div className="relative group overflow-x-clip">
                    <div
                      id="recommended-scroll-container"
                      className="flex items-stretch gap-3.5 overflow-x-auto snap-x pb-2 pt-1 flex-nowrap scroll-smooth [&::-webkit-scrollbar]:h-[3px] [&::-webkit-scrollbar-track]:bg-slate-100 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400"
                    >
                      {/* Quiz Card */}
                      <div className="w-56 sm:w-64 shrink-0 bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between text-center shadow-xs hover:border-slate-300 transition-all snap-start">
                        <div>
                          <div className="w-full flex items-center justify-center py-1 mb-2">
                            <img
                              src="/images/bulb.png"
                              alt="Not sure where to start"
                              className="h-24 sm:h-28 object-contain mx-auto"
                            />
                          </div>
                          <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                            Not sure where to start?
                          </h3>
                          <p className="text-[11px] text-slate-500 mt-1.5 leading-snug">
                            Answer 3 quick questions and get recommendations.
                          </p>
                        </div>
                        <button
                          onClick={handleOpenQuiz}
                          className="mt-3 w-full py-2 bg-[#FF3B30] hover:bg-[#EE3126] text-white font-bold text-xs rounded-xl shadow-xs transition-all"
                        >
                          Take the quiz
                        </button>
                      </div>

                      {/* Course Cards */}
                      {RECOMMENDED_COURSES.map((course) => (
                        <div
                          key={course.id}
                          className="w-56 sm:w-64 shrink-0 bg-white border border-slate-200/80 rounded-2xl overflow-hidden flex flex-col justify-between shadow-xs hover:border-slate-300 transition-all snap-start"
                        >
                          <div>
                            <div
                              className={`px-3.5 py-1.5 text-[10px] font-extrabold tracking-wider uppercase ${course.badgeBg}`}
                            >
                              {course.badge}
                            </div>
                            <div className="p-3.5 space-y-2">
                              <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                                {course.title}
                              </h3>
                              <p className="text-[11px] text-slate-600 leading-snug line-clamp-3">
                                {course.desc}
                              </p>
                              {course.progress !== undefined && (
                                <div className="pt-1.5 space-y-1">
                                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                                    <div
                                      className="bg-[#FF3B30] h-1.5 rounded-full"
                                      style={{ width: `${course.progress}%` }}
                                    />
                                  </div>
                                  <div className="text-right text-[10px] font-bold text-slate-500">
                                    {course.progress}% Completed
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="px-3.5 py-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] font-medium text-slate-400">
                            <span>{course.coursesInfo}</span>
                            <span>{course.timeInfo}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                {/* More features to explore */}
                <section className="space-y-2.5">
                  <h2 className="text-sm font-bold text-slate-900">
                    More features to explore
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 flex items-center justify-between hover:border-slate-300 transition-all cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-red-50 text-[#FF3B30] flex items-center justify-center shrink-0">
                          <FiUser className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">
                            Interview Simulator
                          </h4>
                          <p className="text-[10px] text-slate-500">
                            Practice interviewing with AI feedback.
                          </p>
                        </div>
                      </div>
                      <FiArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 flex items-center justify-between hover:border-slate-300 transition-all cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                          <FiBookOpen className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">
                            Job-readiness checker
                          </h4>
                          <p className="text-[10px] text-slate-500">
                            Analyze job postings &amp; skill gaps.
                          </p>
                        </div>
                      </div>
                      <FiArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 flex items-center justify-between hover:border-slate-300 transition-all cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                          <FiUsers className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">
                            Clubs
                          </h4>
                          <p className="text-[10px] text-slate-500">
                            Connect with peers &amp; join events.
                          </p>
                        </div>
                      </div>
                      <FiExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </div>
                </section>
              </div>
            ) : (
              /* My Learning Tab */
              <div className="space-y-4">
                <h2 className="text-sm font-bold text-slate-900">
                  My Active Learning
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-white border border-slate-200/80 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                        IN PROGRESS
                      </span>
                      <span className="text-xs font-bold text-[#FF3B30]">
                        33% Completed
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">
                        Learn to Code with Blockly
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Module 1: Introduction to Learn to Code with Blockly
                      </p>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                      <div className="bg-[#FF3B30] h-1.5 rounded-full w-1/3" />
                    </div>
                    <div className="pt-1 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">
                        4 Modules
                      </span>
                      <Link
                        href={routes.allCourses.logicBuildingForEveryone}
                        className="px-3 py-1.5 bg-[#FF3B30] text-white text-xs font-bold rounded-lg"
                      >
                        Resume Course
                      </Link>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200/80 rounded-xl p-4 space-y-3 flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800">
                        SAVED PATH
                      </span>
                      <h3 className="text-xs font-bold text-slate-900 mt-2">
                        Full Stack Web Development
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        HTML, CSS, JS, React.js, Express &amp; Node.js
                      </p>
                    </div>
                    <div className="pt-1 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">
                        6 Courses
                      </span>
                      <Link
                        href={routes.shiksha}
                        className="px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg"
                      >
                        Start Path
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {showQuiz && (
        <div className="w-full pt-2">
          <PersonalizationQuiz
            initialData={personalization}
            onSubmit={handleQuizSubmit}
            onClose={() => {
              setShowQuiz(false);
              setIsCookingQuiz(false);
            }}
            isSaving={isSavingQuiz}
            onCooking={setIsCookingQuiz}
          />
        </div>
      )}
    </div>
  );
};
