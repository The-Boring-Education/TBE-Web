import { AuthCallback } from "@tbe/auth";

// No /login page in this app; failed sign-ins return to the landing page.
const ContributorAuthCallback = () => <AuthCallback loginPath="/" />;

export default ContributorAuthCallback;
