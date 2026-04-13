import { DSA_EXTRA_QUESTION_TOPICS } from "@tbe/constants";
import { z } from "zod";

import {
  COMPANY_TYPES,
  DSA_DIFFICULTY,
  DSA_DOMAIN,
  DSA_DURATION_DIFFICULTY_BUCKETS,
  DSA_TOPICS,
} from "@/lib/constants";
import type {
  DSADifficultyType,
  DSADomainType,
  DSATopicType,
} from "@/lib/interfaces";

import { isMongoObjectIdString } from "./mongodb";
import {
  allQueryValues,
  firstQueryValue,
  type ParsedQuery,
} from "./queryParams";

/** Max page size for DSA sheet listing (prevents unbounded queries). */
export const DSA_SHEET_MAX_LIMIT = 200;

const DURATION_KEYS = new Set(Object.keys(DSA_DURATION_DIFFICULTY_BUCKETS));
const REAL_WORLD_FILTERS = new Set(["include", "exclude", "only"] as const);

type RealWorldFilterMode = "include" | "exclude" | "only";

const ALL_DSA_TOPICS = [
  ...DSA_TOPICS,
  ...DSA_EXTRA_QUESTION_TOPICS,
] as readonly string[];

const domainEnum = z.enum([DSA_DOMAIN[0], ...DSA_DOMAIN.slice(1)] as [
  string,
  ...string[],
]);
const difficultyEnum = z.enum([
  DSA_DIFFICULTY[0],
  DSA_DIFFICULTY[1],
  DSA_DIFFICULTY[2],
] as [string, ...string[]]);
const companyEnum = z.enum([COMPANY_TYPES[0], ...COMPANY_TYPES.slice(1)] as [
  string,
  ...string[],
]);
const topicEnum = z.enum([ALL_DSA_TOPICS[0], ...ALL_DSA_TOPICS.slice(1)] as [
  string,
  ...string[],
]);

const dsaQuestionCreateSchema = z
  .object({
    title: z.string().trim().min(1).max(5000),
    answer: z.string().optional(),
    content: z.string().optional(),
    domain: z.union([z.array(domainEnum), domainEnum]),
    difficulty: z.preprocess(
      (v) => (typeof v === "string" ? v.trim().toUpperCase() : v),
      difficultyEnum,
    ),
    companyTypes: z.union([z.array(companyEnum), companyEnum]),
    topics: z.union([z.array(topicEnum), topicEnum]),
    sections: z.unknown().optional(),
    isRealWorldProblem: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.answer?.trim() && !data.content?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Required: answer or content",
        path: ["answer"],
      });
    }
  });

export type DsaSheetCreateBody = {
  title: string;
  answer: string;
  domain: DSADomainType[];
  difficulty: DSADifficultyType;
  companyTypes: string[];
  topics: DSATopicType[];
  sections?: unknown;
  isRealWorldProblem?: boolean;
};

export function parseDsaSheetCreateBody(
  body: unknown,
): { ok: true; value: DsaSheetCreateBody } | { ok: false; message: string } {
  const parsed = dsaQuestionCreateSchema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.issues
      .map((e) => `${e.path.join(".") || "body"}: ${e.message}`)
      .join("; ");
    return { ok: false, message: msg };
  }

  const d = parsed.data;
  const questionAnswer = (d.answer?.trim() || d.content?.trim()) as string;
  const domains = (
    Array.isArray(d.domain) ? d.domain : [d.domain]
  ) as DSADomainType[];
  const companyTypes = (
    Array.isArray(d.companyTypes) ? d.companyTypes : [d.companyTypes]
  ) as string[];
  const topics = (
    Array.isArray(d.topics) ? d.topics : [d.topics]
  ) as DSATopicType[];

  return {
    ok: true,
    value: {
      title: d.title.trim(),
      answer: questionAnswer,
      domain: domains,
      difficulty: d.difficulty as DSADifficultyType,
      companyTypes,
      topics,
      ...(d.sections !== undefined ? { sections: d.sections } : {}),
      ...(d.isRealWorldProblem !== undefined
        ? { isRealWorldProblem: d.isRealWorldProblem }
        : {}),
    },
  };
}

export type DsaSheetListFilters = {
  domain?: DSADomainType[];
  difficulty?: DSADifficultyType[];
  companyTypes?: string[];
  topics?: DSATopicType[];
  page: number;
  limit?: number;
  userId?: string;
  duration?: string;
  offCampus: boolean;
  realWorld?: RealWorldFilterMode;
};

export type DsaSheetGetParsed =
  | { mode: "topics"; userId?: string }
  | { mode: "metadata" }
  | {
      mode: "list";
      filters: DsaSheetListFilters;
    };

function parseOptionalEnumArray(
  raw: string[] | undefined,
  allowed: ReadonlySet<string>,
  field: string,
): { ok: true; value: string[] } | { ok: false; message: string } {
  if (!raw?.length) return { ok: true, value: [] };
  const out: string[] = [];
  for (const item of raw) {
    const v = item.trim().toUpperCase();
    if (!allowed.has(v)) {
      return {
        ok: false,
        message: `Invalid ${field}: ${item}. Allowed values are constrained to the DSA sheet schema.`,
      };
    }
    out.push(v);
  }
  return { ok: true, value: out };
}

export function parseDsaSheetGetQuery(
  query: ParsedQuery,
): { ok: true; value: DsaSheetGetParsed } | { ok: false; message: string } {
  const queryFlag = firstQueryValue(query.query);
  if (queryFlag === "topics") {
    const userId = firstQueryValue(query.userId)?.trim();
    if (userId && !isMongoObjectIdString(userId)) {
      return { ok: false, message: "Invalid userId" };
    }
    return { ok: true, value: { mode: "topics", userId } };
  }

  if (firstQueryValue(query.metadata) === "true") {
    return { ok: true, value: { mode: "metadata" } };
  }

  const domainSet = new Set(DSA_DOMAIN as readonly string[]);
  const difficultySet = new Set(DSA_DIFFICULTY as readonly string[]);
  const companySet = new Set(COMPANY_TYPES as readonly string[]);
  const topicSet = new Set(ALL_DSA_TOPICS as readonly string[]);

  const domainRaw = allQueryValues(query.domain);
  const difficultyRaw = allQueryValues(query.difficulty);
  const companyTypeRaw = allQueryValues(query.companyType);
  const topicRaw = allQueryValues(query.topic);

  const d = parseOptionalEnumArray(domainRaw, domainSet, "domain");
  if (!d.ok) return d;
  const diff = parseOptionalEnumArray(
    difficultyRaw,
    difficultySet,
    "difficulty",
  );
  if (!diff.ok) return diff;
  const comp = parseOptionalEnumArray(
    companyTypeRaw,
    companySet,
    "companyType",
  );
  if (!comp.ok) return comp;
  const top = parseOptionalEnumArray(topicRaw, topicSet, "topic");
  if (!top.ok) return top;

  const pageRaw = firstQueryValue(query.page);
  let page = 1;
  if (pageRaw !== undefined) {
    const p = Number.parseInt(pageRaw, 10);
    if (!Number.isFinite(p) || p < 1 || p > 1_000_000) {
      return { ok: false, message: "Invalid page" };
    }
    page = p;
  }

  const limitRaw = firstQueryValue(query.limit);
  let limit: number | undefined;
  if (limitRaw !== undefined) {
    const l = Number.parseInt(limitRaw, 10);
    if (!Number.isFinite(l) || l < 1) {
      return { ok: false, message: "Invalid limit" };
    }
    limit = Math.min(l, DSA_SHEET_MAX_LIMIT);
  } else if (!top.value.length) {
    limit = 50;
  }

  const userId = firstQueryValue(query.userId)?.trim();
  if (userId && !isMongoObjectIdString(userId)) {
    return { ok: false, message: "Invalid userId" };
  }

  const duration = firstQueryValue(query.duration)?.trim();
  if (duration && !DURATION_KEYS.has(duration)) {
    return { ok: false, message: "Invalid duration" };
  }

  const realWorldRaw = firstQueryValue(query.realWorld)?.trim().toLowerCase();
  let realWorld: RealWorldFilterMode | undefined;
  if (realWorldRaw) {
    if (!REAL_WORLD_FILTERS.has(realWorldRaw as RealWorldFilterMode)) {
      return {
        ok: false,
        message: "Invalid realWorld filter (use include, exclude, or only)",
      };
    }
    realWorld = realWorldRaw as RealWorldFilterMode;
  }

  const offCampus = firstQueryValue(query.offCampus) === "true";

  return {
    ok: true,
    value: {
      mode: "list",
      filters: {
        ...(d.value.length ? { domain: d.value as DSADomainType[] } : {}),
        ...(diff.value.length
          ? { difficulty: diff.value as DSADifficultyType[] }
          : {}),
        ...(comp.value.length ? { companyTypes: comp.value } : {}),
        ...(top.value.length ? { topics: top.value as DSATopicType[] } : {}),
        page,
        ...(limit !== undefined ? { limit } : {}),
        ...(userId ? { userId } : {}),
        ...(duration ? { duration } : {}),
        offCampus,
        ...(realWorld ? { realWorld } : {}),
      },
    },
  };
}
