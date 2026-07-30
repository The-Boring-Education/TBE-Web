import { useAuth } from "@tbe/auth";
import { Button } from "@tbe/components";
import { ANALYTICS_EVENTS } from "@tbe/constants";
import type { LoginRedirectButtonProps } from "@tbe/interface";
import { trackEvent } from "@tbe/utils";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const LoginRedirectButton = ({
  text = "Login to Start",
  className = "",
}: LoginRedirectButtonProps) => {
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
      pathname?.startsWith("/dashboard") ||
      pathname?.startsWith("/pricing") ||
      pathname?.startsWith("/journey")
    ) {
      return "/auth";
    }
    // Default to /login for platform app
    return "/login";
  };

  const handleLoginRedirect = () => {
    if (!isAuthenticated) {
      try {
        trackEvent(ANALYTICS_EVENTS.LOGIN_REDIRECT_CLICK, {
          category: "auth",
          label: "Login Redirect",
        });
      } catch {
        /* ignore analytics errors */
      }
      const authRoute = getAuthRoute();
      const redirectParam = authRoute === "/auth" ? "callbackUrl" : "redirect";
      const currentPath =
        pathname ||
        (typeof window !== "undefined" ? window.location.pathname : "/");
      const targetUrl = `${authRoute}?${redirectParam}=${encodeURIComponent(currentPath)}`;
      if (typeof window !== "undefined") {
        window.location.href = targetUrl;
      }
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
      suppressGlobalUiClick
      onClick={handleLoginRedirect}
    />
  );
};

export default LoginRedirectButton;
