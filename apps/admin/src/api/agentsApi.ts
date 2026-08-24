import { agentsClient } from "@/lib/agentsClient";

export type QuizSessionInfo = {
  session_id: string;
  topic?: string;
  status?: string;
  current_step?: string;
  questions_generated?: number;
  created_at?: string;
  filename?: string;
};

export async function listQuizSessions(): Promise<{
  status: string;
  sessions: QuizSessionInfo[];
  count: number;
}> {
  const res = await agentsClient.get<{
    status: string;
    sessions: QuizSessionInfo[];
    count: number;
  }>("/quiz/sessions");
  return res.data;
}

export type QuizSessionProgress = {
  session_id: string;
  topic?: string;
  status?: string;
  current_step?: string;
  steps_completed: string[];
  question_count?: number;
  questions_generated: number;
  percent: number;
  last_updated?: string;
  created_at?: string;
};

export async function getQuizSessionProgress(
  sessionId: string,
): Promise<QuizSessionProgress> {
  const res = await agentsClient.get<QuizSessionProgress>(
    `/quiz/progress/${sessionId}`,
  );
  return res.data;
}

export async function getQuizSessionLogs(
  sessionId: string,
): Promise<{ session_id: string; logs: any[] }> {
  const res = await agentsClient.get<{ session_id: string; logs: any[] }>(
    `/quiz/logs/${sessionId}`,
  );
  return res.data;
}

export async function pingAgents(): Promise<{
  ok: boolean;
  service: string;
  version?: string;
}> {
  const res = await agentsClient.get<{
    ok: boolean;
    service: string;
    version?: string;
  }>("/ping");
  return res.data;
}

// Generic Sessions API (preferred)
export type ActiveSessionsResponse = {
  ok: boolean;
  quiz: QuizSessionInfo[];
  interview: QuizSessionInfo[];
};

export async function listActiveSessions(): Promise<ActiveSessionsResponse> {
  const res =
    await agentsClient.get<ActiveSessionsResponse>("/sessions/active");
  return res.data;
}

export async function getSessionDetail(
  sessionId: string,
): Promise<{ ok: boolean; data: any }> {
  const res = await agentsClient.get<{ ok: boolean; data: any }>(
    `/sessions/detail/${sessionId}`,
  );
  return res.data;
}

export async function getSessionLogs(
  sessionId: string,
  limit: number = 200,
): Promise<{ ok: boolean; session_id: string; logs: any[] }> {
  const res = await agentsClient.get<{
    ok: boolean;
    session_id: string;
    logs: any[];
  }>(`/sessions/logs/${sessionId}`, { params: { limit } });
  return res.data;
}

export async function resumeSession(
  sessionId: string,
): Promise<{ ok: boolean; result?: any }> {
  const res = await agentsClient.post<{ ok: boolean; result?: any }>(
    `/sessions/resume/${sessionId}`,
  );
  return res.data;
}

export async function deleteSessionLogs(
  sessionId: string,
): Promise<{ ok: boolean; message: string }> {
  const res = await agentsClient.delete<{ ok: boolean; message: string }>(
    `/sessions/logs/${sessionId}`,
  );
  return res.data;
}

export async function deleteSession(
  sessionId: string,
): Promise<{ ok: boolean; removed: any }> {
  const res = await agentsClient.delete<{ ok: boolean; removed: any }>(
    `/sessions/${sessionId}`,
  );
  return res.data;
}
