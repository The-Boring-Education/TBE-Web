import {
  CourseChapterModel,
  CourseModel,
  InterviewSheetModel,
  InterviewSheetQuestionModel,
  ProjectChapter,
} from '.';

export type APIMethodTypes = 'GET' | 'POST' | 'PATCH';

export interface APIMakeRquestProps {
  method?: APIMethodTypes;
  url: string;
  headers?: { [key: string]: string };
  body?: any;
}

export interface ClientAPIResponseProps {
  status: boolean;
  data?: any;
}

export interface APIResponseProps extends ClientAPIResponseProps {
  message?: string;
  error?: any;
}

export interface ApiHookResultProps {
  data: any | undefined;
  isSuccess: boolean;
  loading: boolean;
  error: any;
  makeRequest: (params: APIMakeRquestProps) => Promise<void>;
}

export interface ClientAPIResponse {
  status: boolean;
  data?: any;
}

export interface APIResponseType extends ClientAPIResponse {
  message?: string;
  error?: any;
}

export type DatabaseQueryResponseType = {
  data?: any;
  error?: any;
};

export interface AddProjectRequestPayloadProps {
  name: string;
  slug: string;
  description: string;
  coverImageURL: string;
  requiredSkills: SkillsType[];
  roadmap: RoadmapsType;
  difficultyLevel: DifficultyType;
}

export interface AddSectionRequestPayloadProps {
  sectionId: string;
  sectionName: string;
  chapters: ProjectChapter[];
}

export interface AddChapterRequestPayloadProps {
  chapterId: string;
  chapterName: string;
  content: string;
  isOptional?: boolean;
}

export interface UpateSectionRequestPayloadProps {
  projectId: string;
  sectionId: string;
  updatedSectionName: string;
}

export interface DeleteSectionRequestPayloadProps {
  projectId: string;
  sectionId: string;
}

export interface UpdateProjectRequestPayloadProps {
  updatedData: {
    name?: string;
    meta?: string;
    description?: string;
    coverImageURL?: string;
    requiredSkills?: SkillsType[];
    roadmap?: RoadmapsType;
    difficultyLevel?: DifficultyType;
  };
  projectId: string;
}

export interface UpdateChapterRequestPayloadProps {
  updatedChapterName: string;
  updatedChapterContent: string;
  updatedIsOptional: boolean;
}

export interface UpdateChapterDBRequestProps
  extends UpdateChapterRequestPayloadProps {
  projectId: string;
  sectionId: string;
  chapterId: string;
}

export interface AddCourseRequestPayloadProps {
  title: string;
  description: string;
  coverImageURL: string;
  liveOn: string;
  slug: string;
  meta?: string;
  roadmap: RoadmapsType;
}

export interface AddInterviewSheetRequestPayloadProps {
  title: string;
  description: string;
  coverImageURL: string;
  liveOn: string;
  slug: string;
  meta?: string;
  roadmap: RoadmapsType;
}

export interface AddInterviewQuestionRequestPayloadProps {
  title: string;
  question: string;
  answer: string;
  frequency: QuestionFrequencyType;
}

export interface UpdateCourseRequestPayloadProps {
  updatedData: {
    title?: string;
    description?: string;
    coverImageURL?: string;
    meta?: string;
  };
  courseId: string;
}

export interface AddChapterToCourseRequestProps {
  name: string;
  content: string;
}

export interface UpdateChapterInCourseRequestProps {
  name?: string;
  content?: string;
  isOptional?: boolean;
}

export interface EnrollCourseInDBRequestProps {
  userId: string;
  courseId: string;
}

export type SkillsType =
  | 'HTML'
  | 'CSS'
  | 'JavaScript'
  | 'React'
  | 'TypeScript'
  | 'NodeJS'
  | 'ExpressJS'
  | 'MongoDB'
  | 'TailwindCSS'
  | 'NextJS';

export type RoadmapsType = 'Frontend' | 'Backend' | 'Fullstack' | 'Tech';
export type QuestionFrequencyType =
  | 'Most Asked'
  | 'Asked Frequently'
  | 'Asked Sometimes';

export type DifficultyType = 'Beginner' | 'Intermediate' | 'Advanced';

export interface CreateUserRequestPayloadProps {
  name: string;
  email: string;
  image?: string;
  provider: string;
  providerAccountId?: string;
}

export interface CourseEnrollmentRequestProps {
  courseId: string;
  userId: string;
}

export interface UpdateUserChapterInCourseRequestProps {
  userId: string;
  courseId: string;
  chapterId: string;
  isCompleted: boolean;
}

export interface SheetEnrollmentRequestProps {
  sheetId: string;
  userId: string;
}

export interface ExtendedCourseChapterModel extends CourseChapterModel {
  isCompleted: boolean; // Add `isCompleted` flag
}

export interface BaseShikshaCourseResponseProps extends Partial<CourseModel> {
  isEnrolled?: boolean;
  chapters?: ExtendedCourseChapterModel[];
}

export interface BaseInterviewSheetResponseProps
  extends Partial<InterviewSheetModel> {
  isEnrolled?: boolean;
  questions?: InterviewSheetQuestionModel[];
}

export interface MarkQuestionCompletedRequestProps {
  userId: string;
  sheetId: string;
  questionId: string;
  isCompleted: boolean;
}

export interface GetAllQuestionsRequestProps {
  userId: string;
}
