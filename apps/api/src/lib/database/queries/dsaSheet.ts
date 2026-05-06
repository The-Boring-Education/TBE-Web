/**
 * Pure, testable helpers for the DSA sheet pipeline.
 *
 * The orchestrator in interview-prep.ts (`getAllDSAQuestionsFromDB`) wires these
 * together and executes the Mongo aggregation. Each helper here is side-effect
 * free so it can be unit tested without a database.
 */
import {
  applyDSAFreemiumGating,
  DSA_DIFFICULTY,
  DSA_DURATION_DIFFICULTY_BUCKETS,
  DSA_FREEMIUM_LIMITS,
  DSA_FREEMIUM_POLICY_LABEL,
  DSA_FREEMIUM_POLICY_TYPE,
  DSA_FREEMIUM_TOTAL_UNLOCKED,
  getDSAFreemiumBucket,
} from "@tbe/constants";

import type { DSADifficultyType, DSADomainType } from "@/lib/interfaces";
import { selectQuestionsByDifficultyBuckets } from "@/lib/utils";

import { toObjectId } from "./common";

export type RealWorldFilterMode = "include" | "exclude" | "only";

export interface DSASheetFilters {
  domain?: DSADomainType | DSADomainType[];
  difficulty?: DSADifficultyType | DSADifficultyType[];
  companyTypes?: string | string[];
  topics?: string | string[];
  page?: number;
  limit?: number;
  userId?: string;
  /** Duration key e.g. "3Months", "6Months", "1Year" — enables difficulty buckets */
  duration?: string;
  /** Off-campus flag — scales bucket caps ×1.5 */
  offCampus?: boolean;
  /** Product context for shared DSA endpoint callers. */
  productType?: "DSA_YATRA" | "ONCAMPUS";
  /** Baseline experience in years for ranking/filter defaults (OnCampus uses 0). */
  experienceYears?: number;
  /** Filter real-world problems */
  realWorld?: RealWorldFilterMode;
  /** Whether the user has active paid subscription — determines freemium gating */
  isPaidUser?: boolean;
}

export interface DsaPaginationResult<T> {
  items: T[];
  total: number;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
  };
}

/** Primary topic sort order used for DSA Yatra / OnCampus sheet listings. */
export const DSA_TOPIC_SORT_ORDER: readonly string[] = [
  "ARRAY",
  "STRING",
  "HASHMAP",
  "TWO_POINTERS",
  "SLIDING_WINDOW",
  "PREFIX_SUM",
  "SORTING",
  "BINARY_SEARCH",
  "MATH",
  "BIT_MANIPULATION",
  "RECURSION",
  "LINKED_LIST",
  "STACK",
  "QUEUE",
  "BINARY_TREE",
  "TREE",
  "BST",
  "HEAP",
  "TRIE",
  "GRAPH",
  "DFS",
  "BFS",
  "BACKTRACKING",
  "DYNAMIC_PROGRAMMING",
  "GREEDY",
  "UNION_FIND",
];

const INTERNAL_FIELD_KEYS = [
  "_topicOrder",
  "_difficultyOrder",
  "_priorityScore",
  "_topicLimit",
  "userStatus",
] as const;

const LOCKED_ANSWER_FIELD_KEYS = [
  "answer",
  "sections",
  "resources",
  "notes",
] as const;

/** Remove internal aggregation fields we don't want to leak to clients. */
export const stripInternalDsaFields = (
  question: Record<string, unknown>,
): Record<string, unknown> => {
  const cleaned = { ...question };
  for (const key of INTERNAL_FIELD_KEYS) delete cleaned[key];
  return cleaned;
};

/** Strip answer/solution fields for freemium-locked questions. */
export const stripLockedAnswerFields = (
  question: Record<string, unknown>,
): Record<string, unknown> => {
  if (!question.isLocked) return question;
  const cleaned = { ...question };
  for (const key of LOCKED_ANSWER_FIELD_KEYS) delete cleaned[key];
  return cleaned;
};

/**
 * Build the Mongo `$match` stage from filters, intersecting company types with
 * the user's target companies when both are present.
 */
export const buildDsaMatchStage = (
  filters: DSASheetFilters,
  targetCompanies: string[],
): Record<string, any> => {
  const {
    domain,
    difficulty,
    companyTypes,
    topics,
    realWorld,
    userId,
    experienceYears,
  } = filters;
  const match: Record<string, any> = {};

  if (domain) {
    const domains = Array.isArray(domain) ? domain : [domain];
    match.domain = { $in: domains };
  }

  if (difficulty) {
    const difficulties = Array.isArray(difficulty) ? difficulty : [difficulty];
    match.difficulty = { $in: difficulties };
  } else if (experienceYears === 0) {
    // OnCampus college profile: default to foundational questions.
    match.difficulty = { $in: ["EASY", "MEDIUM"] };
  }

  if (companyTypes) {
    const types = Array.isArray(companyTypes) ? companyTypes : [companyTypes];
    match.companyTypes = { $in: types };
  }

  if (topics) {
    const topicsList = Array.isArray(topics) ? topics : [topics];
    match.topics = { $in: topicsList };
  }

  if (realWorld === "only") {
    match.isRealWorldProblem = true;
  } else if (realWorld === "exclude") {
    match.isRealWorldProblem = { $ne: true };
  }

  if (userId && targetCompanies.length > 0) {
    if (match.companyTypes) {
      const currentIn: string[] = match.companyTypes.$in || [];
      const intersection = currentIn.filter((t) => targetCompanies.includes(t));
      match.companyTypes = {
        $in: intersection.length > 0 ? intersection : targetCompanies,
      };
    } else {
      match.companyTypes = { $in: targetCompanies };
    }
  }

  return match;
};

/**
 * Build the `$addFields` stage with topic order, difficulty order and
 * per-question priority score based on company overlap.
 */
export const buildDsaSortFieldsStage = (
  targetCompanies: string[],
): Record<string, any> => ({
  $addFields: {
    _topicOrder: {
      $let: {
        vars: {
          idx: {
            $indexOfArray: [
              DSA_TOPIC_SORT_ORDER,
              { $arrayElemAt: ["$topics", 0] },
            ],
          },
        },
        in: { $cond: [{ $eq: ["$$idx", -1] }, 999, "$$idx"] },
      },
    },
    _difficultyOrder: {
      $switch: {
        branches: [
          { case: { $eq: ["$difficulty", "EASY"] }, then: 1 },
          { case: { $eq: ["$difficulty", "MEDIUM"] }, then: 2 },
          { case: { $eq: ["$difficulty", "HARD"] }, then: 3 },
        ],
        default: 4,
      },
    },
    _priorityScore: {
      $cond: {
        if: {
          $gt: [
            {
              $size: {
                $ifNull: [
                  {
                    $setIntersection: [
                      { $ifNull: ["$companyTypes", []] },
                      targetCompanies,
                    ],
                  },
                  [],
                ],
              },
            },
            0,
          ],
        },
        then: 1,
        else: 0,
      },
    },
  },
});

/**
 * Build the UserSheet lookup stages that attach per-question completion
 * status, stars and notes for the given user.
 */
export const buildUserSheetLookupStages = (
  userId: string,
  systemSheetId: string,
): any[] => [
  {
    $lookup: {
      from: "usersheets",
      let: { qId: "$_id" },
      pipeline: [
        {
          $match: {
            userId: toObjectId(userId),
            sheetId: toObjectId(systemSheetId),
          },
        },
        { $unwind: "$questions" },
        { $match: { $expr: { $eq: ["$questions.questionId", "$$qId"] } } },
        {
          $project: {
            _id: 0,
            isCompleted: "$questions.isCompleted",
            isStarred: "$questions.isStarred",
            notes: "$questions.notes",
          },
        },
      ],
      as: "userStatus",
    },
  },
  { $addFields: { userStatus: { $arrayElemAt: ["$userStatus", 0] } } },
  {
    $addFields: {
      isCompleted: { $ifNull: ["$userStatus.isCompleted", false] },
      isStarred: { $ifNull: ["$userStatus.isStarred", false] },
      notes: { $ifNull: ["$userStatus.notes", ""] },
    },
  },
];

/** Standard sort stage used across freemium and paid paths. */
export const DSA_SORT_STAGE = {
  $sort: {
    _priorityScore: -1,
    _topicOrder: 1,
    _difficultyOrder: 1,
    order: 1,
    createdAt: -1,
  },
};

const normalizeSeedValue = (value?: string | string[]) => {
  if (!value) return "";
  const values = Array.isArray(value) ? value : [value];
  return values
    .map((entry) => entry.toString().trim().toUpperCase())
    .sort()
    .join(",");
};

/**
 * Build a deterministic seed string for stable bucket tie-breaking.
 * Same filters + same user = same selection across requests.
 */
export const buildDsaBucketSeed = (filters: DSASheetFilters): string =>
  [
    filters.userId ?? "__no_user__",
    filters.productType ?? "DSA_YATRA",
    filters.duration ?? "",
    typeof filters.experienceYears === "number"
      ? `exp-${filters.experienceYears}`
      : "exp-na",
    filters.offCampus ? "off-campus" : "on-campus",
    filters.realWorld ?? "include",
    normalizeSeedValue(filters.domain as string | string[] | undefined),
    normalizeSeedValue(filters.difficulty as string | string[] | undefined),
    normalizeSeedValue(filters.companyTypes as string | string[] | undefined),
    normalizeSeedValue(filters.topics as string | string[] | undefined),
  ].join("|");

/**
 * Scale `DSA_DURATION_DIFFICULTY_BUCKETS` caps by 1.5× when `offCampus` is true.
 * Returns `null` when the `duration` key isn't recognized.
 */
export const scaleDsaBuckets = (
  duration: string | undefined,
  offCampus: boolean | undefined,
): Record<DSADifficultyType, number> | null => {
  if (!duration) return null;
  const config = DSA_DURATION_DIFFICULTY_BUCKETS[duration];
  if (!config) return null;
  return Object.fromEntries(
    Object.entries(config).map(([key, count]) => [
      key,
      offCampus ? Math.ceil(count * 1.5) : count,
    ]),
  ) as Record<DSADifficultyType, number>;
};

/** Slice rows for 1-based pagination and return a standard pagination envelope. */
export const paginateDsaRows = <T>(
  rows: T[],
  page: number,
  limit: number,
  totalOverride?: number,
): DsaPaginationResult<T> => {
  const total = totalOverride ?? rows.length;
  const items = rows.slice((page - 1) * limit, (page - 1) * limit + limit);
  return {
    items,
    total,
    pagination: {
      total,
      page,
      limit,
      totalPages: limit > 0 ? Math.ceil(total / limit) : 0,
      hasMore: page * limit < total,
    },
  };
};

/**
 * Freemium gate — marks rows as `isLocked` per per-difficulty caps, strips
 * answer fields from locked rows, paginates, and returns the full response
 * envelope expected by clients.
 */
export const applyDsaFreemiumGate = (
  rows: Record<string, unknown>[],
  page: number,
  limit: number,
) => {
  const gated = applyDSAFreemiumGating(rows, (q) =>
    getDSAFreemiumBucket(
      typeof q.difficulty === "string" ? q.difficulty : undefined,
      Boolean(q.isRealWorldProblem),
    ),
  );

  const { items, pagination } = paginateDsaRows(gated, page, limit);
  const cleaned = items.map((q) =>
    stripLockedAnswerFields(
      stripInternalDsaFields(q as Record<string, unknown>),
    ),
  );

  return {
    questions: cleaned,
    pagination,
    isFreemiumUser: true,
    freemiumPolicy: {
      type: DSA_FREEMIUM_POLICY_TYPE,
      label: DSA_FREEMIUM_POLICY_LABEL,
      limits: DSA_FREEMIUM_LIMITS,
      totalUnlocked: DSA_FREEMIUM_TOTAL_UNLOCKED,
    },
  };
};

/**
 * Duration-bucket path for paid users. Selects a capped subset per difficulty
 * (scaled 1.5× for `offCampus`), paginates, and returns the response envelope.
 * Falls back to plain pagination when `duration` isn't a known bucket key.
 */
export const applyDsaDurationBuckets = (
  rows: Record<string, unknown>[],
  filters: DSASheetFilters,
  page: number,
  limit: number,
) => {
  const { duration, offCampus } = filters;
  const scaledBuckets = scaleDsaBuckets(duration, offCampus);

  if (!scaledBuckets) {
    const { items, pagination } = paginateDsaRows(rows, page, limit);
    return {
      questions: items.map((r) =>
        stripInternalDsaFields(r as Record<string, unknown>),
      ),
      pagination,
    };
  }

  const { selected } = selectQuestionsByDifficultyBuckets(
    rows as Array<Record<string, unknown> & { _id: unknown }>,
    {
      buckets: scaledBuckets,
      difficultyOrder: DSA_DIFFICULTY,
      seed: buildDsaBucketSeed(filters),
      getDifficulty: (question) => {
        const raw = String(
          (question as { difficulty?: unknown }).difficulty || "",
        )
          .trim()
          .toUpperCase();
        return (DSA_DIFFICULTY as readonly string[]).includes(raw)
          ? (raw as DSADifficultyType)
          : null;
      },
      getPriorityScore: (question) => {
        const score = (question as { _priorityScore?: unknown })._priorityScore;
        return typeof score === "number" ? score : 0;
      },
    },
  );

  const { items, pagination } = paginateDsaRows(selected, page, limit);
  return {
    questions: items.map((r) =>
      stripInternalDsaFields(r as Record<string, unknown>),
    ),
    pagination,
  };
};

/**
 * Paid-user path with no duration bucket — returns the full list using the
 * caller-supplied `totalCount` (which should come from `countDocuments` on the
 * same match stage for accuracy).
 */
export const applyDsaPaidPagination = (
  rows: Record<string, unknown>[],
  page: number,
  limit: number,
  totalCount: number,
) => {
  const { items, pagination } = paginateDsaRows(rows, page, limit, totalCount);
  return {
    questions: items.map((r) =>
      stripInternalDsaFields(r as Record<string, unknown>),
    ),
    pagination,
  };
};
