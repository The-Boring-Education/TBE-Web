import { HTMLInputTypeAttribute, MouseEventHandler, ReactNode } from 'react';
import {
  CertificateType,
  GetSEOMetaResponseType,
  QuestionFrequencyType,
  TopNavbarLinkProps,
} from '.';

export interface SectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export interface LinkProps {
  children?: React.ReactNode;
  className?: string;
  href: string;
  target?: '_blank';
  active?: boolean;
  scroll?: boolean;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}

export interface TextProps {
  level: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'label';
  children: React.ReactNode;
  variant?: 'SUCCESS' | 'ERROR';
  className?: string;
  textCenter?: boolean;
}

export interface ImageContainerProps {
  src: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
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
}

export interface ButtonProps {
  variant: 'PRIMARY' | 'OUTLINE' | 'GHOST' | 'SUCCESS' | 'SECONDARY';
  className?: string;
  text: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  active?: boolean;
  isLoading?: boolean;
}

export interface PageLayoutProps {
  children: React.ReactNode;
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
  children: React.ReactNode;
  isWidthFull?: boolean;
  className?: string;
  gap?: string;
}

export interface GradientContainerProps {
  children: React.ReactNode;
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
  children?: React.ReactNode;
  itemCenter?: boolean;
  justifyCenter?: boolean;
  className?: string;
  direction?: 'row' | 'col';
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
  target?: '_blank';
}

export interface FooterLinksContainerProps {
  title: string;
  urls: FooterLinkProps[];
}

export interface GridContainerProps {
  children: React.ReactNode;
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
  variant: 'PRIMARY' | 'SECONDARY' | 'GHOST';
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
}

export interface InputFieldContainerProps {
  label: string;
  type: HTMLInputTypeAttribute;
  onChange: (value: string) => void;
  className?: string;
  value?: string;
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
  target?: '_blank';
  launchingOn?: string;
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
  focusText: string;
  borderColour?: 1 | 2 | 3 | 4 | 5 | 6;
  subtext?: string;
}

export interface CardContainerAProps extends BaseCardContainerProps {
  cards: PrimaryCardProps[];
}

export interface CardContainerBProps extends BaseCardContainerProps {
  cards: PrimaryCardWithCTAProps[];
  id?: string;
  sectionClassName?: string;
}

export interface RadioOptionProps {
  id: string;
  label: string;
  description?: string;
}

export interface InputRadioContainerProps {
  radioItems: RadioOptionProps[];
  onChange: (itemId: string) => void;
  selectedItemId?: string;
  className?: string;
}

export interface RadioInputFieldProps extends RadioOptionProps {
  onChange: (itemId: string) => void;
  selected?: boolean;
  className?: string;
}

export interface ProjectHeroMetaContainerProps {
  subtitle: string;
  title: string;
  titleClassName?: string;
}

export interface ProjectHeroContainerProps {
  id: string;
  name: string;
  roadmap: string;
  difficultyLevel: string;
  isEnrolled?: boolean;
}

export interface CourseHeroContainerProps {
  name: string;
  isEnrolled?: boolean;
  id: string;
}

export interface SheetHeroContainerProps {
  name: string;
  isEnrolled?: boolean;
  id: string;
}

export interface AccordionProps {
  title: string;
  children: React.ReactNode;
  open?: boolean;
}

export interface AccordionLinkItemProps {
  label: string;
  href: string;
  className?: string;
  isCompleted?: boolean;
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
  handleChapterClick: (content: string) => void;
}

export interface QuestionLinkProps {
  href: string;
  questionId: string;
  title: string;
  question: string;
  isCompleted: boolean;
  currentQuestionId: string;
  handleQuestionClick: (question: string) => void;
  frequency: QuestionFrequencyType;
}

export interface MDXRendererProps {
  mdxSource: string;
  actions?: React.ReactNode[];
}

export interface AlertProps {
  message: string;
  type: 'SUCCESS' | 'ERROR' | 'INFO';
  className?: string;
}

export interface ProgressBarProps {
  totalChapters: number;
  completedChapters: number;
}

export interface CertificateBannerProps {
  backgroundColor: string;
  heading: string;
  subtext: string;
  icon: React.ElementType;
  isLocked: boolean;
  onClick?: () => void;
}

export interface CertificateContentProps {
  userName: string;
  courseName: string;
  date: string;
  type: CertificateType;
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
  variant?: 'VARIANT_A' | 'VARIANT_B';
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
  courseName: string;
  certificateId: string;
}

export interface ToggleButtonProps {
  options: string[];
  activeColor: string;
  inactiveColor: string;
  onToggle: (activeOption: string) => void;
  textColors?: string[];
}
