import type { CourseLifecycleStatus, ShikshaCourse } from "@/types";

export const COURSE_LIFECYCLE_STATUSES: CourseLifecycleStatus[] = [
  "DRAFT",
  "PUBLISHED",
  "ARCHIVED",
];

/**
 * Courses created before the lifecycle field have no stored status and are
 * treated as published by the API reads, so the list mirrors that.
 */
export const getCourseStatus = (
  course: Pick<ShikshaCourse, "status">,
): CourseLifecycleStatus => course.status || "PUBLISHED";

export const getChapterCount = (
  course: Pick<ShikshaCourse, "chapters">,
): number => course.chapters?.length ?? 0;

export const filterCoursesByStatus = (
  courses: ShikshaCourse[],
  status: CourseLifecycleStatus | "all",
): ShikshaCourse[] =>
  status === "all"
    ? courses
    : courses.filter((course) => getCourseStatus(course) === status);

export const formatLastUpdated = (updatedAt?: string): string => {
  if (!updatedAt) return "—";

  const date = new Date(updatedAt);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString();
};

/**
 * Surfaces the specific reason the API returned (e.g. a rejected publish)
 * instead of a generic failure message.
 */
export const extractCourseStatusErrorMessage = (
  error: unknown,
  fallback: string,
): string => {
  const err = error as {
    response?: { data?: { message?: string; error?: string } };
    message?: string;
  };

  return (
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    fallback
  );
};
