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
  FEEDBACK: 'Feedback',
  JOB_AGGREGATE: 'JobAggregate',
  PAYMENT: 'Payment',
  PREP_YATRA_SUBSCRIPTION: 'PrepYatraSubscription',
  RECRUITER: 'Recruiters',
  PREP_LOG: 'PrepLog',
  CHALLENGE: 'Challenge',
  CHALLENGE_LOG: 'ChallengeLog',
  MENTORSHIP: 'Mentorship',
  QUIZ: 'Quiz',
  QUIZ_ATTEMPT: 'QuizAttempt',
  QUIZ_SESSION: 'QuizSession',
  USER_QUESTION_PERFORMANCE: 'UserQuestionPerformance',
  USER_QUIZ_ANALYTICS: 'UserQuizAnalytics',
  LEADERBOARD: 'Leaderboard',
  USER_INTEREST: 'UserInterest',
  COUPON: 'Coupon'
};

export const FEEDBACK_TYPES = [
  'GENERAL',
  'SHIKSHA_CHAPTER',
  'SHIKSHA_COURSE',
  'INTERVIEW_SHEET',
  'CERTIFICATE',
] as const;

export type FeedbackType = (typeof FEEDBACK_TYPES)[number];

export const PRODUCT_TYPE = [
  'INTERVIEW_SHEET',
  'SHIKSHA',
  'PROJECTS',
  'PREPYATRA',
  'GENERAL',
];
export type ProductType = (typeof PRODUCT_TYPE)[number];

export const APPLICATION_STATUS = [
  'Screening',
  'Interviewing',
  'Final Round Done',
  'Offer Letter',
  'Rejected',
  'Not Interested',
];

export type ApplicationStatusType = (typeof APPLICATION_STATUS)[number];

export const INTEREST_EVENT_TYPES = [
  'PREPYATRA_SUBSCRIPTION',
  'AI_MENTOR',
  'WEBAPP_SUBSCRIPTION',
  'COHORT_PROGRAM',
  'NEWSLETTER',
  'BETA_FEATURE',
] as const;

export type InterestEventType = (typeof INTEREST_EVENT_TYPES)[number];

export const LEADERBOARD_ENUM = [
  'DAILY',
  'WEEKLY', 
  'MONTHLY',
] as const;

export type LeaderboardEnum = (typeof LEADERBOARD_ENUM)[number];

export const JOB_SKILL_NORMALIZER = [
  { label: 'React', value: 'react' },
  { label: 'JavaScript', value: 'javascript' },
  { label: 'TypeScript', value: 'typescript' },
  { label: 'Node.js', value: 'nodejs' },
  { label: 'Python', value: 'python' },
  { label: 'Java', value: 'java' },
  { label: 'HTML', value: 'html' },
  { label: 'CSS', value: 'css' },
  { label: 'MongoDB', value: 'mongodb' },
  { label: 'Express', value: 'express' },
  { label: 'Next.js', value: 'nextjs' },
  { label: 'Tailwind CSS', value: 'tailwind' },
];

export const SKILL_BLACKLIST = [
  'communication',
  'teamwork',
  'leadership',
  'problem solving',
  'time management',
  'creativity',
  'adaptability',
  'work ethic',
  'critical thinking',
  'attention to detail',
];

export const SUBSCRIPTION_FEATURES = [
  'unlimited_courses',
  'unlimited_projects',
  'unlimited_interview_sheets',
  'certificates',
  'mentorship_sessions',
  'priority_support',
  'advanced_analytics',
  'exclusive_content',
];

export const YOUTUBE_API_PATH = 'https://www.googleapis.com/youtube/v3';

export const JOB_DOMAIN_NORMALIZER = [
  {
    label: [
      'Full Stack Developer',
      'Full Stack Development',
      'Full-Stack Development',
      'Full-Stack Developer',
      'Fullstack',
      'Full Stack',
      'Full Stack Developer (Frontend)',
      'Full Stack Developer (Backend)',
      'Full Stack Developer (Mobile)',
      'Full Stack Developer (Web)',
      'Full Stack Developer (Web Development)',
      'Java Full Stack Developer',
      'Full Stack Application Development',
    ],
    value: 'Full Stack Development',
  },
  {
    label: ['Backend Developer', 'Backend Development', 'Backend', 'Back End'],
    value: 'Backend Development',
  },
  {
    label: [
      'Frontend Developer',
      'Frontend Development',
      'Frontend',
      'Front End',
      'Frontend Engineer',
      'Frontend Web Developer',
      'UI Developer',
      'UX Developer',
    ],
    value: 'Frontend Development',
  },
  {
    label: [
      'Data Scientist',
      'Data Science',
      'Data Analyst',
      'Data Engineering',
      'Data Engineer',
      'Machine Learning Engineer',
      'ML Engineer',
      'AI Engineer',
      'Artificial Intelligence',
    ],
    value: 'Data Science',
  },
  {
    label: [
      'Mobile Developer',
      'Mobile Development',
      'iOS Developer',
      'Android Developer',
      'React Native Developer',
      'Flutter Developer',
      'Mobile App Developer',
    ],
    value: 'Mobile Development',
  },
  {
    label: [
      'DevOps Engineer',
      'DevOps',
      'Cloud Engineer',
      'Infrastructure Engineer',
      'Site Reliability Engineer',
      'SRE',
    ],
    value: 'DevOps',
  },
  {
    label: [
      'QA Engineer',
      'Quality Assurance',
      'Test Engineer',
      'Software Tester',
      'Automation Engineer',
    ],
    value: 'Quality Assurance',
  },
  {
    label: [
      'Product Manager',
      'Product Owner',
      'Technical Product Manager',
      'Product Lead',
    ],
    value: 'Product Management',
  },
  {
    label: [
      'UI/UX Designer',
      'UX Designer',
      'UI Designer',
      'Product Designer',
      'User Experience Designer',
      'User Interface Designer',
    ],
    value: 'Design',
  },
  {
    label: [
      'Software Engineer',
      'Software Developer',
      'Software Development',
      'Developer',
      'Programmer',
      'Software Programmer',
    ],
    value: 'Software Development',
  },
];

export const JOB_DOMAINS = JOB_DOMAIN_NORMALIZER.map(({ value }) => ({
  label: value,
  value: value,
}));

const modelSelectParams = {
  coursePreview: '_id name slug coverImageURL description liveOn isPremium',
  projectPreview: '_id name slug coverImageURL description isActive',
};

export { DATABASE_MODELS, modelSelectParams };
