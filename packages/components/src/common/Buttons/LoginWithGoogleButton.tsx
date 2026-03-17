import { useAuth } from "@tbe/auth";
import { useAnalytics } from "@tbe/hooks";
import type { LoginWithGoogleBtnProps } from "@tbe/interface";
import { trackEvent as sendEvent } from "@tbe/utils";

import Button from "./Button";

const LoginWithGoogleButton = ({ text = "Login" }: LoginWithGoogleBtnProps) => {
  const { isAuthenticated, isLoading, signIn } = useAuth();
  const { trackEvent } = useAnalytics();

  if (isAuthenticated || isLoading) return <></>;

  return (
    <Button
      text={text}
      variant="PRIMARY"
      onClick={() => {
        trackEvent({
          action: "USER_LOGIN",
          category: "User",
          label: "User Logged In",
        });

        try {
          sendEvent("login_click", { category: "auth", label: text });
        } catch {
          /* ignore analytics errors */
        }

        signIn("google");
      }}
    />
  );
};

export default LoginWithGoogleButton;
