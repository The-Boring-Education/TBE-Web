import {
  Award,
  Calendar,
  Clock,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

import { StatCard } from "@/components/ui/stat-card";
import type { PrepLogsSummary as PrepLogsSummaryType } from "@/types";

interface PrepLogsSummaryProps {
  summary: PrepLogsSummaryType;
  isLoading: boolean;
}

export function PrepLogsSummary({ summary, isLoading }: PrepLogsSummaryProps) {
  const stats = [
    {
      title: "Total Users",
      value: summary.totalUsers,
      icon: <Users className="h-4 w-4" />,
      color: "blue" as const,
      description: "Registered users with prep logs",
    },
    {
      title: "Active Today",
      value: summary.activeUsersToday,
      icon: <Calendar className="h-4 w-4" />,
      color: "green" as const,
      description: "Users who logged today",
    },
    {
      title: "Today's Logs",
      value: summary.totalLogsToday,
      icon: <Clock className="h-4 w-4" />,
      color: "purple" as const,
      description: "Total logs submitted today",
    },
    {
      title: "Avg Streak",
      value: summary.averageStreak,
      icon: <TrendingUp className="h-4 w-4" />,
      color: "orange" as const,
      description: "Average current streak",
    },
    {
      title: "Total Hours",
      value: `${summary.totalTimeSpent}h`,
      icon: <Target className="h-4 w-4" />,
      color: "red" as const,
      description: "Total time invested",
    },
    {
      title: "Avg Time/Log",
      value: `${summary.averageTimePerLog}h`,
      icon: <Zap className="h-4 w-4" />,
      color: "purple" as const,
      description: "Average time per log",
    },
  ];

  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">
        Prep Logs Overview
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            isLoading={isLoading}
          />
        ))}
      </div>
      {summary.mostActiveUser && (
        <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-700">
                Most Active User
              </h3>
              <p className="text-lg font-semibold text-purple-700">
                {summary.mostActiveUser}
              </p>
            </div>
            <Award className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      )}
    </div>
  );
}
