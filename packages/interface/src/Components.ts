import type { FeedbackType } from "@tbe/constants";
import type {
  ChangeEvent,
  ElementType,
  HTMLInputTypeAttribute,
  MouseEventHandler,
  ReactNode,
  RefObject,
} from "react";

// Import these types from the api module to avoid duplication
import type {
  BaseInterviewSheetResponseProps,
  BaseShikshaCourseResponseProps,
  ExtendedCourseChapterModel,
  ExtendedInterviewSheetQuestionModel,
} from "./api";
// Import QuestionFrequencyType from the api module to avoid duplication
import type { QuestionFrequencyType } from "./api";
import type { QuestionDifficulty } from "./constants";
// Import CertificateType from the global module to avoid duplication
import type { CertificateType } from "./global";
// Import GetSEOMetaResponseType from the global module to avoid duplication
import type { GetSEOMetaResponseType } from "./global";
// Import TopNavbarLinkProps from the global module to avoid duplication
import type { TopNavbarLinkProps } from "./global";
// Import CohortRoadmapProps from the page module to avoid duplication
import type { CohortRoadmapProps } from "./page";

export interface SectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
  isDev?: boolean;
}

export interface LinkProps {
  children?: ReactNode;
  className?: string;
  href: string;
  target?: "_blank" | "";
  active?: boolean;
  scroll?: boolean;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}

export interface TextProps {
  level: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "label";
  children: ReactNode;
  variant?: "SUCCESS" | "ERROR";
  className?: string;
  textCenter?: boolean;
}

export interface ImageContainerProps {
  src: string;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
  fullHeight?: boolean;
  fullWidth?: boolean;
}

export interface LogoProps {
  className?: string;
  isDark?: boolean;
}

export interface LinkButtonProps extends LinkProps {
  buttonProps: ButtonProps;
  href: string;
  className?: string;
  theme?: 'dark' | 'light';
  noLoader?: boolean;
}

export interface ButtonProps {
  variant:
  | "PRIMARY"
  | "OUTLINE"
  | "GHOST"
  | "SUCCESS"
  | "SECONDARY"
  | "NEUTRAL";
  className?: string;
  text?: string;
  children?: React.ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  active?: boolean;
  isLoading?: boolean;
  animationClasses?: string;
  icon?: React.ReactNode;
  isFullWidth?: boolean;
  disabled?: boolean;
  animationType?: "DEFAULT" | "BOUNCE" | "GLOW";
  size?: "SMALL" | "MEDIUM" | "LARGE";
  type?: "button" | "submit" | "reset";
}

export interface PageLayoutProps {
  children: ReactNode;
}

export interface SectionHeaderProps {
  heading: string;
  focusText: string;
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
  flexContainerProps?: FlexContainerProps;
  subtext?: string;
}

export interface CardSectionContainerProps {
  children: ReactNode;
  isWidthFull?: boolean;
  className?: string;
  gap?: string;
}

export interface GradientContainerProps {
  children: ReactNode;
  className?: string;
  backgroundColor?: string;
  childrenClassName?: string;
}

export interface PrimaryCardProps {
  id?: string;
  image: string;
  imageAltText: string;
  title: string;
  content: string;
  borderColour?: 1 | 2 | 3 | 4 | 5 | 6;
}

export interface PortfolioCardProps {
  index: number;
  imageUrl: string;
  title: string;
  description: string;
}

export interface PortfolioTemplateProps {
  id: number;
  imageUrl: string;
  title: string;
  description: string;
  repo: string;
  developer: {
    name: string;
    link: string;
  };
  previewLink: string;
}

export interface FlexContainerProps {
  children?: ReactNode;
  itemCenter?: boolean;
  justifyCenter?: boolean;
  className?: string;
  direction?: "row" | "col";
  wrap?: boolean;
  fullWidth?: boolean;
  id?: string;
  disabled?: boolean;
}

export interface TestimonialCardProps {
  id?: string;
  image: string;
  imageAltText: string;
  title: string;
  content: string;
  work: string;
}

export interface FooterLinkProps {
  id?: string;
  label: string;
  href: string;
  target?: "_blank";
}

export interface FooterLinksContainerProps {
  title: string;
  urls: FooterLinkProps[];
}

export interface GridContainerProps {
  children: ReactNode;
  className?: string;
}

export type GenerateSectionPathProps = {
  basePath: string;
  sectionID: string;
};

export interface SEOProps {
  seoMeta: GetSEOMetaResponseType;
}

export interface PillProps {
  text: string;
  variant: "PRIMARY" | "SECONDARY" | "GHOST";
  textStyleClasses?: string;
  containerClasses?: string;
  widthFull?: boolean;
}

export interface IconPillProps {
  iconPath: string;
  iconAltText: string;
  label: string;
  className?: string;
  backgroundColor?: string;
  labelColor?: string;
}

export interface WeTaughtAtCardProps {
  image: string;
  imageAltText: string;
}

export interface PopoverContainerProps {
  label: string;
  children: ReactNode;
  panelClasses?: string;
  isOpen: boolean;
  onToggle: () => void;
}

export interface ImageLinkProps {
  linkProps: LinkProps;
  imageProps: ImageContainerProps;
}

export interface SelectInputProps {
  list: any[];
  onChange: (value: string) => void;
  selectedItem: string;
  className?: string;
}

export interface InputFieldContainerProps {
  label: string;
  type: HTMLInputTypeAttribute;
  onChange: (value: string) => void;
  className?: string;
  value?: string;
  labelClass?: string;
  isOptional?: boolean;
}

export interface LoadingSpinnerProps {
  height?: number;
  width?: number;
  marginClass?: string;
  className?: string;
  borderColour?: string;
}

export interface NavbarDropdownContainerProps {
  links: TopNavbarLinkProps[];
}

export interface MobileNavbarLinksContainerProps {
  title: string;
  links: TopNavbarLinkProps[];
  onLinkClick: () => void;
}

export interface PrimaryCardWithCTAProps {
  id: string;
  image: string;
  imageAltText: string;
  title: string;
  content: string;
  href: string;
  active?: boolean;
  ctaText?: string;
  borderColour?: 1 | 2 | 3 | 4 | 5 | 6;
  target?: "_blank";
  launchingOn?: string;
  isPremium?: boolean;
  roadmap?: string;
  isPurchased?: boolean;
}

export interface LandingPageHeroProps {
  sectionHeaderProps: SectionHeaderProps;
  primaryButton: ReactNode;
  secondaryButton?: ReactNode;
  backgroundImageUrl: string;
  heroText: string;
}

interface BaseCardContainerProps {
  heading: string;
  focusText?: string;
  borderColour?: 1 | 2 | 3 | 4 | 5 | 6;
  subtext?: string;
}

export interface CardContainerAProps extends BaseCardContainerProps {
  cards: PrimaryCardProps[];
  subtext?: string;
}

export interface CardContainerBProps extends BaseCardContainerProps {
  cards: PrimaryCardWithCTAProps[];
  id?: string;
  sectionClassName?: string;
}

export interface RadioButtonOptionsProps {
  label: string;
  value: string;
}

export interface UserLevel {
  name: string;
  value: string;
  minPoints: number;
  level: number;
}

export interface InputRadioContainerProps {
  radioItems: RadioButtonOptionsProps[];
  onChange: (itemId: string) => void;
  selectedItemValue?: string;
  className?: string;
}

export interface CheckboxGroupProps {
  options: { label: string; value: string }[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
}

export interface RadioInputFieldProps extends RadioButtonOptionsProps {
  onChange: (itemId: string) => void;
  selected?: boolean;
  className?: string;
}

export interface ProjectHeroMetaContainerProps {
  subtitle: string;
  title: string;
  titleClassName?: string;
  theme?: 'dark' | 'light';
}

export interface ProjectHeroContainerProps {
  id: string;
  name: string;
  roadmap: string;
  difficultyLevel: string;
  isEnrolled?: boolean;
}

export interface LevelInfoProps {
  level: number;
  pointsNeeded: number;
  currentLevel: string;
  nextLevel: string;
}
export interface CourseHeroContainerProps {
  name: string;
  isEnrolled?: boolean;
  id: string;
  isPremium?: boolean;
}

export interface SheetHeroContainerProps {
  name: string;
  isEnrolled?: boolean;
  id: string;
  isPremium?: boolean;
  isPurchased?: boolean;
  redirectTo?: string;
  backHref?: string;
  theme?: 'dark' | 'light';
}

export interface AccordionProps {
  title: string;
  children: ReactNode;
  open?: boolean;
}

export interface AccordionLinkItemProps {
  label: string;
  href: string;
  className?: string;
  isCompleted?: boolean;
  isActive: boolean;
  onClick?: MouseEventHandler<HTMLDivElement>;
}

export interface MDXContentProps {
  mdxSource: string;
}

export interface LoginWithGoogleBtnProps {
  text?: string;
}

export interface ChapterLinkProps {
  href: string;
  chapterId: string;
  name: string;
  content: string;
  isCompleted: boolean;
  currentChapterId: string;
  handleChapterClick: (content: string, chapterId: string) => void;
  isLocked?: boolean;
}

export interface QuestionLinkProps {
  href: string;
  questionId: string;
  title: string;
  question: string;
  isCompleted: boolean;
  isLocked?: boolean;
  currentQuestionId: string;
  handleQuestionClick: (question: string, questionId: string) => void;
  frequency: QuestionFrequencyType;
  theme?: 'light' | 'dark';
}

export interface MDXRendererProps {
  mdxSource: string;
  actions?: ReactNode[];
  theme?: 'light' | 'dark';
}

export interface AlertProps {
  message: string;
  type: "SUCCESS" | "ERROR" | "INFO";
  className?: string;
}

export interface LinerProgressBarProps {
  totalChapters: number;
  completedChapters: number;
}

export interface LearningSidebarPanelProps {
  title: string;
  totalItems: number;
  completedItems: number;
  children?: ReactNode;
  theme?: 'dark' | 'light';
  onClose?: () => void;
}

export interface LearningSidebarListProps<T = any> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  getKey?: (item: T, index: number) => string | number;
  className?: string;
}

export interface LearningQuestionListProps {
  questions: ExtendedInterviewSheetQuestionModel[];
  currentQuestionId: string;
  isLocked?: boolean;
  href: string;
  onQuestionSelect: (questionMeta: string, questionId: string) => void;
  theme?: 'light' | 'dark';
}

export interface LearningChapterListProps {
  chapters: ExtendedCourseChapterModel[];
  currentChapterId: string;
  isLocked?: boolean;
  href: string;
  onChapterSelect: (content: string, chapterId: string) => void;
  includeIndex?: boolean;
}

export interface CertificateBannerProps {
  backgroundColor: string;
  heading: string;
  subtext: string;
  icon: ElementType;
  isLocked: boolean;
  onClick?: () => void;
}

export interface CertificateContentProps {
  userName: string;
  courseName: string;
  date: string;
  type: CertificateType;
  certificateRef: RefObject<HTMLDivElement>;
}

export interface BackgroundImageProps {
  bannerImageUrl: string;
  classNames?: string;
}

export interface BannerProps {
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  imageSrc: string;
  variant?: "VARIANT_A" | "VARIANT_B" | "VARIANT_C";
}

export interface ActionBannerProps {
  backgroundColor: string;
  heading: string;
  subtext: string;
  icon: React.ElementType;
  isLocked: boolean;
  onClick: () => void;
}

export interface ModalProps {
  isOpen: boolean;
  closeModal: () => void;
  title: string;
  children: ReactNode;
}

export interface CertificateModalProps {
  isOpen: boolean;
  closeModal: () => void;
  userName: string;
  userEmail: string;
  onGenerateCertificate: (certificateName: string) => Promise<void>;
  errorMessage?: string | null;
}

export interface ToggleButtonProps {
  options: string[];
  activeColor: string;
  inactiveColor: string;
  onToggle: (activeOption: string) => void;
  textColors?: string[];
}

export interface PlaylistCardProps {
  title: string;
  description: string;
  thumbnail: string;
  isStartedLearningFromPlaylist?: boolean;
  videoId?: string;
}

export interface PrimaryLongCardProps {
  image: string;
  imageAltText: string;
  title: string;
  content: string;
  href?: string;
  active?: boolean;
  borderColour?: 1 | 2 | 3 | 4 | 5 | 6;
  target?: "_blank";
  launchingOn?: string;
}

export interface PlaylistVideoCardProps {
  title: string;
  image: string;
  imageAltText: string;
  href?: string;
  onClick?: () => void;
}
interface Video {
  title: string;
  thumbnail: string;
  videoId: string;
}

export interface PlaylistVideoTimeCard {
  usertime: number;
  userId: string;
  playlistId: string;
}

export interface PlaylistCantainerCardProps {
  id: string;
  playlistName: string;
  description: string;
  thumbnail: string;
  videos: Video[];
  learningTime?: number;
  isRecommended?: boolean;
  playlistId?: string;
}

export interface MentorshipCardProps {
  heading: string;
  description: string;
  link: string;
}

export interface TopmateServiceCardProps {
  id: string;
  title: string;
  description: string;
  rating?: number;
  isPopular?: boolean;
  icon?: string;
  sessionDuration: string;
  sessionType: string;
  originalPrice: number;
  currentPrice: number;
  topmateLink: string;
  category: "mentorship" | "ebooks" | "events" | "templates" | "bootcamps";
}

export interface CarouselProps {
  items: any[];
  renderItem: (item: any) => ReactNode;
}

export interface IconCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  className?: string;
  bgColor?: string;
  index?: number;
}

export interface HeaderLabelProps {
  label: string;
  className?: string;
}

export interface PlaylistRecommendProps {
  playlistId: string;
  userId: string;
  recommend?: boolean;
}

export interface ToastProps {
  message: string;
  type?: "success" | "error" | "info" | "warning";
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  duration?: number;
  onClose?: () => void;
}

export interface RadioButtonProps {
  label: string;
  value: string;
  isSelected: boolean;
  onClick: () => void;
}

export interface CheckboxButtonProps {
  label: string;
  value: string;
  isSelected: boolean;
  onClick: () => void;
}

export interface RadioGroupProps {
  options: RadioButtonOptionsProps[];
  selectedValue: string | null;
  onChange: (value: string) => void;
}

export interface PlaylistSkillCardProps {
  _id: string;
  thumbnail: string;
  playlistName: string;
  referrerBy: number;
  videos?: Video[];
  noOfVideos: number;
}

export interface ExploreCantainerCardProps {
  heading: string;
  focusText: string;
  subtext: string;
  isCenterAligned?: boolean;
}

export interface FloatingActionButtonProps {
  icon: React.ReactNode;
  onClick: () => void;
  className?: string;
}

export interface TabProps {
  tabLabels: string[];
  tabPanels: React.ReactNode[];
  vertical?: boolean;
}

export interface ProgressRingProps {
  progress: number;
  point: number;
}

export interface LevelProgressCardProps {
  points: number;
  currentLevel: number;
  currentLevelName: string;
  nextLevelName?: string;
  pointsLeftToNextLevel: number;
  percentageProgress: number;
}

export interface LoginRedirectButtonProps {
  text?: string;
  className?: string;
}

export interface OnboardingLayoutProps {
  children: ReactNode;
}

export interface OnboardingProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export interface StepNavigationProps {
  currentStep: number;
  isValid: boolean;
  isLastStep: boolean;
  onNext: () => void;
  onSubmit: () => void;
  onBack: () => void;
  isLoading?: boolean;
}

export interface StepOccupationProps {
  value: string;
  onChange: (value: string) => void;
}

export interface StepPhoneNumberProps {
  countryCode: string;
  phoneNumber: string;
  onChangeCode: (code: string) => void;
  onChangeNumber: (number: string) => void;
}

export interface StepUsageProps {
  selected: string[];
  onChange: (updated: string[]) => void;
}

export type StepUsernameProps = {
  userName: string;
  onChange: (value: string) => void;
  setIsUsernameAvailable: (value: boolean) => void;
};

export interface CohortJourneySectionProps {
  weeks: CohortRoadmapProps[];
}

export interface StarRatingCardProps {
  rating: number;
  onClick: (value: number) => void;
}

export interface FeedbackPopupProps {
  type: FeedbackType;
  refId?: string;
  position?: "bottom-right" | "bottom-center";
  onSubmit?: () => void;
}
export interface UploadFileInputProps {
  label?: string;
  file?: File | null;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  accept?: "*" | "pdf";
  className?: string;
  placeholder?: string;
}

export interface CircularProgressBarProps {
  percentage: number;
  color?: string;
  size?: number;
  strokeWidth?: number;
  children?: React.ReactNode;
  bg?: string;
  className?: string;
}

export interface ResumeEvaluationSectionProps {
  title: string;
  subtitle?: string;
  items: {
    skill?: string;
    name?: string;
    percentage: number;
    frequency?: number;
    count?: number;
    jobCount?: number; // New field from API
  }[];
  colorScheme: {
    text: string;
    ring: string;
    bg: string;
  };
}

// Generic product interface for PaymentCard
export interface BaseProductProps {
  _id: string;
  name: string;
  description?: string;
  price?: number;
  features?: string[];
  isPremium?: boolean;
  isEnrolled?: boolean;
  // Allow additional properties for different product types
  [key: string]: any;
}

export interface ResumeEvaluationData {
  resumeScore: number;
  skillsMatched: number;
  skillsMissing: number;
  remoteJobs: number;
  jobsAnalyzed: number;
  matchingSkills: {
    skill: string;
    percentage: number;
    jobCount: number;
  }[];
  missingSkills: {
    skill: string;
    percentage: number;
    jobCount: number;
  }[];
  companyTypeDistribution: {
    type: string;
    percentage: number;
    jobCount: number;
  }[];
}

export interface PaymentCardProps {
  course: BaseShikshaCourseResponseProps | BaseInterviewSheetResponseProps | BaseProductProps;
  onClose: () => void;
  productType: string;
}

export interface RepositoryTabBarProps {
  repositories: Array<{
    repo: string;
    name: string;
    url: string;
    description: string;
    language: string;
  }>;
  activeRepository: {
    repo: string;
    name: string;
    url: string;
    description: string;
    language: string;
  };
  onRepositoryChange: (repository: {
    repo: string;
    name: string;
    url: string;
    description: string;
    language: string;
  }) => void;
}

export interface StarButtonProps {
  isStarred: boolean;
  onToggle: () => void;
  isLoading?: boolean;
  className?: string;
  label?: string;
}

export interface LoginCardNewProps {
  variant?: "default" | "platform" | "prepyatra" | "quizes" | "resume-yatra" | "oncampus";
  customRedirectPath?: string;
  theme?: "light" | "dark";
}

export interface PrepLog {
  _id: string;
  title: string;
  description?: string;
  timeSpent: number;
  createdAt: string;
}

export interface UserProfile {
  name: string;
  userName: string;
  createdAt: string;
  linkedInUrl?: string;
  image?: string;
  githubUrl?: string;
  leetCodeUrl?: string;
  userSkills?: string[];
  userSkillsLastUpdated?: string;
  occupation?: string;
  purpose?: string[];
  prepYatra: {
    goal?: string;
    experienceLevel?: string;
    pyOnboarded?: boolean;
    targetCompanies?: string[];
    preferences?: {
      interviewCategories?: string[];
      focusAreas?: string[];
    };
  };
}

export interface DsaQuestion {
  name: string;
  difficultyLevel: QuestionDifficulty;
  id?: string | number;
  content?: string;
  domain?: string[];
  companyType?: string[];
  topics?: string[]
}

 export interface DsaQuestionListProps {
  questions: DsaQuestion[];
  selectedQuestionId?: string | number;
  onQuestionClick?: (question: DsaQuestion) => void;
  className?: string;
}

export interface DsaQuestionCardProps {
  name: string;
  difficultyLevel: QuestionDifficulty;
  isSelected?: boolean;
  onClick?: () => void;
}

export interface QuestionDetailProps {
    question: DsaQuestion | null;
}

