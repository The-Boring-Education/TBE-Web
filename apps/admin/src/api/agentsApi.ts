import axios from "axios";

import { getAgentsApiBaseForEnv } from "@/hooks/useEnvironment";

const getBase = () => getAgentsApiBaseForEnv();

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
  const res = await axios.get(`${getBase()}/quiz/sessions`);
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
  const res = await axios.get(`${getBase()}/quiz/progress/${sessionId}`);
  return res.data;
}

export async function getQuizSessionLogs(
  sessionId: string,
): Promise<{ session_id: string; logs: any[] }> {
  const res = await axios.get(`${getBase()}/quiz/logs/${sessionId}`);
  return res.data;
}

export async function pingAgents(): Promise<{
  ok: boolean;
  service: string;
  version?: string;
}> {
  const res = await axios.get(`${getBase()}/ping`);
  return res.data;
}

// Generic Sessions API (preferred)
export type ActiveSessionsResponse = {
  ok: boolean;
  quiz: QuizSessionInfo[];
  interview: QuizSessionInfo[];
};

export async function listActiveSessions(): Promise<ActiveSessionsResponse> {
  const res = await axios.get(`${getBase()}/sessions/active`);
  return res.data;
}

export async function getSessionDetail(
  sessionId: string,
): Promise<{ ok: boolean; data: any }> {
  const res = await axios.get(`${getBase()}/sessions/detail/${sessionId}`);
  return res.data;
}

export async function getSessionLogs(
  sessionId: string,
  limit: number = 200,
): Promise<{ ok: boolean; session_id: string; logs: any[] }> {
  const res = await axios.get(`${getBase()}/sessions/logs/${sessionId}`, {
    params: { limit },
  });
  return res.data;
}

export async function resumeSession(
  sessionId: string,
): Promise<{ ok: boolean; result?: any }> {
  const res = await axios.post(`${getBase()}/sessions/resume/${sessionId}`);
  return res.data;
}

export async function deleteSessionLogs(
  sessionId: string,
): Promise<{ ok: boolean; message: string }> {
  const res = await axios.delete(`${getBase()}/sessions/logs/${sessionId}`);
  return res.data;
}

export async function deleteSession(
  sessionId: string,
): Promise<{ ok: boolean; removed: any }> {
  const res = await axios.delete(`${getBase()}/sessions/${sessionId}`);
  return res.data;
}
