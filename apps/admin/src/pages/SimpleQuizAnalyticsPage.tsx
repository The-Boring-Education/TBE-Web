import {
  Activity,
  BarChart3,
  Clock,
  RefreshCw,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/lib/axios";

interface AdminAnalytics {
  overview: {
    totalAttempts: number;
    uniqueUsers: number;
    totalCategories: number;
    avgTimePerQuiz: number;
  };
  categoryStats: {
    categoryName: string;
    totalAttempts: number;
    averageScore: number;
    uniqueUsers: number;
  }[];
  recentActivity: {
    _id: string;
    count: number;
    avgScore: number;
  }[];
}

const SimpleQuizAnalyticsPage = () => {
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use the existing admin analytics endpoint
      const response = await api.get("/admin/quiz-analytics");

      if (response.data.success) {
        setAnalytics(response.data.data);
        setLastUpdated(new Date());
      } else {
        throw new Error(response.data.error || "Failed to load analytics");
      }
    } catch (err: any) {
      console.error("Error loading analytics:", err);
      setError(
        err.response?.data?.error || err.message || "Failed to load analytics",
      );
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  const COLORS = [
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#06B6D4",
  ];

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          <span className="ml-2">Loading analytics...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadAnalytics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No analytics data available</p>
          <Button onClick={loadAnalytics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quiz Analytics</h1>
          <p className="text-gray-600">
            Simple overview of quiz system performance
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {lastUpdated && (
            <p className="text-sm text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
          <Button onClick={loadAnalytics} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Attempts
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.overview.totalAttempts.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Active Users
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.overview.uniqueUsers.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Target className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Quiz Categories
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.overview.totalCategories}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Avg Time/Quiz
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatTime(analytics.overview.avgTimePerQuiz)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Category Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.categoryStats.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No category data available
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.categoryStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="categoryName"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={12}
                  />
                  <YAxis />
                  <Tooltip
                    formatter={(value, name) => [
                      name === "totalAttempts"
                        ? `${value} attempts`
                        : name === "averageScore"
                          ? `${value}% avg score`
                          : `${value} users`,
                      name === "totalAttempts"
                        ? "Total Attempts"
                        : name === "averageScore"
                          ? "Average Score"
                          : "Unique Users",
                    ]}
                  />
                  <Bar
                    dataKey="totalAttempts"
                    fill="#3B82F6"
                    name="totalAttempts"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Recent Activity (Last 7 Days)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.recentActivity.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No recent activity
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.recentActivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="_id" />
                  <YAxis />
                  <Tooltip
                    formatter={(value, name) => [
                      name === "count"
                        ? `${value} attempts`
                        : `${value}% avg score`,
                      name === "count" ? "Quiz Attempts" : "Average Score",
                    ]}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    name="count"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Category Details Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="h-5 w-5" />
            <span>Category Details</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.categoryStats.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No category data available
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">
                      Category
                    </th>
                    <th className="text-left py-3 px-4 font-medium">
                      Total Attempts
                    </th>
                    <th className="text-left py-3 px-4 font-medium">
                      Unique Users
                    </th>
                    <th className="text-left py-3 px-4 font-medium">
                      Avg Score
                    </th>
                    <th className="text-left py-3 px-4 font-medium">
                      Performance
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.categoryStats.map((category, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">
                        {category.categoryName}
                      </td>
                      <td className="py-3 px-4">
                        {category.totalAttempts.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        {category.uniqueUsers.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">{category.averageScore}%</td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            category.averageScore >= 80
                              ? "default"
                              : category.averageScore >= 60
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {category.averageScore >= 80
                            ? "Excellent"
                            : category.averageScore >= 60
                              ? "Good"
                              : "Needs Improvement"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleQuizAnalyticsPage;
