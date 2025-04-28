import {
  CertificateType,
  DifficultyType,
  NotificationType,
  QuestionFrequencyType,
  RoadmapsType,
  SkillsType,
  UserPointsActionType,
  UserRoleType,
  PlatformUsageType,
} from '@/interfaces';

const PROJECT_SKILLS: SkillsType[] = [
  'HTML',
  'CSS',
  'JavaScript',
  'React',
  'TypeScript',
  'NodeJS',
  'ExpressJS',
  'MongoDB',
  'NextJS',
  'TailwindCSS',
];

const ROADMAPS: RoadmapsType[] = ['Frontend', 'Backend', 'Fullstack', 'Tech'];
const INTERVIEW_QUESTION_FREQUENCY: QuestionFrequencyType[] = [
  'Most Asked',
  'Asked Frequently',
  'Asked Sometimes',
];

const DIFFICULTY_LEVEL: DifficultyType[] = [
  'Beginner',
  'Intermediate',
  'Advanced',
];

const CERTIFICATE_TYPE: CertificateType[] = ['WEBINAR', 'SHIKSHA'];

const USER_POINTS_ACTION: UserPointsActionType[] = [
  'ENROLL_COURSE',
  'ENROLL_SHEET',
  'ENROLL_PROJECT',
  'COMPLETE_COURSE_CHAPTER',
  'COMPLETE_PROJECT_CHAPTER',
  'COMPLETE_QUESTION',
  'COMPLETE_COURSE_CERTIFICATE',
  'STREAK',
  'REFER',
];

const NOTIFICATION_TYPE: NotificationType[] = [
  'WEBINAR',
  'SHIKSHA',
  'PROJECT',
  'INTERVIEW PREP',
  'UPDATE',
];

const USER_ROLE: UserRoleType[] = [
  'TECH_STUDENT',
  'NON_TECH_STUDENT',
  'WORKING_PROFESSIONAL',
];

const PLATFORM_USAGE: PlatformUsageType[] = [
  'LEARNING_TECH',
  'BUILDING_PROJECTS',
  'INTERVIEW_PREP',
  'JOB_SEARCH',
];

const YOUTUBE_API_PATH = 'https://www.googleapis.com/youtube/v3';

const JOB_SKILL_NORMALIZER = [
  {
    label: ['react.js', 'React.js', 'react', 'React.JS'],
    value: 'React.js',
  },
  {
    label: ['NodeJS', 'node.js'],
    value: 'Node.js',
  },
  {
    label: ['Javascript', 'JS', 'JavaScript'],
    value: 'JavaScript',
  },
  {
    label: ['Front end', 'Front End', 'Frontend'],
    value: 'Frontend',
  },
  {
    label: ['spring boot', 'Spring Boot', 'Spring'],
    value: 'Spring Boot',
  },
  {
    label: ['Java', 'Java 8', 'Java 11'],
    value: 'Java',
  },
  {
    label: ['Python', 'python'],
    value: 'Python',
  },
  {
    label: ['C++', 'c++'],
    value: 'C++',
  },
  {
    label: ['C#', 'c#'],
    value: 'C#',
  },
  {
    label: ['PHP', 'php'],
    value: 'PHP',
  },
  {
    label: ['HTML', 'html'],
    value: 'HTML',
  },
  {
    label: ['CSS', 'css'],
    value: 'CSS',
  },
  {
    label: ['MongoDB', 'mongodb'],
    value: 'MongoDB',
  },
  {
    label: ['MySQL', 'mysql'],
    value: 'MySQL',
  },
  {
    label: ['PostgreSQL', 'postgresql'],
    value: 'PostgreSQL',
  },
  {
    label: ['Oracle', 'oracle'],
    value: 'Oracle',
  },
  {
    label: ['AWS', 'aws'],
    value: 'AWS',
  },
  {
    label: ['Azure', 'azure'],
    value: 'Azure',
  },
  {
    label: ['GCP', 'gcp'],
    value: 'GCP',
  },
  {
    label: ['Vue.Js', 'vue.js', 'VueJS', 'Vue'],
    value: 'Vue.js',
  },
  {
    label: ['Angular', 'angular'],
    value: 'Angular',
  },
  {
    label: ['Django', 'django'],
    value: 'Django',
  },
  {
    label: ['Flask', 'flask'],
    value: 'Flask',
  },
  {
    label: ['Ruby on Rails', 'Ruby'],
    value: 'Ruby on Rails',
  },
  {
    label: ['Swift', 'swift'],
    value: 'Swift',
  },
  {
    label: ['Kotlin', 'kotlin'],
    value: 'Kotlin',
  },
];

const JOB_LOCATION_NORMALIZER = [
  {
    label: ['Bengaluru', 'Bangalore'],
    value: 'Bangalore',
  },
  {
    label: ['Delhi NCR', 'Delhi', 'New Delhi', 'Delhi / NCR'],
    value: 'Delhi',
  },
  {
    label: ['Bombay', 'Mumbai', 'Mumbai (All Areas)'],
    value: 'Mumbai',
  },
  {
    label: ['Hybrid - Hyderabad'],
    value: 'Hyderabad',
  },
  {
    label: ['Remote', 'Work From Home'],
    value: 'Remote',
  },
];

const JOB_DOMAIN_NORMALIZER = [
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
      'Front-End',
    ],
    value: 'Frontend Development',
  },
  {
    label: [
      'Data Science',
      'Data Scientist',
      'Data Science / Machine Learning',
      'Data Science / AI',
      'Data Science / Data Analyst',
      'Data Science / Data Engineer',
      'Data Science / Data Science',
      'Data Science / Data Science / Machine Learning',
    ],
    value: 'Data Science',
  },
  {
    label: ['Machine Learning', 'ML', 'Data Science / Machine Learning'],
    value: 'Machine Learning',
  },
  {
    label: ['Web Development', 'Web Developer', 'Web Development (Frontend)'],
    value: 'Web Development',
  },
  {
    label: [
      'Software Engineer',
      'Software Development',
      'Software Engineering',
      'Senior Software Engineer',
      'Software Development Engineer',
      'Other Software Development',
      'Computer science',
      'Debugging',
    ],
    value: 'Software Development',
  },
  {
    label: ['DevOps Engineer', 'DevOps', 'DevOps Development'],
    value: 'DevOps',
  },
  {
    label: ['Data Analyst', 'Data Analytics', 'Data Analysis'],
    value: 'Data Analysis',
  },
  {
    label: [
      'Mobile Development',
      'Mobile Developer',
      'Android Developer',
      'Full Stack Developer (Mobile)',
      'Mobile App Development',
      'Mobile Application Development',
      'Mobile Application Developer',
      'Mobile App Developer',
      'Flutter Developer',
    ],
    value: 'Mobile Development',
  },
  {
    label: ['Cloud Computing', 'Cloud Engineer', 'Cloud Developer', 'Cloud'],
    value: 'Cloud Computing',
  },
  {
    label: ['Java Developer', 'Java Development', 'Java', 'Java 8', 'Java 11'],
    value: 'Java Development',
  },
  {
    label: [
      'QA / SDET',
      'Quality Assurance',
      'QA Engineer',
      'Quality Engineer',
      'Quality Analyst',
      'Quality Assurance Engineer',
      'Quality Assurance Analyst',
      'Quality Analyst Engineer',
      'Quality Assurance Tester',
      'Quality Assurance Automation Engineer',
      'Quality Assurance Automation Tester',
      'Quality Assurance Automation Analyst',
    ],
    value: 'QA Engineering',
  },
];

const JOB_DOMAIN_MAPPER = [
  {
    skills: [
      'React.js',
      'Frontend',
      'HTML',
      'CSS',
      'Vue.js',
      'Angular',
      'Tailwind',
      'Bootstrap',
    ],
    domain: ['Frontend Development'],
  },
  {
    skills: [
      'NodeJS',
      'Spring Boot',
      'PHP',
      'MongoDB',
      'MySQL',
      'PostgreSQL',
      'Django',
      'Ruby on Rails',
      'Flask',
      'ExpressJS',
    ],
    domain: ['Backend Development'],
  },
  {
    skills: ['Java', 'Java 8', 'Java 11'],
    domain: ['Java Development', 'Backend Development'],
  },
  {
    skills: ['Python', 'Django', 'Flask'],
    domain: ['Python Development', 'Backend Development'],
  },
  {
    skills: ['Swift', 'Kotlin'],
    domain: ['Mobile Development'],
  },
  {
    skills: [
      'Software Engineer',
      'Software Development',
      'Software Engineering',
      'Senior Software Engineer',
      'Software Development Engineer',
      'Other Software Development',
      'Computer science',
      'Debugging',
    ],
    domain: ['Software Development'],
  },
  {
    skills: ['DevOps', 'Cloud Computing', 'Oracle', 'AWS', 'Azure', 'GCP'],
    domain: ['DevOps'],
  },
  {
    skills: ['Data Science', 'Machine Learning', 'Data Analysis'],
    domain: ['Data Science'],
  },
  {
    skills: ['QA / SDET', 'Quality Assurance', 'QA Engineer'],
    domain: ['QA Engineering'],
  },
];

export {
  PROJECT_SKILLS,
  ROADMAPS,
  DIFFICULTY_LEVEL,
  INTERVIEW_QUESTION_FREQUENCY,
  CERTIFICATE_TYPE,
  YOUTUBE_API_PATH,
  NOTIFICATION_TYPE,
  USER_POINTS_ACTION,
  USER_ROLE,
  PLATFORM_USAGE,
  JOB_LOCATION_NORMALIZER,
  JOB_SKILL_NORMALIZER,
  JOB_DOMAIN_NORMALIZER,
  JOB_DOMAIN_MAPPER,
};
