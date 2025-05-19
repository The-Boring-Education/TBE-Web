const DATABASE_MODELS = {
  PROJECT: 'Project',
  USER: 'User',
  USER_PROJECT: 'UserProject',
  COURSE: 'Course',
  INTERVIEW_SHEET: 'InterviewSheet',
  COURSE_SECTION: 'CourseSection',
  COURSE_CHAPTER: 'CourseChapter',
  USER_COURSE: 'UserCourse',
  USER_SHEET: 'UserSheet',
  PLAYLIST: 'Playlist',
  USER_PLAYLIST: 'UserPlaylist',
  WEBINAR: 'Webinar',
  CERTIFICATE: 'Certificate',
  NOTIFICATION: 'Notification',
  GAMIFICATION: 'Gamification',
  JOB: 'Job',
  FEEDBACK:'Feedback'
};

export type FeedbackType = 
  | 'GENERAL'
  | 'SHIKSHA_CHAPTER'
  | 'SHIKSHA_COURSE'
  | 'INTERVIEW_QUESTION';

const modelSelectParams = {
  coursePreview: '_id name slug coverImageURL description liveOn',
  projectPreview: '_id name slug coverImageURL description isActive',
};

export { DATABASE_MODELS, modelSelectParams };
