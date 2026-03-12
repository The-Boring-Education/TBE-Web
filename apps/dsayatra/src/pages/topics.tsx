import { SEO } from "@tbe/components";
import { PAGE_REFRESH_TIMEOUT, routes, TOPIC_LABELS } from "@tbe/constants";
import { useApi } from "@tbe/hooks";
import type { PageProps } from "@tbe/interface";
import { cn, getPreFetchProps } from "@tbe/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  Code,
  Database,
  Hash,
  Layers,
  Link2,
  Lock,
  Search,
} from "lucide-react";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { Fragment, useEffect, useMemo, useState } from "react";

// Explanations for tooltip info
const EXPLANATIONS: Record<string, string> = {
  Array: "Fundamental linear data structure for storing collections of items.",
  String:
    "Sequence of characters, foundational for text manipulation algorithms.",
  HashMap:
    "Key-value pairs using hash functions for O(1) average time complexity.",
  "Two Pointers": "Technique to optimize searches by using two moving indices.",
  "Sliding Window": "Subset of two pointers for tracking contiguous subarrays.",
  "Binary Search": "Efficient O(log n) algorithm for searching sorted arrays.",
  Sorting: "Algorithms to arrange data in a specific order.",
  "Linked List": "Linear structure where elements point to the next node.",
  Stack: "LIFO data structure for push/pop operations.",
  Queue: "FIFO data structure for processing items strictly in order.",
  Tree: "Hierarchical data structure with a root, branches, and leaves.",
  "Binary Tree": "Tree structure where each node has at most two children.",
  "Binary Search Tree": "A binary tree organized for O(log n) searching.",
  "Prefix Sum": "Precomputed array for fast range sum queries.",
  "Bit Manipulation":
    "Operators that act on the binary representations of values.",
  Math: "Mathematical algorithms and number theory logic.",
  Greedy: "Making the locally optimal choice at each step.",
  Backtracking: "Algorithmic technique for solving problems recursively.",
};

const LOCKED_TOPICS = [
  {
    name: "Tries",
    explanation: "Coming soon: Advanced prefix-tree data structure.",
    isLocked: true,
  },
  {
    name: "Dynamic Programming",
    explanation: "Coming soon: Solving complex problems by breaking them down.",
    isLocked: true,
  },
  {
    name: "Graphs",
    explanation: "Coming soon: Nodes and edges representing complex networks.",
    isLocked: true,
  },
  {
    name: "Segment Trees",
    explanation:
      "Coming soon: Advanced tree structure for rapid range queries.",
    isLocked: true,
  },
];

const TOPIC_ICON_MAP: Record<string, any> = {
  ARRAY: Database,
  SLIDING_WINDOW: Layers,
  RECURSION: Hash,
  BINARY_SEARCH: Search,
  LINKED_LIST: Link2,
  STACK: Database,
  STRING: Code,
};

const DEFAULT_ICON = Code;

// Background Noise
const NoiseOverlay = () => (
  <div className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-[0.03]">
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <filter id="noise">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.8"
          numOctaves="4"
          stitchTiles="stitch"
        />
      </filter>
      <rect width="100%" height="100%" filter="url(#noise)" />
    </svg>
  </div>
);

// Floating Particles
const FloatingParticles = () => {
  const [particles, setParticles] = useState<
    {
      id: number;
      size: number;
      left: number;
      duration: number;
      delay: number;
      color: string;
    }[]
  >([]);

  useEffect(() => {
    const p = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      size: Math.random() * 4 + 1.5,
      left: Math.random() * 100,
      duration: Math.random() * 20 + 10,
      delay: Math.random() * 10,
      color: Math.random() > 0.5 ? "#ff5757" : "#555",
    }));
    setParticles(p);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.left}%`,
            backgroundColor: p.color,
            bottom: "-10px",
            opacity: 0,
          }}
          animate={{
            y: ["0vh", "-120vh"],
            opacity: [0, 0.4, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
};

interface TopicNode {
  id: string; // The original key
  name: string;
  total: number;
  solved: number;
  isLocked: boolean;
  explanation: string;
  difficulty: number;
}

function TopicsClient() {
  const router = useRouter();
  const { response: dsaResponse } = useApi("dashboard-dsa-sheet", {
    url: `${routes.api.base}${routes.api.dsaSheet}?limit=1000`,
  });

  const [completedQuestions, setCompletedQuestions] = useState<
    (string | number)[]
  >([]);

  useEffect(() => {
    const saved = localStorage.getItem("dsayatra_completed_questions");
    if (saved) {
      try {
        setCompletedQuestions(JSON.parse(saved));
      } catch {}
    }
  }, []);

  const allQuestions = useMemo(() => {
    return Array.isArray(dsaResponse?.data?.questions)
      ? dsaResponse.data.questions
      : [];
  }, [dsaResponse]);

  const nodes = useMemo(() => {
    const topicMap = new Map<string, { total: number; solved: number }>();
    allQuestions.forEach((q: any) => {
      const primaryTopic = q.topics?.[0];
      if (primaryTopic) {
        if (!topicMap.has(primaryTopic)) {
          topicMap.set(primaryTopic, { total: 0, solved: 0 });
        }
        const entry = topicMap.get(primaryTopic)!;
        entry.total += 1;
        const qId = q._id;
        if (qId && completedQuestions.includes(qId)) {
          entry.solved += 1;
        }
      }
    });

    // Create a list of all possible topics from TOPIC_LABELS to ensure they all show up
    const allTopicKeys = Object.keys(TOPIC_LABELS);

    // Sort keys to have a consistent roadmap (e.g., Array, String, etc.)
    const preferredOrder = [
      "ARRAY",
      "SLIDING_WINDOW",
      "RECURSION",
      "BINARY_SEARCH",
      "LINKED_LIST",
      "STACK",
      "STRING",
    ];
    const sortedKeys = [...allTopicKeys].sort((a, b) => {
      const idxA = preferredOrder.indexOf(a);
      const idxB = preferredOrder.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });

    const combinedNodes: TopicNode[] = sortedKeys
      .map((topicKey, idx) => {
        const data = topicMap.get(topicKey) || { total: 0, solved: 0 };
        let name = TOPIC_LABELS[topicKey] || topicKey;

        // Specifically match image case for RECURSION
        if (topicKey === "RECURSION") name = "RECURSION";

        // If a topic has 0 questions, it's "locked" or "coming soon"
        const isActuallyLocked = data.total === 0;

        return {
          id: topicKey,
          name,
          total: data.total,
          solved: data.solved,
          isLocked: isActuallyLocked,
          explanation:
            EXPLANATIONS[name] || `Master the fundamentals of ${name}.`,
          difficulty: 1 + (idx % 5),
        };
      })
      .filter(
        (node) => node.total > 0 || node.name === "RECURSION" || node.isLocked,
      ); // Keep non-empty ones or specific ones

    return combinedNodes;
  }, [allQuestions, completedQuestions]);

  const stats = useMemo(() => {
    const topicsTotal = nodes.filter((n) => !n.isLocked).length;
    const mastered = nodes.filter(
      (n) => !n.isLocked && n.total > 0 && n.solved === n.total,
    ).length;
    const potential = nodes.filter((n) => n.isLocked).length;

    let qTotal = 0;
    let qSolved = 0;
    nodes
      .filter((n) => !n.isLocked)
      .forEach((n) => {
        qTotal += n.total;
        qSolved += n.solved;
      });

    const overallPct = qTotal > 0 ? Math.round((qSolved / qTotal) * 100) : 0;

    return { topicsTotal, mastered, potential, overallPct };
  }, [nodes]);

  const [shakingId, setShakingId] = useState<string | null>(null);
  const [rippleId, setRippleId] = useState<string | null>(null);

  const handleNodeClick = (node: TopicNode) => {
    if (node.isLocked) {
      setShakingId(node.id);
      setTimeout(() => setShakingId(null), 500);
      return;
    }

    setRippleId(node.id);
    setTimeout(() => {
      router.push(`/sheets?topic=${node.id}`);
    }, 400);
  };

  // SVG Geometry Calculation
  const NODE_SPACING_X = 220; // Distance between nodes horizontally
  const START_X = 120; // Starting padding
  const BASE_Y = 220; // Vertical center in the Canvas
  const TOTAL_WIDTH = START_X + nodes.length * NODE_SPACING_X + START_X;

  const nodePositions = useMemo(() => {
    return nodes.map((_, i) => ({
      cx: START_X + i * NODE_SPACING_X,
      cy: BASE_Y + Math.sin(i * 1.5) * 110, // Creates a nice wavy vertical offset up and down
    }));
  }, [nodes]);

  const { dFull, dActive } = useMemo(() => {
    if (nodePositions.length === 0) return { dFull: "", dActive: "" };

    let full = "";
    let active = "";

    // Find the last index that is "started" or "completed" to know where the active red line should end
    const lastActiveIndex = nodes.reduce((latest, n, i) => {
      if (!n.isLocked && n.solved > 0) return i;
      return latest;
    }, -1);

    // We let the red dashed line run exactly up to the last active index + 1 (meaning it bridges them)
    // Or just up to the node they are currently on.
    const limitLineIndex = lastActiveIndex >= 0 ? lastActiveIndex : 0;

    nodePositions.forEach((pos, i) => {
      if (i === 0) {
        full += `M ${pos.cx} ${pos.cy}`;
        active += `M ${pos.cx} ${pos.cy}`;
      } else {
        const prev = nodePositions[i - 1];
        const midX = (prev.cx + pos.cx) / 2;
        const curve = ` C ${midX} ${prev.cy}, ${midX} ${pos.cy}, ${pos.cx} ${pos.cy}`;

        full += curve;
        if (i <= limitLineIndex) {
          active += curve;
        }
      }
    });

    return { dFull: full, dActive: active };
  }, [nodePositions, nodes]);

  return (
    <div className="min-h-[calc(100vh-72px)] bg-[#0a0a0a] text-white relative font-sans overflow-x-hidden pt-4 pb-0 flex flex-col items-center">
      {/* Cover navbar bottom border */}
      <div className="absolute -top-[1px] left-0 right-0 h-[3px] bg-[#0a0a0a] z-[100]" />
      <NoiseOverlay />
      <FloatingParticles />

      {/* Back Button */}
      <div className="absolute top-6 left-6 z-[110]">
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2 px-4 py-2 bg-[#111] border border-[#2a2a2a] rounded-lg text-gray-400 hover:text-white hover:border-[#ff5757] transition-all duration-300 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-bold uppercase tracking-widest">
            Back to Dashboard
          </span>
        </button>
      </div>

      {/* Header Section */}
      <motion.div
        className="relative z-10 flex flex-col items-center justify-center text-center px-6 mt-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, staggerChildren: 0.2 }}
      >
        <motion.h1
          className="text-[42px] md:text-[52px] font-[900] leading-[0.9] tracking-tight text-white m-0 p-0"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          DATA
          <br />
          <span className="text-[#ff5757]">STRUCTURES</span>
        </motion.h1>
        <motion.p
          className="mt-2 text-[#888] text-[12px] md:text-[14px] max-w-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          Master the fundamentals of computer science through a structured and
          interactive milestone journey.
        </motion.p>
      </motion.div>

      {/* Stats Row */}
      <motion.div
        className="relative z-10 w-full flex items-center justify-center gap-10 md:gap-20 mt-6 px-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <div className="flex flex-col items-center">
          <span className="text-3xl md:text-5xl font-[900] text-[#ff5757]">
            {stats.topicsTotal}
          </span>
          <span className="text-[10px] font-bold text-[#666] tracking-[0.2em] uppercase mt-2">
            Topics
          </span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-3xl md:text-5xl font-[900] text-[#ff5757]">
            {stats.mastered}
          </span>
          <span className="text-[10px] font-bold text-[#666] tracking-[0.2em] uppercase mt-2">
            Mastered
          </span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-3xl md:text-5xl font-[900] text-[#ff5757]">
            {stats.potential}
          </span>
          <span className="text-[10px] font-bold text-[#666] tracking-[0.2em] uppercase mt-2">
            Potential
          </span>
        </div>
      </motion.div>

      {/* Progress Bar */}
      <motion.div
        className="relative z-10 w-full max-w-xl mx-auto mt-6 px-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1 }}
      >
        <div className="flex justify-between items-center mb-2 font-mono text-[10px] text-[#888] tracking-widest uppercase">
          <span>Overall Progress</span>
          <span>{stats.overallPct}%</span>
        </div>
        <div className="w-full h-1 bg-[#222] rounded-full overflow-hidden relative">
          <motion.div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#ff3030] to-[#ff5757] shadow-[0_0_10px_rgba(255,87,87,0.5)]"
            initial={{ width: 0 }}
            animate={{ width: `${stats.overallPct}%` }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 1.2 }}
          />
        </div>
      </motion.div>

      {/* Scroll Hint */}
      <motion.div
        className="relative z-10 mt-4 text-center font-mono text-[10px] text-[#555] tracking-widest uppercase mb-0"
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        ► scroll horizontally ►
      </motion.div>

      {/* HORIZONTAL ROADMAP CANVAS */}
      <div className="relative w-[100vw] overflow-x-auto z-10 custom-scrollbar pt-6 pb-0 -mt-[56px] flex-1">
        <div
          className="relative mx-auto mt-16"
          style={{ width: TOTAL_WIDTH, height: 420 }}
        >
          {/* SVG Curvy joints */}
          <div className="absolute inset-x-0 inset-y-0 pointer-events-none mt-4">
            <svg width={TOTAL_WIDTH} height={420} className="w-full h-full">
              {/* Thick outer path base */}
              <path
                d={dFull}
                stroke="#161616"
                strokeWidth="26"
                fill="none"
                strokeLinecap="round"
              />
              {/* Inner inset path line */}
              <path
                d={dFull}
                stroke="#222222"
                strokeWidth="4"
                strokeDasharray="14 14"
                fill="none"
                strokeLinecap="round"
              />
              {/* Active animated red dashed path */}
              {dActive && (
                <path
                  d={dActive}
                  stroke="#ff5757"
                  strokeWidth="4"
                  strokeDasharray="14 14"
                  fill="none"
                  className="animate-flowing-dash"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </div>

          {/* Interactive Nodes */}
          {nodes.map((node, index) => {
            const pos = nodePositions[index];

            const isDone =
              !node.isLocked && node.solved === node.total && node.total > 0;
            const isActive =
              !node.isLocked && node.solved > 0 && node.solved < node.total;
            const isAvailable = !node.isLocked && node.solved === 0;

            const isShaking = shakingId === node.id;
            const isRippling = rippleId === node.id;

            const diffColor =
              node.difficulty <= 2
                ? "#51cf66"
                : node.difficulty <= 4
                  ? "#ffb946"
                  : "#ff5757";
            const diffLabel =
              node.difficulty <= 2
                ? "EASY"
                : node.difficulty <= 4
                  ? "MEDIUM"
                  : "HARD";

            return (
              <div
                key={node.id}
                className={cn(
                  "absolute transform flex flex-col items-center group",
                )}
                style={{
                  left: pos.cx,
                  top: pos.cy + 16, // Align perfectly with margin-top 4 of SVG container
                  transform: "translate(-50%, -50%)",
                  zIndex: isDone ? 10 : isActive ? 30 : 20,
                }}
              >
                <div
                  className={cn(
                    "relative cursor-pointer transition-transform duration-300 group-hover:scale-[1.08] group-hover:-translate-y-2",
                    isShaking && "animate-shake",
                  )}
                  onClick={() => handleNodeClick(node)}
                >
                  {/* Tooltip */}
                  <div
                    className="absolute bottom-[110%] left-1/2 -translate-x-1/2 mb-5 w-52 bg-[#111] border border-[#333] p-3.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-auto cursor-pointer shadow-[0_10px_30px_rgba(0,0,0,0.8)] flex flex-col items-center z-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNodeClick(node);
                    }}
                  >
                    <span className="font-bold text-white text-[13px] mb-2">
                      {node.name}
                    </span>
                    <span className="text-[10px] text-[#A0A0A0] font-sans text-center leading-[1.4]">
                      {node.explanation}
                    </span>
                    {!node.isLocked && (
                      <div
                        className="mt-3 text-[8px] font-[900] px-2 py-0.5 rounded-[4px] text-black tracking-widest"
                        style={{ backgroundColor: diffColor }}
                      >
                        {diffLabel}
                      </div>
                    )}
                  </div>

                  {/* Ripple Effect */}
                  <AnimatePresence>
                    {isRippling && (
                      <motion.div
                        className="absolute inset-0 rounded-full bg-[#ff5757]"
                        initial={{ opacity: 0.5, scale: 1 }}
                        animate={{ opacity: 0, scale: 2.5 }}
                        transition={{ duration: 0.6 }}
                      />
                    )}
                  </AnimatePresence>

                  {/* Node Circle matches exact image spec */}
                  <div
                    className={cn(
                      "w-[84px] h-[84px] rounded-full flex flex-col items-center justify-center relative border-[3px] z-10 transition-colors duration-300",
                      isDone
                        ? "bg-[#141414] border-[#51cf66] shadow-[0_0_15px_rgba(81,207,102,0.2)]"
                        : isActive
                          ? "bg-[radial-gradient(circle_at_center,#cc2929_0%,#3b0a0a_100%)] border-[#ff5757] shadow-[0_0_25px_rgba(255,87,87,0.5)]"
                          : isAvailable
                            ? "bg-[#111] border-[#ff5757] shadow-[0_0_15px_rgba(255,87,87,0.15)]"
                            : "bg-[#080808] border-[#1f1f1f]",
                    )}
                  >
                    {/* Active pulsing rings behind circle */}
                    {isActive && (
                      <Fragment>
                        <div className="absolute inset-[-15px] rounded-full border border-[#ff5757]/30 animate-pulse pointer-events-none" />
                        <div className="absolute inset-[-30px] rounded-full border border-[#ff5757]/10 animate-ping opacity-20 pointer-events-none" />
                        <motion.div
                          className="absolute -top-[28px] text-[20px] drop-shadow-[0_0_10px_rgba(255,87,87,0.8)]"
                          animate={{ y: [0, -6, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          👑
                        </motion.div>
                      </Fragment>
                    )}

                    {/* Node Internal Icon */}
                    <span
                      className={cn(
                        "flex items-center justify-center mb-0.5 mt-1 transition-colors duration-300",
                        isDone ? "text-[#51cf66] opacity-70" : "",
                        node.isLocked ? "text-[#444] opacity-30" : "",
                        isActive ? "text-white" : "",
                        isAvailable ? "text-[#ff5757]" : "",
                      )}
                    >
                      {React.createElement(
                        TOPIC_ICON_MAP[node.id] || DEFAULT_ICON,
                        { className: "w-5 h-5 stroke-[2px]" },
                      )}
                    </span>

                    {/* 0X Number text inside circle */}
                    <span
                      className={cn(
                        "text-[12px] font-[900] tracking-wide",
                        isActive
                          ? "text-white"
                          : isAvailable
                            ? "text-[#ff5757]"
                            : "text-[#444]",
                        isDone && "text-[#555]",
                      )}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    {/* Specific Badges attached to edge */}
                    {isDone && (
                      <div className="absolute bottom-1 right-1 w-[22px] h-[22px] bg-[#444] rounded-full border-[2px] border-[#0a0a0a] flex items-center justify-center translate-x-1/4 translate-y-1/4 shadow-md">
                        <Check
                          className="w-3.5 h-3.5 text-white"
                          strokeWidth={4}
                        />
                      </div>
                    )}
                    {node.isLocked && (
                      <div className="absolute bottom-1 right-1 w-[20px] h-[20px] bg-[#1a1a1a] rounded-full border-[2px] border-[#0a0a0a] flex items-center justify-center translate-x-1/4 translate-y-1/4">
                        <Lock
                          className="w-2.5 h-2.5 text-[#555]"
                          strokeWidth={3}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom External Title Text (moved outside scaling container so it doesn't clip) */}
                <div
                  className="absolute top-[96px] left-1/2 -translate-x-1/2 flex flex-col items-center w-36 pointer-events-auto cursor-pointer z-20"
                  onClick={() => handleNodeClick(node)}
                >
                  <span
                    className={cn(
                      "text-[12px] font-bold text-center",
                      isActive || isAvailable ? "text-white" : "text-[#555]",
                    )}
                  >
                    {node.name}
                  </span>
                  {/* Small Difficulty Dots */}
                  <div className="flex gap-1.5 mt-2 opacity-50">
                    {[1, 2, 3, 4, 5].map((d) => (
                      <div
                        key={d}
                        className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          d <= node.difficulty
                            ? isActive || isAvailable
                              ? "bg-[#ff5757]"
                              : "bg-[#444]"
                            : "bg-[#222]",
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom Keyframes and Scrollbar Styling */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20%, 60% { transform: translateX(-5px); }
            40%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
            animation: shake 0.4s ease-in-out;
        }
        @keyframes flowing-dash {
            to { stroke-dashoffset: -28; }
        }
        .animate-flowing-dash {
            animation: flowing-dash 1s linear infinite;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
            height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: #0a0a0a;
            border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #2a2a2a;
            border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #ff5757;
        }
      `,
        }}
      />
    </div>
  );
}

export default function TopicsPage({ seoMeta }: PageProps) {
  return (
    <Fragment>
      <Head>
        <title>DSA Yatra | Topics Roadmap</title>
      </Head>
      <SEO seoMeta={seoMeta} />
      <TopicsClient />
    </Fragment>
  );
}

export const getStaticProps = async () => ({
  ...(await getPreFetchProps({
    slug: routes.dsayatra.home,
    appId: "dsayatra",
  })),
  revalidate: PAGE_REFRESH_TIMEOUT.veryVeryLong,
});
