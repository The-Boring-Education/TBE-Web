import { useAuth } from "@tbe/auth";
import { ANALYTICS_EVENTS } from "@tbe/constants";
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
      suppressGlobalUiClick
      onClick={() => {
        trackEvent({
          action: ANALYTICS_EVENTS.USER_LOGIN,
          category: "User",
          label: "User Logged In",
        });

        try {
          sendEvent(ANALYTICS_EVENTS.LOGIN_CLICK, {
            category: "auth",
            label: text,
          });
        } catch {
          /* ignore analytics errors */
        }

        signIn("google");
      }}
    />
  );
};

export default LoginWithGoogleButton;
