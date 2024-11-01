const databaseModels = {
  PROJECT: 'Project',
  PROJECT_TASK: 'ProjectTask',
  USER_PROJECT: 'UserProject',
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
