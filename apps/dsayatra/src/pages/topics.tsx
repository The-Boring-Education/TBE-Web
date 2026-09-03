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
import { cn, getPreFetchProps } from "@tbe/utils";
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
      className="group relative mb-4 mx-auto max-w-fit flex items-center justify-center gap-3.5 rounded-xl px-3 py-2.5 transition-all duration-300 hover:bg-white/[0.04] sm:px-4"
    >
      <div className="flex items-center gap-3.5 sm:gap-4">
        {/* Slim squarish mini-visualizer preview box with moving element bars */}
        <div className="relative flex h-10 w-10 shrink-0 items-end justify-between overflow-hidden rounded-lg border border-white/10 bg-[#0a0a0c] p-1.5 transition-colors group-hover:border-[#ff5757]/60">
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
                className="w-full rounded-xs bg-gradient-to-t from-[#ff5757]/40 to-[#ff5757]"
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
        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
          <span className="text-xs sm:text-sm font-semibold text-zinc-200 group-hover:text-white transition-colors">
            Explore Interactive Algorithm Visualizers
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#ff5757] group-hover:text-[#ff7777] transition-colors shrink-0">
            <span>Explore</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
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
      topicMap.set(row.topic, { total: row.count, solved: row.solved ?? 0 });
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
        isLocked: false,
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
    <Fragment>
      <VisualizerTopBanner />
      <InteractiveRoadmap
        className={cn(
          /* Match DsaDashboardLayout inset so the roadmap is not a darker “card”. */
          "!bg-[#0f0f0f]",
          /* Bleed past shell horizontal padding (px-3 sm:px-5 lg:px-6 xl:px-8). */
          "-mx-3 max-w-none sm:-mx-5 lg:-mx-6 xl:-mx-8",
          /* Hide the top blackish divider line from InteractiveRoadmap */
          "[&>div.-top-px]:hidden",
        )}
        nodes={nodes}
        onNodeClick={handleNodeClick}
        title={
          <>
            DATA
            <br />
            <span className="text-[#ff5757]">STRUCTURES</span>
          </>
        }
        subtitle="Master the fundamentals of computer science through a structured and interactive milestone journey."
        stats={stats}
        overallProgress={overallProgress}
        accentColor="#ff5757"
        iconMap={DSA_TOPIC_ROADMAP_ICON_MAP}
        defaultIcon={Code}
      />
    </Fragment>
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
