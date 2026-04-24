/**
 * Full-viewport loading state for public profile / journey pages (DSAYatra, Prep Yatra, etc.).
 */
export const PublicPageSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
  </div>
);
