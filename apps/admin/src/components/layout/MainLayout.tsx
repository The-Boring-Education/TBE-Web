import { useAuth } from "@tbe/auth";
import { useAdmin } from "@tbe/hooks";
import { Bot } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  type AdminEnv,
  getStoredAgentsEnv,
  getStoredPlatformEnv,
  setStoredAgentsEnv,
  setStoredPlatformEnv,
} from "@/hooks/useEnvironment";

import AgentsStatus from "../AgentsStatus";
import DebugPanel from "../DebugPanel";
import LogViewer from "../LogViewer";
import Sidebar from "./Sidebar";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  const { isAdmin } = useAdmin();
  const location = useLocation();

  const [platformEnv, setPlatformEnv] = useState<AdminEnv>(() =>
    getStoredPlatformEnv(),
  );
  const [agentsEnv, setAgentsEnv] = useState<AdminEnv>(() =>
    getStoredAgentsEnv(),
  );

  const routeUsesAgents = [
    "/quizzes",
    "/lab/interview-sheets",
    "/email-management",
    "/agents",
    "/content",
  ].some((path) => location.pathname.startsWith(path));

  useEffect(() => {
    const platformHandler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { env: AdminEnv } | undefined;
      if (detail?.env) setPlatformEnv(detail.env);
    };
    const agentsHandler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { env: AdminEnv } | undefined;
      if (detail?.env) setAgentsEnv(detail.env);
    };
    window.addEventListener(
      "tbe-admin-platform-env-change",
      platformHandler as EventListener,
    );
    window.addEventListener(
      "tbe-admin-agents-env-change",
      agentsHandler as EventListener,
    );
    return () => {
      window.removeEventListener(
        "tbe-admin-platform-env-change",
        platformHandler as EventListener,
      );
      window.removeEventListener(
        "tbe-admin-agents-env-change",
        agentsHandler as EventListener,
      );
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center text-gray-600">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-4 text-center">
        <h1 className="text-2xl font-semibold text-gray-900">Access denied</h1>
        <p className="max-w-md text-gray-600">
          Your account does not have admin access. Contact the platform team if
          you believe this is an error.
        </p>
        <Button asChild variant="outline">
          <a href="/login">Back to login</a>
        </Button>
      </div>
    );
  }

  const labelFor = (e: AdminEnv) =>
    e === "local" ? "Local" : e === "dev" ? "Dev" : "Prod";

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="flex items-center justify-between border-b bg-white/70 px-4 py-2 backdrop-blur">
          <div className="flex flex-1 items-center gap-3">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex h-8 items-center gap-2 px-3 text-xs"
                >
                  <Bot className="h-4 w-4" />
                  AI Status
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-96 p-0" align="start">
                <AgentsStatus showDetails />
              </PopoverContent>
            </Popover>

            <div className="flex items-center gap-3 text-sm font-medium text-gray-700">
              <span>Platform API:</span>
              <select
                className="h-7 rounded-md border bg-white px-2 text-xs"
                value={platformEnv}
                onChange={(e) => {
                  const v = e.target.value as AdminEnv;
                  setStoredPlatformEnv(v);
                  setPlatformEnv(v);
                  window.dispatchEvent(
                    new CustomEvent("tbe-admin-platform-env-change", {
                      detail: { env: v },
                    }),
                  );
                }}
              >
                <option value="local">Local</option>
                <option value="dev">Dev</option>
                <option value="prod">Prod</option>
              </select>
              <span className="text-xs text-gray-500">
                (Active: {labelFor(platformEnv)})
              </span>
            </div>
          </div>

          <div className="flex flex-1 items-center justify-center">
            <LogViewer />
          </div>

          <div className="flex flex-1 items-center justify-end gap-3">
            {routeUsesAgents && (
              <div className="flex items-center gap-3 text-sm font-medium text-gray-700">
                <span>Agents:</span>
                <select
                  className="h-7 rounded-md border bg-white px-2 text-xs"
                  value={agentsEnv}
                  onChange={(e) => {
                    const v = e.target.value as AdminEnv;
                    setStoredAgentsEnv(v);
                    setAgentsEnv(v);
                    window.dispatchEvent(
                      new CustomEvent("tbe-admin-agents-env-change", {
                        detail: { env: v },
                      }),
                    );
                  }}
                >
                  <option value="local">Local</option>
                  <option value="dev">Dev</option>
                  <option value="prod">Prod</option>
                </select>
                <span className="text-xs text-gray-500">
                  (Active: {labelFor(agentsEnv)})
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="border-b border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="grid grid-cols-1 gap-3 px-6 py-3 text-xs text-gray-700 md:grid-cols-2">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span className="font-semibold">Platform API</span>
              <span className="rounded bg-green-100 px-2 py-0.5 text-green-800">
                Env: {labelFor(platformEnv)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-purple-500" />
              <span className="font-semibold">Agents</span>
              <span className="rounded bg-purple-100 px-2 py-0.5 text-purple-800">
                Env: {labelFor(agentsEnv)}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6">{children}</div>
        {import.meta.env.DEV && <DebugPanel />}
      </main>
    </div>
  );
};

export default MainLayout;
