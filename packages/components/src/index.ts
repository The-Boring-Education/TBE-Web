// Export all components from the package

// Admin Components
export {
  AdminAreaChart,
  AdminBarChart,
  AdminLineChart,
  AdminPieChart,
} from "./admin/AdminCharts";
export { default as AdminLayout } from "./admin/AdminLayout";
export { default as AdminStats } from "./admin/AdminStats";
export { default as AdminTable } from "./admin/AdminTable";

// Common Components
export { default as Accordion } from "./common/Accordion";
export { default as AccordionLinkItem } from "./common/Accordion/AccordionLinkItem";
export { default as Alert } from "./common/Alert";
export { default as AnalyticsWrapper } from "./common/Analytics/AnalyticsWrapper";
export { default as Banner } from "./common/Banner";
export {
  ActionBanner,
  BannerVariantA,
  BannerVariantB,
  BannerVariantC,
} from "./common/Banner";
export { default as Button } from "./common/Buttons/Button";
export { default as FloatingActionButton } from "./common/Buttons/FloatingActionButton";
export { default as LinkButton } from "./common/Buttons/LinkButton";
export { default as LoginRedirectButton } from "./common/Buttons/LoginRedirectButton";
export { default as LoginWithGoogleButton } from "./common/Buttons/LoginWithGoogleButton";
export { default as LogoutButton } from "./common/Buttons/LogoutButton";
export { default as ScrollToTopBottomButton } from "./common/Buttons/ScrollToTopBottomButton";
export { default as StarButton } from "./common/Buttons/StarButton";
export { default as ToggleButton } from "./common/Buttons/ToggleButton";
export { default as UserPointButton } from "./common/Buttons/UserPointButton";
export { default as Carousel } from "./common/Carousel";
export { default as CelebrationAnimation } from "./common/CelebrationAnimation";
export { default as CertificateBanner } from "./common/Certificate/CertificateBanner";
export { default as CertificateContent } from "./common/Certificate/CertificateContent";
export { default as CertificateModal } from "./common/CertificateModal";
export { default as ComingSoon } from "./common/ComingSoon";
export { default as CheckboxButton } from "./common/Form/CheckboxButton";
export { default as InputFieldContainer } from "./common/Form/InputFieldContainer";
export { default as RadioButton } from "./common/Form/RadioButton";
export { default as RadioInputField } from "./common/Form/RadioInputField";
export { default as SelectInput } from "./common/Form/SelectInput";
export { default as GamificationDemo } from "./common/GamificationDemo";
export { default as GamificationToast } from "./common/GamificationToast";
export { default as BackgroundImage } from "./common/Images/BackgroundImage";
export { default as Image } from "./common/Images/Image";
export { default as ImageLink } from "./common/Images/ImageLink";
export { default as Logo } from "./common/Images/Logo";
export { default as UserAvatar } from "./common/Images/UserAvatar";
export { default as ChapterLink } from "./common/Learning/ChapterLink";
export { default as QuestionLink } from "./common/Learning/QuestionLink";
export { default as LoadingIndicator } from "./common/LoadingIndicator";
export { default as LoadingSpinner } from "./common/LoadingSpinner";
export { default as MDXRenderer } from "./common/MDXRenderer";
export { default as Modal } from "./common/Modal";
export { default as NotificationPopover } from "./common/Notification";
export { default as Pill } from "./common/Pill";
export { default as IconPill } from "./common/Pill/IconPill";
export { default as CircularProgressBar } from "./common/ProgressBar/CircularProgressBar";
export { default as LinerProgressBar } from "./common/ProgressBar/LinerProgressBar";
export type { QuestionResources, ResourceTooltipProps } from "./common/ResourceTooltip";
export { default as ResourceTooltip } from "./common/ResourceTooltip";
export { default as TabComponent } from "./common/Tab";
export { default as Toast } from "./common/Toast";
export { default as Link } from "./common/Typography/Link";
export { default as Text } from "./common/Typography/Text";
// Container Components - Cards
export { default as AboutTBE } from "./containers/Cards/AboutTBE";
export { default as CardContainerA } from "./containers/Cards/CardContainerA";
export { default as CardContainerB } from "./containers/Cards/CardContainerB";
export { default as FeedbackPopup } from "./containers/Cards/FeedbackPopup";
export { default as GitHubIssuesContainer } from "./containers/Cards/GitHubIssuesContainer";
export { default as Leaderboard } from "./containers/Cards/Leaderboard";
export { default as LoginCard } from "./containers/Cards/LoginCard";
export { default as LoginCardNew } from "./containers/Cards/LoginCardNew";
export { default as MentorshipCard } from "./containers/Cards/MentorshipCard";
export { default as NotificationContainer } from "./containers/Cards/NotificationContainer";
export { default as PaymentCard } from "./containers/Cards/PaymentCard";
export { default as PlaylistSkillCard } from "./containers/Cards/PlaylistSkillCard";
export { default as QuizSection } from "./containers/Cards/QuizSection";
export { default as Testimonials } from "./containers/Cards/Testimonials";
export { default as UserLevelProgressContainer } from "./containers/Cards/UserLevelProgressContainer";
export { default as WeAlreadyTaughtAt } from "./containers/Cards/WeAlreadyTaughtAt";
export { default as WebibarCard } from "./containers/Cards/WebibarCard";
export { default as DsaQuestionList } from "./containers/Cards/DsaQuestionList";
export { DsaQuestionCard} from "./containers/Cards/DsaQuestionCard"
export { default as QuestionDetailPanel } from "./containers/Cards/QuestionDetailPanel"


// Container Components - Card Items
export { default as ContactCard } from "./containers/Cards/Items/ContactCard";
export { default as IconCard } from "./containers/Cards/Items/IconCard";
export { default as OutlineCard } from "./containers/Cards/Items/OutlineCard";
export { default as PlaylistCard } from "./containers/Cards/Items/PlaylistCard";
export { default as PlaylistRecommend } from "./containers/Cards/Items/PlaylistRecommend";
export { default as PlaylistVideoCard } from "./containers/Cards/Items/PlaylistVideoCard";
export { default as PlaylistVideoTimeCard } from "./containers/Cards/Items/PlaylistVideoTimeCard";
export { default as PortfolioCard } from "./containers/Cards/Items/PortfolioCard";
export { default as PortfolioTemplate } from "./containers/Cards/Items/PortfolioTemplate";
export { default as PrimaryCard } from "./containers/Cards/Items/PrimaryCard";
export { default as PrimaryCardWithCTA } from "./containers/Cards/Items/PrimaryCardWithCTA";
export { default as ProgressRing } from "./containers/Cards/Items/ProgressRing";
export { default as StarRatingCard } from "./containers/Cards/Items/StarRatingCard";
export { default as TestimonialCard } from "./containers/Cards/Items/TestimonialCard";
export { default as WeTaughtAtCard } from "./containers/Cards/Items/WeTaughtAtCard";

// Container Components - Forms
export { default as CheckboxButtonContainer } from "./containers/Forms/CheckboxButtonContainer";
export { default as InputRadioContainer } from "./containers/Forms/InputRadioContainer";
export { default as RadioButtonContainer } from "./containers/Forms/RadioButtonContainer";
export { default as UploadFileInput } from "./containers/Forms/UploadFileInput";

// Container Components - Page
export { default as NotFound } from "./containers/Cards/NotFound";
export { default as CohortJourneyContainer } from "./containers/Page/Cohort/CohortJourneyContainer";
export { default as FAQSection } from "./containers/Page/Cohort/FAQSection";
export { default as InterviewPrepSection } from "./containers/Page/Cohort/InterviewPrepSection";
export { default as PrevCohortProjects } from "./containers/Page/Cohort/PrevCohortProjects";
export { default as SessionDetailsSection } from "./containers/Page/Cohort/SessionDetailsSection";
export { default as CardSectionContainer } from "./containers/Page/common/CardSectionContainer";
export { default as FlexContainer } from "./containers/Page/common/FlexContainer";
export { default as GradientContainer } from "./containers/Page/common/GradientContainer";
export { default as GridContainer } from "./containers/Page/common/GridContainer";
export { default as HeaderLabel } from "./containers/Page/common/HeaderLabel";
export { default as LandingPageHero } from "./containers/Page/common/Hero";
export { default as MobileNavbarLinksContainer } from "./containers/Page/common/MobileNavbarLinksContainer";
export { default as ModernLandingHero } from "./containers/Page/common/ModernLandingHero";
export { default as NavbarDropdownContainer } from "./containers/Page/common/NavbarDropdownContainer";
export { default as PageHeroMetaContainer } from "./containers/Page/common/PageHeroMetaContainer";
export { default as PopoverContainer } from "./containers/Page/common/PopoverContainer";
export { default as RevenueTransparency } from "./containers/Page/common/RevenueTransparency";
export { default as SectionHeaderContainer } from "./containers/Page/common/SectionHeaderContainer";
export { default as CourseHeroContainer } from "./containers/Page/Course/CourseHeroContainer";
export { default as SheetHeroContainer } from "./containers/Page/Interview-sheet/SheetHeroContainer";
export { default as SheetLandingPage } from "./containers/Page/Interview-sheet/SheetLandingPage";
export { default as CollegeEventsSection } from "./containers/Page/Landing/CollegeEventsSection";
export { default as Community } from "./containers/Page/Landing/Community";
export { default as MentorshipPlans } from "./containers/Page/Landing/MentorshipPlans";
export { default as OnboardingLayout } from "./containers/Page/Onboarding/OnboardingLayout";
export { default as OnboardingProgressBar } from "./containers/Page/Onboarding/OnboardingProgressBar";
export { default as StepNavigation } from "./containers/Page/Onboarding/StepNavigation";
export { default as StepOccupation } from "./containers/Page/Onboarding/StepOccupation";
export { default as StepPhoneNumber } from "./containers/Page/Onboarding/StepPhoneNumber";
export { default as StepUsage } from "./containers/Page/Onboarding/StepUsage";
export { default as StepUsername } from "./containers/Page/Onboarding/StepUsername";
export { default as OpenSourceStatsSection } from "./containers/Page/OpenSource/OpenSourceStatsSection";
export { default as RepositoryTabBar } from "./containers/Page/OpenSource/RepositoryTabBar";
export { default as EnhancedOnboarding } from "./containers/Page/PrepYatra/EnhancedOnboarding";
export { default as PricingPage } from "./containers/Page/PrepYatra/PricingPage";
export { default as ProjectHeroContainer } from "./containers/Page/Project/ProjectHeroContainer";
export { default as ResumeEvaluationSection } from "./containers/Page/UnSkilled/ResumeEvaluationSection";
export { default as WebinarHeroContainer } from "./containers/Page/Webinar/WebinarHeroContainer";
export { default as ExplorePlaylistContainer } from "./containers/Page/YouFocus/ExplorePlaylistContainer";
export { default as PlaylistContainer } from "./containers/Page/YouFocus/PlaylistContainer";
// Layout Components
export {
  GamificationProvider,
  useGamificationContext,
} from "./common/GamificationDemo/GamificationProvider";
export { default as useGamifiedAction } from "./common/GamificationDemo/useGamifiedAction";
export {
    GTM_ID,
    GTMNoScript,
    GTMScript,
    pushToDataLayer,
    trackGTMEvent,
    trackGTMPageView} from "./gtm";
export { default as Footer } from "./layout/Footer";
export { default as Navbar } from "./layout/Navbar";
export { default as Layout } from "./layout/Page";
export { default as Section } from "./layout/Section";
export type {
    ArticleSchema,
    BreadcrumbItem,
    CourseSchema,
    FAQItem,
    SchemaType} from "./layout/SEO";
export { default as SEO } from "./layout/SEO";
export {
    getArticleSchema,
    getBreadcrumbSchema,
    getCourseSchema,
    getFAQSchema,
    getOrganizationSchema,
    getWebSiteSchema} from "./layout/SEO";
export { PageSEO,default as SEOWrapper } from "./layout/SEOWrapper";
export * from "./prepyatra";
// Re-export selected UI primitives from prepyatra/ui with their original names
// Note: We do not re-export prepyatra `Button` to avoid clashing with existing common Button export.
export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./prepyatra/ui/alert-dialog";
export { Badge } from "./prepyatra/ui/badge";
export { buttonVariants } from "./prepyatra/ui/button";
export {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./prepyatra/ui/card";
export { Input } from "./prepyatra/ui/input";
export { Label } from "./prepyatra/ui/label";
export { Progress } from "./prepyatra/ui/progress";
export { Sheet, SheetContent } from "./prepyatra/ui/sheet";
export { Tabs, TabsContent, TabsList, TabsTrigger } from "./prepyatra/ui/tabs";
export { Textarea } from "./prepyatra/ui/textarea";
export {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./prepyatra/ui/tooltip";

// Export all UI components from the main ui directory
export * from "./techyatra";
export * from "./ui";

export { default as QuestionDetails } from "./layout/QuestionDetails";
export { default as QuestionSidebar } from "./layout/QuestionSidebar";
export { default as PageHeader } from "./layout/PageHeader";
export type { PageHeaderProps } from "./layout/PageHeader";