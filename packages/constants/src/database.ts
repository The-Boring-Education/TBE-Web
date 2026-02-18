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

export const RESOURCE_CATEGORIES = {
  YOUTUBE: 'YOUTUBE',
  ARTICLE: 'ARTICLE',
  CODE: 'CODE',
  LEETCODE: 'LEETCODE',
  BLOG: 'BLOG',
} as const;

export type ResourceCategory = (typeof RESOURCE_CATEGORIES)[keyof typeof RESOURCE_CATEGORIES];

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
  { label: ['React', 'ReactJS', 'React.js'], value: 'react' },
  { label: ['JavaScript', 'JS', 'ECMAScript', 'ES6', 'ES2015'], value: 'javascript' },
  { label: ['TypeScript', 'TS'], value: 'typescript' },
  { label: ['Node.js', 'NodeJS', 'Node'], value: 'nodejs' },
  { label: ['Python', 'Python3', 'Py'], value: 'python' },
  { label: ['Java', 'Core Java', 'J2EE', 'Java EE'], value: 'java' },
  { label: ['HTML', 'HTML5'], value: 'html' },
  { label: ['CSS', 'CSS3', 'Cascading Style Sheets'], value: 'css' },
  { label: ['MongoDB', 'Mongo', 'Mongo DB'], value: 'mongodb' },
  { label: ['Express', 'Express.js', 'ExpressJS'], value: 'express' },
  { label: ['Next.js', 'NextJS', 'Next'], value: 'nextjs' },
  { label: ['Tailwind CSS', 'Tailwind', 'TailwindCSS'], value: 'tailwind' },
  { label: ['Angular', 'AngularJS', 'Angular.js'], value: 'angular' },
  { label: ['Vue', 'Vue.js', 'VueJS'], value: 'vue' },
  { label: ['SQL', 'MySQL', 'PostgreSQL', 'Postgres', 'MSSQL'], value: 'sql' },
  { label: ['Docker', 'Containerization'], value: 'docker' },
  { label: ['Kubernetes', 'K8s'], value: 'kubernetes' },
  { label: ['AWS', 'Amazon Web Services'], value: 'aws' },
  { label: ['Azure', 'Microsoft Azure'], value: 'azure' },
  { label: ['GCP', 'Google Cloud', 'Google Cloud Platform'], value: 'gcp' },
  { label: ['Git', 'GitHub', 'GitLab', 'Version Control'], value: 'git' },
  { label: ['REST API', 'RESTful', 'REST'], value: 'rest-api' },
  { label: ['GraphQL', 'Graph QL'], value: 'graphql' },
  { label: ['Redis', 'Cache'], value: 'redis' },
  { label: ['CI/CD', 'Jenkins', 'Travis', 'CircleCI'], value: 'ci-cd' },
  { label: ['Spring', 'Spring Boot', 'SpringBoot'], value: 'spring' },
  { label: ['Django', 'Django REST'], value: 'django' },
  { label: ['Flask', 'Flask API'], value: 'flask' },
  { label: ['FastAPI', 'Fast API'], value: 'fastapi' },
  { label: ['Go', 'Golang'], value: 'golang' },
  { label: ['Rust', 'Rust Lang'], value: 'rust' },
  { label: ['C++', 'CPP', 'C Plus Plus'], value: 'cpp' },
  { label: ['C#', 'CSharp', 'C Sharp', '.NET'], value: 'csharp' },
  { label: ['PHP', 'PHP7', 'PHP8'], value: 'php' },
  { label: ['Ruby', 'Ruby on Rails', 'Rails', 'RoR'], value: 'ruby' },
  { label: ['Swift', 'SwiftUI'], value: 'swift' },
  { label: ['Kotlin', 'Kotlin Android'], value: 'kotlin' },
  { label: ['Flutter', 'Dart'], value: 'flutter' },
  { label: ['React Native', 'ReactNative'], value: 'react-native' },
  { label: ['Sass', 'SCSS', 'LESS'], value: 'sass' },
  { label: ['Webpack', 'Rollup', 'Vite'], value: 'bundler' },
  { label: ['Redux', 'Redux Toolkit', 'RTK'], value: 'redux' },
  { label: ['Material UI', 'MUI', 'Material-UI'], value: 'material-ui' },
  { label: ['Bootstrap', 'Bootstrap 5'], value: 'bootstrap' },
  { label: ['Jest', 'Testing', 'Unit Test', 'Mocha', 'Chai'], value: 'testing' },
  { label: ['Selenium', 'Cypress', 'Playwright', 'Test Automation'], value: 'automation-testing' },
  { label: ['Figma', 'Adobe XD', 'Sketch'], value: 'design-tools' },
  { label: ['Postman', 'API Testing', 'Insomnia'], value: 'api-tools' },
  { label: ['Jira', 'Confluence', 'Project Management'], value: 'project-mgmt' },
  { label: ['Agile', 'Scrum', 'Kanban'], value: 'agile' },
  { label: ['Linux', 'Unix', 'Shell Scripting', 'Bash'], value: 'linux' },
  { label: ['Elasticsearch', 'Elastic Search', 'ELK'], value: 'elasticsearch' },
  { label: ['Apache Kafka', 'Kafka'], value: 'kafka' },
  { label: ['RabbitMQ', 'Message Queue'], value: 'rabbitmq' },
  { label: ['Terraform', 'Infrastructure as Code', 'IaC'], value: 'terraform' },
  { label: ['Microservices', 'Micro Services'], value: 'microservices' },
  { label: ['Machine Learning', 'ML', 'Deep Learning'], value: 'machine-learning' },
  { label: ['TensorFlow', 'Tensor Flow'], value: 'tensorflow' },
  { label: ['PyTorch', 'Py Torch'], value: 'pytorch' },
  { label: ['Pandas', 'NumPy', 'Data Analysis'], value: 'data-analysis' },
  { label: ['Power BI', 'PowerBI', 'Tableau', 'Data Visualization'], value: 'data-viz' },
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

// Resume Evaluation Constants
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
