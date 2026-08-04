import { SectionHeaderContainer, Text } from "@tbe/components";
import { motion } from "framer-motion";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileCheck,
  FileText,
  Flame,
  FolderGit2,
  GraduationCap,
  Layers,
  Lock,
  MessageSquare,
  PlayCircle,
  UserCheck,
} from "lucide-react";
import React, { useState } from "react";

export interface AppShowcaseSectionsProps {
  theme?: "light" | "dark";
}

// Shared widget card wrapper — mirrors the login page right-card style
const WidgetCard = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`relative w-full ${className}`}>
    {/* Gradient border overlay */}
    <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-zinc-200/80 via-zinc-200/30 to-transparent pointer-events-none" />
    <div className="relative rounded-2xl border border-zinc-200/80 bg-white/95 p-4 sm:p-5 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      {children}
    </div>
  </div>
);

// Inner row item
const RowItem = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`flex items-center justify-between gap-2 rounded-xl border border-zinc-100/80 bg-zinc-50/60 px-2.5 py-2 sm:px-3 sm:py-2.5 ring-1 ring-zinc-100/60 transition-colors hover:bg-white/80 ${className}`}
  >
    {children}
  </div>
);

export function AppShowcaseSections({
  theme = "light",
}: AppShowcaseSectionsProps) {
  const [dsaActiveTopic, setDsaActiveTopic] = useState("Arrays & Hashing");

  return (
    <div
      id="products"
      className="relative space-y-10 pt-2 pb-8 sm:space-y-12 md:space-y-16 md:pt-4 md:pb-16 bg-transparent select-none overflow-hidden"
    >
      {/* ─────────────────────────────────────────────────────────────
          1. SHIKSHA SHOWCASE
      ───────────────────────────────────────────────────────────── */}
      <section
        id="showcase-shiksha"
        className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6"
      >
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10 lg:items-center">
          {/* Text — always first on mobile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5 }}
            className="space-y-3 sm:space-y-4"
          >
            <SectionHeaderContainer
              heading="Shiksha:"
              focusText="Learn Full-Stack Development the Right Way."
              headingLevel={3}
              textCenter={false}
            />
            <Text className="paragraph text-grey" level="p">
              Structured, project-based courses covering Frontend, Backend, and
              Full-Stack development — taught by engineers who work in the
              industry, not just talk about it.
            </Text>

            <ul className="space-y-2 pt-1">
              {[
                "Beginner-to-advanced roadmaps for JS, React, Node & more",
                "Hands-on projects you can add directly to your portfolio",
                "Community-supported learning with peer & mentor reviews",
              ].map((bullet) => (
                <li key={bullet} className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span className="text-xs sm:text-sm font-semibold text-zinc-800 leading-snug">
                    {bullet}
                  </span>
                </li>
              ))}
            </ul>

            <div className="pt-1">
              <a
                href="https://www.theboringeducation.com/shiksha"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-[#FF5757] px-4 py-2.5 text-xs font-bold text-white shadow-md transition-all duration-200 hover:bg-[#e04343] hover:shadow-lg"
              >
                Explore Shiksha <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </motion.div>

          {/* Widget */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="w-full"
          >
            <WidgetCard>
              {/* Header */}
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[rgba(255,87,87,0.15)] ring-1 ring-[rgba(255,87,87,0.30)]">
                    <BookOpen className="h-3.5 w-3.5 text-[#FF5757]" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-zinc-900 truncate">
                      My Learning Path
                    </h4>
                    <p className="text-[10px] text-zinc-500 font-medium">
                      Zero to One Frontend Development
                    </p>
                  </div>
                </div>
                <span className="flex items-center gap-1 shrink-0 rounded-full bg-[rgba(255,87,87,0.12)] px-2 py-0.5 text-[10px] font-extrabold text-[#FF5757] ring-1 ring-[rgba(255,87,87,0.20)]">
                  68% Done
                </span>
              </div>

              {/* Module list */}
              <div className="space-y-1.5">
                {[
                  {
                    name: "HTML & CSS Fundamentals",
                    status: "Completed",
                    icon: CheckCircle2,
                    color: "text-[#FF5757]",
                  },
                  {
                    name: "JavaScript ES6+ Essentials",
                    status: "Completed",
                    icon: CheckCircle2,
                    color: "text-[#FF5757]",
                  },
                  {
                    name: "React — Component Architecture",
                    status: "In Progress",
                    icon: PlayCircle,
                    color: "text-[#FF5757]",
                  },
                  {
                    name: "Node.js & REST APIs",
                    status: "Upcoming",
                    icon: Lock,
                    color: "text-zinc-300",
                  },
                  {
                    name: "Full-Stack Capstone Project",
                    status: "Locked",
                    icon: Lock,
                    color: "text-zinc-300",
                  },
                ].map((mod) => (
                  <RowItem key={mod.name}>
                    <div className="flex items-center gap-2 min-w-0">
                      <mod.icon
                        className={`h-3.5 w-3.5 shrink-0 ${mod.color}`}
                      />
                      <span className="text-xs font-semibold text-zinc-800 truncate">
                        {mod.name}
                      </span>
                    </div>
                    <span className="hidden sm:block text-[10px] font-medium text-zinc-400 shrink-0">
                      {mod.status}
                    </span>
                  </RowItem>
                ))}
              </div>
            </WidgetCard>
          </motion.div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. INTERVIEW PREP SHOWCASE
      ───────────────────────────────────────────────────────────── */}
      <section
        id="showcase-interviewprep"
        className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6"
      >
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10 lg:items-center">
          {/* Widget — second on mobile, first on desktop */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="w-full order-2 lg:order-1"
          >
            <WidgetCard>
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3 mb-3">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[rgba(255,87,87,0.15)] ring-1 ring-[rgba(255,87,87,0.30)]">
                    <MessageSquare className="h-3.5 w-3.5 text-[#FF5757]" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-zinc-900 truncate">
                      Interview Question Bank
                    </h4>
                    <p className="text-[10px] text-zinc-500 font-medium">
                      JavaScript · React · Node · System Design
                    </p>
                  </div>
                </div>
                <span className="shrink-0 rounded-full bg-[rgba(255,87,87,0.12)] px-2 py-0.5 text-[10px] font-extrabold text-[#FF5757] ring-1 ring-[rgba(255,87,87,0.20)]">
                  500+ Qs
                </span>
              </div>

              <div className="space-y-1.5">
                {[
                  {
                    question: "Explain event loop in JavaScript",
                    topic: "JavaScript",
                    level: "Mid",
                  },
                  {
                    question: "Virtual DOM vs Real DOM",
                    topic: "React",
                    level: "Junior",
                  },
                  {
                    question: "What is closure & hoisting?",
                    topic: "JavaScript",
                    level: "Junior",
                  },
                  {
                    question: "Design a URL shortener",
                    topic: "System Design",
                    level: "Senior",
                  },
                ].map((q) => (
                  <RowItem key={q.question}>
                    <div className="flex items-center gap-2 min-w-0">
                      <MessageSquare className="h-3.5 w-3.5 shrink-0 text-[#FF5757]/70" />
                      <div className="min-w-0">
                        <h5 className="text-xs font-semibold text-zinc-800 truncate">
                          {q.question}
                        </h5>
                        <p className="text-[10px] text-zinc-400 font-medium">
                          {q.topic}
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 rounded-md bg-[rgba(255,87,87,0.10)] px-2 py-0.5 text-[9px] font-extrabold text-[#FF5757] ring-1 ring-[rgba(255,87,87,0.15)]">
                      {q.level}
                    </span>
                  </RowItem>
                ))}
              </div>
            </WidgetCard>
          </motion.div>

          {/* Text — first on mobile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5 }}
            className="space-y-3 sm:space-y-4 order-1 lg:order-2"
          >
            <SectionHeaderContainer
              heading="Interview Prep:"
              focusText="Crack Tech Interviews with Curated Question Banks."
              headingLevel={3}
              textCenter={false}
            />
            <Text className="paragraph text-grey" level="p">
              Access structured interview question sheets for JavaScript, React,
              Node.js, Python, Java, and System Design — organised by role level
              so you always practise what matters most.
            </Text>

            <ul className="space-y-2 pt-1">
              {[
                "Role-level filtered questions (Junior, Mid, Senior)",
                "Topic-wise sheets for JS, React, Node, Python & more",
                "System Design primers with diagrams & examples",
              ].map((bullet) => (
                <li key={bullet} className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span className="text-xs sm:text-sm font-semibold text-zinc-800 leading-snug">
                    {bullet}
                  </span>
                </li>
              ))}
            </ul>

            <div className="pt-1">
              <a
                href="https://www.theboringeducation.com/interview-prep"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-[#FF5757] px-4 py-2.5 text-xs font-bold text-white shadow-md transition-all duration-200 hover:bg-[#e04343] hover:shadow-lg"
              >
                Start Interview Prep <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. DSA YATRA SHOWCASE
      ───────────────────────────────────────────────────────────── */}
      <section
        id="showcase-dsayatra"
        className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6"
      >
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10 lg:items-center">
          {/* Text — always first on mobile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5 }}
            className="space-y-3 sm:space-y-4"
          >
            <SectionHeaderContainer
              heading="DSA Yatra:"
              focusText="Master Data Structures Without the Random Grind."
              headingLevel={3}
              textCenter={false}
            />
            <Text className="paragraph text-grey" level="p">
              Stop solving random LeetCode questions. Follow a structured,
              topic-wise roadmap that builds pattern intuition step-by-step for
              FAANG & startup interviews.
            </Text>

            <ul className="space-y-2 pt-1">
              {[
                "Targeted practice sheets (Startups, MNCs & MAANG)",
                "Topic roadmap ordered by concept dependencies",
                "Built-in revision rhythms to keep problem patterns fresh",
              ].map((bullet) => (
                <li key={bullet} className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span className="text-xs sm:text-sm font-semibold text-zinc-800 leading-snug">
                    {bullet}
                  </span>
                </li>
              ))}
            </ul>

            <div className="pt-1">
              <a
                href="https://dsayatra.theboringeducation.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-[#FF5757] px-4 py-2.5 text-xs font-bold text-white shadow-md transition-all duration-200 hover:bg-[#e04343] hover:shadow-lg"
              >
                Launch DSA Yatra <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </motion.div>

          {/* Widget */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="w-full"
          >
            <WidgetCard>
              {/* Header */}
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[rgba(255,87,87,0.15)] ring-1 ring-[rgba(255,87,87,0.30)]">
                    <Layers className="h-3.5 w-3.5 text-[#FF5757]" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-zinc-900 truncate">
                      DSA Roadmap & Streak
                    </h4>
                    <p className="text-[10px] text-zinc-500 font-medium">
                      14 Days Streak • 42 Solved
                    </p>
                  </div>
                </div>
                <span className="flex items-center gap-1 shrink-0 rounded-full bg-[rgba(255,87,87,0.12)] px-2 py-0.5 text-[10px] font-extrabold text-[#FF5757] ring-1 ring-[rgba(255,87,87,0.20)]">
                  <Flame className="h-2.5 w-2.5" /> 14 🔥
                </span>
              </div>

              {/* Topic tabs — wrap on mobile, no scroll */}
              <div className="flex flex-wrap gap-1.5 pb-1 mb-2.5">
                {[
                  "Arrays & Hashing",
                  "Two Pointers",
                  "Sliding Window",
                  "Binary Search",
                ].map((topic) => (
                  <button
                    key={topic}
                    onClick={() => setDsaActiveTopic(topic)}
                    className={`shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
                      dsaActiveTopic === topic
                        ? "bg-[#FF5757] text-white"
                        : "bg-zinc-100/80 text-zinc-600 hover:text-zinc-900 ring-1 ring-zinc-200/60"
                    }`}
                  >
                    {topic}
                  </button>
                ))}
              </div>

              {/* Problem list */}
              <div className="space-y-1.5">
                {[
                  {
                    name: "Two Sum Pattern",
                    diff: "Easy",
                    status: "Completed",
                    icon: CheckCircle2,
                    color: "text-[#FF5757]",
                  },
                  {
                    name: "Contains Duplicate",
                    diff: "Easy",
                    status: "Completed",
                    icon: CheckCircle2,
                    color: "text-[#FF5757]",
                  },
                  {
                    name: "Valid Anagram",
                    diff: "Easy",
                    status: "Completed",
                    icon: CheckCircle2,
                    color: "text-[#FF5757]",
                  },
                  {
                    name: "Group Anagrams",
                    diff: "Medium",
                    status: "In Progress",
                    icon: Clock,
                    color: "text-zinc-400",
                  },
                  {
                    name: "Top K Frequent",
                    diff: "Medium",
                    status: "Locked",
                    icon: Lock,
                    color: "text-zinc-300",
                  },
                ].map((prob) => (
                  <RowItem key={prob.name}>
                    <div className="flex items-center gap-2 min-w-0">
                      <prob.icon
                        className={`h-3.5 w-3.5 shrink-0 ${prob.color}`}
                      />
                      <span className="text-xs font-semibold text-zinc-800 truncate">
                        {prob.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className={`rounded-md px-1.5 py-0.5 text-[9px] font-extrabold ring-1 ${
                          prob.diff === "Easy"
                            ? "bg-[rgba(255,87,87,0.10)] text-[#FF5757] ring-[rgba(255,87,87,0.20)]"
                            : "bg-zinc-100 text-zinc-500 ring-zinc-200/60"
                        }`}
                      >
                        {prob.diff}
                      </span>
                      <span className="hidden sm:block text-[10px] font-medium text-zinc-400">
                        {prob.status}
                      </span>
                    </div>
                  </RowItem>
                ))}
              </div>
            </WidgetCard>
          </motion.div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. ONCAMPUS SHOWCASE
      ───────────────────────────────────────────────────────────── */}
      <section
        id="showcase-oncampus"
        className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6"
      >
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10 lg:items-center">
          {/* Widget — second on mobile, first on desktop */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="w-full order-2 lg:order-1"
          >
            <WidgetCard>
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3 mb-3">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[rgba(255,87,87,0.15)] ring-1 ring-[rgba(255,87,87,0.30)]">
                    <GraduationCap className="h-3.5 w-3.5 text-[#FF5757]" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-zinc-900 truncate">
                      Campus Placement Readiness
                    </h4>
                    <p className="text-[10px] text-zinc-500 font-medium">
                      Aptitude, CS Core & Interview Sheets
                    </p>
                  </div>
                </div>
                <span className="shrink-0 rounded-full bg-[rgba(255,87,87,0.12)] px-2 py-0.5 text-[10px] font-extrabold text-[#FF5757] ring-1 ring-[rgba(255,87,87,0.20)]">
                  88% Ready
                </span>
              </div>

              {/* Progress grid — 1 col on xs, 2 col on sm+ */}
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 gap-2">
                {[
                  {
                    title: "Quantitative Aptitude",
                    progress: "92%",
                    count: "120+ Solved",
                  },
                  {
                    title: "Operating Systems",
                    progress: "85%",
                    count: "Cheat Sheet Done",
                  },
                  {
                    title: "DBMS & SQL Queries",
                    progress: "90%",
                    count: "50 Qs Mastered",
                  },
                  {
                    title: "Computer Networks",
                    progress: "78%",
                    count: "Top 40 Qs Reviewed",
                  },
                ].map((mod) => (
                  <div
                    key={mod.title}
                    className="rounded-xl border border-zinc-100/80 bg-zinc-50/60 p-2.5 ring-1 ring-zinc-100/60 space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-1">
                      <span className="text-[11px] font-bold text-zinc-800 leading-tight">
                        {mod.title}
                      </span>
                      <span className="text-[10px] font-extrabold text-[#FF5757] shrink-0">
                        {mod.progress}
                      </span>
                    </div>
                    <div className="h-1 w-full rounded-full bg-zinc-200/80">
                      <div
                        className="h-1 rounded-full bg-[#FF5757]/80"
                        style={{ width: mod.progress }}
                      />
                    </div>
                    <p className="text-[9px] font-medium text-zinc-400">
                      {mod.count}
                    </p>
                  </div>
                ))}
              </div>
            </WidgetCard>
          </motion.div>

          {/* Text — first on mobile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5 }}
            className="space-y-3 sm:space-y-4 order-1 lg:order-2"
          >
            <SectionHeaderContainer
              heading="OnCampus:"
              focusText="Ace Campus Placements from Day One."
              headingLevel={3}
              textCenter={false}
            />
            <Text className="paragraph text-grey" level="p">
              Built specifically for college students to conquer aptitude tests,
              core CS fundamentals (OS, DBMS, CN, OOPS), and campus interview
              rounds.
            </Text>

            <ul className="space-y-2 pt-1">
              {[
                "Topic-wise aptitude practice with detailed solutions",
                "Core Computer Science subject interview revision sheets",
                "Real campus placement quiz challenges & leaderboard",
              ].map((bullet) => (
                <li key={bullet} className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span className="text-xs sm:text-sm font-semibold text-zinc-800 leading-snug">
                    {bullet}
                  </span>
                </li>
              ))}
            </ul>

            <div className="pt-1">
              <a
                href="https://oncampus.theboringeducation.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-[#FF5757] px-4 py-2.5 text-xs font-bold text-white shadow-md transition-all duration-200 hover:bg-[#e04343] hover:shadow-lg"
              >
                Explore OnCampus <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. RESUMEYATRA SHOWCASE
      ───────────────────────────────────────────────────────────── */}
      <section
        id="showcase-resumeyatra"
        className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6"
      >
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10 lg:items-center">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5 }}
            className="space-y-3 sm:space-y-4"
          >
            <SectionHeaderContainer
              heading="ResumeYatra:"
              focusText="Build ATS-Friendly Resumes That Get Calls."
              headingLevel={3}
              textCenter={false}
            />
            <Text className="paragraph text-grey" level="p">
              Score your resume against ATS screeners, optimize bullet points
              with action verbs, and export recruiter-approved tech resume
              templates instantly.
            </Text>

            <ul className="space-y-2 pt-1">
              {[
                "Instant ATS compatibility score scanner (0 to 100)",
                "Action verb & metric impact keyword suggestions",
                "Modern single-column LaTeX templates for developers",
              ].map((bullet) => (
                <li key={bullet} className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span className="text-xs sm:text-sm font-semibold text-zinc-800 leading-snug">
                    {bullet}
                  </span>
                </li>
              ))}
            </ul>

            <div className="pt-1">
              <a
                href="https://resumeyatra.theboringeducation.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-[#FF5757] px-4 py-2.5 text-xs font-bold text-white shadow-md transition-all duration-200 hover:bg-[#e04343] hover:shadow-lg"
              >
                Build Resume Now <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </motion.div>

          {/* Widget */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="w-full"
          >
            <WidgetCard>
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3 mb-3">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[rgba(255,87,87,0.15)] ring-1 ring-[rgba(255,87,87,0.30)]">
                    <FileCheck className="h-3.5 w-3.5 text-[#FF5757]" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-zinc-900">
                      Live ATS Score Inspector
                    </h4>
                    <p className="text-[10px] text-zinc-500 font-medium">
                      Software Engineer Template
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-base font-extrabold text-[#FF5757]">
                    92/100
                  </span>
                  <p className="text-[9px] font-bold text-zinc-400 tracking-wide uppercase">
                    ATS Score
                  </p>
                </div>
              </div>

              <div className="mb-2.5 flex items-center gap-2">
                <div className="h-px flex-1 bg-zinc-100" />
                <span className="text-[10px] text-zinc-400 font-medium">
                  Score Breakdown
                </span>
                <div className="h-px flex-1 bg-zinc-100" />
              </div>

              <div className="space-y-1.5">
                {[
                  { label: "Action Verbs & Impact Metrics", score: "+30 pts" },
                  { label: "Developer Keyword Match", score: "+25 pts" },
                  { label: "Single Column Clean Formatting", score: "+20 pts" },
                  { label: "GitHub & Project Links", score: "+17 pts" },
                ].map((item) => (
                  <RowItem key={item.label}>
                    <div className="flex items-center gap-2 min-w-0">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#FF5757]/70" />
                      <span className="text-xs font-semibold text-zinc-800 truncate">
                        {item.label}
                      </span>
                    </div>
                    <span className="shrink-0 text-[10px] font-extrabold text-[#FF5757] bg-[rgba(255,87,87,0.10)] px-1.5 py-0.5 rounded-md ring-1 ring-[rgba(255,87,87,0.15)]">
                      {item.score}
                    </span>
                  </RowItem>
                ))}
              </div>
            </WidgetCard>
          </motion.div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. PREPYATRA SHOWCASE
      ───────────────────────────────────────────────────────────── */}
      <section
        id="showcase-prepyatra"
        className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6"
      >
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10 lg:items-center">
          {/* Widget — second on mobile */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="w-full order-2 lg:order-1"
          >
            <WidgetCard>
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3 mb-3">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[rgba(255,87,87,0.15)] ring-1 ring-[rgba(255,87,87,0.30)]">
                    <UserCheck className="h-3.5 w-3.5 text-[#FF5757]" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-zinc-900 truncate">
                      Job Search & Recruiter Pipeline
                    </h4>
                    <p className="text-[10px] text-zinc-500 font-medium">
                      Applications & Recruiter Network
                    </p>
                  </div>
                </div>
                <span className="shrink-0 rounded-full bg-[rgba(255,87,87,0.12)] px-2 py-0.5 text-[10px] font-extrabold text-[#FF5757] ring-1 ring-[rgba(255,87,87,0.20)]">
                  12 Active
                </span>
              </div>

              <div className="space-y-1.5">
                {[
                  {
                    company: "Stripe",
                    role: "Frontend Engineer",
                    status: "Interviewing",
                  },
                  {
                    company: "Razorpay",
                    role: "SDE-1 Tech",
                    status: "Applied",
                  },
                  {
                    company: "Swiggy",
                    role: "React Developer",
                    status: "Offer Received",
                  },
                  {
                    company: "Zepto",
                    role: "Fullstack Engineer",
                    status: "HR Screening",
                  },
                ].map((job) => (
                  <RowItem key={job.company}>
                    <div className="min-w-0">
                      <h5 className="text-xs font-semibold text-zinc-800 truncate">
                        {job.company}
                      </h5>
                      <p className="text-[10px] font-medium text-zinc-400 truncate">
                        {job.role}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-md bg-[rgba(255,87,87,0.10)] px-2 py-0.5 text-[10px] font-extrabold text-[#FF5757] ring-1 ring-[rgba(255,87,87,0.15)]">
                      {job.status}
                    </span>
                  </RowItem>
                ))}
              </div>
            </WidgetCard>
          </motion.div>

          {/* Text — first on mobile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5 }}
            className="space-y-3 sm:space-y-4 order-1 lg:order-2"
          >
            <SectionHeaderContainer
              heading="PrepYatra:"
              focusText="Streamline Your Job Search & Recruiter Hub."
              headingLevel={3}
              textCenter={false}
            />
            <Text className="paragraph text-grey" level="p">
              Store recruiter contacts, organize job applications, log daily
              interview practice hours, and share your verified readiness
              journey with employers.
            </Text>

            <ul className="space-y-2 pt-1">
              {[
                "Recruiter contact vault with direct LinkedIn & email tags",
                "Daily prep log calendar & study time analytics",
                "Shareable public profile showing your true interview readiness",
              ].map((bullet) => (
                <li key={bullet} className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span className="text-xs sm:text-sm font-semibold text-zinc-800 leading-snug">
                    {bullet}
                  </span>
                </li>
              ))}
            </ul>

            <div className="pt-1">
              <a
                href="https://prepyatra.theboringeducation.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-[#FF5757] px-4 py-2.5 text-xs font-bold text-white shadow-md transition-all duration-200 hover:bg-[#e04343] hover:shadow-lg"
              >
                Open PrepYatra <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          7. RESOURCE APP SHOWCASE
      ───────────────────────────────────────────────────────────── */}
      <section
        id="showcase-resources"
        className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6"
      >
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10 lg:items-center">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.45 }}
            className="space-y-3 sm:space-y-4"
          >
            <SectionHeaderContainer
              heading="Resource App:"
              focusText="Free Open-Source Tech Vault for Developers."
              headingLevel={3}
              textCenter={false}
            />
            <Text className="paragraph text-grey" level="p">
              Access curated developer roadmaps, tech interview cheatsheets,
              system design primers, and open-source project guides — 100% free
              forever.
            </Text>

            <ul className="space-y-2 pt-1">
              {[
                "High-quality tech cheatsheets (JS, React, Node, Python, SQL)",
                "Handpicked GitHub repositories & open-source projects",
                "No paywalls or hidden subscriptions",
              ].map((bullet) => (
                <li key={bullet} className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span className="text-xs sm:text-sm font-semibold text-zinc-800 leading-snug">
                    {bullet}
                  </span>
                </li>
              ))}
            </ul>

            <div className="pt-1">
              <a
                href="https://resources.theboringeducation.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-[#FF5757] px-4 py-2.5 text-xs font-bold text-white shadow-md transition-all duration-200 hover:bg-[#e04343] hover:shadow-lg"
              >
                Access Free Resources <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </motion.div>

          {/* Widget */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="w-full"
          >
            <WidgetCard>
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3 mb-3">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[rgba(255,87,87,0.15)] ring-1 ring-[rgba(255,87,87,0.30)]">
                    <FolderGit2 className="h-3.5 w-3.5 text-[#FF5757]" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-zinc-900">
                      Developer Vault
                    </h4>
                    <p className="text-[10px] text-zinc-500 font-medium">
                      Cheatsheets & Study Guides
                    </p>
                  </div>
                </div>
                <span className="shrink-0 rounded-full bg-[rgba(255,87,87,0.12)] px-2 py-0.5 text-[10px] font-extrabold text-[#FF5757] ring-1 ring-[rgba(255,87,87,0.20)]">
                  50+ Free
                </span>
              </div>

              <div className="space-y-1.5">
                {[
                  {
                    title: "JavaScript ES6+ Cheatsheet",
                    type: "PDF & Web",
                    reads: "14.2k",
                    tag: "Popular",
                  },
                  {
                    title: "React Interview 50 Questions",
                    type: "Interview Sheet",
                    reads: "22.8k",
                    tag: "Featured",
                  },
                  {
                    title: "System Design for Beginners",
                    type: "Guide",
                    reads: "9.5k",
                    tag: "Essential",
                  },
                  {
                    title: "SQL & DB Queries Handbook",
                    type: "Handbook",
                    reads: "11.1k",
                    tag: "Free",
                  },
                ].map((res) => (
                  <RowItem key={res.title}>
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="h-3.5 w-3.5 shrink-0 text-[#FF5757]/70" />
                      <div className="min-w-0">
                        <h5 className="text-xs font-semibold text-zinc-800 truncate">
                          {res.title}
                        </h5>
                        <p className="text-[10px] text-zinc-400 font-medium">
                          {res.type} · {res.reads}
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 rounded-md bg-[rgba(255,87,87,0.10)] px-2 py-0.5 text-[9px] font-extrabold text-[#FF5757] ring-1 ring-[rgba(255,87,87,0.15)]">
                      {res.tag}
                    </span>
                  </RowItem>
                ))}
              </div>
            </WidgetCard>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

export default AppShowcaseSections;
