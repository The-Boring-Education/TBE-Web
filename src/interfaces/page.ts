import {
  BaseShikshaCourseResponseProps,
  BaseInterviewSheetResponseProps,
} from '.';
import {
  CertificateModel,
  ProjectDocumentModel,
  WebinarModel,
} from './database';
import { GetSEOMetaResponseType } from './global';

export interface PageProps {
  slug: any;
  seoMeta: GetSEOMetaResponseType;
  resolvedUrl?: string;
}

export type ProjectPickedPageProps = Pick<
  ProjectDocumentModel,
  | '_id'
  | 'name'
  | 'meta'
  | 'roadmap'
  | 'difficultyLevel'
  | 'sections'
  | 'requiredSkills'
> & {
  isEnrolled?: boolean;
  _id: string;
};

export interface ProjectPageProps extends PageProps {
  project: ProjectPickedPageProps;
  meta: string;
  currentChapterId: string;
}

export interface CoursePageProps extends PageProps {
  course: BaseShikshaCourseResponseProps;
  meta: string;
  currentChapterId: string;
}

export interface SheetPageProps extends PageProps {
  sheet: BaseInterviewSheetResponseProps;
  meta: string;
  currentQuestionId: string;
}

export interface WebinarCardProps extends WebinarModel {
  isCompleted: boolean;
}

export interface WebinarsLandingPageProps extends PageProps {
  webinars: WebinarCardProps[];
}

export interface CertificatePageProps extends PageProps {
  certificate: CertificateModel;
}
