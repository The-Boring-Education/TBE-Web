import { useState } from "react";
import { useUser } from "@tbe/hooks";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Progress,
  Button,
} from "@tbe/components";
import {
  Search,
  Trophy,
  Clock,
  BookMarked,
  Calendar,
  BookOpen,
} from "lucide-react";
const CampusPrepDashboard = () => {
  const { user, loading, isAuth } = useUser();
  const [searchQuery, setSearchQuery] = useState("");

  // Redirect to login if not authenticated
  if (!loading && !isAuth) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0A0A0A]">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  const userName = user?.name || user?.email?.split('@')[0] || "Student";

  // Mock data for demonstration
  const progressData = {
    weeklyStudyHours: { current: 12.5, goal: 20 },
    coursesActive: 5,
    practiceStreak: 7,
    interviewsPrepared: 3
  };

  const continueLearningSessions = [
    {
      id: 1,
      courseName: "Operating Systems Essentials",
      module: "Module 4 - Deadlocks",
      progress: 60
    },
    {
      id: 2,
      courseName: "Aptitude - Quant Basics",
      module: "Set theory - 40% done",
      progress: 40
    }
  ];

  return (
      <div className="space-y-6">
        {/* Welcome Card */}
        <Card className=" border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">
                  Welcome back, {userName} 👋
                </h1>
                <p className="text-gray-400">Ready to prepare today?</p>
              </div>
              <Button
                variant="PRIMARY"
                text="Continue learning"
                size="MEDIUM"
              />
            </div>
          </CardContent>
        </Card>

        {/* Your Progress Section */}
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">Your progress</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className=" border-gray-800">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Weekly Study Hours
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="text-2xl font-bold text-white">
                          {progressData.weeklyStudyHours.current}
                        </div>
                        <Progress 
                          value={(progressData.weeklyStudyHours.current / progressData.weeklyStudyHours.goal) * 100}
                          className="h-2 bg-gray-800"
                        />
                        <p className="text-xs text-gray-400">
                          Goal: {progressData.weeklyStudyHours.goal} hrs/week
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Courses Active */}
                  <Card className=" border-gray-800">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        Courses Active
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="text-2xl font-bold text-white">
                          {progressData.coursesActive}
                        </div>
                        <p className="text-xs text-gray-400">
                          7 courses completed
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Practice Streak */}
                  <Card className=" border-gray-800">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                        <Trophy className="w-4 h-4" />
                        Practice Streak
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="text-2xl font-bold text-white">
                          {progressData.practiceStreak} days
                        </div>
                        <p className="text-xs text-gray-400">
                          Keep it going!
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Interviews Prepared */}
                  <Card className=" border-gray-800">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Interviews Prepared
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="text-2xl font-bold text-white">
                          {progressData.interviewsPrepared}
                        </div>
                        <p className="text-xs text-gray-400">
                          2 scheduled this week
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

        {/* Daily Challenge and Continue Learning Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Challenge Card */}
          <Card className=" border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Daily challenge</CardTitle>
              <CardDescription className="text-gray-400">
                Solve 10 medium-level array problems in under 40 minutes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                variant="PRIMARY"
                text="Start challenge"
                size="LARGE"
              />
              <p className="text-sm text-gray-500">Status: Not started</p>
            </CardContent>
          </Card>

          {/* Continue Learning Card */}
          <Card className=" border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Continue learning</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {continueLearningSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-3 bg-[#1A1A1A] rounded-lg border border-gray-800"
                >
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-white mb-1">
                      {session.courseName}
                    </h4>
                    <p className="text-xs text-gray-400">
                      {session.module}
                    </p>
                  </div>
                  <Button
                    variant="OUTLINE"
                    size="SMALL"
                    className="border-gray-700 text-white hover:bg-gray-800"
                    text="Resume"
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
  );
};

export default CampusPrepDashboard;
