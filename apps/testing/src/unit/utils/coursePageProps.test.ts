import { getCoursePageProps } from "@tbe/utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const COURSE_SLUG = "sample-course";
const FIRST_CHAPTER_ID = "chapter-one-id";
const SECOND_CHAPTER_ID = "chapter-two-id";

const course = {
  _id: "course-id",
  name: "Sample Course",
  description: "A sample course",
  slug: COURSE_SLUG,
  liveOn: "2020-01-01T00:00:00.000Z",
  meta: "COURSE_META",
  chapters: [
    { _id: FIRST_CHAPTER_ID, name: "Chapter One", content: "CHAPTER_ONE" },
    { _id: SECOND_CHAPTER_ID, name: "Chapter Two", content: "CHAPTER_TWO" },
  ],
};

const buildContext = (resolvedUrl: string, query: Record<string, string>) => ({
  req: { headers: {} },
  query: { courseSlug: COURSE_SLUG, ...query },
  resolvedUrl,
});

describe("getCoursePageProps", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        json: async () => ({ status: true, data: course }),
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe("learn route", () => {
    const learnUrl = `/shiksha/${COURSE_SLUG}/learn`;

    it("resolves a valid chapter id to that chapter's content", async () => {
      const result: any = await getCoursePageProps(
        buildContext(`${learnUrl}?chapterId=${SECOND_CHAPTER_ID}`, {
          chapterId: SECOND_CHAPTER_ID,
        }),
      );

      expect(result.redirect).toBeUndefined();
      expect(result.props.currentChapterId).toBe(SECOND_CHAPTER_ID);
      expect(result.props.meta).toBe("CHAPTER_TWO");
    });

    it("redirects an unrecognised chapter id to the canonical first chapter", async () => {
      const result: any = await getCoursePageProps(
        buildContext(`${learnUrl}?chapterId=does-not-exist`, {
          chapterId: "does-not-exist",
        }),
      );

      expect(result.props).toBeUndefined();
      expect(result.redirect).toEqual({
        destination: `/shiksha/${COURSE_SLUG}/learn?chapterId=${FIRST_CHAPTER_ID}`,
        permanent: false,
      });
    });

    it("does not loop: the redirect destination resolves without redirecting", async () => {
      const result: any = await getCoursePageProps(
        buildContext(`${learnUrl}?chapterId=${FIRST_CHAPTER_ID}`, {
          chapterId: FIRST_CHAPTER_ID,
        }),
      );

      expect(result.redirect).toBeUndefined();
      expect(result.props.currentChapterId).toBe(FIRST_CHAPTER_ID);
    });

    it("defaults to the first chapter when no chapter id is provided", async () => {
      const result: any = await getCoursePageProps(buildContext(learnUrl, {}));

      expect(result.redirect).toBeUndefined();
      expect(result.props.currentChapterId).toBe(FIRST_CHAPTER_ID);
      expect(result.props.meta).toBe("CHAPTER_ONE");
    });
  });

  describe("course overview route", () => {
    const overviewUrl = `/shiksha/${COURSE_SLUG}`;

    it("keeps returning the first chapter props", async () => {
      const result: any = await getCoursePageProps(
        buildContext(overviewUrl, {}),
      );

      expect(result.redirect).toBeUndefined();
      expect(result.props.slug).toBe(`/shiksha/${COURSE_SLUG}`);
      expect(result.props.course).toEqual(course);
      expect(result.props.currentChapterId).toBe(FIRST_CHAPTER_ID);
      expect(result.props.meta).toBe("CHAPTER_ONE");
    });

    it("never redirects on an unrecognised chapter id", async () => {
      const result: any = await getCoursePageProps(
        buildContext(overviewUrl, { chapterId: "does-not-exist" }),
      );

      expect(result.redirect).toBeUndefined();
      expect(result.props.currentChapterId).toBe(FIRST_CHAPTER_ID);
      expect(result.props.meta).toBe("CHAPTER_ONE");
    });
  });
});
