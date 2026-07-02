import { format } from "date-fns";
import {
  Award,
  BookOpen,
  Calendar,
  ChevronDown,
  ChevronRight,
  Clock,
  Mail,
  Star,
  StarOff,
  Target,
  TrendingUp,
  User,
  Zap,
} from "lucide-react";
import { useState } from "react";

import { addMentorFeedback } from "@/api/prepLogsApi";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UserWithPrepLogs } from "@/types";

interface UserPrepLogsAccordionProps {
  user: UserWithPrepLogs;
  onMentorshipToggle?: (userId: string, isSelected: boolean) => Promise<void>;
  isMentee?: boolean;
}

export function UserPrepLogsAccordion({
  user,
  onMentorshipToggle,
  isMentee = false,
}: UserPrepLogsAccordionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isUpdatingMentorship, setIsUpdatingMentorship] = useState(false);
  const [feedbackForLog, setFeedbackForLog] = useState<Record<string, string>>(
    {},
  );
  const [submittingLogId, setSubmittingLogId] = useState<string | null>(null);

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

  const totalTimeSpent = user.logs.reduce(
    (total, log) => total + log.timeSpent,
    0,
  );
  const averageTimePerLog =
    user.logs.length > 0 ? totalTimeSpent / user.logs.length : 0;

  const handleMentorshipToggle = async () => {
    if (!onMentorshipToggle) return;

    setIsUpdatingMentorship(true);
    try {
      await onMentorshipToggle(user._id, !isMentee);
    } catch (error) {
      console.error("Failed to update mentorship status:", error);
    } finally {
      setIsUpdatingMentorship(false);
    }
  };

  const submitFeedback = async (logId: string) => {
    const feedback = feedbackForLog[logId]?.trim();
    if (!feedback) return;
    try {
      setSubmittingLogId(logId);
      await addMentorFeedback({
        prepLogId: logId,
        mentorFeedback: feedback,
        notifyEmail: true,
        userId: user._id,
        userName: user.name,
        userEmail: user.email,
      });
      setFeedbackForLog((prev) => ({ ...prev, [logId]: "" }));
    } catch (err) {
      console.error("Failed to add feedback", err);
    } finally {
      setSubmittingLogId(null);
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader
        className="cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.image} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{user.name}</CardTitle>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Mail className="h-4 w-4" />
                <span>{user.email}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="font-medium">
                  {user.prepLogStats.currentStreak} day streak
                </span>
              </div>
              <div className="text-sm text-gray-500">
                {user.totalLogs} total logs
              </div>
            </div>

            {onMentorshipToggle && (
              <Button
                variant={isMentee ? "default" : "outline"}
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleMentorshipToggle();
                }}
                disabled={isUpdatingMentorship}
                className={`flex items-center space-x-1 ${
                  isMentee
                    ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                    : "hover:bg-yellow-50 hover:text-yellow-600"
                }`}
              >
                {isMentee ? (
                  <Star className="h-4 w-4 fill-current" />
                ) : (
                  <StarOff className="h-4 w-4" />
                )}
                <span className="text-xs">
                  {isMentee ? "Mentee" : "Select"}
                </span>
              </Button>
            )}

            {isExpanded ? (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronRight className="h-5 w-5 text-gray-500" />
            )}
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Profile Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Profile Overview
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Experience Level:
                  </span>
                  <Badge variant="outline">
                    {user.prepYatra.experienceLevel}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Work Domain:</span>
                  <span className="text-sm font-medium">
                    {user.prepYatra.workDomain}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Goal:</span>
                  <Badge variant="outline">{user.prepYatra.goal}</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Work Experience:
                  </span>
                  <span className="text-sm font-medium">
                    {user.prepYatra.workExperience} years
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">
                  Target Companies:
                </h4>
                <div className="flex flex-wrap gap-1">
                  {user.prepYatra.targetCompanies.map((company, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {company}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">
                  Focus Areas:
                </h4>
                <div className="flex flex-wrap gap-1">
                  {user.prepYatra.preferences.focusAreas.map((area, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Stats Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Performance Stats
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Target className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Current Streak</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-700">
                    {user.prepLogStats.currentStreak}
                  </div>
                  <div
                    className={`text-xs ${
                      getStreakStatus(user.prepLogStats.currentStreak).color
                    } px-2 py-1 rounded-full inline-block mt-1`}
                  >
                    {getStreakStatus(user.prepLogStats.currentStreak).text}
                  </div>
                </div>

                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Award className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Longest Streak</span>
                  </div>
                  <div className="text-2xl font-bold text-green-700">
                    {user.prepLogStats.longestStreak}
                  </div>
                </div>

                <div className="bg-purple-50 p-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium">Total Hours</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-700">
                    {totalTimeSpent}h
                  </div>
                </div>

                <div className="bg-orange-50 p-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Zap className="h-4 w-4 text-orange-600" />
                    <span className="text-sm font-medium">Avg Time/Log</span>
                  </div>
                  <div className="text-2xl font-bold text-orange-700">
                    {Math.round(averageTimePerLog * 10) / 10}h
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium">Last Activity</span>
                </div>
                <div className="text-sm text-gray-700">
                  {formatDate(user.prepLogStats.lastLoggedDate)}
                </div>
              </div>
            </div>
          </div>

          {/* Logs Section */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center mb-4">
              <BookOpen className="h-5 w-5 mr-2" />
              Prep Logs ({user.logs.length})
            </h3>

            <div className="space-y-3">
              {user.logs.length > 0 ? (
                user.logs.map((log, index) => (
                  <div
                    key={log._id}
                    className="bg-white border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                          Day {user.logs.length - index}
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

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>
                        Created: {formatDate(log.createdAt)} at{" "}
                        {formatTime(log.createdAt)}
                      </span>
                      <span>
                        Updated: {formatDate(log.updatedAt)} at{" "}
                        {formatTime(log.updatedAt)}
                      </span>
                    </div>

                    <div className="mt-3 flex gap-2">
                      <textarea
                        className="w-full border rounded p-2 text-sm"
                        placeholder="Write feedback to the learner (visible on their dashboard)"
                        value={feedbackForLog[log._id] || ""}
                        onChange={(e) =>
                          setFeedbackForLog((prev) => ({
                            ...prev,
                            [log._id]: e.target.value,
                          }))
                        }
                      />
                      <Button
                        size="sm"
                        onClick={() => submitFeedback(log._id)}
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
      )}
    </Card>
  );
}
