// Export all UI components from TBE design system

// Common Components
export { default as Accordion } from "./Accordion"
export { default as Alert } from "./Alert"
export { default as Banner } from "./Banner"
export { default as Carousel } from "./Carousel"
export { default as CelebrationAnimation } from "./CelebrationAnimation"
export { default as ComingSoon } from "./ComingSoon"
export { default as ErrorBoundary } from "./ErrorBoundary"
export { default as Modal } from "./Modal"
export { default as Notification } from "./Notification"
export { default as Tab } from "./Tab"
export { default as Toast } from "./Toast"

// Button Components
export { default as Button } from "./Buttons/Button"
export { default as FloatingActionButton } from "./Buttons/FloatingActionButton"
export { default as LinkButton } from "./Buttons/LinkButton"
export { default as LoginRedirectButton } from "./Buttons/LoginRedirectButton"
export { default as LoginWithGoogleButton } from "./Buttons/LoginWithGoogleButton"
export { default as LogoutButton } from "./Buttons/LogoutButton"
export { default as ScrollToTopBottomButton } from "./Buttons/ScrollToTopBottomButton"
export { default as StarButton } from "./Buttons/StarButton"
export { default as ToggleButton } from "./Buttons/ToggleButton"
export { default as UserPointButton } from "./Buttons/UserPointButton"

// Form Components
export { default as CheckboxButton } from "./Form/CheckboxButton"
export { default as InputFieldContainer } from "./Form/InputFieldContainer"
export { default as RadioButton } from "./Form/RadioButton"
export { default as RadioInputField } from "./Form/RadioInputField"
export { default as SelectInput } from "./Form/SelectInput"
export { default as OnboardingField } from "./Form/OnboardingField"

// Image Components
export { default as BackgroundImage } from "./Images/BackgroundImage"
export { default as Image } from "./Images/Image"
export { default as ImageLink } from "./Images/ImageLink"
export { default as Logo } from "./Images/Logo"
export { default as UserAvatar } from "./Images/UserAvatar"

// Layout Components
export { default as Footer } from "./Footer"
export { default as GamificationProvider } from "./GamificationProvider"
export { default as Navbar } from "./Navbar"
export { default as Page } from "./Page"
export { default as Section } from "./Section"
export { default as SEO } from "./SEO"

// Standardized Layout Components (NEW - Use these for consistent UI)
export { default as StandardizedNavbar } from "./StandardizedNavbar"
export { default as StandardizedFooter } from "./StandardizedFooter"

// Loading Components
export { default as LoadingIndicator } from "./LoadingIndicator"
export { default as LoadingSpinner } from "./LoadingSpinner"

// Progress Components
export { default as CircularProgressBar } from "./ProgressBar/CircularProgressBar"
export { default as LinerProgressBar } from "./ProgressBar/LinerProgressBar"
export { default as OnboardingProgressBar } from "./ProgressBar/OnboardingProgressBar"

// Pill Components
export { default as Pill } from "./Pill"
export { default as IconPill } from "./Pill/IconPill"

// Typography Components
export { default as Link } from "./Typography/Link"
export { default as Text } from "./Typography/Text"

// Learning Components
export { default as ChapterLink } from "./Learning/ChapterLink"
export { default as QuestionLink } from "./Learning/QuestionLink"

// Certificate Components
export { default as CertificateBanner } from "./Certificate/CertificateBanner"
export { default as CertificateContent } from "./Certificate/CertificateContent"

// Gamification Components
export { default as GamificationDemo } from "./GamificationDemo"
export { default as GamificationToast } from "./GamificationToast"

// MDX Components
export { default as MDXRenderer } from "./MDXRenderer"

// === APP-SPECIFIC COMPONENTS ===

// PrepYatra Components
export { default as ChallengeCard } from "./PrepYatra/Cards/ChallengeCard"
export { default as ChallengeShareCard } from "./PrepYatra/Cards/ChallengeShareCard"
export { default as FeatureCards } from "./PrepYatra/Cards/FeatureCards"

export { default as BuildYourStack } from "./PrepYatra/Features/BuildYourStack"
export { default as ChallengeSection } from "./PrepYatra/Features/ChallengeSection"
export { default as DailyPrepEncouragement } from "./PrepYatra/Features/DailyPrepEncouragement"
export { default as PrepYatraHero } from "./PrepYatra/Features/Hero"
export { default as InstallButton } from "./PrepYatra/Features/InstallButton"
export { default as MotivationalBoost } from "./PrepYatra/Features/MotivationalBoost"
export { default as PrepLogsList } from "./PrepYatra/Features/PrepLogsList"
export { default as RecruiterContactsTable } from "./PrepYatra/Features/RecruiterContactsTable"

export { default as ProtectedRoute } from "./PrepYatra/Auth/ProtectedRoute"
export { default as PublicRoute } from "./PrepYatra/Auth/PublicRoute"

export { default as PrepYatraNavbar } from "./PrepYatra/Layout/Navbar"
export { default as PrepYatraFooter } from "./PrepYatra/Layout/Footer"
export { default as Navigation } from "./PrepYatra/Layout/Navigation"

export { default as PrepYatraGamificationBadge } from "./PrepYatra/Gamification/GamificationBadge"
export { default as PrepYatraGamificationDisplay } from "./PrepYatra/Gamification/GamificationDisplay"

// Quizes Components
export { default as QuizNavbar } from "./Quizes/Layout/Navbar"
export { default as QuizFooter } from "./Quizes/Layout/Footer"
export { default as QuizLayout } from "./Quizes/Layout/Layout"
export { default as DashboardNav } from "./Quizes/Layout/DashboardNav"

export { default as ClientAuth } from "./Quizes/Auth/ClientAuth"
export { default as QuizProtectedRoute } from "./Quizes/Auth/ProtectedRoute"

export { default as QuizGamificationCard } from "./Quizes/Gamification/GamificationCard"
export { default as GamificationWrapper } from "./Quizes/Gamification/GamificationWrapper"
export { default as PointsDisplay } from "./Quizes/Gamification/PointsDisplay"

export { default as CodeRenderer } from "./Quizes/Common/CodeRenderer"
export { default as MarkdownRenderer } from "./Quizes/Common/MarkdownRenderer"

// Onboarding Components (Refactored with shared components)
export { default as OnboardingLayout } from "./Onboarding/Core/OnboardingLayout"
export { default as OnboardingForm } from "./Onboarding/Core/OnboardingForm"

// Utilities
export * from "./lib/utils"

// Legacy Radix components (keeping for backward compatibility)
export * from "./accordion"
export * from "./alert-dialog"
export * from "./avatar"
export * from "./badge"
export * from "./breadcrumb"
export * from "./button"
export * from "./calendar"
export * from "./card"
export * from "./chart"
export * from "./checkbox"
export * from "./collapsible"
export * from "./command"
export * from "./context-menu"
export * from "./dialog"
export * from "./drawer"
export * from "./dropdown-menu"
export * from "./form"
export * from "./hover-card"
export * from "./input-otp"
export * from "./input"
export * from "./label"
export * from "./menubar"
export * from "./navigation-menu"
export * from "./pagination"
export * from "./popover"
export * from "./progress"
export * from "./radio-group"
export * from "./resizable"
export * from "./scroll-area"
export * from "./select"
export * from "./separator"
export * from "./sheet"
export * from "./sidebar"
export * from "./skeleton"
export * from "./slider"
export * from "./sonner"
export * from "./switch"
export * from "./table"
export * from "./tabs"
export * from "./textarea"
export * from "./toast"
export * from "./toaster"
export * from "./toggle-group"
export * from "./toggle"
export * from "./tooltip"
export * from "./use-toast"
