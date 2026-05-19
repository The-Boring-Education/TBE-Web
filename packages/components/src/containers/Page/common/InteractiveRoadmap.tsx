import type { RoadmapNode } from "@tbe/interface";
import { cn } from "@tbe/utils";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Check, Code, Lock } from "lucide-react";
import type { ComponentType, ReactNode } from "react";
import React, { Fragment, useEffect, useMemo, useState } from "react";

/* ---------- Sub-components ---------- */

const NoiseOverlay = () => (
  <div className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-[0.03]">
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <filter id="roadmap-noise">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.8"
          numOctaves="4"
          stitchTiles="stitch"
        />
      </filter>
      <rect width="100%" height="100%" filter="url(#roadmap-noise)" />
    </svg>
  </div>
);

const FloatingParticles = ({ accentColor }: { accentColor: string }) => {
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
      color: Math.random() > 0.5 ? accentColor : "#555",
    }));
    setParticles(p);
  }, [accentColor]);

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

/* ---------- Types ---------- */

export interface RoadmapStatItem {
  label: string;
  value: number;
}

export interface InteractiveRoadmapProps {
  nodes: RoadmapNode[];
  onNodeClick: (node: RoadmapNode) => void;
  title: ReactNode;
  subtitle?: string;
  stats?: RoadmapStatItem[];
  overallProgress?: number;
  accentColor?: string;
  iconMap?: Record<string, ComponentType<{ className?: string }>>;
  defaultIcon?: ComponentType<{ className?: string }>;
  backButtonLabel?: string;
  onBackClick?: () => void;
  className?: string;
}

/* ---------- Geometry helpers ---------- */

const NODE_SPACING_X = 220;
/** Extra inset so the first node clears the DSA Yatra dashboard sidebar on lg+ */
const CANVAS_LEFT_INSET = 48;
const START_X = 120 + CANVAS_LEFT_INSET;
const BASE_Y = 220;
const CANVAS_HEIGHT = 420;

function computeNodePositions(count: number) {
  return Array.from({ length: count }).map((_, i) => ({
    cx: START_X + i * NODE_SPACING_X,
    cy: BASE_Y + Math.sin(i * 1.5) * 110,
  }));
}

function computePaths(
  positions: { cx: number; cy: number }[],
  nodes: RoadmapNode[],
) {
  if (positions.length === 0) return { dFull: "", dActive: "" };

  let full = "";
  let active = "";

  const lastActiveIndex = nodes.reduce((latest, n, i) => {
    if (!n.isLocked && n.solved > 0) return i;
    return latest;
  }, -1);

  const limitLineIndex = lastActiveIndex >= 0 ? lastActiveIndex : 0;

  positions.forEach((pos, i) => {
    if (i === 0) {
      full += `M ${pos.cx} ${pos.cy}`;
      active += `M ${pos.cx} ${pos.cy}`;
    } else {
      const prev = positions[i - 1]!;
      const midX = (prev.cx + pos.cx) / 2;
      const curve = ` C ${midX} ${prev.cy}, ${midX} ${pos.cy}, ${pos.cx} ${pos.cy}`;
      full += curve;
      if (i <= limitLineIndex) active += curve;
    }
  });

  return { dFull: full, dActive: active };
}

/* ---------- Main component ---------- */

const InteractiveRoadmap = ({
  nodes,
  onNodeClick,
  title,
  subtitle,
  stats,
  overallProgress,
  accentColor = "#ff5757",
  iconMap = {},
  defaultIcon = Code,
  backButtonLabel,
  onBackClick,
  className,
}: InteractiveRoadmapProps) => {
  const [shakingId, setShakingId] = useState<string | null>(null);
  const [rippleId, setRippleId] = useState<string | null>(null);

  const handleClick = (node: RoadmapNode) => {
    if (node.isLocked) {
      setShakingId(node.id);
      setTimeout(() => setShakingId(null), 500);
      return;
    }
    setRippleId(node.id);
    setTimeout(() => {
      onNodeClick(node);
    }, 400);
  };

  const TOTAL_WIDTH = START_X + nodes.length * NODE_SPACING_X + START_X;

  const nodePositions = useMemo(
    () => computeNodePositions(nodes.length),
    [nodes.length],
  );

  const { dFull, dActive } = useMemo(
    () => computePaths(nodePositions, nodes),
    [nodePositions, nodes],
  );

  return (
    <div
      className={cn(
        "min-h-[calc(100vh-72px)] bg-[#0a0a0a] text-white relative font-sans overflow-x-hidden pt-4 pb-0 flex flex-col items-center",
        className,
      )}
    >
      <div className="absolute -top-px left-0 right-0 h-[3px] bg-[#0a0a0a] z-[100]" />
      <NoiseOverlay />
      <FloatingParticles accentColor={accentColor} />

      {/* Back Button */}
      {backButtonLabel && onBackClick && (
        <div className="absolute top-6 left-6 z-[110]">
          <button
            onClick={onBackClick}
            className="flex items-center gap-2 border border-gray-700 rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-400 hover:border-gray-500 hover:text-gray-200 transition-all duration-300 bg-transparent"
          >
            <ArrowLeft className="w-4 h-4" />
            {backButtonLabel}
          </button>
        </div>
      )}

      {/* Header */}
      <motion.div
        className="relative z-10 flex flex-col items-center justify-center text-center px-6 mt-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          className="text-5xl font-black leading-[0.9] tracking-tight text-white m-0 p-0"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {title}
        </motion.div>
        {subtitle && (
          <motion.p
            className="mt-2 text-gray-500 text-xs md:text-sm max-w-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            {subtitle}
          </motion.p>
        )}
      </motion.div>

      {/* Stats Row */}
      {stats && stats.length > 0 && (
        <motion.div
          className="relative z-10 w-full flex items-center justify-center gap-10 md:gap-20 mt-6 px-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center">
              <span
                className="text-3xl md:text-5xl font-black"
                style={{ color: accentColor }}
              >
                {stat.value}
              </span>
              <span className="text-[10px] font-bold text-gray-500 tracking-widest uppercase mt-2">
                {stat.label}
              </span>
            </div>
          ))}
        </motion.div>
      )}

      {/* Progress Bar */}
      {overallProgress !== undefined && (
        <motion.div
          className="relative z-10 w-full max-w-xl mx-auto mt-6 px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
        >
          <div className="flex justify-between items-center mb-2 font-mono text-[10px] text-gray-500 tracking-widest uppercase">
            <span>Overall Progress</span>
            <span>{overallProgress}%</span>
          </div>
          <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden relative">
            <motion.div
              className="absolute top-0 left-0 h-full rounded-full"
              style={{
                background: `linear-gradient(to right, ${accentColor}cc, ${accentColor})`,
                boxShadow: `0 0 10px ${accentColor}80`,
              }}
              initial={{ width: 0 }}
              animate={{ width: `${overallProgress}%` }}
              transition={{ duration: 1.5, ease: "easeOut", delay: 1.2 }}
            />
          </div>
        </motion.div>
      )}

      {/* Scroll Hint */}
      <motion.div
        className="relative z-10 mt-4 text-center font-mono text-[10px] text-gray-600 tracking-widest uppercase mb-0"
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        ► scroll horizontally ►
      </motion.div>

      {/* Roadmap Canvas — w-full (not 100vw) so content stays beside the dashboard sidebar */}
      <motion.div
        className="relative z-10 w-full min-w-0 overflow-x-auto roadmap-custom-scrollbar scroll-pl-6 pt-6 pb-0 -mt-14 flex-1 lg:scroll-pl-12"
        data-testid="roadmap-canvas-scroll"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1 }}
      >
        <div
          className="relative mx-auto mt-16 pl-6 lg:pl-12"
          style={{ width: TOTAL_WIDTH, height: CANVAS_HEIGHT }}
        >
          {/* SVG Paths */}
          <div className="absolute inset-x-0 inset-y-0 pointer-events-none mt-4">
            <svg
              width={TOTAL_WIDTH}
              height={CANVAS_HEIGHT}
              className="w-full h-full"
            >
              <path
                d={dFull}
                stroke="#161616"
                strokeWidth="26"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d={dFull}
                stroke="#222222"
                strokeWidth="4"
                strokeDasharray="14 14"
                fill="none"
                strokeLinecap="round"
              />
              {dActive && (
                <path
                  d={dActive}
                  stroke={accentColor}
                  strokeWidth="4"
                  strokeDasharray="14 14"
                  fill="none"
                  className="roadmap-flowing-dash"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </div>

          {/* Nodes */}
          {nodes.map((node, index) => {
            const pos = nodePositions[index]!;
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
                  : accentColor;
            const diffLabel =
              node.difficulty <= 2
                ? "EASY"
                : node.difficulty <= 4
                  ? "MEDIUM"
                  : "HARD";

            const NodeIcon = iconMap[node.id] || defaultIcon;

            return (
              <div
                key={node.id}
                className="absolute transform flex flex-col items-center group"
                style={{
                  left: pos.cx,
                  top: pos.cy + 16,
                  transform: "translate(-50%, -50%)",
                  zIndex: isDone ? 10 : isActive ? 30 : 20,
                }}
              >
                <div
                  className={cn(
                    "relative cursor-pointer transition-transform duration-300 group-hover:scale-[1.08] group-hover:-translate-y-2",
                    isShaking && "roadmap-shake",
                  )}
                  onClick={() => handleClick(node)}
                >
                  {/* Tooltip */}
                  <div
                    className="absolute bottom-[110%] left-1/2 -translate-x-1/2 mb-5 w-52 bg-gray-900 border border-gray-700 p-3.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-auto cursor-pointer shadow-[0_10px_30px_rgba(0,0,0,0.8)] flex flex-col items-center z-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClick(node);
                    }}
                  >
                    <span className="font-bold text-white text-xs mb-2">
                      {node.name}
                    </span>
                    <span className="text-[10px] text-gray-400 font-sans text-center leading-relaxed">
                      {node.explanation}
                    </span>
                    {!node.isLocked && (
                      <div
                        className="mt-3 text-[8px] font-black px-2 py-0.5 rounded text-black tracking-widest"
                        style={{ backgroundColor: diffColor }}
                      >
                        {diffLabel}
                      </div>
                    )}
                  </div>

                  {/* Ripple */}
                  <AnimatePresence>
                    {isRippling && (
                      <motion.div
                        className="absolute inset-0 rounded-full"
                        style={{ backgroundColor: accentColor }}
                        initial={{ opacity: 0.5, scale: 1 }}
                        animate={{ opacity: 0, scale: 2.5 }}
                        transition={{ duration: 0.6 }}
                      />
                    )}
                  </AnimatePresence>

                  {/* Node Circle */}
                  <div
                    className={cn(
                      "w-20 h-20 rounded-full flex flex-col items-center justify-center relative border-[3px] z-10 transition-colors duration-300",
                      isDone &&
                        "bg-gray-900 border-green-500 shadow-[0_0_15px_rgba(81,207,102,0.2)]",
                      isActive &&
                        "bg-[radial-gradient(circle_at_center,#cc2929_0%,#3b0a0a_100%)] shadow-[0_0_25px_rgba(255,87,87,0.5)]",
                      isAvailable &&
                        "bg-gray-900 shadow-[0_0_15px_rgba(255,87,87,0.15)]",
                      node.isLocked && "bg-[#080808] border-gray-800",
                    )}
                    style={
                      isActive || isAvailable
                        ? { borderColor: accentColor }
                        : undefined
                    }
                  >
                    {isActive && (
                      <Fragment>
                        <div
                          className="absolute inset-[-15px] rounded-full border animate-pulse pointer-events-none"
                          style={{ borderColor: `${accentColor}4D` }}
                        />
                        <div
                          className="absolute inset-[-30px] rounded-full border animate-ping opacity-20 pointer-events-none"
                          style={{ borderColor: `${accentColor}1A` }}
                        />
                        <motion.div
                          className="absolute -top-7 text-xl drop-shadow-lg"
                          animate={{ y: [0, -6, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          👑
                        </motion.div>
                      </Fragment>
                    )}

                    <span
                      className={cn(
                        "flex items-center justify-center mb-0.5 mt-1 transition-colors duration-300",
                        isDone && "text-green-500 opacity-70",
                        node.isLocked && "text-gray-700 opacity-30",
                        isActive && "text-white",
                      )}
                      style={isAvailable ? { color: accentColor } : undefined}
                    >
                      <NodeIcon className="w-5 h-5 stroke-[2px]" />
                    </span>

                    <span
                      className={cn(
                        "font-black tracking-tight tabular-nums",
                        node.total > 0
                          ? "text-[10px] leading-tight"
                          : "text-xs tracking-wide",
                        isActive && "text-white",
                        isDone && "text-gray-600",
                        node.isLocked && "text-gray-700",
                      )}
                      style={isAvailable ? { color: accentColor } : undefined}
                    >
                      {node.total > 0
                        ? `${node.solved}/${node.total}`
                        : String(index + 1).padStart(2, "0")}
                    </span>

                    {isDone && (
                      <div className="absolute bottom-1 right-1 w-5.5 h-5.5 bg-gray-600 rounded-full border-2 border-[#0a0a0a] flex items-center justify-center translate-x-1/4 translate-y-1/4 shadow-md">
                        <Check
                          className="w-3.5 h-3.5 text-white"
                          strokeWidth={4}
                        />
                      </div>
                    )}
                    {node.isLocked && (
                      <div className="absolute bottom-1 right-1 w-5 h-5 bg-gray-900 rounded-full border-2 border-[#0a0a0a] flex items-center justify-center translate-x-1/4 translate-y-1/4">
                        <Lock
                          className="w-2.5 h-2.5 text-gray-600"
                          strokeWidth={3}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Label below node */}
                <div
                  className="absolute top-24 left-1/2 -translate-x-1/2 flex flex-col items-center w-36 pointer-events-auto cursor-pointer z-20"
                  onClick={() => handleClick(node)}
                >
                  <span
                    className={cn(
                      "text-xs font-bold text-center",
                      isActive || isAvailable ? "text-white" : "text-gray-600",
                    )}
                  >
                    {node.name}
                  </span>
                  <div className="flex gap-1.5 mt-2 opacity-50">
                    {[1, 2, 3, 4, 5].map((d) => (
                      <div
                        key={d}
                        className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          d <= node.difficulty
                            ? isActive || isAvailable
                              ? "bg-current"
                              : "bg-gray-700"
                            : "bg-gray-800",
                        )}
                        style={
                          d <= node.difficulty && (isActive || isAvailable)
                            ? { backgroundColor: accentColor }
                            : undefined
                        }
                      />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Keyframes & scrollbar */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes roadmap-shake-anim {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-5px); }
          40%, 80% { transform: translateX(5px); }
        }
        .roadmap-shake {
          animation: roadmap-shake-anim 0.4s ease-in-out;
        }
        @keyframes roadmap-flowing {
          to { stroke-dashoffset: -28; }
        }
        .roadmap-flowing-dash {
          animation: roadmap-flowing 1s linear infinite;
        }
        .roadmap-custom-scrollbar::-webkit-scrollbar {
          height: 6px;
        }
        .roadmap-custom-scrollbar::-webkit-scrollbar-track {
          background: #0a0a0a;
          border-radius: 10px;
        }
        .roadmap-custom-scrollbar::-webkit-scrollbar-thumb {
          background: #2a2a2a;
          border-radius: 10px;
        }
        .roadmap-custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${accentColor};
        }
      `,
        }}
      />
    </div>
  );
};

export default InteractiveRoadmap;
