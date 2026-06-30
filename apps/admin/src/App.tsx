import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import ContentRedirect from "@/components/ContentRedirect";
import MainLayout from "@/components/layout/MainLayout";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LogProvider } from "@/contexts/LogContext";

import AgentsPage from "./pages/AgentsPage";
import AuthCallbackPage from "./pages/AuthCallbackPage";
import ChallengesPage from "./pages/ChallengesPage";
import CouponsPage from "./pages/CouponsPage";
import CoursesPage from "./pages/CoursesPage";
import Dashboard from "./pages/Dashboard";
import EmailManagementPage from "./pages/EmailManagementPage";
import InterviewPrepPage from "./pages/InterviewPrepPage";
import InterviewSheetCreatePage from "./pages/InterviewSheetCreatePage";
import InterviewSheetDetailPage from "./pages/InterviewSheetDetailPage";
import InterviewSheetsListPage from "./pages/InterviewSheetsListPage";
import LoginPage from "./pages/LoginPage";
import MentorshipPage from "./pages/MentorshipPage";
import PrepLogsPage from "./pages/PrepLogsPage";
import ProjectsPage from "./pages/ProjectsPage";
import QuizzesPage from "./pages/QuizzesPage";
import SimpleQuizAnalyticsPage from "./pages/SimpleQuizAnalyticsPage";
import UserInterestsPage from "./pages/UserInterestsPage";
import UsersPage from "./pages/UsersPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <LogProvider>
        <TooltipProvider>
          <Sonner position="top-right" />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/auth/callback" element={<AuthCallbackPage />} />

              <Route path="/" element={<Navigate to="/admin" replace />} />

              <Route
                path="/admin"
                element={
                  <MainLayout>
                    <Dashboard />
                  </MainLayout>
                }
              />

              <Route
                path="/users"
                element={
                  <MainLayout>
                    <UsersPage />
                  </MainLayout>
                }
              />

              <Route
                path="/courses"
                element={
                  <MainLayout>
                    <CoursesPage />
                  </MainLayout>
                }
              />

              <Route
                path="/projects"
                element={
                  <MainLayout>
                    <ProjectsPage />
                  </MainLayout>
                }
              />

              <Route
                path="/content"
                element={
                  <MainLayout>
                    <ContentRedirect />
                  </MainLayout>
                }
              />
              <Route
                path="/content/creation"
                element={
                  <MainLayout>
                    <ContentRedirect />
                  </MainLayout>
                }
              />
              <Route
                path="/content/creation/quizzes"
                element={
                  <MainLayout>
                    <ContentRedirect />
                  </MainLayout>
                }
              />
              <Route
                path="/content/analytics/quiz"
                element={
                  <MainLayout>
                    <SimpleQuizAnalyticsPage />
                  </MainLayout>
                }
              />
              <Route
                path="/quizzes"
                element={
                  <MainLayout>
                    <QuizzesPage />
                  </MainLayout>
                }
              />
              <Route
                path="/content/modifications"
                element={
                  <MainLayout>
                    <ContentRedirect />
                  </MainLayout>
                }
              />
              <Route
                path="/content/modifications/interview-sheets"
                element={
                  <MainLayout>
                    <ContentRedirect />
                  </MainLayout>
                }
              />
              <Route
                path="/content/modifications/quiz"
                element={
                  <MainLayout>
                    <ContentRedirect />
                  </MainLayout>
                }
              />
              <Route
                path="/content/modifications/quiz/:id"
                element={
                  <MainLayout>
                    <ContentRedirect />
                  </MainLayout>
                }
              />

              <Route
                path="/lab/interview-sheets"
                element={
                  <MainLayout>
                    <InterviewSheetsListPage />
                  </MainLayout>
                }
              />
              <Route
                path="/lab/interview-sheets/new"
                element={
                  <MainLayout>
                    <InterviewSheetCreatePage />
                  </MainLayout>
                }
              />
              <Route
                path="/lab/interview-sheets/:sheetId"
                element={
                  <MainLayout>
                    <InterviewSheetDetailPage />
                  </MainLayout>
                }
              />

              <Route
                path="/interview-prep"
                element={
                  <MainLayout>
                    <InterviewPrepPage />
                  </MainLayout>
                }
              />

              <Route
                path="/prep-logs"
                element={
                  <MainLayout>
                    <PrepLogsPage />
                  </MainLayout>
                }
              />

              <Route
                path="/challenges"
                element={
                  <MainLayout>
                    <ChallengesPage />
                  </MainLayout>
                }
              />

              <Route
                path="/coupon"
                element={
                  <MainLayout>
                    <CouponsPage />
                  </MainLayout>
                }
              />

              <Route
                path="/mentorship"
                element={
                  <MainLayout>
                    <MentorshipPage />
                  </MainLayout>
                }
              />

              <Route
                path="/email-management"
                element={
                  <MainLayout>
                    <EmailManagementPage />
                  </MainLayout>
                }
              />

              <Route
                path="/agents"
                element={
                  <MainLayout>
                    <AgentsPage />
                  </MainLayout>
                }
              />

              <Route
                path="/user-interests"
                element={
                  <MainLayout>
                    <UserInterestsPage />
                  </MainLayout>
                }
              />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </LogProvider>
    </QueryClientProvider>
  );
};

export default App;
