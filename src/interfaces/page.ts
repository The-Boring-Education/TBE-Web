import {
  BaseShikshaCourseResponseProps,
  BaseInterviewSheetResponseProps,
} from '.';
import {
  CertificateModel,
  ProjectDocumentModel,
  WebinarModel,
  PlaylistModel,
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

export interface PlaylistPageProps extends PageProps {
  playlist: PlaylistPickedPageProps;
  PlaylistId: string;
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

export interface CardItem {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
}

export interface CardContainerAProps {
  heading: string;
  focusText: string;
  subtext?: string;
  borderColour?: string;
  cards: CardItem[];
}


export type PlaylistPickedPageProps = Pick<
  PlaylistModel & { _id: string }, // Explicitly adding _id
  | '_id' 
  | 'playlistId' 
  | 'playlistName' 
  | 'description'
  | 'thumbnail' 
  | 'tags' 
  | 'videos' 
  | 'referrerBy'
>;

export interface PlaylistVideoTimeCardProps {
  usertime?: number;
}


