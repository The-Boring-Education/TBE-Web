import { useAuth } from "@tbe/auth";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import LoginForm from "@/components/auth/LoginForm";

const LoginPage = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/admin");
    }
  }, [isAuthenticated, navigate]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 text-gray-600">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-purple-700">TBE Admin Panel</h1>
        <p className="mt-2 text-gray-600">
          Sign in to access the admin dashboard
        </p>
      </div>
      <LoginForm />
    </div>
  );
};

export default LoginPage;
