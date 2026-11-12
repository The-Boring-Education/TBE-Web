import { v4 as uuidv4 } from "uuid";

import {
  COURSE_STATUS,
  COURSE_STATUS_PUBLISHED,
  modelSelectParams,
} from "@/lib/constants";
import type {
  AddChapterToCourseRequestProps,
  AddCourseRequestPayloadProps,
  BaseShikshaCourseResponseProps,
  CourseModel,
  CourseStatusType,
  DatabaseQueryResponseType,
  EnrollCourseInDBRequestProps,
  UpdateChapterInCourseRequestProps,
  UpdateCourseRequestPayloadProps,
  UpdateUserChapterInCourseRequestProps,
} from "@/lib/interfaces";
import { logger } from "@/lib/utils/logger";

import { Course, UserCourse } from "../models";
import { updateUserPointsInDB } from "./gamification";

type CourseReadOptions = {
  // Admin-authenticated reads pass `true` so courses in every lifecycle
  // status are returned. Public reads always stay restricted to PUBLISHED.
  includeAllStatuses?: boolean;
};

// Fields a course must carry before it can be published. `chapters` is
// validated separately so the rejection message can name the reason.
const REQUIRED_FIELDS_FOR_PUBLISH: Array<keyof CourseModel> = [
  "name",
  "slug",
  "description",
  "coverImageURL",
  "liveOn",
  "roadmap",
  "difficultyLevel",
];

// Courses created before the lifecycle field have no stored `status` (schema
// defaults only apply to new documents), so they are treated as published
// until `backfill:course-status` has run. Drop the `$exists` arm once every
// environment is backfilled.
const buildCourseStatusFilter = (options?: CourseReadOptions) =>
  options?.includeAllStatuses
    ? {}
    : {
        $or: [
          { status: COURSE_STATUS_PUBLISHED },
          { status: { $exists: false } },
        ],
      };

const addACourseToDB = async (
  courseDetails: AddCourseRequestPayloadProps,
): Promise<DatabaseQueryResponseType> => {
  try {
    const course = new Course({ ...courseDetails, contentId: uuidv4() });
    await course.save();
    return { data: course };
  } catch (error) {
    logger.error("DB: addACourseToDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Failed while adding course", details: error };
  }
};

const updateACourseInDB = async ({
  courseId,
  updatedData,
}: UpdateCourseRequestPayloadProps): Promise<DatabaseQueryResponseType> => {
  try {
    const existingCourse = await Course.findById(courseId);

    if (!existingCourse) return { error: "Course does not exists" };

    const nextSlug = (updatedData as { slug?: string })?.slug;

    if (
      existingCourse.status === "PUBLISHED" &&
      nextSlug &&
      nextSlug !== existingCourse.slug
    ) {
      return {
        error: "Slug cannot be changed once the course is published",
      };
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      updatedData,
      { new: true },
    );

    if (!updatedCourse) return { error: "Course does not exists" };

    return { data: updatedCourse };
  } catch (error) {
    logger.error("DB: updateACourseInDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Failed while updating course", details: error };
  }
};

const deleteACourseFromDBById = async (
  courseId: string,
): Promise<DatabaseQueryResponseType> => {
  try {
    const deletedCourse = await Course.findByIdAndDelete(courseId);

    if (!deletedCourse) {
      return { error: "Course not found" };
    }
    return { data: "Course deleted" };
  } catch (error) {
    logger.error("DB: deleteACourseFromDBById failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Failed while deleting course", details: error };
  }
};

const getAllCourseFromDB = async (
  options?: CourseReadOptions,
): Promise<DatabaseQueryResponseType> => {
  try {
    const course = await Course.find(buildCourseStatusFilter(options))
      .select(modelSelectParams.coursePreview)
      .exec();

    if (!course) {
      return { error: "Course not found" };
    }

    return { data: course };
  } catch (error) {
    logger.error("DB: getAllCourseFromDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return {
      error: "Failed while fetching courses from database",
      details: error,
    };
  }
};

const getACourseFromDBById = async (
  courseId: string,
  userId?: string,
  options?: CourseReadOptions,
): Promise<DatabaseQueryResponseType> => {
  try {
    const course = await Course.findOne({
      _id: courseId,
      ...buildCourseStatusFilter(options),
    });

    if (!course) {
      return { error: "Course not found" };
    }

    if (userId) {
      const { data } = await getEnrolledCourseFromDB({ userId, courseId });

      return {
        data: {
          ...course.toObject(),
          isEnrolled: !!data,
        } as BaseShikshaCourseResponseProps,
      };
    }

    return { data: course };
  } catch (error) {
    logger.error("DB: getACourseFromDBById failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return {
      error: "Failed while fetching course by ID from database",
      details: error,
    };
  }
};

const addChapterToCourseInDB = async (
  courseId: string,
  chapter: AddChapterToCourseRequestProps,
) => {
  try {
    const updatedCourse = await Course.findOneAndUpdate(
      { _id: courseId },
      { $push: { chapters: chapter } },
      { new: true },
    );

    if (!updatedCourse) {
      return { error: "Course not found" };
    }

    return { data: updatedCourse };
  } catch (error) {
    logger.error("DB: addChapterToCourseInDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Failed to add chapter to course", details: error };
  }
};

const updateCourseChapterInDB = async (
  courseId: string,
  chapterId: string,
  { name, content, isOptional }: UpdateChapterInCourseRequestProps,
) => {
  try {
    const course = await Course.findOneAndUpdate(
      { _id: courseId, "chapters._id": chapterId },
      {
        $set: {
          "chapters.$.chapterName": name,
          "chapters.$.content": content,
          "chapters.$.isOptional": isOptional,
        },
      },
      { new: true },
    );

    return { data: course };
  } catch (error) {
    logger.error("DB: updateCourseChapterInDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Failed to update chapter to course", details: error };
  }
};

const deleteCourseChapterByIdFromDB = async (
  courseId: string,
  chapterId: string,
) => {
  try {
    const course = await Course.findOneAndUpdate(
      { _id: courseId },
      { $pull: { chapters: { _id: chapterId } } },
      { new: true },
    );
    return { data: course };
  } catch (error) {
    logger.error("DB: deleteCourseChapterByIdFromDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Failed to delete chapter from course", details: error };
  }
};

const enrollInACourse = async ({
  userId,
  courseId,
}: EnrollCourseInDBRequestProps): Promise<DatabaseQueryResponseType> => {
  try {
    const course = await Course.findOne({
      _id: courseId,
      ...buildCourseStatusFilter(),
    }).lean();
    if (!course) {
      return { error: "Course not found" };
    }

    const chapters = course.chapters.map((chapter: any) => ({
      chapterId: chapter._id,
      isCompleted: false,
    }));

    const userCourse = await UserCourse.create({
      userId,
      courseId,
      chapters,
    });

    // Enrollment was successful add Points
    await updateUserPointsInDB(userId, "ENROLL_COURSE");

    return { data: userCourse };
  } catch (error) {
    logger.error("DB: enrollInACourse failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Failed while enrolling in a course", details: error };
  }
};

const getEnrolledCourseFromDB = async ({
  userId,
  courseId,
}: EnrollCourseInDBRequestProps): Promise<DatabaseQueryResponseType> => {
  try {
    const enrolledCourse = await UserCourse.findOne({ userId, courseId });
    return { data: enrolledCourse };
  } catch (error) {
    logger.error("DB: getEnrolledCourseFromDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Failed while fetching enrolled course", details: error };
  }
};

const getAllEnrolledCoursesFromDB = async (
  userId: string,
): Promise<DatabaseQueryResponseType> => {
  try {
    const enrolledCourse = await UserCourse.find({ userId })
      .populate({
        path: "course",
        select: `${modelSelectParams.coursePreview} chapters._id`,
      })
      .exec();

    const enrolledCoursesData: BaseShikshaCourseResponseProps[] = enrolledCourse
      .map((userCourse) => {
        const course = userCourse.course as any;
        if (!course) return null;

        const currentChapterIds = new Set(
          (course.chapters || []).map((chapter: any) =>
            chapter._id ? chapter._id.toString() : chapter.toString(),
          ),
        );

        const totalChapters = currentChapterIds.size;

        const completedChapters = (userCourse.chapters || []).filter(
          (chapter: any) =>
            chapter.isCompleted &&
            currentChapterIds.has(chapter.chapterId?.toString()),
        ).length;

        const percentage =
          totalChapters > 0
            ? Math.round((completedChapters / totalChapters) * 100)
            : 0;

        const courseObj = course.toObject ? course.toObject() : course;

        return {
          ...courseObj,
          title: courseObj.name,
          isEnrolled: true,
          progress: {
            completed: completedChapters,
            total: totalChapters,
            percentage,
          },
        };
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item));

    return {
      data: enrolledCoursesData,
    };
  } catch (error) {
    logger.error("DB: getAllEnrolledCoursesFromDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Failed while fetching enrolled courses", details: error };
  }
};

const getCourseBySlugFromDB = async (
  slug: string,
  options?: CourseReadOptions,
): Promise<DatabaseQueryResponseType> => {
  try {
    const course = await Course.findOne({
      slug,
      ...buildCourseStatusFilter(options),
    });

    if (!course) {
      return { error: "Course not found" };
    }

    return { data: course };
  } catch (error) {
    logger.error("DB: getCourseBySlugFromDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return {
      error: "Failed to fetch course by slug from database",
      details: error,
    };
  }
};

const getCourseBySlugWithUserFromDB = async (
  slug: string,
  userId?: string,
  options?: CourseReadOptions,
): Promise<DatabaseQueryResponseType> => {
  try {
    const course = await Course.findOne({
      slug,
      ...buildCourseStatusFilter(options),
    });

    if (!course) {
      return { error: "Course not found" };
    }

    let isEnrolled = false;
    let mappedChapters = course.chapters.map((chapter) => chapter.toObject());

    if (userId) {
      const userCourse = await UserCourse.findOne({
        userId,
        courseId: course._id,
      });

      isEnrolled = !!userCourse;

      if (userCourse) {
        mappedChapters = course.chapters.map((chapter) => {
          const userChapter = userCourse.chapters.find(
            (uc) => uc.chapterId.toString() === chapter._id.toString(),
          );

          return {
            ...chapter.toObject(),
            isCompleted: userChapter?.isCompleted || false,
          };
        });
      }
    }

    return {
      data: {
        ...course.toObject(),
        isEnrolled,
        chapters: mappedChapters,
      },
    };
  } catch (error) {
    logger.error("DB: getCourseBySlugWithUserFromDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return {
      error: "Failed to fetch course by slug with user from database",
      details: error,
    };
  }
};

const updateUserCourseChapterInDB = async ({
  userId,
  courseId,
  chapterId,
  isCompleted,
}: UpdateUserChapterInCourseRequestProps) => {
  try {
    // Find the UserCourse document
    const userCourse = await UserCourse.findOne({ userId, courseId });

    if (!userCourse) {
      return { error: "User course not found" };
    }

    // Find the specific chapter in the chapters array
    const chapterIndex = userCourse.chapters.findIndex(
      (chapter) => chapter.chapterId.toString() === chapterId.toString(),
    );

    if (chapterIndex === -1) {
      // If chapter is not found in the array, add it with the given status
      userCourse.chapters.push({
        chapterId,
        isCompleted,
      });
    } else {
      // If chapter is found, update the isCompleted status
      const chapter = userCourse.chapters[chapterIndex];
      if (chapter) {
        chapter.isCompleted = isCompleted;
      }
    }

    // Check if all chapters are completed and update isCompleted field
    const allChaptersCompleted = userCourse.chapters.every(
      (chapter) => chapter.isCompleted,
    );
    userCourse.isCompleted = allChaptersCompleted;

    // Save the updated document
    await userCourse.save();

    return { data: userCourse };
  } catch (error) {
    logger.error("DB: updateUserCourseChapterInDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Failed to update chapter in user course", details: error };
  }
};

const getACourseForUserFromDB = async (
  userId: string,
  courseId: string,
  options?: CourseReadOptions,
) => {
  try {
    // A falsy userId must not reach UserCourse.findOne — Mongoose strips
    // undefined from the filter, which would match any user's enrolment.
    const userCourse = userId
      ? await UserCourse.findOne({ userId, courseId })
          .populate({
            path: "course",
          })
          .exec()
      : null;

    // If the user is not enrolled in the course, fetch the course data without user-specific data
    if (!userCourse) {
      const { data: course, error } = await getACourseFromDBById(
        courseId,
        undefined,
        options,
      );

      if (error || !course) {
        return { error: error ?? "Course not found" };
      }

      return { data: { ...course.toObject(), isEnrolled: false } };
    }

    // Already-enrolled learners keep access regardless of lifecycle status, so
    // unpublishing a course never strips it from people part-way through it.

    // Map the chapters to include the `isCompleted` status from the embedded chapters in UserCourse
    const mappedChapters = userCourse.course.chapters.map((chapter) => {
      const isCompleted = userCourse.chapters.find(
        (uc) => uc.chapterId.toString() === chapter._id.toString(),
      )?.isCompleted;

      return {
        ...chapter.toObject(),
        isCompleted,
      };
    });

    // Construct the updated course response
    const updatedCourseResponse = {
      ...userCourse.course.toObject(),
      chapters: mappedChapters,
      isCompleted: userCourse.isCompleted,
      certificateId: userCourse.certificateId,
    };

    return {
      data: {
        ...updatedCourseResponse,
        isEnrolled: true,
      } as BaseShikshaCourseResponseProps,
    };
  } catch (error) {
    logger.error("DB: getACourseForUserFromDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return {
      error: "Failed to fetch courses with chapter status",
      details: error,
    };
  }
};

const updateCertificateToUserShikshaCourseDoc = async (
  userId: string,
  courseId: string,
  certificateId: string,
) => {
  try {
    const userCourse = await UserCourse.findOneAndUpdate(
      { userId, courseId },
      { isCompleted: true, certificateId },
      { new: true },
    );

    if (!userCourse) {
      return { error: "User course not found" };
    }

    return { data: userCourse };
  } catch (error) {
    logger.error("DB: updateCertificateToUserShikshaCourseDoc failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return {
      error: "Failed to update certificate status in user course",
      details: error,
    };
  }
};

const updateCourseStatusInDB = async (
  courseId: string,
  status: CourseStatusType,
): Promise<DatabaseQueryResponseType> => {
  try {
    if (!COURSE_STATUS.includes(status)) {
      return {
        error: `Invalid course status. Allowed values: ${COURSE_STATUS.join(", ")}`,
      };
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return { error: "Course not found" };
    }

    if (status === "PUBLISHED") {
      if (!course.chapters?.length) {
        return { error: "Cannot publish a course with no chapters" };
      }

      const missingField = REQUIRED_FIELDS_FOR_PUBLISH.find((field) => {
        const value = course[field];
        return (
          value === undefined ||
          value === null ||
          (typeof value === "string" && value.trim() === "")
        );
      });

      if (missingField) {
        return {
          error: `Cannot publish a course without ${String(missingField)}`,
        };
      }
    }

    course.status = status;
    await course.save();

    return { data: course };
  } catch (error) {
    logger.error("DB: updateCourseStatusInDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Failed while updating course status", details: error };
  }
};

export {
  addACourseToDB,
  addChapterToCourseInDB,
  deleteACourseFromDBById,
  deleteCourseChapterByIdFromDB,
  enrollInACourse,
  getACourseForUserFromDB,
  getACourseFromDBById,
  getAllCourseFromDB,
  getAllEnrolledCoursesFromDB,
  getCourseBySlugFromDB,
  getCourseBySlugWithUserFromDB,
  getEnrolledCourseFromDB,
  updateACourseInDB,
  updateCertificateToUserShikshaCourseDoc,
  updateCourseChapterInDB,
  updateCourseStatusInDB,
  updateUserCourseChapterInDB,
};
