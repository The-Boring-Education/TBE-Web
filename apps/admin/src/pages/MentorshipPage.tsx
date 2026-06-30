import { format } from "date-fns";
import {
  Award,
  BookOpen,
  Calendar,
  Clock,
  Mail,
  RefreshCw,
  Search,
  Star,
  Target,
  Trash2,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";

import type { MentorshipUser } from "@/api/mentorshipApi";
import { useMentees, useRemoveFromMentorship } from "@/api/mentorshipApi";
import { addMentorFeedback } from "@/api/prepLogsApi";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const MentorshipPage = () => {
  const { data: mentees, isLoading, refetch } = useMentees();
  const removeFromMentorship = useRemoveFromMentorship();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [experienceFilter, setExperienceFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [feedbackForLog, setFeedbackForLog] = useState<Record<string, string>>(
    {},
  );
  const [submittingLogId, setSubmittingLogId] = useState<string | null>(null);

  // Filter and sort mentees
  const filteredMentees = useMemo(() => {
    const filtered = (mentees || []).filter((mentee) => {
      const name = (mentee?.name || "").toString().toLowerCase();
      const email = (mentee?.email || "").toString().toLowerCase();
      const workDomain = (mentee?.prepYatra?.workDomain || "")
        .toString()
        .toLowerCase();
      const expLevel = (mentee?.prepYatra?.experienceLevel || "").toString();

      const query = searchTerm.toLowerCase();

      const matchesSearch =
        name.includes(query) ||
        email.includes(query) ||
        workDomain.includes(query);

      const matchesExperience =
        experienceFilter === "all" || expLevel.includes(experienceFilter);

      return matchesSearch && matchesExperience;
    });

    // Sort mentees
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
        case "selected":
          return (
            new Date(b.mentorshipSelectedAt || 0).getTime() -
            new Date(a.mentorshipSelectedAt || 0).getTime()
          );
        default:
          return 0;
      }
    });
  }, [mentees, searchTerm, experienceFilter, sortBy]);

  const handleRefresh = () => {
    refetch();
  };

  const handleRemoveFromMentorship = async (
    menteeId: string,
    menteeName: string,
  ) => {
    try {
      const response = await removeFromMentorship.mutateAsync({
        userId: menteeId,
      });

      if (response.status) {
        toast({
          title: "Removed from Mentorship",
          description: `${menteeName} has been removed from the mentorship program.`,
        });
      }
    } catch (error) {
      console.error("Remove from mentorship error:", error);
      toast({
        title: "Error",
        description: "Failed to remove from mentorship. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM dd, yyyy");
  };

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), "HH:mm");
  };

  const getStreakStatus = (streak: number) => {
    if (streak >= 7)
      return { color: "bg-green-100 text-green-700", text: "Excellent" };
    if (streak >= 3)
      return { color: "bg-blue-100 text-blue-700", text: "Good" };
    if (streak >= 1)
      return { color: "bg-yellow-100 text-yellow-700", text: "Starting" };
    return { color: "bg-gray-100 text-gray-700", text: "No Streak" };
  };

  const submitFeedback = async (logId: string, mentee: MentorshipUser) => {
    const feedback = (feedbackForLog[logId] || "").trim();
    if (!feedback) return;
    try {
      setSubmittingLogId(logId);
      await addMentorFeedback({
        prepLogId: logId,
        mentorFeedback: feedback,
        notifyEmail: true,
        userId: mentee._id,
        userName: mentee.name,
        userEmail: mentee.email,
      });
      setFeedbackForLog((prev) => ({ ...prev, [logId]: "" }));
      toast({
        title: "Feedback Published",
        description: "The mentee has been notified via email.",
      });
      refetch();
    } catch (error) {
      console.error("Failed to add feedback", error);
      toast({
        title: "Error",
        description: "Failed to publish feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmittingLogId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Star className="h-8 w-8 mr-3 text-yellow-500 fill-current" />
            Mentorship Program
          </h1>
          <p className="text-gray-600 mt-1">
            Manage and track your mentees' progress
          </p>
        </div>
        <Button onClick={handleRefresh} disabled={isLoading} variant="outline">
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Mentees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredMentees.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Streaks
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                filteredMentees.filter((m) => m.prepLogStats.currentStreak > 0)
                  .length
              }
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Streak</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredMentees.length > 0
                ? Math.round(
                    filteredMentees.reduce(
                      (sum, m) => sum + m.prepLogStats.currentStreak,
                      0,
                    ) / filteredMentees.length,
                  )
                : 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredMentees.reduce((sum, m) => sum + m.totalLogs, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

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
                <SelectItem value="name">Name A-Z</SelectItem>
                <SelectItem value="selected">Recently Selected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Showing {filteredMentees.length} mentees
            </span>
            {searchTerm && (
              <Badge variant="secondary">Search: "{searchTerm}"</Badge>
            )}
            {experienceFilter !== "all" && (
              <Badge variant="outline">Experience: {experienceFilter}</Badge>
            )}
          </div>
        </div>
      </div>

      {/* Mentees List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto" />
            <p className="mt-2 text-gray-600">Loading mentees...</p>
          </div>
        ) : filteredMentees.length > 0 ? (
          filteredMentees.map((mentee) => {
            const totalTimeSpent = mentee.logs.reduce(
              (total, log) => total + log.timeSpent,
              0,
            );

            return (
              <Card key={mentee._id} className="mb-4">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={mentee.image} alt={mentee.name} />
                        <AvatarFallback>{mentee.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-xl flex items-center">
                          {mentee.name}
                          <Star className="h-4 w-4 ml-2 text-yellow-500 fill-current" />
                        </CardTitle>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Mail className="h-4 w-4" />
                          <span>{mentee.email}</span>
                        </div>
                        {mentee.mentorshipSelectedAt && (
                          <div className="flex items-center space-x-2 text-xs text-green-600 mt-1">
                            <Calendar className="h-3 w-3" />
                            <span>
                              Selected:{" "}
                              {formatDate(mentee.mentorshipSelectedAt)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          <Target className="h-4 w-4 text-green-600" />
                          <span className="font-medium">
                            {mentee.prepLogStats.currentStreak} day streak
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {mentee.totalLogs} total logs
                        </div>
                      </div>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Remove from Mentorship
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to remove {mentee.name} from
                              the mentorship program? This action cannot be
                              undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() =>
                                handleRemoveFromMentorship(
                                  mentee._id,
                                  mentee.name,
                                )
                              }
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Profile Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800">
                        Profile Overview
                      </h3>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            Experience Level:
                          </span>
                          <Badge variant="outline">
                            {mentee.prepYatra.experienceLevel}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            Work Domain:
                          </span>
                          <span className="text-sm font-medium">
                            {mentee.prepYatra.workDomain}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Goal:</span>
                          <Badge variant="outline">
                            {mentee.prepYatra.goal}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            Work Experience:
                          </span>
                          <span className="text-sm font-medium">
                            {mentee.prepYatra.workExperience} years
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-700">
                          Target Companies:
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {mentee.prepYatra.targetCompanies.map(
                            (company, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="text-xs"
                              >
                                {company}
                              </Badge>
                            ),
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Stats Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800">
                        Performance Stats
                      </h3>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <Target className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium">
                              Current Streak
                            </span>
                          </div>
                          <div className="text-2xl font-bold text-blue-700">
                            {mentee.prepLogStats.currentStreak}
                          </div>
                          <div
                            className={`text-xs ${
                              getStreakStatus(mentee.prepLogStats.currentStreak)
                                .color
                            } px-2 py-1 rounded-full inline-block mt-1`}
                          >
                            {
                              getStreakStatus(mentee.prepLogStats.currentStreak)
                                .text
                            }
                          </div>
                        </div>

                        <div className="bg-green-50 p-3 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <Award className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium">
                              Longest Streak
                            </span>
                          </div>
                          <div className="text-2xl font-bold text-green-700">
                            {mentee.prepLogStats.longestStreak}
                          </div>
                        </div>

                        <div className="bg-purple-50 p-3 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-purple-600" />
                            <span className="text-sm font-medium">
                              Total Hours
                            </span>
                          </div>
                          <div className="text-2xl font-bold text-purple-700">
                            {totalTimeSpent}h
                          </div>
                        </div>

                        <div className="bg-orange-50 p-3 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <BookOpen className="h-4 w-4 text-orange-600" />
                            <span className="text-sm font-medium">
                              Total Logs
                            </span>
                          </div>
                          <div className="text-2xl font-bold text-orange-700">
                            {mentee.totalLogs}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Logs */}
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center mb-4">
                      <BookOpen className="h-5 w-5 mr-2" />
                      Recent Prep Logs ({Math.min(mentee.logs.length, 3)}/
                      {mentee.logs.length})
                    </h3>

                    <div className="space-y-3">
                      {mentee.logs.length > 0 ? (
                        mentee.logs.slice(0, 3).map((log, index) => (
                          <div
                            key={log._id}
                            className="bg-gray-50 border border-gray-200 rounded-lg p-4"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-3">
                                <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                                  Day {mentee.logs.length - index}
                                </div>
                                <h4 className="font-medium text-gray-900">
                                  {log.title}
                                </h4>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Clock className="h-4 w-4 text-gray-500" />
                                <span className="text-sm font-medium text-gray-700">
                                  {log.timeSpent}h
                                </span>
                              </div>
                            </div>

                            <p className="text-gray-600 text-sm mb-2">
                              {log.description}
                            </p>

                            {log.mentorFeedback && (
                              <div className="rounded-md border border-purple-200 bg-purple-50 p-3 mb-3">
                                <div className="text-xs font-semibold text-purple-700 mb-1">
                                  Mentor Feedback
                                </div>
                                <p className="text-sm text-purple-900 whitespace-pre-line">
                                  {log.mentorFeedback}
                                </p>
                              </div>
                            )}

                            <div className="text-xs text-gray-500">
                              {formatDate(log.createdAt)} at{" "}
                              {formatTime(log.createdAt)}
                            </div>

                            <div className="mt-3 flex gap-2">
                              <Textarea
                                placeholder="Write feedback to the learner (visible on their dashboard)"
                                value={feedbackForLog[log._id] || ""}
                                onChange={(e) =>
                                  setFeedbackForLog((prev) => ({
                                    ...prev,
                                    [log._id]: e.target.value,
                                  }))
                                }
                                className="text-sm"
                              />
                              <Button
                                size="sm"
                                onClick={() => submitFeedback(log._id, mentee)}
                                disabled={
                                  submittingLogId === log._id ||
                                  !(feedbackForLog[log._id] || "").trim()
                                }
                              >
                                {submittingLogId === log._id
                                  ? "Publishing..."
                                  : "Publish Feedback"}
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <BookOpen className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                          <p>No prep logs yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="text-center py-12 bg-white rounded-lg border">
            <div className="text-gray-400 mb-4">
              <Star className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No mentees found
            </h3>
            <p className="text-gray-600">
              {searchTerm || experienceFilter !== "all"
                ? "Try adjusting your search or filters"
                : "No mentees have been selected yet"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MentorshipPage;
