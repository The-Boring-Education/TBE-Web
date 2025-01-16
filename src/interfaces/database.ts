import { Document, Schema } from 'mongoose';
import {
  CertificateType,
  DifficultyType,
  QuestionFrequencyType,
  RoadmapsType,
  SkillsType,
  WebinarEnrolledUsersProps,
} from '.';

export interface UserModel {
  name: string;
  email: string;
  image?: string;
  provider: string;
  providerAccountId?: string;
}

export interface ProjectChapter {
  isCompleted?: boolean;
  chapterId: string;
  chapterName: string;
  content: string;
  isOptional?: boolean;
  toObject: any;
}

export interface ProjectSection {
  sectionId: string;
  sectionName: string;
  chapters: ProjectChapter[];
  toObject: any;
}

export interface ProjectDocumentModel extends Document {
  name: string;
  meta: string;
  slug: string;
  description: string;
  coverImageURL: string;
  sections: ProjectSection[];
  requiredSkills: SkillsType[];
  roadmap: RoadmapsType;
  difficultyLevel: DifficultyType;
  isActive: boolean;
}

export interface UserProjectModel extends Document {
  userId: typeof Schema.Types.ObjectId;
  projectId: typeof Schema.Types.ObjectId;
  sections: UserProjectSectionModel[];
}

export interface UserProjectSectionModel {
  sectionId: string;
  chapters: UserProjectChapterModel[];
}

export interface UserProjectChapterModel {
  chapterId: string;
  isCompleted?: boolean;
}

export interface CourseModel extends Document {
  name: string;
  meta: string;
  slug: string;
  description: string;
  coverImageURL: string;
  liveOn: Date;
  chapters: CourseChapterModel[];
  roadmap: RoadmapsType;
  difficultyLevel: DifficultyType;
}

export interface InterviewSheetModel extends Document {
  name: string;
  meta: string;
  slug: string;
  description: string;
  coverImageURL: string;
  liveOn: Date;
  questions: InterviewSheetQuestionModel[];
  roadmap: RoadmapsType;
}

export interface InterviewSheetQuestionModel {
  _id: typeof Schema.Types.ObjectId;
  title: string;
  question: string;
  answer: string;
  frequency: QuestionFrequencyType;
  toObject: () => UserCourseModel;
}

export interface UserSheetModel extends Document {
  userId: typeof Schema.Types.ObjectId;
  sheetId: typeof Schema.Types.ObjectId;
  sheet: InterviewSheetModel;
  questions: UserSheetQuestionModel[];
}

export interface UserSheetQuestionModel {
  questionId: typeof Schema.Types.ObjectId;
  isCompleted?: boolean;
}

export interface CourseChapterModel {
  _id: typeof Schema.Types.ObjectId;
  name: string;
  content: string;
  isOptional?: boolean;
  toObject: () => UserCourseModel;
}

export interface UserCourseModel {
  userId: typeof Schema.Types.ObjectId;
  courseId: typeof Schema.Types.ObjectId;
  course: CourseModel;
  chapters: UserCourseChapterModel[];
  isCompleted: boolean;
  certificateId: string;
}

export interface UserCourseChapterModel {
  chapterId: string;
  isCompleted?: boolean;
}

export interface Video {
  title: string;
  videoId: string;
  thumbnail: string;
}

export interface PlaylistModel {
  playlistId: string;
  playlistName: string;
  description?: string;
  referrerBy?: number;
  tags?: string[];
  videos: Video[];
}

export interface UserPlaylistModel {
  userId: typeof Schema.Types.ObjectId;
  playlistId: typeof Schema.Types.ObjectId;
  playlist: PlaylistModel;
  isPublic: boolean;
}

export interface WebinarModel {
  _id: typeof Schema.Types.ObjectId;
  slug: string;
  name: string;
  description: string;
  isFree: boolean;
  about: string[];
  learnings: string[];
  host: {
    name: string;
    imageUrl: string;
    role: string;
    about: string[];
    linkedInUrl: string;
  };
  registrationUrl: string;
  dateAndTime: string;
  whatYoullLearn: string[];
  enrolledUsersList: WebinarEnrolledUsersProps[];
  recordedVideoUrl: string;
  coverImageURL: string;
  toObject: () => WebinarModel;
}

export interface CertificateModel extends Document {
  _id: typeof Schema.Types.ObjectId;
  type: CertificateType;
  userName: string;
  userId: string;
  date: string;
  programName: string;
  programId: typeof Schema.Types.ObjectId;
}

