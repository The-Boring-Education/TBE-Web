import { ArrowRight, FileText, Layers, ListChecks } from "lucide-react";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ContentRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Auto-redirect after 5 seconds
    const timer = setTimeout(() => {
      navigate("/quizzes", { replace: true });
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  const getRedirectInfo = () => {
    const path = location.pathname;

    if (
      path.includes("/content/creation") ||
      path.includes("/content/modifications/quiz")
    ) {
      return {
        title: "Quiz Management Moved",
        description:
          "Quiz creation and modification functionality has been consolidated into the Quizzes page.",
        primaryAction: "Go to Quizzes",
        primaryPath: "/quizzes",
        icon: <ListChecks className="w-8 h-8 text-blue-600" />,
      };
    } else if (path.includes("/content/modifications/interview-sheets")) {
      return {
        title: "Interview Prep Management Moved",
        description:
          "Interview sheet modification functionality has been consolidated into the Interview Prep page.",
        primaryAction: "Go to Interview Prep",
        primaryPath: "/interview-prep",
        icon: <FileText className="w-8 h-8 text-green-600" />,
      };
    } else {
      return {
        title: "Content Page Consolidated",
        description:
          "The Content page has been consolidated into the Quiz and Interview Prep pages for better organization.",
        primaryAction: "Go to Quizzes",
        primaryPath: "/quizzes",
        icon: <Layers className="w-8 h-8 text-purple-600" />,
      };
    }
  };

  const info = getRedirectInfo();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">{info.icon}</div>
          <CardTitle className="text-xl">{info.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600 text-center">{info.description}</p>

          <div className="space-y-3">
            <Button
              className="w-full"
              onClick={() => navigate(info.primaryPath)}
            >
              {info.primaryAction}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("/interview-prep")}
            >
              Go to Interview Prep
            </Button>
          </div>

          <div className="text-center text-sm text-gray-500">
            <p>Redirecting automatically in 5 seconds...</p>
            <p className="mt-1">You can also use the navigation menu above.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentRedirect;
