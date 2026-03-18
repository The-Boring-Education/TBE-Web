import { useAuth } from "@tbe/auth";
import { Button } from "@tbe/components";
import type { LoginRedirectButtonProps } from "@tbe/interface";
import { trackEvent } from "@tbe/utils";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const LoginRedirectButton = ({
  text = "Login to Start",
  className = "",
}: LoginRedirectButtonProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Determine the correct auth route based on current pathname
  // Prep-yatra uses /auth, platform uses /login
  const getAuthRoute = () => {
    // Check if we're in prep-yatra app (has /auth route)
    if (
      pathname === "/auth" ||
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/pricing") ||
      pathname.startsWith("/journey")
    ) {
      return "/auth";
    }
    // Default to /login for platform app
    return "/login";
  };

  const handleLoginRedirect = () => {
    if (!isAuthenticated) {
      try {
        trackEvent("login_redirect_click", {
          category: "auth",
          label: "Login Redirect",
        });
      } catch {
        /* ignore analytics errors */
      }
      const authRoute = getAuthRoute();
      const redirectParam = authRoute === "/auth" ? "callbackUrl" : "redirect";
      router.push(
        `${authRoute}?${redirectParam}=${encodeURIComponent(pathname)}`,
      );
    }
  };

  const authRoute = getAuthRoute();
  if (!isClient) return null;
  if (isAuthenticated || pathname === "/login" || pathname === "/auth") {
    return null;
  }

  return (
    <Button
      className={className}
      text={text}
      variant="PRIMARY"
      onClick={handleLoginRedirect}
    />
  );
};

export default LoginRedirectButton;
