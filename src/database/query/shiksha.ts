import {
  AddChapterToCourseRequestProps,
  AddCourseRequestPayloadProps,
  BaseShikshaCourseResponseProps,
  DatabaseQueryResponseType,
  EnrollCourseInDBRequestProps,
  UpdateChapterInCourseRequestProps,
  UpdateCourseRequestPayloadProps,
  UpdateUserChapterInCourseRequestProps,
} from '@/interfaces';
import { Course, UserCourse } from '@/database';
import { modelSelectParams } from '@/constant';

const addACourseToDB = async (
  courseDetails: AddCourseRequestPayloadProps
): Promise<DatabaseQueryResponseType> => {
  try {
    const course = new Course(courseDetails);
    await course.save();
    return { data: course };
  } catch (error) {
    return { error: 'Failed while adding course' };
  }
};

const updateACourseInDB = async ({
  courseId,
  updatedData,
}: UpdateCourseRequestPayloadProps): Promise<DatabaseQueryResponseType> => {
  try {
    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      updatedData,
      { new: true }
    );

    if (!updatedCourse) return { error: 'Course does not exists' };

    return { data: updatedCourse };
  } catch (error) {
    return { error: 'Failed while updating course' };
  }
};

const deleteACourseFromDBById = async (
  courseId: string
): Promise<DatabaseQueryResponseType> => {
  try {
    const deletedCourse = await Course.findByIdAndDelete(courseId);

    if (!deletedCourse) {
      return { error: 'Course not found' };
    }
    return { data: 'Course deleted' };
  } catch (error) {
    return { error: 'Failed while deleting course' };
  }
};

const getAllCourseFromDB = async (): Promise<DatabaseQueryResponseType> => {
  try {
    const course = await Course.find()
      .select(modelSelectParams.coursePreview)
      .exec();

    if (!course) {
      return { error: 'Course not found' };
    }

    return { data: course };
  } catch (error) {
    return { error: `Failed while fetching a course ${error}` };
  }
};

const getACourseFromDBById = async (
  courseId: string,
  userId?: string
): Promise<DatabaseQueryResponseType> => {
  try {
    const course = await Course.findById(courseId);

    if (!course) {
      return { error: 'Course not found' };
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
    return { error: `Failed while fetching a course ${error}` };
  }
};

const addChapterToCourseInDB = async (
  courseId: string,
  chapter: AddChapterToCourseRequestProps
) => {
  try {
    const updatedCourse = await Course.findOneAndUpdate(
      { _id: courseId },
      { $push: { chapters: chapter } },
      { new: true }
    );

    if (!updatedCourse) {
      return { error: 'Course not found' };
    }

    return { data: updatedCourse };
  } catch (error) {
    return { error: 'Failed to add chapter to course' };
  }
};

const updateCourseChapterInDB = async (
  courseId: string,
  chapterId: string,
  { name, content, isOptional }: UpdateChapterInCourseRequestProps
) => {
  try {
    const course = await Course.findOneAndUpdate(
      { _id: courseId, 'chapters._id': chapterId },
      {
        $set: {
          'chapters.$.chapterName': name,
          'chapters.$.content': content,
          'chapters.$.isOptional': isOptional,
        },
      },
      { new: true }
    );

    return { data: course };
  } catch (error) {
    return { error: 'Failed to update chapter to course' };
  }
};

const deleteCourseChapterByIdFromDB = async (
  courseId: string,
  chapterId: string
) => {
  try {
    const course = await Course.findOneAndUpdate(
      { _id: courseId },
      { $pull: { chapters: { _id: chapterId } } },
      { new: true }
    );
    return { data: course };
  } catch (error) {
    return { error: 'Failed to delete chapter from course' };
  }
};

const enrollInACourse = async ({
  userId,
  courseId,
}: EnrollCourseInDBRequestProps): Promise<DatabaseQueryResponseType> => {
  try {
    const userCourse = await UserCourse.create({ userId, courseId });
    return { data: userCourse };
  } catch (error) {
    return { error: 'Failed while enrolling in a course' };
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
    return { error: 'Failed while fetching enrolled course' };
  }
};

const getAllEnrolledCoursesFromDB = async (
  userId: string
): Promise<DatabaseQueryResponseType> => {
  try {
    const enrolledCourse = await UserCourse.find({ userId })
      .populate({
        path: 'course',
        select: modelSelectParams.coursePreview,
      })
      .exec();

    return {
      data: enrolledCourse.map(
        (course) => course.course
      ) as BaseShikshaCourseResponseProps,
    };
  } catch (error) {
    return { error: 'Failed while fetching enrolled course' };
  }
};

const getCourseBySlugFromDB = async (
  slug: string
): Promise<DatabaseQueryResponseType> => {
  try {
    const course = await Course.findOne({ slug });

    if (!course) {
      return { error: 'Course not found' };
    }

    return { data: course };
  } catch (error) {
    return { error };
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
      return { error: 'User course not found' };
    }

    // Find the specific chapter in the chapters array
    const chapterIndex = userCourse.chapters.findIndex(
      (chapter) => chapter.chapterId.toString() === chapterId.toString()
    );

    if (chapterIndex === -1) {
      // If chapter is not found in the array, add it with the given status
      userCourse.chapters.push({
        chapterId: chapterId,
        isCompleted: isCompleted,
      });
    } else {
      // If chapter is found, update the isCompleted status
      userCourse.chapters[chapterIndex].isCompleted = isCompleted;
    }

    // Save the updated document
    await userCourse.save();

    return { data: userCourse };
  } catch (error) {
    return { error: 'Failed to update chapter in user course' };
  }
};

const getACourseForUserFromDB = async (userId: string, courseId: string) => {
  try {
    // Find the UserCourse document, including the populated course data
    const userCourse = await UserCourse.findOne({ userId, courseId })
      .populate({
        path: 'course',
      })
      .exec();

    // If the user is not enrolled in the course, fetch the course data without user-specific data
    if (!userCourse) {
      const { data: course } = await getACourseFromDBById(courseId);
      return { data: { ...course.toObject(), isEnrolled: false } };
    }

    // Map the chapters to include the `isCompleted` status from the embedded chapters in UserCourse
    const mappedChapters = userCourse.course.chapters.map((chapter) => {
      const isCompleted = userCourse.chapters.find(
        (uc) => uc.chapterId.toString() === chapter._id.toString()
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
    };

    return {
      data: {
        ...updatedCourseResponse,
        isEnrolled: true,
      } as BaseShikshaCourseResponseProps,
    };
  } catch (error) {
    return { error: 'Failed to fetch courses with chapter status' };
  }
};

export {
  addACourseToDB,
  updateACourseInDB,
  deleteACourseFromDBById,
  getACourseFromDBById,
  enrollInACourse,
  getEnrolledCourseFromDB,
  getAllEnrolledCoursesFromDB,
  getCourseBySlugFromDB,
  addChapterToCourseInDB,
  updateCourseChapterInDB,
  deleteCourseChapterByIdFromDB,
  updateUserCourseChapterInDB,
  getACourseForUserFromDB,
  getAllCourseFromDB,
};
