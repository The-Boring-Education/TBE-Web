import { RefreshCw, Search } from "lucide-react";
import { useMemo, useState } from "react";

import {
  useMentees,
  useMentorshipToggle,
  useSendMentorshipNotification,
} from "@/api/mentorshipApi";
import { usePrepLogs, usePrepLogsSummary } from "@/api/prepLogsApi";
import { PrepLogsSummary } from "@/components/PrepLogsSummary";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPrepLogsAccordion } from "@/components/UserPrepLogsAccordion";
import { useToast } from "@/hooks/use-toast";

const PrepLogsPage = () => {
  const { data: users, isLoading, refetch } = usePrepLogs();
  const { summary } = usePrepLogsSummary();
  const { data: mentees } = useMentees();
  const mentorshipToggle = useMentorshipToggle();
  const sendNotification = useSendMentorshipNotification();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [streakFilter, setStreakFilter] = useState("all");
  const [experienceFilter, setExperienceFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  // Filter and sort users
  const filteredUsers = useMemo(() => {
    const filtered = users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.prepYatra.workDomain
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesStreak =
        streakFilter === "all" ||
        (streakFilter === "active" && user.prepLogStats.currentStreak > 0) ||
        (streakFilter === "excellent" &&
          user.prepLogStats.currentStreak >= 7) ||
        (streakFilter === "good" &&
          user.prepLogStats.currentStreak >= 3 &&
          user.prepLogStats.currentStreak < 7) ||
        (streakFilter === "starting" &&
          user.prepLogStats.currentStreak >= 1 &&
          user.prepLogStats.currentStreak < 3) ||
        (streakFilter === "inactive" && user.prepLogStats.currentStreak === 0);

      const matchesExperience =
        experienceFilter === "all" ||
        user.prepYatra.experienceLevel.includes(experienceFilter);

      return matchesSearch && matchesStreak && matchesExperience;
    });

    // Sort users
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return (
            new Date(b.prepLogStats.lastLoggedDate).getTime() -
            new Date(a.prepLogStats.lastLoggedDate).getTime()
          );
        case "streak":
          return b.prepLogStats.currentStreak - a.prepLogStats.currentStreak;
        case "logs":
          return b.totalLogs - a.totalLogs;
        case "name":
          return a.name.localeCompare(b.name);
        case "time": {
          const aTime = a.logs.reduce((total, log) => total + log.timeSpent, 0);
          const bTime = b.logs.reduce((total, log) => total + log.timeSpent, 0);
          return bTime - aTime;
        }
        default:
          return 0;
      }
    });
  }, [users, searchTerm, streakFilter, experienceFilter, sortBy]);

  const handleRefresh = () => {
    refetch();
  };

  // Create a set of mentee IDs for quick lookup
  const menteeIds = new Set(mentees?.map((mentee) => mentee._id) || []);

  const handleMentorshipToggle = async (
    userId: string,
    isSelected: boolean,
  ) => {
    try {
      const user = users.find((u) => u._id === userId);
      if (!user) return;

      const response = await mentorshipToggle.mutateAsync({
        userId,
        isSelected,
        note: `Selected for mentorship based on performance: ${user.prepLogStats.currentStreak} day streak, ${user.totalLogs} total logs`,
      });

      if (response.status) {
        if (isSelected) {
          // Send notification email
          await sendNotification.mutateAsync({
            userId,
            userEmail: user.email,
            userName: user.name,
          });

          toast({
            title: "Success!",
            description: `${user.name} has been selected for mentorship and notified via email.`,
          });
        } else {
          toast({
            title: "Removed from Mentorship",
            description: `${user.name} has been removed from mentorship.`,
          });
        }
      }
    } catch (error) {
      console.error("Mentorship toggle error:", error);
      toast({
        title: "Error",
        description: "Failed to update mentorship status. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Prep Logs</h1>
          <p className="text-gray-600 mt-1">
            Monitor student progress and prep journey
          </p>
        </div>
        <Button onClick={handleRefresh} disabled={isLoading} variant="outline">
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Summary Section */}
      <PrepLogsSummary summary={summary} isLoading={isLoading} />

      {/* Filters Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, email, or domain..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Select value={streakFilter} onValueChange={setStreakFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Streak Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Streaks</SelectItem>
                <SelectItem value="active">Active (1+ days)</SelectItem>
                <SelectItem value="excellent">Excellent (7+ days)</SelectItem>
                <SelectItem value="good">Good (3-6 days)</SelectItem>
                <SelectItem value="starting">Starting (1-2 days)</SelectItem>
                <SelectItem value="inactive">Inactive (0 days)</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={experienceFilter}
              onValueChange={setExperienceFilter}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Experience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="Junior">Junior</SelectItem>
                <SelectItem value="Mid">Mid</SelectItem>
                <SelectItem value="Senior">Senior</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="streak">Highest Streak</SelectItem>
                <SelectItem value="logs">Most Logs</SelectItem>
                <SelectItem value="time">Most Time</SelectItem>
                <SelectItem value="name">Name A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Showing {filteredUsers.length} of {users.length} users
            </span>
            {searchTerm && (
              <Badge variant="secondary">Search: "{searchTerm}"</Badge>
            )}
            {streakFilter !== "all" && (
              <Badge variant="outline">Streak: {streakFilter}</Badge>
            )}
            {experienceFilter !== "all" && (
              <Badge variant="outline">Experience: {experienceFilter}</Badge>
            )}
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto" />
            <p className="mt-2 text-gray-600">Loading prep logs...</p>
          </div>
        ) : filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <UserPrepLogsAccordion
              key={user._id}
              user={user}
              onMentorshipToggle={handleMentorshipToggle}
              isMentee={menteeIds.has(user._id)}
            />
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-lg border">
            <div className="text-gray-400 mb-4">
              <Search className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No users found
            </h3>
            <p className="text-gray-600">
              {searchTerm ||
              streakFilter !== "all" ||
              experienceFilter !== "all"
                ? "Try adjusting your search or filters"
                : "No users with prep logs found"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrepLogsPage;
