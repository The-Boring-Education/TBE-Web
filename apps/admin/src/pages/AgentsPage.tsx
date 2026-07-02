import { useEffect, useState } from "react";

import {
  getSessionDetail,
  getSessionLogs,
  listActiveSessions,
  type QuizSessionInfo,
  resumeSession,
} from "@/api/agentsApi";
import SessionProgress from "@/components/SessionProgress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAgentsApiBaseForEnv, getStoredEnv } from "@/hooks/useEnvironment";

const AgentsPage = () => {
  const env = getStoredEnv();
  const agentsBaseUrl = getAgentsApiBaseForEnv(env);
  const [sessions, setSessions] = useState<QuizSessionInfo[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    () => {
      return localStorage.getItem("tbe-active-session-quiz") || null;
    },
  );
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>("");
  const [detail, setDetail] = useState<any>(null);
  const [detailLogs, setDetailLogs] = useState<any[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const refreshSessions = async () => {
    setLoadingSessions(true);
    try {
      const res = await listActiveSessions();
      setSessions(res?.quiz || []);
      setLastRefreshed(new Date().toLocaleTimeString());
    } catch (_e) {
      // ignore for now; status card will show if agents are down
    } finally {
      setLoadingSessions(false);
    }
  };

  useEffect(() => {
    let timer: number | null = null;
    const start = async () => {
      await refreshSessions();
      // Only poll if there are active (non-completed) sessions
      const hasActive = sessions.some(
        (s) => s.status !== "completed" && s.status !== "failed",
      );
      if (hasActive) {
        timer = window.setInterval(refreshSessions, 4000) as unknown as number;
      }
    };
    start();
    return () => {
      if (timer) window.clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [env]);

  // If sessions list changes, update polling dynamically
  useEffect(() => {
    // no-op here; polling managed on mount/env change; manual Refresh exists
  }, [sessions]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Agents Management</h1>
          <p className="text-gray-600 mt-2">
            Monitor and manage AI-powered content generation services
          </p>
        </div>
        <Badge variant="outline" className="text-sm px-3 py-1">
          Environment: {env.toUpperCase()}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sessions & Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Agentic Sessions</span>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {sessions.length} active
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={refreshSessions}
                  disabled={loadingSessions}
                >
                  {loadingSessions ? "Refreshing..." : "Refresh"}
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-gray-500 mb-2">
              Last updated: {lastRefreshed || "-"}
            </div>
            <div className="max-h-72 overflow-auto border rounded">
              {sessions.length === 0 ? (
                <div className="p-4 text-sm text-gray-500">
                  No active sessions
                </div>
              ) : (
                sessions.map((s) => (
                  <div
                    key={s.session_id}
                    className={`p-3 border-b flex items-center justify-between cursor-pointer hover:bg-gray-50 ${
                      selectedSessionId === s.session_id ? "bg-purple-50" : ""
                    }`}
                    onClick={async () => {
                      setSelectedSessionId(s.session_id);
                      localStorage.setItem(
                        "tbe-active-session-quiz",
                        s.session_id,
                      );
                      try {
                        setLoadingDetail(true);
                        const [d, l] = await Promise.all([
                          getSessionDetail(s.session_id),
                          getSessionLogs(s.session_id, 200),
                        ]);
                        setDetail(d?.data || null);
                        setDetailLogs(l?.logs || []);
                      } finally {
                        setLoadingDetail(false);
                      }
                    }}
                  >
                    <div>
                      <div className="text-sm font-medium">
                        Session {s.session_id}
                      </div>
                      <div className="text-xs text-gray-600">
                        {s.topic || "-"} • {s.status || "-"} •{" "}
                        {s.questions_generated || 0} q
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {s.current_step || "-"}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Session Detail</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedSessionId ? (
              <SessionProgress
                sessionId={selectedSessionId}
                className="border-none p-0"
              />
            ) : (
              <div className="text-sm text-gray-500">
                Select a session to view live progress and logs.
              </div>
            )}
            {selectedSessionId && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium">Snapshot</div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        if (!selectedSessionId) return;
                        setLoadingDetail(true);
                        try {
                          const [d, l] = await Promise.all([
                            getSessionDetail(selectedSessionId),
                            getSessionLogs(selectedSessionId, 200),
                          ]);
                          setDetail(d?.data || null);
                          setDetailLogs(l?.logs || []);
                        } finally {
                          setLoadingDetail(false);
                        }
                      }}
                    >
                      {loadingDetail ? "Loading..." : "Refresh Snapshot"}
                    </Button>
                    <Button
                      size="sm"
                      onClick={async () => {
                        if (!selectedSessionId) return;
                        try {
                          await resumeSession(selectedSessionId);
                          refreshSessions();
                        } catch {}
                      }}
                    >
                      Resume
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  <div className="border rounded p-2 bg-gray-50 text-xs overflow-auto max-h-80">
                    <div className="font-medium mb-1">Detail JSON</div>
                    <pre>{detail ? JSON.stringify(detail, null, 2) : "-"}</pre>
                  </div>
                  <div className="border rounded p-2 bg-gray-50 text-xs overflow-auto max-h-80">
                    <div className="font-medium mb-1">Recent Logs</div>
                    {detailLogs.length === 0 ? (
                      <div className="text-gray-500">No logs</div>
                    ) : (
                      detailLogs.map((l, idx) => (
                        <div key={idx} className="py-1 border-b last:border-0">
                          <span className="text-gray-500">
                            {new Date(l.timestamp).toLocaleTimeString()}
                          </span>
                          <span className="mx-2 font-medium">{l.event}</span>
                          {l.meta ? (
                            <code className="bg-white px-1 rounded">
                              {JSON.stringify(l.meta)}
                            </code>
                          ) : null}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* API Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="mr-2">🔗</span>
              API Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">
                Base URL
              </label>
              <div className="mt-1 p-3 bg-gray-50 rounded-md border">
                <code className="text-sm text-gray-800 break-all">
                  {agentsBaseUrl}
                </code>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">
                Environment
              </label>
              <div className="mt-1">
                <Badge variant="outline" className="bg-blue-100 text-blue-800">
                  {env.toUpperCase()}
                </Badge>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">
                Available Endpoints
              </label>
              <div className="mt-2 space-y-2">
                <div className="flex items-center justify-between p-2 bg-green-50 rounded border">
                  <span className="text-sm font-mono">GET /ping</span>
                  <Badge
                    variant="outline"
                    className="bg-green-100 text-green-800 text-xs"
                  >
                    Health Check
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-blue-50 rounded border">
                  <span className="text-sm font-mono">GET /quiz/topics</span>
                  <Badge
                    variant="outline"
                    className="bg-blue-100 text-blue-800 text-xs"
                  >
                    Quiz Topics
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-purple-50 rounded border">
                  <span className="text-sm font-mono">POST /quiz/generate</span>
                  <Badge
                    variant="outline"
                    className="bg-purple-100 text-purple-800 text-xs"
                  >
                    Generate Quiz
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-orange-50 rounded border">
                  <span className="text-sm font-mono">POST /quiz/validate</span>
                  <Badge
                    variant="outline"
                    className="bg-orange-100 text-orange-800 text-xs"
                  >
                    Validate Quiz
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-indigo-50 rounded border">
                  <span className="text-sm font-mono">POST /quiz/upload</span>
                  <Badge
                    variant="outline"
                    className="bg-indigo-100 text-indigo-800 text-xs"
                  >
                    Upload Quiz
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Services Overview Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="mr-2">🚀</span>
              Available Services
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">🎯</span>
                  <div>
                    <h4 className="font-medium text-gray-800">
                      Quiz Generation
                    </h4>
                    <p className="text-sm text-gray-600">
                      AI-powered quiz creation
                    </p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className="bg-green-100 text-green-800"
                >
                  Active
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">📚</span>
                  <div>
                    <h4 className="font-medium text-gray-800">
                      Interview Prep
                    </h4>
                    <p className="text-sm text-gray-600">
                      Technical interview questions
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-blue-100 text-blue-800">
                  Active
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg border border-purple-200">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">💡</span>
                  <div>
                    <h4 className="font-medium text-gray-800">
                      Content Creation
                    </h4>
                    <p className="text-sm text-gray-600">
                      Course outlines & materials
                    </p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className="bg-purple-100 text-purple-800"
                >
                  Active
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-200">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">🏗️</span>
                  <div>
                    <h4 className="font-medium text-gray-800">
                      Project Planning
                    </h4>
                    <p className="text-sm text-gray-600">
                      Project structure & roadmaps
                    </p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className="bg-orange-100 text-orange-800"
                >
                  Active
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <span className="mr-2">⚡</span>
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => window.open(`${agentsBaseUrl}/docs`, "_blank")}
              className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 text-left"
            >
              <div className="text-2xl mb-2">📖</div>
              <h4 className="font-medium text-gray-800">API Documentation</h4>
              <p className="text-sm text-gray-600">View Swagger docs</p>
            </button>

            <button
              onClick={() => window.open(agentsBaseUrl, "_blank")}
              className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg hover:from-green-100 hover:to-emerald-100 transition-all duration-200 text-left"
            >
              <div className="text-2xl mb-2">🔍</div>
              <h4 className="font-medium text-gray-800">Test Endpoints</h4>
              <p className="text-sm text-gray-600">Direct API access</p>
            </button>

            <button
              onClick={() =>
                window.open(
                  "https://github.com/your-org/The-Boring-Agents",
                  "_blank",
                )
              }
              className="p-4 bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 rounded-lg hover:from-purple-100 hover:to-violet-100 transition-all duration-200 text-left"
            >
              <div className="text-2xl mb-2">🐙</div>
              <h4 className="font-medium text-gray-800">Source Code</h4>
              <p className="text-sm text-gray-600">View on GitHub</p>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentsPage;
