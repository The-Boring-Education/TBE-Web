import { useNavigate } from "react-router-dom";

const CardButton = ({
  title,
  description,
  to,
  gradient,
}: {
  title: string;
  description: string;
  to: string;
  gradient: string;
}) => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(to)}
      className={`p-6 rounded-xl border shadow-sm text-left transition-all hover:shadow-md ${gradient}`}
    >
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      <p className="text-sm text-gray-600 mt-1">{description}</p>
    </button>
  );
};

const ContentPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Content</h1>
        <p className="text-gray-600 mt-2">
          Create or modify platform content using AI-powered tools
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-gray-700">Modifications</h2>
          <div className="space-y-3">
            <CardButton
              title="Interview Prep Sheet Modifications"
              description="Update sheet metadata, edit questions, and manage content"
              to="/content/modifications/interview-sheets"
              gradient="bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200"
            />
            <CardButton
              title="Quiz Modifications"
              description="Edit quiz categories, questions, answers, and explanations"
              to="/content/modifications/quiz"
              gradient="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200"
            />
          </div>
        </div>
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-gray-700">Creation</h2>
          <CardButton
            title="Quiz Creation"
            description="Generate high-quality quizzes for multiple technologies"
            to="/content/creation/quizzes"
            gradient="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200"
          />
        </div>
      </div>
    </div>
  );
};

export default ContentPage;
