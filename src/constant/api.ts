import {
  CertificateType,
  DifficultyType,
  NotificationType,
  QuestionFrequencyType,
  RoadmapsType,
  SkillsType,
  UserPointsActionType,
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

const YOUTUBE_API_PATH = 'https://www.googleapis.com/youtube/v3';

export {
  PROJECT_SKILLS,
  ROADMAPS,
  DIFFICULTY_LEVEL,
  INTERVIEW_QUESTION_FREQUENCY,
  CERTIFICATE_TYPE,
  YOUTUBE_API_PATH,
  NOTIFICATION_TYPE,
  USER_POINTS_ACTION,
};
