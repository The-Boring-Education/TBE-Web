import type { RoadmapStatItem } from "@tbe/components";
import { InteractiveRoadmap, SEO } from "@tbe/components";
import {
  compareDsaTopicKeys,
  DSA_TOPIC_ROADMAP_ICON_MAP,
  PAGE_REFRESH_TIMEOUT,
  routes,
  TOPIC_LABELS,
} from "@tbe/constants";
import { useDsaTopicSummaries } from "@tbe/hooks";
import type { PageProps, RoadmapNode } from "@tbe/interface";
import { getPreFetchProps } from "@tbe/utils";
import { motion } from "framer-motion";
import { ArrowRight, Code } from "lucide-react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { Fragment, useMemo } from "react";

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
  Recursion:
    "Functions that call themselves to break problems into subproblems.",
  DFS: "Depth-first traversal for trees and graphs.",
  BFS: "Breadth-first traversal layer by layer.",
  Trie: "Tree-based structure for efficient prefix lookups.",
  Heap: "Priority queue backed by a complete binary heap.",
  Graph: "Vertices and edges; modeling relationships and paths.",
  "Dynamic Programming": "Optimal substructure and overlapping subproblems.",
  "Union Find": "Disjoint-set connectivity with path compression.",
  Simulation: "Step-by-step modeling of process or state machines.",
  Design: "System-style problems: APIs, data structures, and tradeoffs.",
  "Monotonic Stack":
    "Stack maintaining order for next-greater and span problems.",
};

function VisualizerTopBanner() {
  return (
    <Link
      href={routes.dsayatra.visualizers}
      className="group relative flex items-center justify-between gap-3.5 rounded-xl border border-slate-200/90 dark:border-[#24242A] bg-white dark:bg-[#131316] hover:dark:bg-[#18181D] px-3.5 py-2.5 transition-all duration-300 shadow-2xs"
    >
      <div className="flex items-center gap-3 sm:gap-3.5">
        {/* Slim squarish mini-visualizer preview box with moving element bars */}
        <div className="relative flex h-9 w-9 shrink-0 items-end justify-between overflow-hidden rounded-lg border border-slate-200/90 dark:border-[#24242A] bg-slate-50 dark:bg-[#0E0E12] p-1.5 transition-colors group-hover:border-[#FF4D4D]/60">
          {/* Moving element bars */}
          <div className="relative flex h-full w-full items-end justify-between gap-0.5">
            {[
              {
                initial: "40%",
                animate: ["30%", "85%", "45%", "95%", "30%"],
                duration: 3.4,
              },
              {
                initial: "75%",
                animate: ["75%", "25%", "90%", "40%", "75%"],
                duration: 2.9,
              },
              {
                initial: "50%",
                animate: ["50%", "95%", "35%", "70%", "50%"],
                duration: 3.8,
              },
              {
                initial: "90%",
                animate: ["90%", "40%", "80%", "20%", "90%"],
                duration: 3.2,
              },
            ].map((bar, idx) => (
              <motion.div
                key={idx}
                className="w-full rounded-xs bg-gradient-to-t from-[#FF4D4D]/40 to-[#FF4D4D]"
                style={{ height: bar.initial }}
                animate={{ height: bar.animate }}
                transition={{
                  duration: bar.duration,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        </div>

        {/* Text Content */}
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#FF4D4D] transition-colors">
            Explore Interactive Algorithm Visualizers
          </span>
          <span className="hidden sm:inline-block text-[11px] text-slate-400 dark:text-slate-500 font-medium">
            — Step through sorting, trees & graphs dynamically
          </span>
        </div>
      </div>

      <div className="inline-flex items-center gap-1 text-xs font-bold text-[#FF4D4D] group-hover:translate-x-0.5 transition-transform shrink-0">
        <span>Explore</span>
        <ArrowRight className="h-3.5 w-3.5" />
      </div>
    </Link>
  );
}

function TopicsClient() {
  const router = useRouter();
  const { data: topicRows } = useDsaTopicSummaries("DSA_YATRA");

  const nodes: RoadmapNode[] = useMemo(() => {
    const topicMap = new Map<string, { total: number; solved: number }>();
    (topicRows || []).forEach((row) => {
      topicMap.set(row.topic, {
        total: row.accessibleCount,
        solved: row.accessibleSolved,
      });
    });

    const sortedKeys = Object.keys(TOPIC_LABELS).sort(compareDsaTopicKeys);

    return sortedKeys.map((topicKey, idx) => {
      const data = topicMap.get(topicKey) || { total: 0, solved: 0 };
      const name = TOPIC_LABELS[topicKey] || topicKey;

      return {
        id: topicKey,
        name,
        total: data.total,
        solved: data.solved,
        isLocked: data.total === 0,
        explanation:
          EXPLANATIONS[name] || `Master the fundamentals of ${name}.`,
        difficulty: 1 + (idx % 5),
      };
    });
  }, [topicRows]);

  const stats: RoadmapStatItem[] = useMemo(() => {
    const topicsTotal = nodes.filter((n) => !n.isLocked).length;
    const mastered = nodes.filter(
      (n) => !n.isLocked && n.total > 0 && n.solved === n.total,
    ).length;
    const potential = nodes.filter((n) => n.isLocked).length;

    return [
      { label: "Topics", value: topicsTotal },
      { label: "Mastered", value: mastered },
      { label: "Potential", value: potential },
    ];
  }, [nodes]);

  const overallProgress = useMemo(() => {
    let qTotal = 0;
    let qSolved = 0;
    nodes
      .filter((n) => !n.isLocked)
      .forEach((n) => {
        qTotal += n.total;
        qSolved += n.solved;
      });
    return qTotal > 0 ? Math.round((qSolved / qTotal) * 100) : 0;
  }, [nodes]);

  const handleNodeClick = (node: RoadmapNode) => {
    router.push(`/sheets?topic=${node.id}`);
  };

  return (
    <div className="w-full h-full overflow-y-auto px-3 sm:px-6 py-2 sm:py-3 space-y-3 font-sans scrollbar-thin-grey">
      {/* Breadcrumb Navigation on Top */}
      <nav className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 dark:text-slate-500">
        <Link
          href="/dashboard"
          className="hover:text-slate-800 dark:hover:text-white transition-colors"
        >
          DSA Yatra
        </Link>
        <span className="text-slate-300 dark:text-slate-600">›</span>
        <span className="font-bold text-[#FF4D4D]">Topics Roadmap</span>
      </nav>

      <VisualizerTopBanner />

      <div className="rounded-2xl border border-slate-200/90 dark:border-[#24242A] bg-white dark:bg-[#131316] overflow-hidden shadow-2xs">
        <InteractiveRoadmap
          className="!bg-transparent dark:!bg-[#131316] [&>div.-top-px]:hidden [&_.bg-[#0a0a0a]]:!bg-[#131316] min-h-[500px]"
          nodes={nodes}
          onNodeClick={handleNodeClick}
          title={
            <>
              DATA
              <br />
              <span className="text-[#FF4D4D]">STRUCTURES</span>
            </>
          }
          subtitle="Master the fundamentals of computer science through a structured and interactive milestone journey."
          stats={stats}
          overallProgress={overallProgress}
          accentColor="#FF4D4D"
          iconMap={DSA_TOPIC_ROADMAP_ICON_MAP}
          defaultIcon={Code}
        />
      </div>
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
