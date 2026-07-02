import { useEffect, useMemo, useRef, useState } from "react";

import { getQuizSessionLogs, getQuizSessionProgress } from "@/api/agentsApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

type Props = {
  sessionId: string;
  topic?: string;
  className?: string;
};

export default function SessionProgress({
  sessionId,
  topic,
  className = "",
}: Props) {
  const [percent, setPercent] = useState(0);
  const [status, setStatus] = useState<string>("in_progress");
  const [currentStep, setCurrentStep] = useState<string>("research");
  const [counts, setCounts] = useState<{ gen: number; total: number }>({
    gen: 0,
    total: 0,
  });
  const [logs, setLogs] = useState<any[]>([]);
  const [expanded, setExpanded] = useState(false);
  const timerRef = useRef<number | null>(null);

  // Persist active session so user can revisit later
  useEffect(() => {
    const key = `tbe-active-session-${topic || "quiz"}`;
    localStorage.setItem(key, sessionId);
    return () => {
      // keep it for revisit; clearing on completion handled when status becomes completed
    };
  }, [sessionId, topic]);

  const fetchProgress = async () => {
    try {
      const p = await getQuizSessionProgress(sessionId);
      setPercent(p.percent || 0);
      setStatus(p.status || "");
      setCurrentStep(p.current_step || "");
      setCounts({
        gen: p.questions_generated || 0,
        total: p.question_count || 0,
      });
      if (p.status === "completed" || p.status === "failed") {
        if (timerRef.current) window.clearInterval(timerRef.current);
      }
    } catch (e) {
      // ignore transient errors
    }
  };

  const fetchLogs = async () => {
    try {
      const r = await getQuizSessionLogs(sessionId);
      setLogs(r.logs || []);
    } catch (e) {}
  };

  useEffect(() => {
    // initial load
    fetchProgress();
    fetchLogs();
    // poll every 4s
    timerRef.current = window.setInterval(() => {
      fetchProgress();
      if (expanded) fetchLogs();
    }, 4000) as unknown as number;
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [sessionId, expanded]);

  const statusBadge = useMemo(() => {
    const base = "px-2 py-0.5 rounded text-xs";
    if (status === "completed")
      return (
        <span className={`${base} bg-green-100 text-green-800`}>Completed</span>
      );
    if (status === "failed")
      return (
        <span className={`${base} bg-rose-100 text-rose-800`}>Failed</span>
      );
    return (
      <span className={`${base} bg-amber-100 text-amber-800`}>In Progress</span>
    );
  }, [status]);

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base font-semibold">
          Session {sessionId}
          {topic ? (
            <span className="ml-2 text-muted-foreground">({topic})</span>
          ) : null}
        </CardTitle>
        <div className="flex items-center gap-2">
          {statusBadge}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              fetchProgress();
              fetchLogs();
            }}
          >
            Refresh
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? "Hide Logs" : "Show Logs"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Step: {currentStep || "-"}</span>
            <span>
              {counts.gen}/{counts.total} ({Math.round(percent)}%)
            </span>
          </div>
          <Progress value={percent} />
        </div>

        {expanded && (
          <div className="mt-4 max-h-56 overflow-auto rounded border bg-muted/30 p-2 text-xs">
            {logs.length === 0 && (
              <div className="text-muted-foreground">No logs yet.</div>
            )}
            {logs.map((l, idx) => (
              <div key={idx} className="py-1">
                <span className="text-muted-foreground">
                  {new Date(l.timestamp).toLocaleTimeString()}
                </span>
                <span className="mx-2 font-medium">{l.event}</span>
                {l.meta ? (
                  <code className="bg-muted px-1 rounded">
                    {JSON.stringify(l.meta)}
                  </code>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
