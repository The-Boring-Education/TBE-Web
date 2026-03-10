import { useAnalytics } from "@tbe/hooks";
import type { LoginWithGoogleBtnProps } from "@tbe/interface";
import { trackEvent as sendEvent } from "@tbe/utils";
import { signIn, useSession } from "next-auth/react";

import Button from "./Button";

const LoginWithGoogleButton = ({ text = "Login" }: LoginWithGoogleBtnProps) => {
  const session = useSession();
  const { trackEvent } = useAnalytics();

  if (session.status === "authenticated" || session.status === "loading")
    return <></>;

  return (
    <Button
      text={text}
      variant="PRIMARY"
      onClick={() => {
        // Track login attempt and potentially award first login points
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

        // Note: First login points will be awarded in the backend or user hook
        // when we detect it's the user's first login

        // Use Google provider for authentication
        signIn("google");
      }}
    />
  );
};

export default LoginWithGoogleButton;
