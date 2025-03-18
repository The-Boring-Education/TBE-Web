import path from 'path';
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
  'ENROLL',
  'COMPLETE_CHAPTER',
  'COMPLETE_COURSE',
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

const UNSKILL_DATA_FILE = path.resolve('src/data/unskilled.json');

export {
  PROJECT_SKILLS,
  ROADMAPS,
  DIFFICULTY_LEVEL,
  INTERVIEW_QUESTION_FREQUENCY,
  CERTIFICATE_TYPE,
  YOUTUBE_API_PATH,
  NOTIFICATION_TYPE,
  USER_POINTS_ACTION,
  UNSKILL_DATA_FILE,
};
