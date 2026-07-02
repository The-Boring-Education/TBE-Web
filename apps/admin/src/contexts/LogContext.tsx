import type { ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { initLogInterceptor } from "@/lib/logInterceptor";

export type LogType = "toast" | "api_success" | "api_error";

export interface LogEntry {
  id: string;
  type: LogType;
  timestamp: Date;
  title: string;
  description?: string;
  data?: any;
  method?: string;
  path?: string;
  status?: number;
}

interface LogContextType {
  logs: LogEntry[];
  addLog: (log: Omit<LogEntry, "id" | "timestamp">) => void;
  clearLogs: () => void;
  removeLog: (id: string) => void;
}

const LogContext = createContext<LogContextType | undefined>(undefined);

export const useLogs = () => {
  const context = useContext(LogContext);
  if (!context) {
    throw new Error("useLogs must be used within LogProvider");
  }
  return context;
};

interface LogProviderProps {
  children: ReactNode;
  maxLogs?: number;
}

export const LogProvider = ({ children, maxLogs = 500 }: LogProviderProps) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const addLog = useCallback(
    (log: Omit<LogEntry, "id" | "timestamp">) => {
      const newLog: LogEntry = {
        ...log,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
      };

      setLogs((prev) => {
        const updated = [newLog, ...prev];
        // Keep only the most recent logs
        return updated.slice(0, maxLogs);
      });
    },
    [maxLogs],
  );

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const removeLog = useCallback((id: string) => {
    setLogs((prev) => prev.filter((log) => log.id !== id));
  }, []);

  // Initialize log interceptor
  useEffect(() => {
    initLogInterceptor({ addLog });
  }, [addLog]);

  return (
    <LogContext.Provider value={{ logs, addLog, clearLogs, removeLog }}>
      {children}
    </LogContext.Provider>
  );
};
