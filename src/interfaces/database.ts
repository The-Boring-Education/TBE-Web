import { Document, Schema } from 'mongoose';
import { DifficultyType, RoadmapsType, SkillsType } from '.';

export interface UserModel {
  name: string;
  email: string;
  image?: string;
  provider: string;
  providerAccountId?: string;
}

export interface ProjectChapter {
  chapterId: string;
  chapterName: string;
  content: string;
  isOptional?: boolean;
}

export interface ProjectSection {
  sectionId: string;
  sectionName: string;
  chapters: ProjectChapter[];
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

export interface UserProgressTaskModel {
  taskId: typeof Schema.Types.ObjectId;
  isCompleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserProjectProgressModel {
  userId: typeof Schema.Types.ObjectId;
  projectId: typeof Schema.Types.ObjectId;
  project?: ProjectDocumentModel;
  tasks: UserProgressTaskModel[];
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
}

export interface UserCourseChapterModel {
  chapterId: string;
  isCompleted?: boolean;
}
