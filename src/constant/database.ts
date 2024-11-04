const databaseModels = {
  PROJECT: 'Project',
  USER_PROJECT_PROGRESS: 'ProgressTask',
  USER_PROGRESS: 'UserProgress',
  USER: 'User',
  COURSE: 'Course',
  INTERVIEW_SHEET: 'InterviewSheet',
  COURSE_SECTION: 'CourseSection',
  COURSE_CHAPTER: 'CourseChapter',
  USER_COURSE: 'UserCourse',
  USER_SHEET: 'UserSheet',
};

const modelSelectParams = {
  coursePreview: '_id name slug coverImageURL description liveOn',
};

export { databaseModels, modelSelectParams };
