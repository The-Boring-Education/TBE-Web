import { useAuth } from "@tbe/auth";
import type { RoadmapStatItem } from "@tbe/components";
import { InteractiveRoadmap, SEO } from "@tbe/components";
import {
  compareDsaTopicKeys,
  DSA_TOPIC_ROADMAP_ICON_MAP,
  PAGE_REFRESH_TIMEOUT,
  routes,
  TOPIC_LABELS,
} from "@tbe/constants";
import { useDsaCompletedQuestions, useDsaQuestions } from "@tbe/hooks";
import type { PageProps, RoadmapNode } from "@tbe/interface";
import { encodeDsaTopicForUrl, getPreFetchProps } from "@tbe/utils";
import { Code } from "lucide-react";
import Head from "next/head";
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

function TopicsClient() {
  const router = useRouter();
  const { user } = useAuth();
  const { questions: allQuestions } = useDsaQuestions();
  const { completedIds: completedQuestions } = useDsaCompletedQuestions({
    userId: user?.id,
  });

  const nodes: RoadmapNode[] = useMemo(() => {
    const topicMap = new Map<string, { total: number; solved: number }>();
    allQuestions.forEach((q: any) => {
      const primaryTopic = q.topics?.[0];
      if (primaryTopic) {
        if (!topicMap.has(primaryTopic)) {
          topicMap.set(primaryTopic, { total: 0, solved: 0 });
        }
        const entry = topicMap.get(primaryTopic)!;
        entry.total += 1;
        const qId = q._id || q.id;
        if (qId && completedQuestions.includes(String(qId))) {
          entry.solved += 1;
        }
      }
    });

    const sortedKeys = Object.keys(TOPIC_LABELS).sort(compareDsaTopicKeys);

    return sortedKeys
      .map((topicKey, idx) => {
        const data = topicMap.get(topicKey) || { total: 0, solved: 0 };
        const name = TOPIC_LABELS[topicKey] || topicKey;
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
        (node) => node.total > 0 || node.id === "RECURSION" || node.isLocked,
      );
  }, [allQuestions, completedQuestions]);

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
    router.push(`/sheets?topic=${encodeDsaTopicForUrl(node.id)}`);
  };

  return (
    <InteractiveRoadmap
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
      backButtonLabel="Back to Dashboard"
      onBackClick={() => router.push("/dashboard")}
    />
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
