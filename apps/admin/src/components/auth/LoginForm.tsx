import { useAuth } from "@tbe/auth";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const LoginForm = () => {
  const { isLoading, signIn } = useAuth();

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle className="text-2xl">Admin Login</CardTitle>
        <CardDescription>
          Sign in with your Google account to access the admin panel
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          type="button"
          className="w-full bg-purple-600 hover:bg-purple-700"
          disabled={isLoading}
          onClick={() => signIn("google", "/admin")}
        >
          {isLoading ? "Loading..." : "Sign in with Google"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default LoginForm;
