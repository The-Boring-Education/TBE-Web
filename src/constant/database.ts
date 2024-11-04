const databaseModels = {
  PROJECT: 'Project',
  USER_PROJECT_PROGRESS: 'ProgressTask',
  USER_PROGRESS: 'UserProgress',
  USER: 'User',
  COURSE: 'Course',
  COURSE_SECTION: 'CourseSection',
  COURSE_CHAPTER: 'CourseChapter',
  USER_COURSE: 'UserCourse',
};

const modelSelectParams = {
  coursePreview: '_id name slug coverImageURL description liveOn',
};

export { databaseModels, modelSelectParams };
