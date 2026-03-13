import type { RoadmapStatItem } from "@tbe/components";
import { InteractiveRoadmap, SEO } from "@tbe/components";
import { PAGE_REFRESH_TIMEOUT, routes, TOPIC_LABELS } from "@tbe/constants";
import { useDsaCompletedQuestions, useDsaQuestions } from "@tbe/hooks";
import type { PageProps, RoadmapNode } from "@tbe/interface";
import { getPreFetchProps } from "@tbe/utils";
import { Code, Database, Hash, Layers, Link2, Search } from "lucide-react";
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
};

const TOPIC_ICON_MAP: Record<string, any> = {
    ARRAY: Database,
    SLIDING_WINDOW: Layers,
    RECURSION: Hash,
    BINARY_SEARCH: Search,
    LINKED_LIST: Link2,
    STACK: Database,
    STRING: Code,
};

const PREFERRED_ORDER = [
  "ARRAY",
  "SLIDING_WINDOW",
  "RECURSION",
  "BINARY_SEARCH",
  "LINKED_LIST",
  "STACK",
  "STRING",
];

function TopicsClient() {
  const router = useRouter();
  const { rawQuestions: allQuestions } = useDsaQuestions({
    queryKey: "dashboard-dsa-sheet",
  });
  const { completedIds: completedQuestions } = useDsaCompletedQuestions();

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
        const qId = q._id;
        if (qId && completedQuestions.includes(qId)) {
          entry.solved += 1;
        }
      }
    });

    const allTopicKeys = Object.keys(TOPIC_LABELS);
    const sortedKeys = [...allTopicKeys].sort((a, b) => {
      const idxA = PREFERRED_ORDER.indexOf(a);
      const idxB = PREFERRED_ORDER.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });

    return sortedKeys
      .map((topicKey, idx) => {
        const data = topicMap.get(topicKey) || { total: 0, solved: 0 };
        let name = TOPIC_LABELS[topicKey] || topicKey;
        if (topicKey === "RECURSION") name = "RECURSION";
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
    router.push(`/sheets?topic=${node.id}`);
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
      iconMap={TOPIC_ICON_MAP}
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
