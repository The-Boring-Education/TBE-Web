import { useAuth } from "@tbe/auth";

import Button from "./Button";

const LogoutButton = () => {
  const { isAuthenticated, signOut } = useAuth();
  if (!isAuthenticated) return <></>;
  return (
    <Button
      className="w-full"
      text="Log out"
      variant="GHOST"
      onClick={() => {
        signOut();
      }}
    />
  );
};

export default LogoutButton;
