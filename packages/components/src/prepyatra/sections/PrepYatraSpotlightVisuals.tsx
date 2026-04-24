"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

// Utility to hide scrollbar but allow scrolling
const noScrollbar =
  "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]";

// Wrapper: centers on mobile, aligns right on desktop
const wrapperAlign = "w-full max-w-[420px] mx-auto lg:ml-auto lg:mr-0";

/* ─────────────────────────────────────────────
   1. PREP LOGS VISUAL — Interactive study timeline
   ───────────────────────────────────────────── */
const LOGS = [
  { id: 1, title: "System Design: Scalability", time: "2h", tag: "Design" },
  { id: 2, title: "LeetCode: Graph Traversal", time: "1.5h", tag: "Algo" },
  {
    id: 3,
    title: "Mock Interview: Behavioral",
    time: "1h",
    tag: "Soft Skills",
  },
];

export function PrepLogsVisual() {
  const [activeLog, setActiveLog] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveLog((prev) => (prev + 1) % LOGS.length);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className={`${wrapperAlign} rounded-[2rem] border border-gray-200 bg-white p-6 shadow-xl flex flex-col gap-4 select-none`}
    >
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">
            Study Tracking
          </p>
          <p className="text-xl font-black text-gray-900">Weekly Progress</p>
        </div>
        <div className="bg-primary/10 border border-primary/20 text-primary text-xs font-bold px-3 py-1.5 rounded-xl">
          14h Total
        </div>
      </div>

      <div className={`flex flex-col gap-3 ${noScrollbar}`}>
        {LOGS.map((log, i) => {
          const isActive = i === activeLog;
          return (
            <motion.div
              key={log.id}
              animate={isActive ? { scale: 1.02 } : { scale: 1 }}
              className={`p-3 rounded-xl border transition-all duration-500 ${
                isActive
                  ? "bg-primary/5 border-primary/30 shadow-sm"
                  : "bg-gray-50 border-gray-100"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span
                  className={`text-sm font-bold ${isActive ? "text-primary" : "text-gray-700"}`}
                >
                  {log.title}
                </span>
                <span className="text-[10px] font-bold text-gray-500 bg-white px-2 py-0.5 rounded border">
                  {log.time}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                  {log.tag}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
      <div className="mt-2 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-primary rounded-full"
          initial={{ width: "0%" }}
          animate={{ width: "75%" }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </div>
      <p className="text-center text-[9px] text-gray-400 font-semibold uppercase tracking-wider mt-1">
        Goal: 20h / week
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────────
   2. RECRUITER CONTACTS VISUAL — Interactive network dashboard
   ───────────────────────────────────────────── */
const RECRUITERS = [
  {
    name: "S. Jha",
    company: "TechCorp",
    status: "Active",
    color: "green",
    avatar: "https://i.pravatar.cc/150?u=1",
  },
  {
    name: "A. Gupta",
    company: "StartupXYZ",
    status: "Follow-up",
    color: "yellow",
    avatar: "https://i.pravatar.cc/150?u=2",
  },
  {
    name: "M. Patel",
    company: "BigTech",
    status: "Interview",
    color: "blue",
    avatar: "https://i.pravatar.cc/150?u=3",
  },
];

export function RecruiterContactsVisual() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div
      className={`${wrapperAlign} rounded-[2rem] border border-gray-200 bg-white p-6 shadow-xl flex flex-col gap-4 select-none cursor-pointer`}
    >
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">
            Network
          </p>
          <p className="text-xl font-black text-gray-900">Connections</p>
        </div>
        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-50 border border-gray-200">
          <svg
            className="h-5 w-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </div>
      </div>

      <div className="space-y-2">
        {RECRUITERS.map((recruiter, idx) => {
          const isHovered = hoveredIndex === idx;
          const statusColors: Record<string, string> = {
            green: "bg-green-50 text-green-600 border-green-200",
            yellow: "bg-yellow-50 text-yellow-600 border-yellow-200",
            blue: "bg-blue-50 text-blue-600 border-blue-200",
          };

          return (
            <div
              key={recruiter.name}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-300 ${
                isHovered
                  ? "bg-gray-50 scale-[1.02] shadow-sm"
                  : "bg-white border-gray-100"
              }`}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full overflow-hidden border border-gray-100">
                  <img
                    src={recruiter.avatar}
                    alt={recruiter.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">
                    {recruiter.name}
                  </p>
                  <p className="text-[10px] text-gray-500">
                    {recruiter.company}
                  </p>
                </div>
              </div>
              <span
                className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-md border ${statusColors[recruiter.color]}`}
              >
                {recruiter.status}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   3. RESOURCE SHARING VISUAL — 3D Flip Card
   ───────────────────────────────────────────── */
export function ResourceSharingVisual() {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className={`${wrapperAlign} group relative h-[380px] perspective-[1800px] cursor-pointer`}
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
    >
      <div
        className={`relative flex h-full w-full transition-transform duration-700 ${flipped ? "[transform:rotateY(180deg)]" : ""}`}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* FRONT */}
        <div
          className="absolute inset-0 backface-hidden rounded-[2rem] border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-7 flex flex-col justify-between shadow-xl"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div>
            <div className="mb-4 inline-flex items-center rounded-lg bg-primary/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-primary border border-primary/20">
              Community Access
            </div>
            <h3 className="text-3xl font-black text-gray-900 mb-3">
              Shared Insights
            </h3>
            <p className="text-sm text-gray-500 font-semibold leading-relaxed">
              Hover to reveal top-rated interview experiences and study guides
              shared by the community.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-8 w-8 rounded-full border-2 border-white overflow-hidden bg-gray-50"
                >
                  <img
                    src={`https://i.pravatar.cc/100?u=contributor-${i}`}
                    alt="user"
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
            <p className="text-xs font-bold text-gray-500 ml-2">
              1,200+ Contributors
            </p>
          </div>
        </div>

        {/* BACK */}
        <div
          className="absolute inset-0 backface-hidden rounded-[2rem] border border-gray-200 bg-white p-6 [transform:rotateY(180deg)] flex flex-col shadow-xl overflow-hidden gap-4"
          style={{ backfaceVisibility: "hidden" }}
        >
          <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">
            Top Resources
          </p>
          {[
            {
              title: "Google L4 Interview Exp",
              author: "DevNinja",
              likes: "342",
            },
            { title: "Grokking DP Guide", author: "AlgoMaster", likes: "289" },
            {
              title: "100 Must-Do Questions",
              author: "PrepKing",
              likes: "156",
            },
          ].map((res, i) => (
            <div
              key={i}
              className="flex justify-between items-center border-b border-gray-100 pb-3 last:border-0"
            >
              <div>
                <p className="text-xs font-bold text-gray-900">{res.title}</p>
                <p className="text-[9px] text-gray-500 mt-1">by {res.author}</p>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded">
                <span>↑</span> {res.likes}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   4. PUBLIC PROFILE VISUAL — Animated Profile Mock
   ───────────────────────────────────────────── */
export function PublicProfileVisual() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className={`${wrapperAlign} rounded-[2.5rem] border border-gray-200 bg-white p-6 flex flex-col gap-5 shadow-xl`}
    >
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
        <div className="h-14 w-14 rounded-full bg-gradient-to-tr from-primary to-blue-400 p-[2px]">
          <div className="h-full w-full rounded-full bg-white border-2 border-white overflow-hidden flex items-center justify-center">
            <img
              src="https://i.pravatar.cc/150?u=alex"
              alt="profile"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
        <div>
          <h4 className="text-lg font-black text-gray-900">Alex Coder</h4>
          <p className="text-xs font-semibold text-gray-500">
            SDE Prep Journey
          </p>
        </div>
      </div>

      {/* Activity Graph Mock */}
      <div>
        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2">
          Consistency Graph
        </p>
        <div className="grid grid-cols-7 gap-1 h-16">
          {Array.from({ length: 28 }).map((_, i) => {
            // random opacity for activity
            const activeLevel = mounted ? Math.random() : 0.1;
            return (
              <div
                key={i}
                className="rounded-sm bg-primary transition-opacity duration-1000 ease-out"
                style={{ opacity: activeLevel < 0.2 ? 0.1 : activeLevel }}
              />
            );
          })}
        </div>
      </div>

      {/* Stats */}
      <div className="flex justify-between bg-gray-50 rounded-xl p-3 border border-gray-100">
        <div className="text-center flex-1">
          <p className="text-lg font-black text-gray-900">124</p>
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
            Logs
          </p>
        </div>
        <div className="w-px bg-gray-200 mx-2" />
        <div className="text-center flex-1">
          <p className="text-lg font-black text-gray-900">14</p>
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
            Streak
          </p>
        </div>
      </div>
    </div>
  );
}
