import {
  Activity,
  Clock,
  FileText,
  Star,
  Target,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react";

import { useChallengeStats } from "@/api/challengesApi";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/ui/stat-card";

const ChallengesPage = () => {
  const { data: stats, isLoading, error, refetch } = useChallengeStats();

  const getPredefinedChallengeIcon = (type: string) => {
    switch (type) {
      case "21DaysPython":
        return "🐍";
      case "21DaysJava":
        return "☕";
      case "50DaysInternship":
        return "💼";
      default:
        return "🎯";
    }
  };

  const getPredefinedChallengeName = (type: string) => {
    switch (type) {
      case "21DaysPython":
        return "21 Days Python";
      case "21DaysJava":
        return "21 Days Java";
      case "50DaysInternship":
        return "50 Days Internship";
      default:
        return type;
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Challenges</h1>
            <p className="text-muted-foreground">
              Monitor challenge activities and engagement
            </p>
          </div>
        </div>

        <Card className="border-red-500/20 bg-red-500/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-red-500" />
              <p className="text-red-600">Failed to load challenge data</p>
            </div>
            <button
              onClick={() => refetch()}
              className="mt-2 text-sm text-blue-600 hover:underline"
            >
              Try again
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Challenges</h1>
          <p className="text-muted-foreground">
            Monitor challenge activities and user engagement
          </p>
        </div>
        <Badge variant="outline" className="text-xs">
          <Activity className="mr-1 h-3 w-3" />
          Live Data
        </Badge>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Challenges"
          value={
            isLoading ? "..." : stats?.totalChallenges?.toLocaleString() || "0"
          }
          icon={<Target className="h-4 w-4" />}
          color="blue"
          isLoading={isLoading}
        />
        <StatCard
          title="Active Now"
          value={
            isLoading ? "..." : stats?.activeChallenges?.toLocaleString() || "0"
          }
          icon={<TrendingUp className="h-4 w-4" />}
          color="green"
          isLoading={isLoading}
        />
        <StatCard
          title="Completed"
          value={
            isLoading
              ? "..."
              : stats?.completedChallenges?.toLocaleString() || "0"
          }
          icon={<Trophy className="h-4 w-4" />}
          color="purple"
          isLoading={isLoading}
        />
        <StatCard
          title="Total Users"
          value={isLoading ? "..." : stats?.totalUsers?.toLocaleString() || "0"}
          icon={<Users className="h-4 w-4" />}
          color="orange"
          isLoading={isLoading}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <StatCard
          title="Progress Logs"
          value={isLoading ? "..." : stats?.totalLogs?.toLocaleString() || "0"}
          icon={<FileText className="h-4 w-4" />}
          color="blue"
          isLoading={isLoading}
        />
        <StatCard
          title="Recent Activity (30 days)"
          value={
            isLoading ? "..." : stats?.recentActivity?.toLocaleString() || "0"
          }
          icon={<Clock className="h-4 w-4" />}
          color="green"
          isLoading={isLoading}
        />
      </div>

      {/* Popular Challenge Types */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Popular Challenge Types
          </CardTitle>
          <CardDescription>
            Most popular predefined challenges among users
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-6 w-12" />
                </div>
              ))}
            </div>
          ) : stats?.popularTypes && stats.popularTypes.length > 0 ? (
            <div className="space-y-3">
              {stats.popularTypes.map((type, index) => (
                <div
                  key={type._id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-muted text-lg">
                      {getPredefinedChallengeIcon(type._id)}
                    </div>
                    <div>
                      <p className="font-medium">
                        {getPredefinedChallengeName(type._id)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Rank #{index + 1}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">{type.count} challenges</Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No popular challenge types yet</p>
              <p className="text-sm">
                Challenge data will appear as users create challenges
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Challenge Insights */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Completion Rate */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Completion Rate</CardTitle>
            <CardDescription>
              Percentage of challenges that are completed
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-16 w-full" />
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-primary">
                    {stats?.totalChallenges && stats.totalChallenges > 0
                      ? Math.round(
                          (stats.completedChallenges / stats.totalChallenges) *
                            100,
                        )
                      : 0}
                    %
                  </span>
                  <Badge variant="outline">
                    {stats?.completedChallenges || 0} /{" "}
                    {stats?.totalChallenges || 0}
                  </Badge>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        stats?.totalChallenges && stats.totalChallenges > 0
                          ? (stats.completedChallenges /
                              stats.totalChallenges) *
                            100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Engagement Score */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Average Logs per Challenge
            </CardTitle>
            <CardDescription>
              How actively users are logging their progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-16 w-full" />
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-primary">
                    {stats?.totalChallenges && stats.totalChallenges > 0
                      ? (stats.totalLogs / stats.totalChallenges).toFixed(1)
                      : "0.0"}
                  </span>
                  <Badge variant="outline">
                    {stats?.totalLogs || 0} total logs
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {stats?.totalLogs && stats.totalLogs > 0
                    ? "Good engagement level"
                    : "Waiting for user activity"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChallengesPage;
