import type { DatabaseQueryResponseType } from "@/lib/interfaces";

import { CoreSubject } from "../models";

/**
 * Fetch all active core subjects from MongoDB, sorted by `order` ascending.
 * Maps `subjectId` → `id` so the frontend Subject type is satisfied directly.
 */
const getCoreSubjectsFromDB = async (
  isPaidUser?: boolean,
): Promise<DatabaseQueryResponseType> => {
  try {
    const subjects = await CoreSubject.find({ isActive: true })
      .sort({ order: 1 })
      .lean();

    // Map subjectId → id to match the frontend Subject type
    const data = subjects.map((s: any) => {
      const totalChapters = s.chapters?.length ?? 0;
      const freeLimit = Math.ceil(totalChapters * 0.3);

      return {
        id: s.subjectId,
        label: s.label,
        order: s.order,
        chapters: (s.chapters ?? []).map((ch: any, idx: number) => {
          const isLocked = !isPaidUser && idx >= freeLimit;
          return {
            id: ch._id?.toString() ?? ch.contentId ?? ch.title,
            title: ch.title,
            description: ch.description,
            isLocked,
            content: isLocked
              ? {
                  overview: ch.content?.overview ?? "",
                  notes: [],
                  importantPoints: [],
                  interviewQuestions: [],
                  codeBlock: undefined,
                  markdownContent: undefined,
                }
              : {
                  overview: ch.content?.overview ?? "",
                  notes: ch.content?.notes ?? [],
                  importantPoints: ch.content?.importantPoints ?? [],
                  interviewQuestions: ch.content?.interviewQuestions ?? [],
                  codeBlock: ch.content?.codeBlock ?? undefined,
                  markdownContent: ch.content?.markdownContent ?? undefined,
                },
          };
        }),
      };
    });

    return { data };
  } catch (error) {
    return { error: "Failed to fetch core subjects", details: error };
  }
};

export { getCoreSubjectsFromDB };
