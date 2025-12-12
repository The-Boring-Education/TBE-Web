import { useState } from "react";
import { useAuth } from "@tbe/auth";
import { useRouter } from "next/router";
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarContent, 
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Progress,
  Button as UIButton,
  Input,
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@tbe/components";
import { 
  Home, 
  BookOpen, 
  Target, 
  Briefcase, 
  Users,
  Search,
  Trophy,
  Clock,
  BookMarked,
  Calendar
} from "lucide-react";

const CampusPrepDashboard = () => {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  // For demo purposes, we'll show the dashboard even without auth
  // In production, uncomment the redirect logic below
  // if (!isLoading && !user) {
  //   router.push("/login");
  //   return null;
  // }

  const userName = user?.name || user?.email?.split('@')[0] || "Shivani";

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

  const sidebarItems = [
    { name: "Dashboard", icon: Home, href: "/dashboard" },
    { name: "Academics", icon: BookOpen, href: "/academics" },
    { name: "Practice & Prep", icon: Target, href: "/practice" },
    { name: "Career Tools", icon: Briefcase, href: "/career" },
    { name: "Projects & Community", icon: Users, href: "/community" }
  ];

  return (
    <div className="dark">
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-[#0A0A0A]">
          {/* Left Sidebar */}
          <Sidebar className="bg-[#141414] border-r border-gray-800">
            <SidebarHeader className="border-b border-gray-800 p-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#FF5757] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">CP</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-semibold text-sm">Campus Prep</span>
                  <span className="text-gray-400 text-xs">Interview Platform</span>
                </div>
              </div>
            </SidebarHeader>
            <SidebarContent className="p-2">
              <SidebarMenu>
                {sidebarItems.map((item) => (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton
                      isActive={item.href === "/dashboard"}
                      className="text-gray-300 hover:text-white hover:bg-gray-800 data-[active=true]:bg-[#FF5757] data-[active=true]:text-white"
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>

          {/* Main Content Area */}
          <SidebarInset className="bg-[#0A0A0A]">
            {/* Top Header Bar */}
            <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-gray-800 bg-[#141414] px-6">
              <SidebarTrigger className="text-white" />
              
              {/* Global Search */}
              <div className="flex-1 max-w-xl">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Search Campus Prep..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 bg-[#1A1A1A] border-gray-700 text-white placeholder:text-gray-500 focus:border-[#FF5757]"
                  />
                </div>
              </div>

              {/* User Profile Icon */}
              <Avatar className="h-8 w-8 cursor-pointer">
                <AvatarImage src={user?.image || undefined} alt={userName} />
                <AvatarFallback className="bg-[#FF5757] text-white text-sm">
                  {userName.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-6 space-y-6">
              {/* Welcome Card */}
              <Card className="bg-[#141414] border-gray-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-2xl font-bold text-white mb-1">
                        Welcome back, {userName} 👋
                      </h1>
                      <p className="text-gray-400">Ready to prepare today?</p>
                    </div>
                    <UIButton 
                      variant="default"
                      className="bg-[#FF5757] hover:bg-[#FF5757]/90 text-white"
                    >
                      Continue learning
                    </UIButton>
                  </div>
                </CardContent>
              </Card>

              {/* Your Progress Section */}
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">Your progress</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Weekly Study Hours */}
                  <Card className="bg-[#141414] border-gray-800">
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
                  <Card className="bg-[#141414] border-gray-800">
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
                          7 courses completion
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Practice Streak */}
                  <Card className="bg-[#141414] border-gray-800">
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
                  <Card className="bg-[#141414] border-gray-800">
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
                <Card className="bg-[#141414] border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white">Daily challenge</CardTitle>
                    <CardDescription className="text-gray-400">
                      Solve 10 medium-level array problems in under 40 minutes.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <UIButton 
                      variant="default"
                      className="w-full bg-[#FF5757] hover:bg-[#FF5757]/90 text-white"
                    >
                      Start challenge
                    </UIButton>
                    <p className="text-sm text-gray-500">Status: Not started</p>
                  </CardContent>
                </Card>

                {/* Continue Learning Card */}
                <Card className="bg-[#141414] border-gray-800">
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
                        <UIButton
                          variant="outline"
                          size="sm"
                          className="border-gray-700 text-white hover:bg-gray-800"
                        >
                          Resume
                        </UIButton>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default CampusPrepDashboard;
