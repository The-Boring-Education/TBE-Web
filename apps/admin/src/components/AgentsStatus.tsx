import { useEffect, useState } from "react";

import { getQuizTopics, pingAgents } from "@/api/quizApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAgentsApiBaseForEnv, getStoredEnv } from "@/hooks/useEnvironment";
import { errorLogger } from "@/utils/errorLogger";

interface AgentsStatusProps {
  className?: string;
  showDetails?: boolean;
}

const AgentsStatus = ({
  className = "",
  showDetails = false,
}: AgentsStatusProps) => {
  const [agentsOk, setAgentsOk] = useState<boolean | null>(null);
  const [topicsCount, setTopicsCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState<string>("");
  const env = getStoredEnv();
  const agentsBaseUrl = getAgentsApiBaseForEnv(env);

  const checkAgentsStatus = async () => {
    setLoading(true);
    try {
      const [pingRes, topicsRes] = await Promise.allSettled([
        pingAgents(),
        getQuizTopics(),
      ]);

      if (pingRes.status === "fulfilled") {
        setAgentsOk(!!pingRes.value?.ok);
      } else {
        setAgentsOk(false);
        errorLogger.logNetworkError(pingRes.reason, "ping agents");
      }

      if (topicsRes.status === "fulfilled" && Array.isArray(topicsRes.value)) {
        setTopicsCount(topicsRes.value.length);
      } else if (topicsRes.status === "rejected") {
        errorLogger.logNetworkError(topicsRes.reason, "fetch quiz topics");
      }

      setLastChecked(new Date().toLocaleTimeString());
    } catch (error) {
      setAgentsOk(false);
      errorLogger.logNetworkError(error, "check agents status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAgentsStatus();
  }, [env]);

  const getStatusColor = () => {
    if (agentsOk === null) return "bg-gray-100 text-gray-800";
    return agentsOk ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  };

  const getStatusIcon = () => {
    if (agentsOk === null) return "⏳";
    return agentsOk ? "🟢" : "🔴";
  };

  const getStatusText = () => {
    if (agentsOk === null) return "Checking...";
    return agentsOk ? "Online" : "Offline";
  };

  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center">
            <span className="mr-2">🤖</span>
            AI Agents Status
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={checkAgentsStatus}
            disabled={loading}
            className="h-7 px-2 text-xs"
          >
            {loading ? "⏳" : "🔄"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Status Row */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Status:</span>
            <Badge variant="outline" className={getStatusColor()}>
              {getStatusIcon()} {getStatusText()}
            </Badge>
          </div>

          {/* Environment Row */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Environment:</span>
            <Badge variant="outline" className="bg-blue-100 text-blue-800">
              {env.toUpperCase()}
            </Badge>
          </div>

          {/* Topics Count Row */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Available Topics:</span>
            <Badge variant="outline" className="bg-purple-100 text-purple-800">
              {topicsCount} topics
            </Badge>
          </div>

          {/* Last Checked Row */}
          {lastChecked && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Last Checked:</span>
              <span className="text-xs text-gray-500">{lastChecked}</span>
            </div>
          )}

          {/* Base URL Row */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Base URL:</span>
            <code className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
              {agentsBaseUrl}
            </code>
          </div>
        </div>

        {/* Detailed Status (if enabled) */}
        {showDetails && (
          <div className="mt-4 pt-3 border-t border-gray-200">
            <div className="text-xs text-gray-500 space-y-1">
              <div>
                • Quiz Generation:{" "}
                {agentsOk ? "✅ Available" : "❌ Unavailable"}
              </div>
              <div>
                • Content Creation:{" "}
                {agentsOk ? "✅ Available" : "❌ Unavailable"}
              </div>
              <div>
                • Interview Prep: {agentsOk ? "✅ Available" : "❌ Unavailable"}
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={checkAgentsStatus}
              disabled={loading}
              className="flex-1 text-xs h-8"
            >
              {loading ? "Checking..." : "Check Status"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(agentsBaseUrl, "_blank")}
              className="flex-1 text-xs h-8"
            >
              Open API
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AgentsStatus;
